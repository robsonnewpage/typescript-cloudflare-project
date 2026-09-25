import { DurableObject } from "cloudflare:workers";
import { and, eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema";
import { threads } from "@/db/schema";

/**
 * One instance per thread (routed via idFromName(threadId)), so every
 * claim/resolve for the SAME thread is handled by the same object instead
 * of racing across isolates. D1 stays the source of truth — this object
 * arbitrates the transition and gates it with the same conditional-UPDATE
 * pattern Cluster D already used, plus an idempotency cache so a retried
 * client request never double-applies or double-logs a transition.
 *
 * Not called over HTTP: actions.ts invokes claim()/resolve() directly as
 * RPC through the THREAD_ARBITER binding.
 */

export type ClaimOutcome = "ok" | "already_claimed" | "already_resolved" | "not_found";
export type ResolveOutcome = "ok" | "already_resolved" | "not_claimed_by_you" | "not_found";
export type ReopenOutcome = "ok" | "not_resolved" | "not_found";

interface ClaimInput {
  threadId: string;
  claimant: string;
  idempotencyKey: string;
}

interface ResolveInput {
  threadId: string;
  resolvedBy: string;
  resolutionStatement: string;
  idempotencyKey: string;
}

interface ReopenInput {
  threadId: string;
  reopenedBy: string;
  idempotencyKey: string;
}

const RECENTLY_RESOLVED_CACHE_KEY = "threads:recently-resolved";
const RECENTLY_RESOLVED_CACHE_LIMITS = [1, 2, 3];

export class ThreadArbiterDO extends DurableObject<CloudflareEnv> {
  constructor(ctx: DurableObjectState, env: CloudflareEnv) {
    super(ctx, env);
    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS idempotency_cache (
        idempotency_key TEXT PRIMARY KEY,
        outcome_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
  }

  private getCachedOutcome<T>(idempotencyKey: string): T | null {
    const row = this.ctx.storage.sql
      .exec<{ outcome_json: string }>("SELECT outcome_json FROM idempotency_cache WHERE idempotency_key = ?", idempotencyKey)
      .toArray()[0];
    return row ? (JSON.parse(row.outcome_json) as T) : null;
  }

  private cacheOutcome<T>(idempotencyKey: string, outcome: T): T {
    this.ctx.storage.sql.exec(
      "INSERT INTO idempotency_cache (idempotency_key, outcome_json, created_at) VALUES (?, ?, ?)",
      idempotencyKey,
      JSON.stringify(outcome),
      new Date().toISOString(),
    );
    return outcome;
  }

  async claim(input: ClaimInput): Promise<ClaimOutcome> {
    const cached = this.getCachedOutcome<ClaimOutcome>(input.idempotencyKey);
    if (cached) return cached;

    const db = drizzle(this.env.DB, { schema });
    const now = new Date().toISOString();

    const updated = await db
      .update(threads)
      .set({ status: "claimed", claimedBy: input.claimant, claimedAt: now })
      .where(and(eq(threads.id, input.threadId), eq(threads.status, "open")))
      .returning({ id: threads.id });

    if (updated.length === 0) {
      const [existing] = await db.select({ status: threads.status }).from(threads).where(eq(threads.id, input.threadId)).limit(1);
      if (!existing) return this.cacheOutcome(input.idempotencyKey, "not_found");
      if (existing.status === "resolved") return this.cacheOutcome(input.idempotencyKey, "already_resolved");
      return this.cacheOutcome(input.idempotencyKey, "already_claimed");
    }

    console.log(`[AUDIT] thread.claimed threadId=${input.threadId} claimant="${input.claimant}" at=${now}`);
    return this.cacheOutcome(input.idempotencyKey, "ok");
  }

  async resolve(input: ResolveInput): Promise<ResolveOutcome> {
    const cached = this.getCachedOutcome<ResolveOutcome>(input.idempotencyKey);
    if (cached) return cached;

    const db = drizzle(this.env.DB, { schema });
    const now = new Date().toISOString();

    // Resolvable straight from "open" (no claim required — preserves the
    // Cluster D flow) or from "claimed", but only by the same claimant.
    const updated = await db
      .update(threads)
      .set({ status: "resolved", resolvedBy: input.resolvedBy, resolvedAt: now, resolutionStatement: input.resolutionStatement })
      .where(
        and(
          eq(threads.id, input.threadId),
          or(eq(threads.status, "open"), and(eq(threads.status, "claimed"), eq(threads.claimedBy, input.resolvedBy))),
        ),
      )
      .returning({ id: threads.id });

    if (updated.length === 0) {
      const [existing] = await db.select({ status: threads.status }).from(threads).where(eq(threads.id, input.threadId)).limit(1);
      if (!existing) return this.cacheOutcome(input.idempotencyKey, "not_found");
      if (existing.status === "resolved") return this.cacheOutcome(input.idempotencyKey, "already_resolved");
      return this.cacheOutcome(input.idempotencyKey, "not_claimed_by_you");
    }

    await this.bustRecentlyResolvedCache();

    console.log(`[AUDIT] thread.resolved threadId=${input.threadId} resolvedBy="${input.resolvedBy}" at=${now}`);
    return this.cacheOutcome(input.idempotencyKey, "ok");
  }

  // resolved -> open. Clears the claim and the resolution outright rather
  // than keeping a history (no migration); the audit line below is where the
  // previous resolution survives.
  async reopen(input: ReopenInput): Promise<ReopenOutcome> {
    const cached = this.getCachedOutcome<ReopenOutcome>(input.idempotencyKey);
    if (cached) return cached;

    const db = drizzle(this.env.DB, { schema });
    const now = new Date().toISOString();

    const [previous] = await db
      .select({ resolvedBy: threads.resolvedBy, resolutionStatement: threads.resolutionStatement })
      .from(threads)
      .where(eq(threads.id, input.threadId))
      .limit(1);

    const updated = await db
      .update(threads)
      .set({ status: "open", claimedBy: null, claimedAt: null, resolvedBy: null, resolvedAt: null, resolutionStatement: null })
      .where(and(eq(threads.id, input.threadId), eq(threads.status, "resolved")))
      .returning({ id: threads.id });

    if (updated.length === 0) {
      return this.cacheOutcome(input.idempotencyKey, previous ? "not_resolved" : "not_found");
    }

    // The thread just left the resolved list, so the cached copy is stale too.
    await this.bustRecentlyResolvedCache();

    console.log(
      `[AUDIT] thread.reopened threadId=${input.threadId} reopenedBy="${input.reopenedBy}" previousResolvedBy="${previous?.resolvedBy}" previousResolution=${JSON.stringify(previous?.resolutionStatement)} at=${now}`,
    );
    return this.cacheOutcome(input.idempotencyKey, "ok");
  }

  private async bustRecentlyResolvedCache(): Promise<void> {
    await Promise.all(
      RECENTLY_RESOLVED_CACHE_LIMITS.map((limit) => this.env.CACHE.delete(`${RECENTLY_RESOLVED_CACHE_KEY}:${limit}`)),
    );
  }
}
