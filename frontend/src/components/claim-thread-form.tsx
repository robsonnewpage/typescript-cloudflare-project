"use client";

import { useActionState } from "react";
import { claimThread, type ClaimThreadState } from "@/app/(app)/threads/[threadId]/actions";

const initialState: ClaimThreadState = { status: "idle" };

export function ClaimThreadForm({ threadId }: { threadId: string }) {
  const [state, formAction, pending] = useActionState(claimThread, initialState);

  // A fresh key per actual submit — see resolve-thread-form.tsx for why this
  // can't just be generated once per mount.
  function submitWithFreshIdempotencyKey(formData: FormData) {
    formData.set("idempotencyKey", crypto.randomUUID());
    return formAction(formData);
  }

  if (state.status === "success") return null; // page revalidates and re-renders as "claimed"

  return (
    <form action={submitWithFreshIdempotencyKey} className="flex items-end gap-2">
      <input type="hidden" name="threadId" value={threadId} />

      <div className="flex flex-col gap-1">
        <label htmlFor="claimant" className="text-sm font-medium text-foreground-muted">
          Your name
        </label>
        <input
          id="claimant"
          name="claimant"
          type="text"
          required
          disabled={pending}
          className="rounded-lg border border-border-strong bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-subtle focus:border-accent focus:outline-none disabled:opacity-50"
        />
        {state.fieldErrors?.claimant && (
          <p role="alert" className="text-sm text-danger">
            {state.fieldErrors.claimant[0]}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-border-strong px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent-strong disabled:opacity-50"
      >
        {pending ? "Claiming…" : "Claim thread"}
      </button>

      {state.formError && (
        <p role="alert" className="text-sm text-danger">
          {state.formError}
        </p>
      )}
    </form>
  );
}
