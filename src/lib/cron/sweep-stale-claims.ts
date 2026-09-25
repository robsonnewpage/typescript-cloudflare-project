import { and, eq, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema";
import { cronRuns, threads } from "@/db/schema";

/**
 * Runs from custom-worker.ts's scheduled() export, never from the Next.js
 * request pipeline — takes env directly rather than going through
 * getCloudflareContext(), which only resolves inside an OpenNext fetch.
 */

const STALE_CLAIM_MINUTES = 30;

export async function sweepStaleClaims(env: CloudflareEnv): Promise<number> {
  const db = drizzle(env.DB, { schema });
  const cutoff = new Date(Date.now() - STALE_CLAIM_MINUTES * 60_000).toISOString();

  // Idempotent by construction: a second run just matches zero rows.
  const swept = await db
    .update(threads)
    .set({ status: "open", claimedBy: null, claimedAt: null })
    .where(and(eq(threads.status, "claimed"), lt(threads.claimedAt, cutoff)))
    .returning({ id: threads.id });

  const now = new Date().toISOString();
  await db
    .insert(cronRuns)
    .values({ jobName: "sweep-stale-claims", lastRunAt: now, rowsAffected: swept.length })
    .onConflictDoUpdate({
      target: cronRuns.jobName,
      set: { lastRunAt: now, rowsAffected: swept.length },
    });

  console.log(`[AUDIT] cron.sweep_stale_claims swept=${swept.length} at=${now}`);
  return swept.length;
}
