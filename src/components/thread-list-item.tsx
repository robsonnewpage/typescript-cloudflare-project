import Link from "next/link";
import type { OpenThreadView } from "@/lib/data/threads";

export function ThreadListItem({ view }: { view: OpenThreadView }) {
  const { thread, fact, meetingTitle } = view;
  return (
    <li>
      <Link
        href={`/threads/${thread.id}`}
        className="block rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent hover:bg-surface-hover"
      >
        <p className="font-medium text-foreground">{fact.statement}</p>
        <p className="mt-1 text-sm text-foreground-muted">
          {meetingTitle}
          {thread.status === "claimed" && (
            <span className="ml-2 rounded-full bg-warning-muted px-2 py-0.5 text-xs font-medium text-warning">
              claimed by {thread.claimedBy}
            </span>
          )}
        </p>
      </Link>
    </li>
  );
}
