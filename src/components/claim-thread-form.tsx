"use client";

import { useActionState } from "react";
import { claimThread, type ClaimThreadState } from "@/app/(app)/threads/[threadId]/actions";

const initialState: ClaimThreadState = { status: "idle" };

// The name comes from ThreadActions' shared picker; it's posted as a hidden
// field so the Server Action and its schema stay unchanged.
export function ClaimThreadForm({ threadId, claimant }: { threadId: string; claimant: string }) {
  const [state, formAction, pending] = useActionState(claimThread, initialState);

  // A fresh key per actual submit — see resolve-thread-form.tsx for why this
  // can't just be generated once per mount.
  function submitWithFreshIdempotencyKey(formData: FormData) {
    formData.set("idempotencyKey", crypto.randomUUID());
    return formAction(formData);
  }

  if (state.status === "success") return null; // page revalidates and re-renders as "claimed"

  return (
    <form action={submitWithFreshIdempotencyKey} className="flex flex-col gap-2">
      <input type="hidden" name="threadId" value={threadId} />
      <input type="hidden" name="claimant" value={claimant} />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending || !claimant}
          className="rounded-full border border-border-strong px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent-strong disabled:opacity-50"
        >
          {pending ? "Claiming…" : "Claim thread"}
        </button>
        <p className="text-sm text-foreground-subtle">Let others know you&apos;re on it, or resolve it directly below.</p>
      </div>

      {(state.formError || state.fieldErrors?.claimant) && (
        <p role="alert" className="text-sm text-danger">
          {state.formError ?? state.fieldErrors?.claimant?.[0]}
        </p>
      )}
    </form>
  );
}
