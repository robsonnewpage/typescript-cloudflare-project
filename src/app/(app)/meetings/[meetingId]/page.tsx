import Link from "next/link";
import { notFound } from "next/navigation";
import { getMeeting, listMeetingFacts, type MeetingFactView } from "@/lib/data/meetings";
import { FactKindBadge, PersonBadge, ThreadStatusLabel, responsiblePerson } from "@/components/fact-kind-badge";
import type { FactKind } from "@/model/fact";
import { TranscriptUpload } from "@/components/transcript-upload";
import { DeleteMeetingButton } from "@/components/delete-meeting-button";

// Same reasoning as the rest of the app's data pages — read D1 live.
export const dynamic = "force-dynamic";

export default async function MeetingDetailPage(props: PageProps<"/meetings/[meetingId]">) {
  const { meetingId } = await props.params;
  const [meeting, meetingFacts] = await Promise.all([getMeeting(meetingId), listMeetingFacts(meetingId)]);
  if (!meeting) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/meetings" className="text-sm text-foreground-muted hover:text-accent-strong">
        ← Meetings
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{meeting.title}</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            {new Date(meeting.occurredAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            · {meeting.participants.join(", ")}
          </p>
        </div>
        <DeleteMeetingButton meetingId={meeting.id} meetingTitle={meeting.title} />
      </div>

      <section className="mt-10 flex flex-col gap-8">
        {meetingFacts.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-foreground-muted">
            No decisions, commitments or open threads recorded for this meeting yet.
          </p>
        ) : (
          FACT_GROUPS.map(({ kind, title }) => (
            <FactGroup key={kind} kind={kind} title={title} items={meetingFacts.filter((f) => f.fact.kind === kind)} />
          ))
        )}
      </section>

      <div className="mt-10">
        <TranscriptUpload meetingId={meeting.id} transcriptKey={meeting.transcriptKey} />
      </div>
    </div>
  );
}

const FACT_GROUPS: { kind: FactKind; title: string }[] = [
  { kind: "decision", title: "Decisions" },
  { kind: "commitment", title: "Commitments" },
  { kind: "open_thread", title: "Open threads" },
];

function FactGroup({ kind, title, items }: { kind: FactKind; title: string; items: MeetingFactView[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h2 className="flex items-center gap-2 text-sm font-medium tracking-wide text-foreground-subtle uppercase">
        {title} <span className="tabular-nums">{items.length}</span>
      </h2>
      <ul className="mt-3 flex flex-col gap-3">
        {items.map(({ fact, threadStatus, claimedBy, resolvedBy }) => {
          const responsible = responsiblePerson(
            fact,
            threadStatus ? { status: threadStatus, claimedBy, resolvedBy } : null,
          );
          return (
            <li key={fact.id} className="rounded-xl border border-border bg-surface p-4">
              <p className="font-medium text-foreground">{fact.statement}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground-subtle">
                <FactKindBadge kind={kind} />
                {responsible && <PersonBadge name={responsible} />}
                {kind === "commitment" && fact.due && <span>due {fact.due}</span>}
                <span>{fact.speakers.join(", ")}</span>
                {threadStatus && (
                  <>
                    <ThreadStatusLabel status={threadStatus} />
                    <Link href={`/threads/${fact.id}`} className="text-accent-strong hover:underline">
                      Open thread →
                    </Link>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
