-- B.E.N. OS v0.3.2: founder workspace migration. Safe to re-run on staging.
-- Existing users/oauth_states/sessions are retained. No member data is deleted.
-- Task progress is NOT a substitute for documented Board decisions or safeguarding approvals.
CREATE TABLE IF NOT EXISTS founder_updates (
  action_id TEXT PRIMARY KEY,
  state TEXT NOT NULL CHECK(state IN ('not_started','in_progress','needs_review','completed')),
  public_note TEXT NOT NULL DEFAULT '',
  evidence_ref TEXT NOT NULL DEFAULT '',
  owner_note TEXT NOT NULL DEFAULT '',
  updated_by TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY(updated_by) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS audit (
  id TEXT PRIMARY KEY,
  actor_id TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  record_id TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY(actor_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS audit_actor_recent ON audit(actor_id, created_at);
