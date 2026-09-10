"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

// A plain <form method="GET"> would trigger a real browser navigation,
// bypassing Next's router entirely — no pending state, no loading.tsx.
// router.push keeps this a client-side transition instead, so isPending
// (and the route's loading.tsx, via Suspense) both actually fire.
export function AskForm({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(defaultValue);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value.trim()) return;
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(value)}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Who's chasing the Acme PO number?"
        required
        disabled={isPending}
        className="min-w-0 flex-1 rounded-full border border-border-strong bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle focus:border-accent focus:outline-none disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={isPending}
        className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground shadow-[0_0_20px_-4px_var(--accent)] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent-foreground/40 border-t-accent-foreground" />
            Asking…
          </span>
        ) : (
          "Ask"
        )}
      </button>
    </form>
  );
}
