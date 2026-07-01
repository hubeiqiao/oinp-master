-- OINP support backend — migration 0002
-- Single-use nonces: each issued nonce (jti) may be consumed once, preventing replay.
-- Rows are purged by the Cron handler once they're older than the nonce TTL.

CREATE TABLE IF NOT EXISTS used_nonces (
  jti     TEXT PRIMARY KEY,
  used_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_used_nonces_used_at ON used_nonces(used_at);
