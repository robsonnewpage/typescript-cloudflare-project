import Link from "next/link";
import { askQuestion } from "@/lib/data/search";
import { AskForm } from "@/components/ask-form";
import { FactSourceButton } from "@/components/fact-source-button";
import { FactKindBadge, PersonBadge, ThreadStatusLabel, responsiblePerson } from "@/components/fact-kind-badge";
import { getThreadStatuses } from "@/lib/data/threads";

// Reads live on every request — a search result page has no business being
// statically cached.
export const dynamic = "force-dynamic";

export default async function SearchPage(props: PageProps<"/search">) {
  const params = await props.searchParams;
  const question = typeof params.q === "string" ? params.q : "";
  const result = question ? await askQuestion(question) : null;
  const citedFacts = result?.citedFacts ?? [];
  const threadStatuses = await getThreadStatuses(
    citedFacts.filter(({ fact }) => fact.kind === "open_thread").map(({ fact }) => fact.id),
  );
  const cited = citedFacts.map((r) => {
    const thread = threadStatuses.get(r.fact.id) ?? null;
    return { ...r, thread, responsible: responsiblePerson(r.fact, thread) };
  });

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Ask your meetings</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        Semantic search over every decision, commitment, and open thread — grounded, cited answers, not keyword
        matching.
      </p>

      <AskForm defaultValue={question} />

      {result && (
        <div className="mt-10 flex flex-col gap-6">
          {result.answer ? (
            <div className="rounded-xl border border-accent-muted bg-accent-muted/40 p-5">
              <p className="text-xs font-medium tracking-wide text-accent-strong uppercase">Answer</p>
              <p className="mt-2 text-foreground">{result.answer}</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface p-5 text-sm text-foreground-muted">
              Couldn&apos;t generate an answer right now, but here&apos;s what matched.
            </div>
          )}

          <div>
            <h2 className="text-sm font-medium tracking-wide text-foreground-subtle uppercase">Cited facts</h2>
            <ul className="mt-3 flex flex-col gap-3">
              {cited.map(({ fact, score, thread, responsible }) => (
                <li
                  key={fact.id}
                  className="rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent"
                >
                  <FactSourceButton meetingId={fact.meetingId} quote={fact.quote}>
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-medium text-foreground">{fact.statement}</p>
                      <span className="shrink-0 rounded-full bg-background px-2 py-0.5 text-xs text-foreground-subtle tabular-nums">
                        {score.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-foreground-subtle">
                      <FactKindBadge kind={fact.kind} />
                      {responsible && <PersonBadge name={responsible} />}
                      {fact.kind === "commitment" && fact.due && <span>due {fact.due}</span>}
                      <span>[{fact.id}] · view source</span>
                    </div>
                  </FactSourceButton>
                  {fact.kind === "open_thread" && (
                    <div className="mt-2 flex items-center gap-3">
                      <Link href={`/threads/${fact.id}`} className="text-xs text-accent-strong hover:underline">
                        Open thread →
                      </Link>
                      {thread && <ThreadStatusLabel status={thread.status} />}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
