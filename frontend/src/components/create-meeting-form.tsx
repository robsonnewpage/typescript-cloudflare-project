"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { createMeetingAction } from "@/app/(app)/meetings/new/actions";
import { createTranscriptUploadUrl, confirmTranscriptUpload } from "@/app/(app)/meetings/[meetingId]/actions";
import { parseWebVTT, uniqueSpeakers } from "@/lib/webvtt";
import type { CreateMeetingInput } from "@/lib/validation/create-meeting-schema";

type Status = "idle" | "submitting" | "error";
type FieldErrors = Partial<Record<keyof CreateMeetingInput, string[]>>;

export function CreateMeetingForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [occurredAt, setOccurredAt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setFormError(null);
    if (!selected) {
      setParticipants([]);
      return;
    }
    const text = await selected.text();
    setParticipants(uniqueSpeakers(parseWebVTT(text)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;
    if (participants.length === 0) {
      setFormError("Couldn't find any speakers in that transcript — check the file uses \"Speaker: text\" or a <v> voice tag per cue.");
      return;
    }

    setStatus("submitting");
    setFormError(null);
    setFieldErrors({});

    const result = await createMeetingAction({ title, occurredAt, participants });
    if (result.status === "error") {
      setStatus("error");
      setFieldErrors(result.fieldErrors);
      return;
    }

    try {
      const contentType = file.type || "text/vtt";
      const { key, url } = await createTranscriptUploadUrl(result.meeting.id, file.name, contentType);
      const response = await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": contentType } });
      if (!response.ok) throw new Error(`Transcript upload failed (${response.status}).`);
      await confirmTranscriptUpload(result.meeting.id, key);
    } catch {
      // The meeting itself was created successfully — land on it rather
      // than losing that, and let them retry the attach from there.
      router.push(`/meetings/${result.meeting.id}`);
      return;
    }

    router.push(`/meetings/${result.meeting.id}`);
  }

  const pending = status === "submitting";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-col gap-1">
        <label htmlFor="transcript-file" className="text-sm font-medium text-foreground-muted">
          Transcript (WebVTT)
        </label>
        <input
          id="transcript-file"
          type="file"
          accept=".vtt,text/vtt"
          required
          disabled={pending}
          onChange={handleFileChange}
          className="text-sm text-foreground-muted file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent-foreground hover:file:opacity-90 disabled:opacity-50"
        />
        <p className="text-xs text-foreground-subtle">
          Participants are read from the transcript&apos;s speakers — WebVTT has no field for a participant list, so
          there&apos;s nothing to derive that from otherwise.
        </p>
        {participants.length > 0 && (
          <p className="mt-1 text-xs text-foreground-muted">
            <span className="text-foreground-subtle">Detected: </span>
            {participants.join(", ")}
          </p>
        )}
        {formError && (
          <p role="alert" className="text-sm text-danger">
            {formError}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium text-foreground-muted">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Q3 Renewal — Weekly Sync"
          required
          disabled={pending}
          className="rounded-lg border border-border-strong bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-subtle focus:border-accent focus:outline-none disabled:opacity-50"
        />
        <p className="text-xs text-foreground-subtle">Not in WebVTT either — there&apos;s no standard title field.</p>
        {fieldErrors.title && (
          <p role="alert" className="text-sm text-danger">
            {fieldErrors.title[0]}
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
          value={occurredAt}
          onChange={(event) => setOccurredAt(event.target.value)}
          required
          disabled={pending}
          className="rounded-lg border border-border-strong bg-background px-3 py-2 text-sm text-foreground [color-scheme:dark] focus:border-accent focus:outline-none disabled:opacity-50"
        />
        <p className="text-xs text-foreground-subtle">
          WebVTT has no field for this either — it&apos;s purely cues and timestamps, no recording-date metadata.
        </p>
        {fieldErrors.occurredAt && (
          <p role="alert" className="text-sm text-danger">
            {fieldErrors.occurredAt[0]}
          </p>
        )}
      </div>

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
