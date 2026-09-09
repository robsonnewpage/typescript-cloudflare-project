-- Seed data matching src/lib/data/seed.ts, for local/remote D1 provisioning.
DELETE FROM threads;
DELETE FROM facts;
DELETE FROM meetings;

INSERT INTO meetings (id, title, occurred_at, participants, transcript_key) VALUES
  ('m1', 'Acme Corp Renewal — Weekly Sync', '2026-09-02', '["Alice Chen","Bob Ibrahim","Priya Nair"]', NULL),
  ('m2', 'Platform Migration Standup', '2026-09-05', '["Alice Chen","Priya Nair","Sam Okafor"]', NULL);

INSERT INTO facts (id, meeting_id, kind, statement, owner, due, start_turn_index, end_turn_index, speakers, quote) VALUES
  ('f1', 'm1', 'decision', 'Renew Acme Corp at the current tier through Q1, revisit pricing after the migration ships.', NULL, NULL, 12, 15, '["Alice Chen"]', 'Let''s renew at the current tier through Q1 and revisit pricing once the migration''s live.'),
  ('f2', 'm1', 'commitment', 'Send the updated MSA redline to legal.', 'Bob Ibrahim', 'Friday', 20, 21, '["Bob Ibrahim"]', 'I''ll get the redline over to legal by Friday.'),
  ('t1', 'm1', 'open_thread', 'Who''s following up with Acme Corp''s procurement team about the delayed PO number?', NULL, NULL, 30, 33, '["Priya Nair","Alice Chen"]', 'We still don''t have the PO number from procurement — someone needs to chase that.'),
  ('t2', 'm2', 'open_thread', 'Does the new ingestion pipeline need a feature flag before it rolls out past the pilot team?', NULL, NULL, 8, 11, '["Sam Okafor"]', 'Before this goes past the pilot group, are we gating it behind a flag or just shipping it?'),
  ('f3', 'm2', 'commitment', 'Draft the rollback plan before Thursday''s release.', 'Priya Nair', 'Thursday', 40, 41, '["Priya Nair"]', 'I''ll have the rollback plan written up before we release Thursday.'),
  ('t3', 'm2', 'open_thread', 'What''s the story for backfilling embeddings on transcripts uploaded before the pipeline change?', NULL, NULL, 55, 58, '["Alice Chen","Sam Okafor"]', 'What happens to everything uploaded before this change — do we backfill it?');

INSERT INTO threads (id, meeting_id, status, claimed_by, claimed_at, resolved_by, resolved_at, resolution_statement) VALUES
  ('t1', 'm1', 'open', NULL, NULL, NULL, NULL, NULL),
  ('t2', 'm2', 'open', NULL, NULL, NULL, NULL, NULL),
  ('t3', 'm2', 'resolved', 'Sam Okafor', '2026-09-05T15:02:00.000Z', 'Sam Okafor', '2026-09-05T15:11:00.000Z', 'No backfill — the migration cron in Cluster E will re-embed anything older than the pipeline change once it lands.');
