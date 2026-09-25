"use client";

import { useActionState } from "react";
import { reopenThread, type ReopenThreadState } from "@/app/(app)/threads/[threadId]/actions";

const initialState: ReopenThreadState = { status: "idle" };

// The name comes from ThreadActions' shared picker; it's posted as a hidden
// field alongside the thread id.
export function ReopenThreadForm({ threadId, reopenedBy }: { threadId: string; reopenedBy: string }) {
  const [state, formAction, pending] = useActionState(reopenThread, initialState);

  // A fresh key per actual submit — see resolve-thread-form.tsx for why.
  function submitWithFreshIdempotencyKey(formData: FormData) {
    formData.set("idempotencyKey", crypto.randomUUID());
    return formAction(formData);
  }

  if (state.status === "success") return null; // page revalidates and re-renders as "open"

  return (
    <form action={submitWithFreshIdempotencyKey} className="flex flex-col gap-2">
      <input type="hidden" name="threadId" value={threadId} />
      <input type="hidden" name="reopenedBy" value={reopenedBy} />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending || !reopenedBy}
          className="rounded-full border border-border-strong px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent-strong disabled:opacity-50"
        >
          {pending ? "Reopening…" : "Reopen thread"}
        </button>
        <p className="text-sm text-foreground-subtle">Clears this resolution and puts the thread back in the inbox.</p>
      </div>

      {(state.formError || state.fieldErrors?.reopenedBy) && (
        <p role="alert" className="text-sm text-danger">
          {state.formError ?? state.fieldErrors?.reopenedBy?.[0]}
        </p>
      )}
    </form>
  );
}
