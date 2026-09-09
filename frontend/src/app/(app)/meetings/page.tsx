import Link from "next/link";
import { listMeetings } from "@/lib/data/meetings";

// Same reasoning as threads/page.tsx — read D1 live on every request, since
// a newly-registered meeting must show up immediately after redirect.
export const dynamic = "force-dynamic";

export default async function MeetingsPage() {
  const meetings = await listMeetings();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Meetings</h1>
          <p className="mt-1 text-sm text-foreground-muted">Every meeting registered so far.</p>
        </div>
        <Link
          href="/meetings/new"
          className="shrink-0 whitespace-nowrap rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-[0_0_20px_-4px_var(--accent)] transition-opacity hover:opacity-90"
        >
          Register meeting
        </Link>
      </div>

      <ul className="mt-8 flex flex-col gap-3">
        {meetings.length === 0 ? (
          <li className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-foreground-muted">
            No meetings registered yet.
          </li>
        ) : (
          meetings.map((meeting) => (
            <li key={meeting.id}>
              <Link
                href={`/meetings/${meeting.id}`}
                className="block rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent hover:bg-surface-hover"
              >
                <p className="font-medium text-foreground">{meeting.title}</p>
                <p className="mt-1 text-sm text-foreground-muted">
                  {new Date(meeting.occurredAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  · {meeting.participants.join(", ")}
                </p>
                <p className="mt-2 text-xs text-foreground-subtle">
                  {meeting.transcriptKey ? "Transcript attached" : "No transcript attached yet"}
                </p>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
