-- OINP support backend — Phase 1 schema
-- See docs/plans/2026-06-30-support-count-trust-design.md §16 (Traceability & Audit Ledger).
-- Genesis ledger row is written lazily by worker.js (INSERT OR IGNORE) so its row_hash
-- is produced by the SAME canonical hash function used for every other row.

-- Supporters: pseudonymous, operator-only, deletable -------------------------
CREATE TABLE IF NOT EXISTS supporters (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,           -- internal locator; OPERATOR-ONLY
  token         TEXT UNIQUE,                                 -- per-browser UUID; dedupe key; NULLable (shred on delete)
  receipt       TEXT NOT NULL UNIQUE,                        -- opaque random handle shown to the supporter
  update_token  TEXT NOT NULL,                               -- capability, stored as sha256 hex (never plaintext)
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','removed')),
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  source        TEXT
);
CREATE INDEX IF NOT EXISTS idx_supporters_status ON supporters(status);

-- Ephemeral abuse signals (PII-adjacent; auto-purged by cron) -----------------
CREATE TABLE IF NOT EXISTS abuse_ephemeral (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  hmac_ip   TEXT NOT NULL,                                   -- HMAC over IPv4 /24 or IPv6 /64 prefix (keyed, rotated)
  ua_class  TEXT,
  dwell_ms  INTEGER,
  seen_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_abuse_ip_seen ON abuse_ephemeral(hmac_ip, seen_at);
CREATE INDEX IF NOT EXISTS idx_abuse_seen ON abuse_ephemeral(seen_at);

-- Append-only hash-chained ledger (ZERO PII; the audit trail) -----------------
CREATE TABLE IF NOT EXISTS ledger (
  seq           INTEGER PRIMARY KEY,                          -- strict order; genesis = 0
  ts            TEXT NOT NULL,                                -- coarse date 'YYYY-MM-DD'
  event_type    TEXT NOT NULL CHECK (event_type IN ('genesis','support_added','support_removed','support_restored')),
  target_id     TEXT,                                         -- opaque RECEIPT only; never token/email/name/IP
  delta         INTEGER NOT NULL,
  running_total INTEGER NOT NULL,
  reason        TEXT CHECK (reason IS NULL OR length(reason) <= 200),
  actor         TEXT NOT NULL,                                -- 'system' or 'mod:<operator>'
  prev_hash     TEXT NOT NULL UNIQUE,
  row_hash      TEXT NOT NULL UNIQUE
);
CREATE INDEX IF NOT EXISTS idx_ledger_target ON ledger(target_id);
CREATE TRIGGER IF NOT EXISTS ledger_no_update BEFORE UPDATE ON ledger BEGIN SELECT RAISE(ABORT,'ledger is append-only'); END;
CREATE TRIGGER IF NOT EXISTS ledger_no_delete BEFORE DELETE ON ledger BEGIN SELECT RAISE(ABORT,'ledger is append-only'); END;

-- External anchor publications ------------------------------------------------
CREATE TABLE IF NOT EXISTS ledger_anchors (
  anchor_seq   INTEGER PRIMARY KEY,
  head_hash    TEXT NOT NULL,
  published_at TEXT NOT NULL,
  location     TEXT NOT NULL
);

-- Stories (PII; deletable) ----------------------------------------------------
CREATE TABLE IF NOT EXISTS stories (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  receipt        TEXT,                                        -- link via opaque handle
  name           TEXT,
  email          TEXT,                                        -- private; never returned publicly
  comment        TEXT NOT NULL,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  visibility     TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private','public')),
  public_consent INTEGER NOT NULL DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','removed'))
);
CREATE INDEX IF NOT EXISTS idx_stories_receipt ON stories(receipt);
