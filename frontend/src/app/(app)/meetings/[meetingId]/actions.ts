"use server";

import { revalidatePath } from "next/cache";
import { getMeeting, setMeetingTranscriptKey } from "@/lib/data/meetings";
import { createPresignedDownloadUrl, createPresignedUploadUrl, transcriptKeyFor } from "@/lib/r2";

// Called directly (RPC-style), not via a <form action>: the upload itself
// is a client-side PUT straight to R2 using the presigned URL this returns,
// bypassing this Worker entirely for the file bytes.
export async function createTranscriptUploadUrl(
  meetingId: string,
  filename: string,
  contentType: string,
): Promise<{ key: string; url: string }> {
  const meeting = await getMeeting(meetingId);
  if (!meeting) throw new Error("This meeting no longer exists.");

  const key = transcriptKeyFor(meetingId, filename);
  const url = await createPresignedUploadUrl(key, contentType);
  return { key, url };
}

export async function confirmTranscriptUpload(meetingId: string, key: string): Promise<void> {
  await setMeetingTranscriptKey(meetingId, key);
  revalidatePath("/meetings");
  revalidatePath(`/meetings/${meetingId}`);
}

export async function getTranscriptDownloadUrl(key: string): Promise<string> {
  return createPresignedDownloadUrl(key);
}
