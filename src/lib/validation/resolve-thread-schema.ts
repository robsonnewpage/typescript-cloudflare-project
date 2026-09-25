import { z } from "zod";

export const resolveThreadSchema = z.object({
  threadId: z.string().min(1, "Missing thread id."),
  resolvedBy: z.string().trim().min(1, "Enter your name.").max(80, "Keep it under 80 characters."),
  resolutionStatement: z
    .string()
    .trim()
    .min(10, "Give at least 10 characters so this is useful to the next person who reads it.")
    .max(2000, "Keep it under 2000 characters."),
  idempotencyKey: z.string().min(1, "Missing idempotency key."),
});

export type ResolveThreadInput = z.infer<typeof resolveThreadSchema>;
