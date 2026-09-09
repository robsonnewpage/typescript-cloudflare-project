-- Additional sample meetings, appended on top of seed.sql's original m1/m2 —
-- pure INSERTs, no DELETE, so this is safe to run against a database that
-- already has real activity (claims/resolves) on the original seed threads.

INSERT INTO meetings (id, title, occurred_at, participants, transcript_key) VALUES
  ('m3', 'Fintech Co Onboarding Kickoff', '2026-08-12', '["Alice Chen","Dana Kwon","Marcus Webb"]', NULL),
  ('m4', 'Sprint Retro — Search Team', '2026-08-20', '["Sam Okafor","Priya Nair","Marcus Webb"]', NULL),
  ('m5', 'Incident Postmortem — Checkout Outage', '2026-08-22', '["Alice Chen","Sam Okafor","Priya Nair","Dana Kwon"]', NULL),
  ('m6', 'Hiring Debrief — Senior Backend Engineer', '2026-08-25', '["Bob Ibrahim","Marcus Webb"]', NULL),
  ('m7', 'Q3 Budget Review', '2026-08-28', '["Alice Chen","Priya Nair"]', NULL),
  ('m8', 'Vendor Renewal — CloudMetrics', '2026-09-01', '["Bob Ibrahim","Dana Kwon"]', NULL),
  ('m9', 'Design Review — Notifications Revamp', '2026-09-03', '["Sam Okafor","Marcus Webb","Priya Nair"]', NULL),
  ('m10', 'All-Hands Q&A', '2026-09-04', '["Alice Chen","Bob Ibrahim","Sam Okafor","Priya Nair","Dana Kwon","Marcus Webb"]', NULL);

