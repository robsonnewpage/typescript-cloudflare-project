"use client";

export default function ThreadsError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div role="alert" className="mx-auto max-w-2xl px-6 py-12">
      <h2 className="text-lg font-semibold text-foreground">Couldn&apos;t load the inbox</h2>
      <p className="mt-2 text-sm text-foreground-muted">{error.message}</p>
      <button
        onClick={() => retry()}
        className="mt-4 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
