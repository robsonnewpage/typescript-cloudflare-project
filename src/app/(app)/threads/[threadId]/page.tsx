import { notFound } from "next/navigation";
import { getThreadDetail } from "@/lib/data/threads";
import { ThreadActions } from "@/components/thread-actions";
import { FactSourceButton } from "@/components/fact-source-button";

// Same reasoning as threads/page.tsx — read D1 live on every request.
export const dynamic = "force-dynamic";

export default async function ThreadDetailPage(props: PageProps<"/threads/[threadId]">) {
  const { threadId } = await props.params;
  const detail = await getThreadDetail(threadId);
  if (!detail) notFound();

  const { thread, fact, meetingTitle, meetingParticipants, meetingHasTranscript } = detail;

  return (
    <article className="mx-auto max-w-2xl px-6 py-12">
      <p className="text-sm text-foreground-muted">{meetingTitle}</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{fact.statement}</h1>

      <blockquote className="mt-6 border-l-2 border-border-strong pl-4 text-sm italic text-foreground-muted">
        &quot;{fact.quote}&quot;
        <footer className="mt-1 not-italic text-foreground-subtle">
          — {fact.speakers.join(", ")}, turns {fact.startTurnIndex}–{fact.endTurnIndex}
        </footer>
      </blockquote>

      {/* Same viewer search uses: opens the meeting's transcript with this quote highlighted. */}
      {meetingHasTranscript && (
        <div className="mt-3 w-fit">
          <FactSourceButton meetingId={fact.meetingId} quote={fact.quote}>
            <span className="text-sm text-accent-strong hover:underline">View in transcript →</span>
          </FactSourceButton>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-6">
        {thread.status === "resolved" && (
          <div className="rounded-xl border border-success-muted bg-surface p-6">
            <p className="text-sm text-foreground-muted">
              Resolved by {thread.resolvedBy} on{" "}
              {thread.resolvedAt && new Date(thread.resolvedAt).toLocaleString()}
            </p>
            <p className="mt-2 text-foreground">{thread.resolutionStatement}</p>
          </div>
        )}
        {thread.status === "claimed" && (
          <p className="rounded-lg border border-warning-muted bg-warning-muted/40 px-4 py-3 text-sm text-warning">
            Claimed by {thread.claimedBy} — resolving now needs that same name, or it&apos;ll reopen on its own after 30
            minutes of inactivity.
          </p>
        )}
        {/* Keyed by status so the picker re-reads claimedBy after each transition. */}
        <ThreadActions
          key={thread.status}
          threadId={thread.id}
          status={thread.status}
          claimedBy={thread.claimedBy}
          participants={meetingParticipants}
        />
      </div>
    </article>
  );
}
