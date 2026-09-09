"use server";

import { revalidatePath } from "next/cache";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { claimThreadSchema } from "@/lib/validation/claim-thread-schema";
import { resolveThreadSchema } from "@/lib/validation/resolve-thread-schema";

export interface ClaimThreadState {
  status: "idle" | "error" | "success";
  fieldErrors?: Partial<Record<"threadId" | "claimant" | "idempotencyKey", string[]>>;
  formError?: string;
}

export interface ResolveThreadState {
  status: "idle" | "error" | "success";
  fieldErrors?: Partial<Record<"threadId" | "resolvedBy" | "resolutionStatement" | "idempotencyKey", string[]>>;
  formError?: string;
}

async function getThreadArbiter() {
  const { env } = await getCloudflareContext({ async: true });
  return env.THREAD_ARBITER;
}

export async function claimThread(_prevState: ClaimThreadState, formData: FormData): Promise<ClaimThreadState> {
  const parsed = claimThreadSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const arbiter = await getThreadArbiter();
  const stub = arbiter.get(arbiter.idFromName(parsed.data.threadId));
  const result = await stub.claim({
    threadId: parsed.data.threadId,
    claimant: parsed.data.claimant,
    idempotencyKey: parsed.data.idempotencyKey,
  });

  if (result === "already_claimed") {
    return { status: "error", formError: "Someone already claimed this thread." };
  }
  if (result === "already_resolved") {
    return { status: "error", formError: "Someone already resolved this thread." };
  }
  if (result === "not_found") {
    return { status: "error", formError: "This thread no longer exists." };
  }

  revalidatePath("/threads");
  revalidatePath(`/threads/${parsed.data.threadId}`);
  return { status: "success" };
}

export async function resolveThread(_prevState: ResolveThreadState, formData: FormData): Promise<ResolveThreadState> {
  const parsed = resolveThreadSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const arbiter = await getThreadArbiter();
  const stub = arbiter.get(arbiter.idFromName(parsed.data.threadId));
  const result = await stub.resolve({
    threadId: parsed.data.threadId,
    resolvedBy: parsed.data.resolvedBy,
    resolutionStatement: parsed.data.resolutionStatement,
    idempotencyKey: parsed.data.idempotencyKey,
  });

  if (result === "not_claimed_by_you") {
    return { status: "error", formError: "This thread is claimed by someone else — use the same name they claimed it under to resolve it." };
  }
  if (result === "already_resolved") {
    return { status: "error", formError: "Someone already resolved this thread." };
  }
  if (result === "not_found") {
    return { status: "error", formError: "This thread no longer exists." };
  }

  revalidatePath("/threads");
  revalidatePath(`/threads/${parsed.data.threadId}`);
  return { status: "success" };
}
