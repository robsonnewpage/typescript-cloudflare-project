import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 sm:px-6">
          <span className="flex shrink-0 items-center gap-2 text-base font-semibold whitespace-nowrap text-foreground sm:text-lg">
            <span className="h-2 w-2 shrink-0 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
            Meeting Intelligence
          </span>
          <Link
            href="/threads"
            className="shrink-0 whitespace-nowrap rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-[0_0_20px_-4px_var(--accent)] transition-opacity hover:opacity-90"
          >
            Open the app
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden px-6 py-24 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 opacity-40 blur-3xl"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 0%, var(--accent) 0%, transparent 70%)",
            }}
          />
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-foreground text-balance sm:text-5xl">
            Every open question from your meetings, answered before it is{" "}
            <span className="bg-gradient-to-r from-accent to-accent-strong bg-clip-text text-transparent">
              forgotten
            </span>
            .
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground-muted">
            Upload the transcripts. Meeting Intelligence indexes them for search, pulls out every
            decision, commitment, and open thread, and gives your team one inbox to close the loop
            on what is still open.
          </p>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid gap-6 sm:grid-cols-3">
            <Feature
              title="Ask across every transcript"
              description="Get answers with inline citations back to the exact moment someone said it."
            />
            <Feature
              title="Nothing falls through the cracks"
              description="Every open thread a meeting produced lands in one inbox, so the right person can close it out."
            />
            <Feature
              title="One resolution, no duplicates"
              description="When two teammates both go to resolve the same open thread, only one resolution sticks — the other finds out immediately."
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-8 text-center text-sm text-foreground-subtle">
          Meeting Intelligence. Built for Project JEDI training.
        </div>
      </footer>
    </div>
  );
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-foreground-muted">{description}</p>
    </div>
  );
}
