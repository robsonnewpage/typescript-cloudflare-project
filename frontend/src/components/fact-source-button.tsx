"use client";

import { useState, type ReactNode } from "react";
import { getFactSourceUrl } from "@/app/(app)/search/actions";
import { TranscriptViewer } from "@/components/transcript-viewer";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | { status: "done"; url: string; meetingTitle: string };

export function FactSourceButton({ meetingId, quote, children }: { meetingId: string; quote: string; children: ReactNode }) {
  const [state, setState] = useState<State>({ status: "idle" });

  async function handleClick() {
    setState({ status: "loading" });
    const source = await getFactSourceUrl(meetingId);
    setState(source ? { status: "done", url: source.url, meetingTitle: source.meetingTitle } : { status: "error" });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={state.status === "loading"}
        className="block w-full rounded-lg text-left transition-opacity disabled:opacity-70"
      >
        {children}
      </button>
      {state.status === "loading" && <p className="mt-1 text-xs text-foreground-subtle">Opening source…</p>}
      {state.status === "error" && (
        <p role="alert" className="mt-1 text-xs text-danger">
          No transcript attached to this meeting yet.
        </p>
      )}
      {state.status === "done" && (
        <TranscriptViewer
          url={state.url}
          filename="transcript.vtt"
          meetingTitle={state.meetingTitle}
          highlightQuote={quote}
          onClose={() => setState({ status: "idle" })}
        />
      )}
    </>
  );
}
