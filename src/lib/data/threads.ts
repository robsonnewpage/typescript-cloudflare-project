import "server-only";
import { desc, eq, inArray } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db/client";
import { facts, meetings, threads } from "@/db/schema";
import type { Fact } from "@/model/fact";
import type { Thread } from "@/model/thread";

/**
 * D1-backed replacement for the in-memory repository. Real persistence,
 * shared across every isolate. Claim/resolve transitions themselves are no
 * longer written here — they go through the ThreadArbiterDO (one instance
 * per thread, see src/durable-objects/thread-arbiter.ts) via a service
 * binding from the Server Actions in actions.ts, so this file only reads.
 */

const RECENTLY_RESOLVED_CACHE_KEY = "threads:recently-resolved";
const RECENTLY_RESOLVED_TTL_SECONDS = 60; // KV's enforced minimum TTL

export interface OpenThreadView {
  thread: Thread;
  fact: Fact;
  meetingTitle: string;
}

function toView(row: {
  threads: typeof threads.$inferSelect;
  facts: typeof facts.$inferSelect;
  meetings: typeof meetings.$inferSelect;
}): OpenThreadView {
  return {
    thread: row.threads as Thread,
    fact: row.facts as Fact,
    meetingTitle: row.meetings.title,
  };
}

export async function listOpenThreads(): Promise<OpenThreadView[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(threads)
    .innerJoin(facts, eq(facts.id, threads.id))
    .innerJoin(meetings, eq(meetings.id, threads.meetingId))
    // "claimed" is still unresolved — someone's working it, it's not done.
    .where(inArray(threads.status, ["open", "claimed"]));

  return rows.map(toView);
}

export async function listRecentlyResolved(limit = 3): Promise<OpenThreadView[]> {
  const { env } = await getCloudflareContext({ async: true });
  const cacheKey = `${RECENTLY_RESOLVED_CACHE_KEY}:${limit}`;

  const cached = await env.CACHE.get<OpenThreadView[]>(cacheKey, "json");
  if (cached) return cached;

  const db = await getDb();
  const rows = await db
    .select()
    .from(threads)
    .innerJoin(facts, eq(facts.id, threads.id))
    .innerJoin(meetings, eq(meetings.id, threads.meetingId))
    .where(eq(threads.status, "resolved"))
    .orderBy(desc(threads.resolvedAt))
    .limit(limit);

  const result = rows.map(toView);
  await env.CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: RECENTLY_RESOLVED_TTL_SECONDS });
  return result;
}

export async function getThreadDetail(threadId: string): Promise<OpenThreadView | null> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(threads)
    .innerJoin(facts, eq(facts.id, threads.id))
    .innerJoin(meetings, eq(meetings.id, threads.meetingId))
    .where(eq(threads.id, threadId))
    .limit(1);

  return rows.length > 0 ? toView(rows[0]) : null;
}
