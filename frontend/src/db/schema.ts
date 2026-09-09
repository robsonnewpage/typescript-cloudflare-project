import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const meetings = sqliteTable("meetings", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  occurredAt: text("occurred_at").notNull(), // ISO date string
  participants: text("participants", { mode: "json" }).$type<string[]>().notNull(),
  transcriptKey: text("transcript_key"), // R2 object key; null until a transcript is uploaded
});

export const facts = sqliteTable("facts", {
  id: text("id").primaryKey(),
  meetingId: text("meeting_id")
    .notNull()
    .references(() => meetings.id),
  kind: text("kind", { enum: ["decision", "commitment", "open_thread"] }).notNull(),
  statement: text("statement").notNull(),
  owner: text("owner"),
  due: text("due"),
  startTurnIndex: integer("start_turn_index").notNull(),
  endTurnIndex: integer("end_turn_index").notNull(),
  speakers: text("speakers", { mode: "json" }).$type<string[]>().notNull(),
  quote: text("quote").notNull(),
  embeddedAt: text("embedded_at"), // set once this fact has been upserted into Vectorize; null until then
});

export const threads = sqliteTable("threads", {
  id: text("id").primaryKey(), // shares id with the open_thread Fact it tracks
  meetingId: text("meeting_id")
    .notNull()
    .references(() => meetings.id),
  status: text("status", { enum: ["open", "claimed", "resolved"] }).notNull(),
  claimedBy: text("claimed_by"),
  claimedAt: text("claimed_at"),
  resolvedBy: text("resolved_by"),
  resolvedAt: text("resolved_at"),
  resolutionStatement: text("resolution_statement"),
});

// Bookkeeping for the scheduled() stale-claim sweep — one row per job,
// upserted on every run, so "did the cron run and what did it do" is
// inspectable without grepping worker logs.
export const cronRuns = sqliteTable("cron_runs", {
  jobName: text("job_name").primaryKey(),
  lastRunAt: text("last_run_at").notNull(),
  rowsAffected: integer("rows_affected").notNull(),
});
