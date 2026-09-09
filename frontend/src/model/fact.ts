export type FactKind = "decision" | "commitment" | "open_thread";

export interface Fact {
  id: string;
  meetingId: string;
  kind: FactKind;
  statement: string;
  owner: string | null;
  due: string | null;
  startTurnIndex: number;
  endTurnIndex: number;
  speakers: string[];
  quote: string;
}
