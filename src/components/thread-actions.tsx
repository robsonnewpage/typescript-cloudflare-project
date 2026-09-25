"use client";

import { useState } from "react";
import type { ThreadStatus } from "@/model/thread";
import { ClaimThreadForm } from "@/components/claim-thread-form";
import { ResolveThreadForm } from "@/components/resolve-thread-form";
import { ReopenThreadForm } from "@/components/reopen-thread-form";

const OTHER = "__other__";

const fieldClass =
  "rounded-lg border border-border-strong bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-subtle focus:border-accent focus:outline-none";

interface ThreadActionsProps {
  threadId: string;
  status: ThreadStatus;
  claimedBy: string | null;
  participants: string[];
}

// One name picker for every action on the thread, so claim, resolve and
// reopen can't disagree on who's acting. The arbiter compares names by exact
// string, which is why picking a participant beats typing: a claim made as
// "Alice Chen" can only be resolved as "Alice Chen".
export function ThreadActions({ threadId, status, claimedBy, participants }: ThreadActionsProps) {
  const hasParticipants = participants.length > 0;
  const [selection, setSelection] = useState(() => {
    if (!hasParticipants) return OTHER;
    if (claimedBy) return participants.includes(claimedBy) ? claimedBy : OTHER;
    return "";
  });
  const [otherName, setOtherName] = useState(() =>
    claimedBy && !participants.includes(claimedBy) ? claimedBy : "",
  );

  const name = (selection === OTHER ? otherName : selection).trim();

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="actor-name" className="text-sm font-medium text-foreground-muted">
          Your name
        </label>
        {hasParticipants && (
          <select
            id="actor-name"
            value={selection}
            onChange={(event) => setSelection(event.target.value)}
            className={fieldClass}
          >
            <option value="" disabled>
              Choose your name
            </option>
            {participants.map((participant) => (
              <option key={participant} value={participant}>
                {participant}
              </option>
            ))}
            <option value={OTHER}>Other…</option>
          </select>
        )}
        {selection === OTHER && (
          <input
            id={hasParticipants ? "actor-name-other" : "actor-name"}
            type="text"
            value={otherName}
            onChange={(event) => setOtherName(event.target.value)}
            placeholder="Type your name"
            maxLength={80}
            aria-label={hasParticipants ? "Your name (not a participant)" : undefined}
            className={fieldClass}
          />
        )}
      </div>

      {status === "resolved" ? (
        <ReopenThreadForm threadId={threadId} reopenedBy={name} />
      ) : (
        <>
          {status === "open" && <ClaimThreadForm threadId={threadId} claimant={name} />}
          <ResolveThreadForm threadId={threadId} resolvedBy={name} />
        </>
      )}
    </div>
  );
}
