import "server-only";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { meetings } from "@/db/schema";
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
