import type { FactKind } from "@/model/fact";
import type { ThreadStatus } from "@/model/thread";

const KIND_STYLES: Record<FactKind, { label: string; className: string }> = {
  decision: { label: "Decision", className: "bg-accent-muted text-accent-strong" },
  commitment: { label: "Commitment", className: "bg-success-muted text-success" },
  open_thread: { label: "Open thread", className: "bg-warning-muted text-warning" },
};

export function FactKindBadge({ kind }: { kind: FactKind }) {
  const { label, className } = KIND_STYLES[kind];
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{label}</span>;
}

const STATUS_STYLES: Record<ThreadStatus, string> = {
  open: "text-foreground-muted",
  claimed: "text-warning",
  resolved: "text-success",
};

// Deliberately not a pill, so it can't be mistaken for a kind badge sitting next to it.
export function ThreadStatusLabel({ status }: { status: ThreadStatus }) {
  return <span className={`text-xs font-medium ${STATUS_STYLES[status]}`}>● {status}</span>;
}

// Tuned for the app's single dark theme. Picked by name, so the same person
// gets the same colour on every result and every page.
const PERSON_COLORS = ["#8b7bf6", "#4ade80", "#fbbf24", "#fb7185", "#38bdf8", "#f472b6"];

function colorFor(name: string): string {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return PERSON_COLORS[hash % PERSON_COLORS.length];
}

export function PersonBadge({ name }: { name: string }) {
  const color = colorFor(name);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium text-foreground"
      style={{ borderColor: `${color}66`, backgroundColor: `${color}1a` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {name}
    </span>
  );
}

interface ThreadActors {
  status: ThreadStatus;
  claimedBy: string | null;
  resolvedBy: string | null;
}

// Who's accountable for a fact right now: whoever is working or closed an
// open thread, otherwise the fact's own owner (commitments). An unclaimed
// open thread has nobody yet.
export function responsiblePerson(fact: { kind: FactKind; owner: string | null }, thread: ThreadActors | null): string | null {
  if (fact.kind === "open_thread") {
    if (thread?.status === "claimed") return thread.claimedBy;
    if (thread?.status === "resolved") return thread.resolvedBy;
    return null;
  }
  return fact.owner;
}
