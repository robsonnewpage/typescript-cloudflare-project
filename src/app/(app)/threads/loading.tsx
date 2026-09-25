export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse px-6 py-12">
      <div className="h-7 w-48 rounded bg-surface" />
      <div className="mt-4 h-4 w-72 rounded bg-surface" />
      <div className="mt-8 flex flex-col gap-3">
        <div className="h-16 rounded-xl bg-surface" />
        <div className="h-16 rounded-xl bg-surface" />
      </div>
    </div>
  );
}
