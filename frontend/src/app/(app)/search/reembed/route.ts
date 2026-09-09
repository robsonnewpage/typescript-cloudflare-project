import { NextResponse, type NextRequest } from "next/server";
import { isNull } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db/client";
import { facts } from "@/db/schema";
import { embedAndUpsertFact } from "@/lib/data/search";

// One-time/occasional trigger: nothing in the app currently creates a Fact
// (extraction from a real transcript is out of scope here), so there's no
// live "embed on write" hook to fire yet — this is the documented
// extensibility point instead. Gated by a shared-secret header, not public.
//
// Backfill by default (only facts with embeddedAt still null — e.g. ones
// added after the embeddedAt column existed but before this ran); pass
// ?all=true to force re-embedding everything.
export async function POST(request: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });

  if (request.headers.get("x-admin-token") !== env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const forceAll = request.nextUrl.searchParams.get("all") === "true";
  const db = await getDb();
  const pending = forceAll ? await db.select().from(facts) : await db.select().from(facts).where(isNull(facts.embeddedAt));

  for (const fact of pending) {
    await embedAndUpsertFact(fact);
  }

  return NextResponse.json({ embedded: pending.length });
}
