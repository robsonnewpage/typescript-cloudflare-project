import "server-only";
import { desc } from "drizzle-orm";
import { getDb } from "@/db/client";
import { meetings } from "@/db/schema";
import type { Meeting } from "@/model/meeting";

export async function listMeetings(): Promise<Meeting[]> {
  const db = await getDb();
  const rows = await db.select().from(meetings).orderBy(desc(meetings.occurredAt));
  return rows;
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
