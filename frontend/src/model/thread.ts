// "claimed" is unreachable from any Cluster B code path — resolve goes
// straight open -> resolved. The full lifecycle is typed now so Cluster E
// adds behavior (a Durable Object, a claim step), not a type migration.
export type ThreadStatus = "open" | "claimed" | "resolved";

export interface Thread {
  id: string; // shares its id with the open_thread Fact it tracks
  meetingId: string;
  status: ThreadStatus;
  claimedBy: string | null;
  claimedAt: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  resolutionStatement: string | null;
}
