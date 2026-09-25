"use client";

import { useActionState, useState, type FocusEvent } from "react";
import { resolveThread, type ResolveThreadState } from "@/app/(app)/threads/[threadId]/actions";
import { resolveThreadSchema } from "@/lib/validation/resolve-thread-schema";

const initialState: ResolveThreadState = { status: "idle" };

export function ResolveThreadForm({ threadId }: { threadId: string }) {
  const [state, formAction, pending] = useActionState(resolveThread, initialState);
  const [liveError, setLiveError] = useState<string | null>(null);

  // A fresh key per actual submit (not per mount): the DO uses it to make a
  // network-level retry of the SAME submission a no-op, but a resubmit after
  // a rejected attempt (e.g. wrong name) is a new attempt and must not reuse
  // — and get short-circuited by — a previous attempt's cached outcome.
  function submitWithFreshIdempotencyKey(formData: FormData) {
    formData.set("idempotencyKey", crypto.randomUUID());
    return formAction(formData);
  }

  function handleBlur(event: FocusEvent<HTMLTextAreaElement>) {
    const result = resolveThreadSchema.shape.resolutionStatement.safeParse(event.target.value);
    setLiveError(result.success ? null : (result.error.issues[0]?.message ?? null));
  }

  if (state.status === "success") {
    return (
      <div className="rounded-xl border border-success-muted bg-surface p-6">
        <p className="font-medium text-success">Resolved. Nice work closing the loop.</p>
      </div>
    );
  }

  return (
    <form action={submitWithFreshIdempotencyKey} className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
      <input type="hidden" name="threadId" value={threadId} />

      <div className="flex flex-col gap-1">
        <label htmlFor="resolvedBy" className="text-sm font-medium text-foreground-muted">
          Your name
        </label>
        <input
          id="resolvedBy"
          name="resolvedBy"
          type="text"
          required
          disabled={pending}
          className="rounded-lg border border-border-strong bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-subtle focus:border-accent focus:outline-none disabled:opacity-50"
        />
        {state.fieldErrors?.resolvedBy && (
          <p role="alert" className="text-sm text-danger">
            {state.fieldErrors.resolvedBy[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="resolutionStatement" className="text-sm font-medium text-foreground-muted">
          Resolution
        </label>
        <textarea
          id="resolutionStatement"
          name="resolutionStatement"
          rows={4}
          required
          minLength={10}
          maxLength={2000}
          disabled={pending}
          onBlur={handleBlur}
          className="rounded-lg border border-border-strong bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-subtle focus:border-accent focus:outline-none disabled:opacity-50"
        />
        {(liveError || state.fieldErrors?.resolutionStatement) && (
          <p role="alert" className="text-sm text-danger">
            {liveError ?? state.fieldErrors?.resolutionStatement?.[0]}
          </p>
        )}
      </div>

      {state.formError && (
        <p role="alert" className="text-sm text-danger">
          {state.formError}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-[0_0_20px_-4px_var(--accent)] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Resolving…" : "Resolve thread"}
      </button>
    </form>
  );
}
