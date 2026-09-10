"use client";

import { useState } from "react";

interface StackItem {
  name: string;
  purpose: string;
}

const CLOUDFLARE: StackItem[] = [
  { name: "Workers", purpose: "The whole app — one Worker, no separate backend." },
  { name: "D1", purpose: "SQLite — meetings, facts, threads." },
  { name: "Workers KV", purpose: "Read-through cache for the resolved-threads list." },
  { name: "Vectorize", purpose: "Vector index over fact embeddings — semantic search." },
  { name: "Workers AI", purpose: "Embeddings + Llama-generated, cited answers." },
  { name: "Durable Objects", purpose: "One instance per thread, arbitrates claim → resolve." },
  { name: "Cron Triggers", purpose: "Sweeps stale claims back to open every 15 min." },
  { name: "R2", purpose: "Transcript storage, presigned browser uploads." },
  { name: "Workers Assets", purpose: "Static JS/CSS served straight off the Worker." },
];

const ALSO_IN_THE_STACK: StackItem[] = [
  { name: "Next.js 16", purpose: "App Router, Server Actions, Server Components." },
  { name: "TypeScript", purpose: "Strict, end to end." },
  { name: "Drizzle ORM", purpose: "Schema + migrations for D1." },
  { name: "Zod", purpose: "Validation shared between client and server." },
  { name: "Tailwind CSS v4", purpose: "Styling, CSS-first theme tokens." },
  { name: "aws4fetch", purpose: "Signs R2's S3-compatible presigned URLs." },
];

export function TechStackPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="text-xs text-foreground-subtle transition-colors hover:text-accent-strong"
      >
        {open ? "Hide" : "Stats for nerds"}
      </button>

      {open && (
        <div className="mx-auto mt-4 max-w-2xl text-left">
          <StackGroup title="Cloudflare" items={CLOUDFLARE} />
          <div className="mt-4">
            <StackGroup title="Also in the stack" items={ALSO_IN_THE_STACK} />
          </div>
        </div>
      )}
    </div>
  );
}

function StackGroup({ title, items }: { title: string; items: StackItem[] }) {
  return (
    <div>
      <p className="text-xs font-medium tracking-wide text-foreground-subtle uppercase">{title}</p>
      <dl className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.name} className="flex items-baseline gap-2">
            <dt className="shrink-0 rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-foreground">
              {item.name}
            </dt>
            <dd className="text-xs text-foreground-subtle">{item.purpose}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
