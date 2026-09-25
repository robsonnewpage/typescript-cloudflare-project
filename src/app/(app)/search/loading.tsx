export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse px-6 py-12">
      <div className="h-7 w-56 rounded bg-surface" />
      <div className="mt-4 h-4 w-full rounded bg-surface" />
      <div className="mt-2 h-4 w-2/3 rounded bg-surface" />

      <div className="mt-8 flex gap-2">
        <div className="h-11 flex-1 rounded-full bg-surface" />
        <div className="h-11 w-20 rounded-full bg-surface" />
      </div>

      <div className="mt-10 flex flex-col gap-6">
        <div className="h-20 rounded-xl bg-surface" />
        <div className="flex flex-col gap-3">
          <div className="h-16 rounded-xl bg-surface" />
          <div className="h-16 rounded-xl bg-surface" />
          <div className="h-16 rounded-xl bg-surface" />
        </div>
      </div>
    </div>
  );
}