INSERT INTO facts (id, meeting_id, kind, statement, owner, due, start_turn_index, end_turn_index, speakers, quote) VALUES
  ('f4', 'm3', 'decision', 'Kick off Fintech Co''s onboarding with a phased rollout: sandbox access first, production API keys after their security review clears.', NULL, NULL, 5, 8, '["Alice Chen"]', 'Let''s not hand them prod keys until security review clears — sandbox first, then we flip the switch.'),
  ('f5', 'm3', 'commitment', 'Send Fintech Co the sandbox credentials and onboarding checklist.', 'Dana Kwon', 'Friday', 14, 15, '["Dana Kwon"]', 'I''ll get them the sandbox creds and the checklist by Friday.'),
  ('t4', 'm3', 'open_thread', 'Who owns following up on Fintech Co''s security review timeline?', NULL, NULL, 20, 23, '["Marcus Webb","Alice Chen"]', 'Their security team said two weeks but didn''t give us a hard date — someone should chase that.'),

  ('f6', 'm4', 'decision', 'Adopt a two-week freeze on non-critical Vectorize index changes after the last reindex caused a search quality regression.', NULL, NULL, 6, 9, '["Priya Nair"]', 'No more index changes for two weeks — we just got burned by the last reindex.'),
  ('f7', 'm4', 'commitment', 'Write a runbook for safely rotating the embedding model without a full reindex outage.', 'Sam Okafor', NULL, 18, 19, '["Sam Okafor"]', 'I''ll write up a runbook so the next model swap doesn''t take search down again.'),
  ('t5', 'm4', 'open_thread', 'Should relevance scoring weight recency, or is that overcorrecting for the regression we just saw?', NULL, NULL, 25, 29, '["Marcus Webb","Priya Nair"]', 'Is weighting recency actually the fix, or are we about to overcorrect for one bad reindex?'),

  ('f8', 'm5', 'decision', 'Roll back the payment gateway SDK to the last known-good version until the vendor ships a patch.', NULL, NULL, 4, 7, '["Alice Chen"]', 'We roll back to the last known-good SDK version now — we don''t wait for their patch.'),
  ('f9', 'm5', 'commitment', 'File a formal incident report with the payment vendor, including the exact error logs and timeline.', 'Dana Kwon', 'Tomorrow', 15, 16, '["Dana Kwon"]', 'I''ll file the incident report with their support team tomorrow, logs and all.'),
  ('t6', 'm5', 'open_thread', 'Do we need a circuit breaker on the payment gateway call so one vendor outage can''t take down checkout entirely?', NULL, NULL, 32, 36, '["Sam Okafor","Priya Nair"]', 'If their gateway hiccups again, should checkout even notice, or does it just go down with them?'),

  ('f10', 'm6', 'decision', 'Move forward with an offer for the senior backend candidate from Tuesday''s onsite.', NULL, NULL, 3, 5, '["Bob Ibrahim"]', 'Everyone''s aligned — let''s get an offer out to the Tuesday candidate.'),
  ('f11', 'm6', 'commitment', 'Draft the offer letter and get comp approved before Friday so we don''t lose the candidate to a competing offer.', 'Bob Ibrahim', 'Friday', 10, 11, '["Bob Ibrahim"]', 'I''ll have the offer letter and comp approval done before Friday — they mentioned another offer.'),
  ('t7', 'm6', 'open_thread', 'Is the team ready to also open a second backend req, or does that wait until this hire starts?', NULL, NULL, 18, 21, '["Marcus Webb","Bob Ibrahim"]', 'Do we open the second req now, or wait until this one actually starts?'),

  ('f12', 'm7', 'decision', 'Cut the conference travel budget by 20% for Q4 and reallocate it to the on-call stipend increase.', NULL, NULL, 8, 12, '["Alice Chen"]', 'Travel comes down 20% in Q4 — that money goes straight into the on-call stipend bump.'),
  ('f13', 'm7', 'commitment', 'Circulate the revised Q4 budget breakdown to team leads before the all-hands.', 'Priya Nair', NULL, 20, 21, '["Priya Nair"]', 'I''ll send the revised breakdown to team leads before the all-hands so nobody''s surprised.'),

  ('f14', 'm8', 'decision', 'Renew CloudMetrics for one more year at the current tier rather than switching providers, since the migration cost outweighs the savings.', NULL, NULL, 5, 9, '["Bob Ibrahim"]', 'Switching providers would cost more than a year of savings — we renew as-is.'),
  ('t8', 'm8', 'open_thread', 'Can we negotiate CloudMetrics down given we''re renewing without a re-bid — has anyone actually asked?', NULL, NULL, 14, 17, '["Dana Kwon","Bob Ibrahim"]', 'Has anyone actually asked them for a better rate, or are we just accepting the renewal price?'),

  ('f15', 'm9', 'decision', 'Ship in-app notification grouping by thread before adding a digest email — grouping is the bigger complaint.', NULL, NULL, 6, 10, '["Sam Okafor"]', 'Grouping by thread ships first — that''s the complaint we actually hear, not the lack of a digest.'),
  ('f16', 'm9', 'commitment', 'Prototype the grouped notification UI and share it with the design team by next Tuesday.', 'Marcus Webb', 'Tuesday', 16, 17, '["Marcus Webb"]', 'I''ll have a grouped-notifications prototype for design review by next Tuesday.'),
  ('t9', 'm9', 'open_thread', 'Should users be able to mute a single thread''s notifications, or is that scope creep for this revamp?', NULL, NULL, 24, 27, '["Priya Nair","Sam Okafor"]', 'Per-thread muting feels useful, but is it scope creep for this pass or does it ship with grouping?'),

  ('f17', 'm10', 'commitment', 'Publish the anonymized survey results from the engagement survey within two weeks.', 'Alice Chen', NULL, 30, 31, '["Alice Chen"]', 'I''ll get the anonymized survey results published within two weeks.'),
  ('t10', 'm10', 'open_thread', 'Someone asked about return-to-office policy changes for next year — nobody on the panel had a confirmed answer.', NULL, NULL, 40, 43, '["Bob Ibrahim"]', 'Someone asked about RTO changes for next year and none of us actually had an answer.');

INSERT INTO threads (id, meeting_id, status, claimed_by, claimed_at, resolved_by, resolved_at, resolution_statement) VALUES
  ('t4', 'm3', 'open', NULL, NULL, NULL, NULL, NULL),
  ('t5', 'm4', 'open', NULL, NULL, NULL, NULL, NULL),
  ('t6', 'm5', 'open', NULL, NULL, NULL, NULL, NULL),
  ('t7', 'm6', 'open', NULL, NULL, NULL, NULL, NULL),
  ('t8', 'm8', 'open', NULL, NULL, NULL, NULL, NULL),
  ('t9', 'm9', 'open', NULL, NULL, NULL, NULL, NULL),
  ('t10', 'm10', 'open', NULL, NULL, NULL, NULL, NULL);
