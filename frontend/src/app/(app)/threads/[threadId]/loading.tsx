export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse px-6 py-12">
      <div className="h-3 w-40 rounded bg-surface" />
      <div className="mt-3 h-7 w-full rounded bg-surface" />
      <div className="mt-8 h-24 w-full rounded-xl bg-surface" />
    </div>
  );
}
