"use server";

import { revalidatePath } from "next/cache";
import { createMeeting } from "@/lib/data/meetings";
import { createMeetingSchema, type CreateMeetingInput } from "@/lib/validation/create-meeting-schema";
import type { Meeting } from "@/model/meeting";

export type CreateMeetingResult =
  | { status: "ok"; meeting: Meeting }
  | { status: "error"; fieldErrors: Partial<Record<keyof CreateMeetingInput, string[]>> };

// Called directly (RPC-style), not via a <form action>: creation is the
// first of two network calls the client makes (create, then attach the
// transcript via presigned upload), and it needs the new meeting's id
// before it can even request an upload URL — a plain form-action redirect
// can't hand that back mid-flow.
export async function createMeetingAction(input: unknown): Promise<CreateMeetingResult> {
  const parsed = createMeetingSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const meeting = await createMeeting(parsed.data);
  revalidatePath("/meetings");
  return { status: "ok", meeting };
}
