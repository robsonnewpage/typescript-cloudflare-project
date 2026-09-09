import { listOpenThreads, listRecentlyResolved } from "@/lib/data/threads";
import { ThreadListItem } from "@/components/thread-list-item";

// This page now reads D1 on every request. Without this, Next's Full Route
// Cache would prerender it statically and bake in whatever the local build-time
// D1 simulation contained, not live data — revalidatePath alone can't fix that
// for a page that was never dynamic in the first place.
export const dynamic = "force-dynamic";

export default async function ThreadsPage() {
  const [open, resolved] = await Promise.all([listOpenThreads(), listRecentlyResolved()]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Open threads</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        Unanswered questions your meetings raised. Resolve one to close the loop.
      </p>

      <ul className="mt-8 flex flex-col gap-3">
        {open.length === 0 ? (
          <li className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-foreground-muted">
            Nothing open right now — every thread from your meetings has been resolved.
          </li>
        ) : (
          open.map((view) => <ThreadListItem key={view.thread.id} view={view} />)
        )}
      </ul>

      {resolved.length > 0 && (
        <section className="mt-12">
          <h2 className="text-sm font-medium text-foreground-subtle uppercase tracking-wide">Recently resolved</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {resolved.map((view) => (
              <li key={view.thread.id}>
                <a href={`/threads/${view.thread.id}`} className="text-sm text-foreground-muted hover:text-accent-strong">
                  {view.fact.statement}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
