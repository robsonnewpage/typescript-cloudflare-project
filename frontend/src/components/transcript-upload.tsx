"use client";

import { useState, type ChangeEvent } from "react";
import { confirmTranscriptUpload, createTranscriptUploadUrl, getTranscriptDownloadUrl } from "@/app/(app)/meetings/[meetingId]/actions";

type Status = "idle" | "uploading" | "error" | "done";

export function TranscriptUpload({ meetingId, transcriptKey }: { meetingId: string; transcriptKey: string | null }) {
  const [status, setStatus] = useState<Status>(transcriptKey ? "done" : "idle");
  const [key, setKey] = useState<string | null>(transcriptKey);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setError(null);

    try {
      const contentType = file.type || "text/vtt";
      const { key: uploadedKey, url } = await createTranscriptUploadUrl(meetingId, file.name, contentType);

      // Straight to R2 from the browser — the presigned URL is the whole
      // point, this never touches the Worker for the file bytes.
      const response = await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": contentType } });
      if (!response.ok) {
        throw new Error(`Upload failed (${response.status}).`);
      }

      await confirmTranscriptUpload(meetingId, uploadedKey);
      setKey(uploadedKey);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Upload failed.");
    }
  }

  async function handleView() {
    if (!key) return;
    const url = await getTranscriptDownloadUrl(key);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (status === "done" && key) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-xl border border-success-muted bg-surface p-4">
        <div>
          <p className="text-sm font-medium text-foreground">Transcript attached</p>
          <p className="mt-0.5 text-xs text-foreground-subtle">{key.split("/").pop()}</p>
        </div>
        <button
          type="button"
          onClick={handleView}
          className="shrink-0 rounded-full border border-border-strong px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent-strong"
        >
          View
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <label htmlFor="transcript-file" className="text-sm font-medium text-foreground-muted">
        Attach a WebVTT transcript
      </label>
      <input
        id="transcript-file"
        type="file"
        accept=".vtt,text/vtt"
        disabled={status === "uploading"}
        onChange={handleFileChange}
        className="mt-2 block w-full text-sm text-foreground-muted file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent-foreground hover:file:opacity-90 disabled:opacity-50"
      />
      {status === "uploading" && <p className="mt-2 text-sm text-foreground-muted">Uploading…</p>}
      {status === "error" && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
