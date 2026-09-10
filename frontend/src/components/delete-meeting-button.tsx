"use client";

import { useState, useTransition } from "react";
import { deleteMeetingAction } from "@/app/(app)/meetings/[meetingId]/actions";

export function DeleteMeetingButton({ meetingId, meetingTitle }: { meetingId: string; meetingTitle: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(() => {
      deleteMeetingAction(meetingId);
    });
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-danger-muted bg-surface p-4">
        <p className="flex-1 text-sm text-foreground">
          Delete <span className="font-medium">{meetingTitle}</span> and everything extracted from it — facts,
          threads, transcript? This can&apos;t be undone.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={isPending}
            className="rounded-full border border-border-strong px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-accent disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-full bg-danger px-3 py-1.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent-foreground/40 border-t-accent-foreground" />
                Deleting…
              </span>
            ) : (
              "Confirm delete"
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="rounded-full border border-border-strong px-3 py-1.5 text-sm font-medium text-danger transition-colors hover:border-danger"
    >
      Delete meeting
    </button>
  );
}
