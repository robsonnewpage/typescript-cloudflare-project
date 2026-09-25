"use client";

import { useState, type ChangeEvent } from "react";
import { confirmTranscriptUpload, createTranscriptUploadUrl, getTranscriptDownloadUrl } from "@/app/(app)/meetings/[meetingId]/actions";
import { TranscriptViewer } from "@/components/transcript-viewer";

type Status = "idle" | "uploading" | "error" | "done";

export function TranscriptUpload({ meetingId, transcriptKey }: { meetingId: string; transcriptKey: string | null }) {
  const [status, setStatus] = useState<Status>(transcriptKey ? "done" : "idle");
  const [key, setKey] = useState<string | null>(transcriptKey);
  const [error, setError] = useState<string | null>(null);
  const [viewer, setViewer] = useState<{ url: string } | null>(null);
  const [openingViewer, setOpeningViewer] = useState(false);

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
    setOpeningViewer(true);
    try {
      const url = await getTranscriptDownloadUrl(key);
      setViewer({ url });
    } finally {
      setOpeningViewer(false);
    }
  }

  if (status === "done" && key) {
    return (
      <>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-success-muted bg-surface p-4">
          <div>
            <p className="text-sm font-medium text-foreground">Transcript attached</p>
            <p className="mt-0.5 text-xs text-foreground-subtle">{key.split("/").pop()}</p>
          </div>
          <button
            type="button"
            onClick={handleView}
            disabled={openingViewer}
            className="shrink-0 rounded-full border border-border-strong px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent-strong disabled:opacity-50"
          >
            {openingViewer ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />
                Opening…
              </span>
            ) : (
              "View"
            )}
          </button>
        </div>

        {viewer && (
          <TranscriptViewer url={viewer.url} filename={key.split("/").pop() ?? "transcript"} onClose={() => setViewer(null)} />
        )}
      </>
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
