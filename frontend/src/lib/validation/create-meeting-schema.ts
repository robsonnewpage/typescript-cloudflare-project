import { z } from "zod";

export const createMeetingSchema = z.object({
  title: z.string().trim().min(1, "Enter a title.").max(200, "Keep it under 200 characters."),
  occurredAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date."),
  participants: z
    .string()
    .trim()
    .min(1, "List at least one participant, separated by commas.")
    .transform((value) =>
      value
        .split(",")
        .map((name) => name.trim())
        .filter((name) => name.length > 0),
    )
    .pipe(z.array(z.string()).min(1, "List at least one participant, separated by commas.")),
});

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
