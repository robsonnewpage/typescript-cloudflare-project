import { z } from "zod";

// participants is no longer free-typed — it's derived by parsing the
// transcript's speaker cues client-side (WebVTT has no field for it, so
// this is the closest thing to a real source of truth). Still validated
// here since a Server Action's input is never trusted just because a
// trusted-looking client sent it.
export const createMeetingSchema = z.object({
  title: z.string().trim().min(1, "Enter a title.").max(200, "Keep it under 200 characters."),
  occurredAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date."),
  participants: z
    .array(z.string().trim().min(1))
    .min(1, "Couldn't find any speakers in that transcript — check the file."),
});

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
