"use server";

import { getMeeting } from "@/lib/data/meetings";
import { createPresignedDownloadUrl } from "@/lib/r2";

export interface FactSource {
  url: string;
  meetingTitle: string;
}

export async function getFactSourceUrl(meetingId: string): Promise<FactSource | null> {
  const meeting = await getMeeting(meetingId);
  if (!meeting || !meeting.transcriptKey) return null;

  const url = await createPresignedDownloadUrl(meeting.transcriptKey);
  return { url, meetingTitle: meeting.title };
}
