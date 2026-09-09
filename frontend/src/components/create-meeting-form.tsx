"use client";

import { useActionState } from "react";
import { createMeetingAction, type CreateMeetingState } from "@/app/(app)/meetings/new/actions";

const initialState: CreateMeetingState = { status: "idle" };

export function CreateMeetingForm() {
  const [state, formAction, pending] = useActionState(createMeetingAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium text-foreground-muted">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="Q3 Renewal — Weekly Sync"
          required
          disabled={pending}
          className="rounded-lg border border-border-strong bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-subtle focus:border-accent focus:outline-none disabled:opacity-50"
        />
        {state.fieldErrors?.title && (
          <p role="alert" className="text-sm text-danger">
            {state.fieldErrors.title[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="occurredAt" className="text-sm font-medium text-foreground-muted">
          Date
        </label>
        <input
          id="occurredAt"
          name="occurredAt"
          type="date"
          required
          disabled={pending}
          className="rounded-lg border border-border-strong bg-background px-3 py-2 text-sm text-foreground [color-scheme:dark] focus:border-accent focus:outline-none disabled:opacity-50"
        />
        {state.fieldErrors?.occurredAt && (
          <p role="alert" className="text-sm text-danger">
            {state.fieldErrors.occurredAt[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="participants" className="text-sm font-medium text-foreground-muted">
          Participants
        </label>
        <input
          id="participants"
          name="participants"
          type="text"
          placeholder="Alice Chen, Bob Ibrahim, Priya Nair"
          required
          disabled={pending}
          className="rounded-lg border border-border-strong bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-subtle focus:border-accent focus:outline-none disabled:opacity-50"
        />
        <p className="text-xs text-foreground-subtle">Comma-separated names.</p>
        {state.fieldErrors?.participants && (
          <p role="alert" className="text-sm text-danger">
            {state.fieldErrors.participants[0]}
          </p>
        )}
      </div>

      <p className="text-xs text-foreground-subtle">
        You can attach a transcript on the next screen once the meeting&apos;s created.
      </p>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-[0_0_20px_-4px_var(--accent)] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create meeting"}
      </button>
    </form>
  );
}
