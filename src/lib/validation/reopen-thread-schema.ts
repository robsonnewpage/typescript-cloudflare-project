import { z } from "zod";

export const reopenThreadSchema = z.object({
  threadId: z.string().min(1, "Missing thread id."),
  reopenedBy: z.string().trim().min(1, "Enter your name.").max(80, "Keep it under 80 characters."),
  idempotencyKey: z.string().min(1, "Missing idempotency key."),
});

export type ReopenThreadInput = z.infer<typeof reopenThreadSchema>;
