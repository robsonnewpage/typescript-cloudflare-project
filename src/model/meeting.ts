export interface Meeting {
  id: string;
  title: string;
  occurredAt: string; // ISO date
  participants: string[];
  transcriptKey: string | null; // R2 object key; null until a transcript is uploaded
}
