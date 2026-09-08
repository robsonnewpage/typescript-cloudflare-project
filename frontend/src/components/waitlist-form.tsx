"use client";

import { useState, type FormEvent } from "react";
import { fetchJson } from "@/lib/fetch";
import type { WaitlistResponse } from "@/model/waitlist-response";
import type { SubmissionState } from "@/model/submission-state";

export function WaitlistForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submission, setSubmission] = useState<SubmissionState>({ status: "idle" });

  const isSubmitting = submission.status === "submitting";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmission({ status: "submitting" });

    try {
      const result = await fetchJson<WaitlistResponse>("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      setSubmission({ status: "success", message: result.message });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      setSubmission({ status: "error", message });
    }
  }

  if (submission.status === "success") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <p className="font-medium text-green-800">{submission.message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none disabled:opacity-50"
        />
      </div>

      {submission.status === "error" && (
        <p className="text-sm text-red-600">{submission.message}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {isSubmitting ? "Submitting…" : "Join the waitlist"}
      </button>
    </form>
  );
}
