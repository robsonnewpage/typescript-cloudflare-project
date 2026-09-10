"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatCueTime, parseWebVTT, type TranscriptCue } from "@/lib/webvtt";

function normalize(text: string): string {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

const SPEAKER_COLORS = [
  { text: "text-sky-400", dot: "bg-sky-400" },
  { text: "text-teal-400", dot: "bg-teal-400" },
  { text: "text-fuchsia-400", dot: "bg-fuchsia-400" },
  { text: "text-orange-400", dot: "bg-orange-400" },
  { text: "text-lime-400", dot: "bg-lime-400" },
  { text: "text-cyan-400", dot: "bg-cyan-400" },
];

function colorForSpeaker(speaker: string, order: string[]): (typeof SPEAKER_COLORS)[number] {
  const index = order.indexOf(speaker);
  return SPEAKER_COLORS[index % SPEAKER_COLORS.length];
}

interface Group {
  speaker: string | null;
  cues: TranscriptCue[];
}

function groupBySpeaker(cues: TranscriptCue[]): Group[] {
  const groups: Group[] = [];
  for (const cue of cues) {
    const last = groups[groups.length - 1];
    if (last && last.speaker === cue.speaker) {
      last.cues.push(cue);
    } else {
      groups.push({ speaker: cue.speaker, cues: [cue] });
    }
  }
  return groups;
}

interface TranscriptViewerProps {
  url: string;
  filename: string;
  onClose: () => void;
  meetingTitle?: string;
  highlightQuote?: string;
}

export function TranscriptViewer({ url, filename, onClose, meetingTitle, highlightQuote }: TranscriptViewerProps) {
  const [status, setStatus] = useState<"loading" | "error" | "done">("loading");
  const [cues, setCues] = useState<TranscriptCue[]>([]);
  const highlightRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Couldn't load transcript (${res.status}).`);
        return res.text();
      })
      .then((text) => {
        if (cancelled) return;
        setCues(parseWebVTT(text));
        setStatus("done");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const speakerOrder = useMemo(() => {
    const seen: string[] = [];
    for (const cue of cues) {
      if (cue.speaker && !seen.includes(cue.speaker)) seen.push(cue.speaker);
    }
    return seen;
  }, [cues]);

  const groups = useMemo(() => groupBySpeaker(cues), [cues]);

  // Reference equality works here: groupBySpeaker pushes the same cue
  // objects into each group, it doesn't clone them.
  const highlightedCue = useMemo(() => {
    if (!highlightQuote) return null;
    const target = normalize(highlightQuote);
    return cues.find((cue) => normalize(cue.text) === target || normalize(cue.text).includes(target)) ?? null;
  }, [cues, highlightQuote]);

  useEffect(() => {
    if (status === "done" && highlightedCue && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [status, highlightedCue]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Transcript: ${filename}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border-strong bg-surface shadow-2xl animate-[slideUp_180ms_ease-out]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-foreground-subtle uppercase">
              {meetingTitle ?? "Transcript"}
            </p>
            <p className="mt-0.5 font-medium text-foreground">{filename}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-foreground-muted transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {status === "loading" && (
            <div className="flex flex-col gap-4 animate-pulse">
              <div className="h-4 w-1/3 rounded bg-surface-hover" />
              <div className="h-4 w-2/3 rounded bg-surface-hover" />
              <div className="h-4 w-1/2 rounded bg-surface-hover" />
            </div>
          )}

          {status === "error" && (
            <p role="alert" className="text-sm text-danger">
              Couldn&apos;t load this transcript. The link may have expired — try opening it again.
            </p>
          )}

          {status === "done" && cues.length === 0 && (
            <p className="text-sm text-foreground-muted">This file has no readable cues.</p>
          )}

          {status === "done" && cues.length > 0 && (
            <ol className="flex flex-col gap-4">
              {groups.map((group, groupIndex) => {
                const color = group.speaker ? colorForSpeaker(group.speaker, speakerOrder) : null;
                return (
                  <li key={groupIndex} className="flex gap-3">
                    <div className="flex w-8 shrink-0 flex-col items-center pt-0.5">
                      <span className={`h-2 w-2 rounded-full ${color?.dot ?? "bg-foreground-subtle"}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        {group.speaker && (
                          <span className={`text-sm font-semibold ${color?.text ?? "text-foreground"}`}>
                            {group.speaker}
                          </span>
                        )}
                        <span className="font-mono text-xs text-foreground-subtle tabular-nums">
                          {formatCueTime(group.cues[0].start)}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-col gap-1.5">
                        {group.cues.map((cue, cueIndex) => {
                          const isHighlighted = cue === highlightedCue;
                          return (
                            <p
                              key={cueIndex}
                              ref={isHighlighted ? highlightRef : undefined}
                              className={`text-sm leading-relaxed ${
                                isHighlighted
                                  ? "-mx-2 rounded-lg border border-accent bg-accent-muted px-2 py-1 text-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {cue.text}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
