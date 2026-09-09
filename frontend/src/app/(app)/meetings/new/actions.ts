"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createMeeting } from "@/lib/data/meetings";
import { createMeetingSchema } from "@/lib/validation/create-meeting-schema";

export interface CreateMeetingState {
  status: "idle" | "error";
  fieldErrors?: Partial<Record<"title" | "occurredAt" | "participants", string[]>>;
}

export async function createMeetingAction(
  _prevState: CreateMeetingState,
  formData: FormData,
): Promise<CreateMeetingState> {
  const parsed = createMeetingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const meeting = await createMeeting(parsed.data);

  revalidatePath("/meetings");
  redirect(`/meetings/${meeting.id}`);
}
