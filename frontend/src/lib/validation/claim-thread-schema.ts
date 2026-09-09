import { z } from "zod";

export const claimThreadSchema = z.object({
  threadId: z.string().min(1, "Missing thread id."),
  claimant: z.string().trim().min(1, "Enter your name.").max(80, "Keep it under 80 characters."),
  idempotencyKey: z.string().min(1, "Missing idempotency key."),
});

export type ClaimThreadInput = z.infer<typeof claimThreadSchema>;
