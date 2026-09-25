import "server-only";
import { desc, eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db/client";
import { facts, meetings, threads } from "@/db/schema";
import type { Meeting } from "@/model/meeting";

export async function listMeetings(): Promise<Meeting[]> {
  const db = await getDb();
  const rows = await db.select().from(meetings).orderBy(desc(meetings.occurredAt));
  return rows;
}

export async function getMeeting(meetingId: string): Promise<Meeting | null> {
  const db = await getDb();
  const [meeting] = await db.select().from(meetings).where(eq(meetings.id, meetingId)).limit(1);
  return meeting ?? null;
}

export async function setMeetingTranscriptKey(meetingId: string, transcriptKey: string): Promise<void> {
  const db = await getDb();
  await db.update(meetings).set({ transcriptKey }).where(eq(meetings.id, meetingId));
}

// No ON DELETE CASCADE on the facts/threads foreign keys, so this deletes
// the dependent rows itself — child tables first, in one D1 batch so the
// three deletes commit atomically. Vectorize/R2 cleanup runs after and is
// best-effort: by then the D1 rows (the source of truth) are already
// gone, so a failure here leaves an orphaned vector or R2 object, never
// stale data the app would still show.
export async function deleteMeeting(meetingId: string): Promise<void> {
  const db = await getDb();
  const meeting = await getMeeting(meetingId);
  if (!meeting) return;

  const meetingFacts = await db.select({ id: facts.id }).from(facts).where(eq(facts.meetingId, meetingId));

  await db.batch([
    db.delete(threads).where(eq(threads.meetingId, meetingId)),
    db.delete(facts).where(eq(facts.meetingId, meetingId)),
    db.delete(meetings).where(eq(meetings.id, meetingId)),
  ]);

  const { env } = await getCloudflareContext({ async: true });
  const factIds = meetingFacts.map((f) => f.id);

  await Promise.all([
    factIds.length > 0
      ? env.VECTORIZE.deleteByIds(factIds).catch((err) => console.error("[AUDIT] vectorize.delete_failed", err))
      : Promise.resolve(),
    meeting.transcriptKey
      ? env.TRANSCRIPTS.delete(meeting.transcriptKey).catch((err) => console.error("[AUDIT] r2.delete_failed", err))
      : Promise.resolve(),
  ]);

  console.log(`[AUDIT] meeting.deleted meetingId=${meetingId} facts=${factIds.length}`);
}

export async function createMeeting(input: {
  title: string;
  occurredAt: string;
  participants: string[];
}): Promise<Meeting> {
  const db = await getDb();
  const meeting: Meeting = {
    id: crypto.randomUUID(),
    title: input.title,
    occurredAt: input.occurredAt,
    participants: input.participants,
    transcriptKey: null,
  };
  await db.insert(meetings).values(meeting);
  return meeting;
}
