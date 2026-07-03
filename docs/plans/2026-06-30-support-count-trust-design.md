# Support Count — Design & Trust Model

> **Status:** 🟡 Proposal / awaiting go-ahead. Nothing built yet. This document must be approved before any backend or display work begins.
>
> **Audited 2026-06-30** by four independent reviewers (security/anti-abuse, privacy/PIPEDA, trust/credibility, Cloudflare architecture) + synthesis. See **§15 — Audit findings** and **§16 — Traceability & Audit Ledger** (satisfies the "every count locatable & traceable" requirement). The audit found a **CRITICAL ship-now honesty bug**: the current site already says "your support is counted" while nothing is stored (see §15).
>
> **Date:** 2026-06-30 · **Owner:** Joe Hu · **Author:** design pass with Kiro
> **Related:** `docs/plans/2026-06-26-oinp-perspective-site-plan.md` (Task 8 — Support API, deferred), `public/script.js` (`initSupport`, `initStoryPortal`), `worker.js`, `wrangler.toml`

---

## 1. Why this document exists

The site asks visitors to add their name to a public message about fair immigration pathways for people already building in Canada. We want to show **how many people support it** — a supporter count — and pair it with the thank-you state.

A number on an advocacy page is a claim. The moment we print "1,284 people support this," we are asking the reader, journalists, faculty, and policymakers to believe us. If that number is inflated, seeded, or gameable, the entire message loses credibility — and for a message about *integrity and fairness*, a dishonest counter would be self-defeating.

So the real question is not "can we show a number?" It is **"how do we make the number one that a skeptical reader is right to trust?"** This document answers that first, then specifies the build.

---

## 2. Current reality (what exists today)

Verified in the codebase as of 2026-06-30:

- **No backend, no datastore.** `worker.js` only delegates to the static-assets binding (`env.ASSETS.fetch`). There is no `/api` route in production.
- **The support click is browser-local.** `initSupport` in `script.js` posts optimistically to `/api/support`, but that endpoint 404s, so it falls back to a 1,400 ms timer and records the signal in `localStorage` (`oinp_support_v1`). Nothing leaves the visitor's browser.
- **Story submissions also 404.** `POST /api/support/details` has no handler, so shared stories are **not persisted anywhere** today.
- **The front-end is already API-shaped.** It expects a response with `supportId` and `updateToken`, and sends `startedAt` (time-on-page) plus a honeypot field (`company`). It was built to be completed by a backend.
- **The plan deliberately avoided a fake number.** The implementation plan records: *"No D1/Worker API, no fabricated counts (Task 8 deferred)."*

**Consequence:** there is no existing tally being hidden. Even in production, zero supporters have ever been stored. A trustworthy count requires building the deferred backend — and a number can only start from the moment real collection goes live.

---

## 3. Principles (non-negotiable)

1. **Never fabricate or seed.** The count starts at the real number, even if that is 0. No "starting boost," no padding, no purchased numbers.
2. **One real human, one count.** The number must represent distinct people who took a deliberate action — not clicks, not page views, not refreshes.
3. **Verifiable from source.** We must be able to recompute the displayed number from raw records at any time, and explain exactly how it was derived.
4. **Transparent methodology.** We can state plainly, on the page, how the count works. If we cannot describe it without embarrassment, we should not ship it.
5. **Privacy is part of trust.** Over-collecting data to "prove" the count erodes trust. Collect the minimum; protect what we collect; honor deletion.
6. **Degrade honestly.** If the backend is down or the number is too low to be meaningful, show the warm thank-you with **no number** — never a stale or invented one.

---

## 4. What "trust" means here — two layers

Trust splits into two distinct problems. Both must be solved.

### Layer A — Integrity: the number is actually true
The count reflects real, distinct, willing humans. Threats: bots, scripts, one person counted many times, accidental double-submits, network retries, race conditions. (Section 6.)

### Layer B — Credibility: the reader believes it is true
Even a perfectly accurate number can read as fake if presented badly (too round, too sudden, no context) or can backfire if it is tiny. Threats: weak social proof at low counts, "is this real?" skepticism, dark-pattern smell. (Section 7.)

---

## 5. Architecture options

| Option | Accuracy of count | Stores stories? | Complexity | Verdict |
| --- | --- | --- | --- | --- |
| **Cloudflare D1** (SQLite) | Exact (`COUNT(*)` with a unique constraint; idempotent) | ✅ Yes | Low–medium | ✅ **Recommended** |
| Cloudflare KV (counter key) | Approximate — read-modify-write races can undercount; hard to dedupe | ❌ Awkward | Low | ❌ Not for a trusted number |
| Durable Object (atomic counter) | Exact, strongly consistent | Needs pairing with storage | Medium–high | Overkill now; revisit at high scale |

**Recommendation: D1.** It makes the count an auditable `SELECT COUNT(*)` over real rows, enforces one-person-one-row with a `UNIQUE` constraint (idempotent against retries), **and** finally persists the "Share your story" submissions that currently vanish. One store solves the count, the integrity, and the story-persistence gap together.

---

## 6. Layer A — making the number accurate (integrity mechanisms)

### 6.1 Threat model → mitigation

| Threat | How it inflates/distorts | Mitigation |
| --- | --- | --- |
| Self-seeding / vanity padding | We add fake numbers | Policy: forbidden (Principle 1). Count derived only from rows. |
| Same person, refresh / re-click | +1 each click | Stable per-browser **support token** (UUID in `localStorage`), `UNIQUE` in D1 → upsert, never double-counts. |
| Same person, multiple browsers/devices/incognito | A few extra | Secondary soft signal: salted **hashed IP** + coarse heuristics for monitoring; accept small honest drift rather than over-fingerprint (privacy cost). |
| Network retry / double POST | Duplicate rows | Idempotency: unique `token`; server `INSERT … ON CONFLICT DO NOTHING`. |
| Bots / scripted mass submits | Large fake inflation | Honeypot (already present) + **time-on-page floor** (reject < ~2 s via `startedAt`) + **per-IP rate limit** + **Cloudflare Turnstile** (privacy-friendly, low-friction) if/when abuse appears. |
| Race conditions | Lost or doubled increments | D1 row inserts + `COUNT(*)` avoid read-modify-write counter races entirely. |
| Headless/replay against the API | Inflation | Same-origin checks, method/length limits, Turnstile token verification server-side. |

### 6.2 One-person-one-count, concretely
- On first support, generate `token = crypto.randomUUID()`, store in `localStorage`, send with every request.
- D1 `supporters.token` has a `UNIQUE` constraint; the insert is idempotent.
- A returning supporter re-sends their token; server recognizes it and returns the **current total** without adding a row.

### 6.3 Bot resistance ladder (escalate only as needed)
1. **Now:** honeypot + time-on-page floor + per-IP rate limit. (Zero UX cost.)
2. **If abuse seen:** add **Cloudflare Turnstile** — invisible/low-friction, no Google reCAPTCHA, privacy-respecting.
3. **If targeted attack:** temporary manual review / freeze the displayed number; recount from D1 after cleanup.

### 6.4 Verifiability & moderation
- Every counted person is a row with a timestamp → the displayed number is reproducible.
- Moderation removals (spam, abuse) delete rows; the count recomputes. We never let the public number tick **down** visibly without cause — if a cleanup lowers it, hold the display or annotate.
- Keep a private, append-only audit note when bulk removals happen, so the number's history is explainable.

---

## 7. Layer B — making the number believable (display rules)

### 7.1 Reveal threshold
Do not show a tiny number. Below a threshold **N₀** (proposed: **50**), show the thank-you **without** a count, e.g. *"You're one of the first to back this."* At or above N₀, reveal the number. Rationale: low counts are weak social proof and can suppress action; the number should start working only once it helps.

### 7.2 Honest formatting
- Show the **real** number (e.g., "312"). If we ever abbreviate at scale, **round down** ("1,200+", never "1,300" for 1,284). Under-claim, never over-claim.
- No suspiciously round launch numbers. No animated count-up that overshoots then settles (reads as theatrical/fake). A calm, single settle is fine.

### 7.3 Transparency note (the trust unlock)
Next to the number, a quiet, linkable line:
> *How we count: one verified signal per person. No bought, bot, or seeded numbers — every supporter is a real action stored once.*

Optionally link to a short `/transparency` section or this doc's public summary. Stating the method is what converts a skeptic.

### 7.4 Corroboration beats a bare number
A number alone is abstract. **Real shared stories** (which D1 now persists) are stronger, harder-to-fake proof. Consider surfacing a few moderated, opt-in story excerpts near the count — qualitative truth backs the quantitative claim.

### 7.5 No dark patterns
- No fake "someone in Toronto just supported this" live ticker unless it is genuinely real and consented.
- No countdown pressure, no inflated "goal" bars.
- The number is a mirror, not a manipulation.

### 7.6 Display states (ties the count to the thank-you)
1. **Pre-support (optional, above N₀):** "Join **N** people backing this" near the button.
2. **Just supported:** "Thank you — you're **#N**." or "**N** people now support this." + the share line.
3. **Returning supporter:** thank-you + current **N** (recognized by token; no double count).
4. **Below N₀ / backend down:** warm thank-you, **no number**.

---

## 8. Data model (D1, proposed)

```sql
CREATE TABLE supporters (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  token       TEXT NOT NULL UNIQUE,        -- per-browser UUID; idempotency key
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  ip_hash     TEXT,                        -- salted SHA-256, truncated; abuse heuristics only
  ua_hash     TEXT,                        -- coarse; abuse heuristics only
  source      TEXT,                        -- e.g. 'oinp-homepage'
  dwell_ms    INTEGER,                     -- startedAt → submit, bot-floor check
  status      TEXT NOT NULL DEFAULT 'active'  -- 'active' | 'removed'
);

CREATE TABLE stories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  token       TEXT,                        -- links to supporter if present
  name        TEXT,
  email       TEXT,                        -- private; never returned publicly
  comment     TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  visibility  TEXT NOT NULL DEFAULT 'private',  -- 'private' | 'public' (after review)
  status      TEXT NOT NULL DEFAULT 'pending'   -- 'pending' | 'approved' | 'removed'
);

-- Public count = SELECT COUNT(*) FROM supporters WHERE status='active';
```

Notes: `email` is collected only for follow-up, never shown publicly, and matches the consent text already on the form. `ip_hash`/`ua_hash` are for abuse detection only and use a salted, truncated hash so raw IPs are never stored.

---

## 9. API contract (proposed)

```
POST /api/support
  body: { token, startedAt, source, company(honeypot), turnstileToken? }
  → 200 { ok: true, total: <int>, alreadyCounted: <bool> }
  rules: reject if honeypot filled; reject if dwell < ~2s; rate-limit per IP;
         INSERT ON CONFLICT(token) DO NOTHING; return current total.

POST /api/support/details        (the "Share your story" form)
  body: { token, name, email, comment, startedAt, company(honeypot), turnstileToken? }
  → 200 { ok: true }
  rules: same anti-abuse; store story as pending/private.

GET /api/support/count
  → 200 { total: <int>, threshold: <int>, show: <bool> }   // 'show' = total >= threshold
  cache: short edge cache (e.g. 30–60s) to absorb load; never blocks page render.
```

The front-end already sends `startedAt` and the honeypot, and already consumes a JSON response — wiring is incremental.

---

## 10. Privacy & legal (Canada / PIPEDA-aware)

- **Minimize:** store only what the count and follow-up need. No third-party trackers for this.
- **Email:** private, follow-up only, never rendered publicly — consistent with the on-page consent ("…it's never shown publicly… To remove or update yours, contact Joe at hi@hubeiqiao.com").
- **IP:** never stored raw; salted + truncated hash for abuse heuristics, with short retention.
- **Deletion/correction:** the consent already provides a contact path (`hi@hubeiqiao.com`); removals set `status='removed'` and the count recomputes.
- **Consent clarity:** if we display public story excerpts, they must be explicitly opt-in and reviewed.

---

## 11. Phased rollout

| Phase | Scope | Count shown? |
| --- | --- | --- |
| **0 — now** | This document; decisions approved | — |
| **1 — collect quietly** | D1 + `/api/support` + `/api/support/details` + idempotent token dedupe + honeypot/dwell/rate-limit; **persist stories** | ❌ Not yet — gather real data first |
| **2 — reveal** | `/api/support/count`, threshold gate, honest formatting, "how we count" note; add Turnstile if abuse seen | ✅ Above N₀ |
| **3 — corroborate (optional)** | Moderated, opt-in public story excerpts; `/transparency` summary | ✅ + stories |

Collecting quietly first (Phase 1) means that when the number appears, it is already real and non-trivial — avoiding the cold-start "3 supporters" problem honestly.

---

## 12. Explicitly rejected (anti-patterns)

- ❌ Seeding a starting number or "boosting" the count.
- ❌ Counting page views, clicks, or refreshes as "supporters."
- ❌ Rounding **up**, or theatrical count-up animations that overshoot.
- ❌ Fake live "someone just supported" activity.
- ❌ Heavy fingerprinting / raw-IP storage to chase perfect dedupe at the cost of privacy.
- ❌ Showing a stale cached number when the backend is down.

---

## 13. Open decisions (needed before build)

1. **Go-ahead** to build the D1-backed Support API (also fixes story persistence)? **[ yes / no ]**
2. **Reveal threshold N₀** — propose **50**. **[ confirm / change ]**
3. **Pre-support social proof** — show "Join N…" near the button too, or **only** in the thank-you? **[ both / thanks-only ]**
4. **Turnstile now or later** — ship with anti-abuse basics and add Turnstile only if abuse appears? **[ later (default) / now ]**
5. **Public story excerpts** (Phase 3) — pursue later, or out of scope? **[ later / skip ]**

---

## 14. Success criteria

- The displayed number can be reproduced exactly from D1 at any time.
- A skeptical reader can read *how* it is counted in one sentence on the page.
- Re-clicking, refreshing, and retries never increase the count for one person.
- Stories submitted through the form are persisted (no more silent 404s).
- If the backend fails, the page still shows a warm, honest thank-you — never a fake number.

---

## 15. Audit findings & required revisions (2026-06-30)

Independent review by four parallel auditors (security/anti-abuse, privacy/PIPEDA, trust/credibility, Cloudflare architecture) + a synthesis pass. Findings are deduplicated and ranked. **Anchor decision:** the ledger is **operator-traceable end-to-end, but the public only ever sees an opaque receipt** — never PII, never a sequential rank. Traceability is **record-level**; person-level identity is reachable by the operator only for supporters who submitted a consented story.

### 15.1 Severity-ranked issues

| Severity | Area | Issue | Concrete fix |
|---|---|---|---|
| **CRITICAL** | Live site / honesty | The site prints "your support is counted" today with **no backend** (404 → 1.4 s timer → `localStorage`; nothing stored). Present-tense false reassurance, live now — the exact dishonesty this doc forbids. | Gate the word "counted" on a real `200` write. Add a save-failed state: "…couldn't reach our server — it may not be saved." **Ship independently of everything else.** |
| **CRITICAL** | Contract/schema | Front-end ↔ API ↔ schema disagree: shipped `initSupport` sends **no token** and expects server-minted `supportId`+`updateToken` (absent from §8), while §8 requires `token NOT NULL UNIQUE`. → hard error, or no dedupe, or empty-token collapses the count to 1. | Align all three: client generates `token=crypto.randomUUID()` **once**, persists it, sends on **every** POST; server `INSERT … ON CONFLICT(token) DO NOTHING`, mints opaque `receipt` + hashed `update_token`, returns `{receipt,total,alreadyCounted}`. |
| **CRITICAL** | Integrity claim | "One verified signal per person, stored once" is false: nothing is verified, it's per-**browser**, and `UNIQUE(token)` gives **zero** Sybil resistance (clear localStorage / incognito → new token). | Reframe to "one action per browser, de-duplicated, bot-screened — not verified identities." Add a write-time **admission gate** (§16 T.2). |
| **CRITICAL** | Traceability / tamper / deletion | §6.4 "private append-only audit note" is operator-mutable D1 with no external anchor → tamper-evidence requirement unmet. Append-only **conflicts** with row-delete moderation **and** PIPEDA deletion; person-level traceability would re-identify anonymous supporters. | Adopt **§16 Traceability & Audit Ledger**: PII-free append-only hash chain, tombstone+append for removals, external anchoring, record-level trace, person-join only for consented stories. |
| **HIGH** | Anti-abuse / phasing | Phase-1 collection is unprotected (Turnstile deferred; dwell floor uses **client** `startedAt`, trivially forged) → the **first revealed number may already be contaminated**. | **Turnstile mandatory from Phase 1.** Server-signed init nonce; compute dwell **server-side**. Active abuse monitoring + a **pre-reveal integrity recount**. (Flips Open Decision #4.) |
| **HIGH** | Rate-limit + privacy | Per-IP limit + full-IP `ip_hash` is both **ineffective** (IPv6 /64, CGNAT, proxies) **and re-identifiable PII** stored durably with no TTL (IPv4 ≈ 4.3B enumerable; co-located salt reverses all). | Bucket by **IPv4 /24 + IPv6 /64** via Cloudflare native rate-limiting or **HMAC keyed by a rotated Worker Secret**, in a **TTL'd `abuse_ephemeral` table** purged by Cron. Remove `ip_hash`/`ua_hash` from `supporters` and the ledger. |
| **HIGH** | Display / data model | Public "#N" ordinal is conflated with the total, unstable (upserts/cache/concurrency/tombstones), races (two inserts both "#1284"), and the sequential PK is an enumeration/timing surface. | **Drop the public "#N" rank.** Display "you're **one of N**." Personal artifact = **opaque receipt**. Keep sequential `id` strictly **operator-only**. |
| **HIGH** | Privacy / consent | No collection notice at the bare support click (PIPEDA Principles 2 & 3). | One-line notice + privacy-policy link at the support action: what's collected, why, where stored (cross-border), how to delete. |
| **HIGH** | Privacy / deletion | Deletion right unfulfillable for anonymous supporters (nothing to match on); `status='removed'` soft-delete retains data. | Self-service **"Remove my support"** via the `update_token`; **hard-delete/crypto-shred** PII + append a `support_removed` ledger event. Disclose D1 Time Travel ~30-day backup lag. |
| **HIGH** | Consent / stories | Story publishing has no explicit opt-in ("may be reviewed/displayed" ≠ consent). | Unchecked checkbox: "☐ You may publish my first name and story. My email is never shown." Default `private`. |
| **HIGH** | Credibility / provenance | A hidden reveal threshold reads as cherry-picking; "collect quietly then reveal" is **visually identical to seeding** without provenance; `/transparency` deferred to optional Phase 3. | Disclose threshold + **collection start date + as-of timestamp + append-only history** at reveal. **Move `/transparency` to Phase 2** — it is the credibility unlock. |
| **HIGH** | Honesty / §7 | "Never tick down" becomes manipulation if corrections are hidden. | Displayed total **always** = `COUNT(active)` = ledger `running_total`. Explain decreases via an **aggregate correction log** on `/transparency` ("28 Jun: −14 — scripted submissions"). |
| **MED** | API correctness | `ON CONFLICT DO NOTHING` returns no row → can't distinguish new vs duplicate, risks a duplicate ledger event. | Branch on `changes()`/`RETURNING`: inserted → mint + append ledger; else `SELECT` existing `receipt`/`total`, skip the append. |
| **MED** | Availability | `GET /count` 30–60 s edge cache can serve a **stale number on origin error** and delays moderation decreases. | Cache only `200` with short `s-maxage` + `stale-if-error=0`; never cache `5xx`; on error return `{show:false}`. |
| **MED** | Architecture rationale | §5 omits that D1's **single-threaded writer** is what makes a lock-free hash chain safe; enabling read replicas later would make `GET /count` read stale. | Document the serialized-writer basis; keep count reads on **primary**. |
| **MED** | Anti-abuse gap | Honeypot is credited to `/api/support` but the support control has **no honeypot field** (client hardcodes `company:""`). | Add a real hidden honeypot to the support control, or drop honeypot from `/api/support`'s claimed mitigations; rely on Turnstile + signed nonce. |
| **MED** | Story auth | Story endpoint uses `supportId`/`updateToken` inconsistent with §8; an undefined `updateToken` risks **story hijack** + a second inflation path. | Stories reference `receipt` and require the hashed `update_token`; reject any story without a valid capability. |
| **MED** | Display / threshold | Threshold on/off flapping; framing `<N₀` as "untrustworthy." | Hysteresis: reveal at 50, keep showing unless it drops below ~40; frame `<50` as "early," not "untrustworthy." |
| **MED** | Formatting honesty | Round numbers / real-time language / optimistic local +1 read as fake. | Exact integers (round-**down** only above ~10k); add **as-of + since-date + unit** ("312 supporters since June 2026"); display the **server-returned** total only. |
| **MED** | Privacy / legal | No openness notice; no cross-border disclosure (D1 may store outside Canada); email follow-up implicates CASL. | Publish a privacy note; disclose D1 region + Cloudflare as processor; keep email transactional/advocacy or add CASL consent + unsubscribe. |
| **LOW** | API | `alreadyCounted` is a small oracle (probe if a token is counted). | Rate-limit; keep responses generic. |
| **LOW** | Display | Count-up-from-zero animation reads theatrical. | Single calm fade-in only. |
| **LOW** | Privacy | Client story draft (`oinp_story_draft_v1`) stores name/email and auto-restores → shared-device PII leak. | Store **comment only**; clear on idle/`pagehide`. *(Introduced 2026-06-30; revisit.)* |
| **LOW** | Schema | §5 vs §8 disagree on the active predicate; no index for `COUNT(*) WHERE status='active'`. | Standardize `WHERE status='active'`; add `idx_supporters_status`. |
| **LOW** | Ops | Moderation/operator auth unspecified. | Define operator auth for remove/restore; record `actor` in every ledger event. |

### 15.2 Required edits to existing sections (§1–§14)
- **§2** — add a ⚠ ship-now correction (claim "counted" only on a real `200`; add save-failed state; note the client/API/schema token mismatch).
- **§3** — Principle 2 → "**One deliberate action per browser, de-duplicated**" (the honest guarantee). Add **Principle 7 — Traceable & tamper-evident** (record-level, PII-free, anchored).
- **§5** — add the single-writer rationale + replica-freshness caveat; add `ledger`, `ledger_anchors`, `abuse_ephemeral` to the design.
- **§6.1** — token row = **idempotency, not identity**; replace durable hashed-IP with **prefix-bucket keyed HMAC in a TTL'd store**; move Turnstile to **Phase 1**; dwell **server-computed**.
- **§6.2** — rewrite to the corrected contract (client persists `token`, sends every POST; `ON CONFLICT DO NOTHING` + `changes()`/`RETURNING`; returns `{receipt,total,alreadyCounted}`).
- **§6.3** — promote Turnstile to step 1; add signed init nonce + prefix rate-limit as baseline.
- **§6.4** — tombstone (`status='removed'`) + append `support_removed`, not row-delete; replace "audit note" with §16; displayed total **always** = `COUNT(active)`.
- **§7.2/7.3/7.6** — as-of + since-date + unit; exact integers; **drop "#N"** → "one of N" + opaque receipt line; rewrite the transparency microcopy to stop over-claiming; add save-failed + below-threshold copy; server-returned total only.
- **§8** — replace with the **§16 T.1 DDL** (`receipt` + hashed `update_token`; `abuse_ephemeral`; `ledger` + triggers; `ledger_anchors`; `stories.public_consent`; link by `receipt`).
- **§9** — add `GET /api/support/init` (signed nonce), `GET /api/verify?receipt=`, `POST /api/support/delete`; require Turnstile + nonce; `{ok,total,alreadyCounted,receipt}` (no ordinal); cache only `200` + `stale-if-error=0`.
- **§10** — collection notice; explicit TTLs; keyed-HMAC prefix IP; cross-border/processor disclosure; CASL; Time-Travel note; self-service deletion; story consent; state the ledger is PII-free.
- **§11** — ledger + admission gate + abuse monitoring in **Phase 1**; `/transparency` + provenance in **Phase 2**; add a pre-reveal integrity recount.
- **§12** — add ❌ public per-entry timestamps; ❌ exposing a sequential public ordinal/PK; ❌ holding/inflating during cleanup.
- **§13** — flip #4 default to "**Turnstile from Phase 1**."
- **§14** — add: every unit traces to a ledger event + opaque row; the published fingerprint reproduces from raw records; tamper-evident to the last anchor; PII hard-deletable without breaking the chain.

### 15.3 Additional open decisions (raised by the audit)
6. **Anchoring medium + cadence** — Git commit / OpenTimestamps (Bitcoin) / RFC-3161; every K events or T minutes? *[propose: Git commit each reveal + monthly OTS]*
7. **Receipt format** — random base32 (no time leak) vs HMAC-derived; public vs operator-only `/api/verify`? *[propose: random base32 + public rate-limited verify]*
8. **Keep internal sequential `id`?** *[propose: keep, operator-only]*
9. **Abuse retention window** — 7 vs 30 days. *[propose: 30 d]*
10. **D1 region pinning** + cross-border disclosure stance.
11. **Email program** — transactional/advocacy only vs full CASL.
12. **Third-party attestation at reveal** — journalist/faculty signs "verified count=N, root=…"? *[propose: yes]*
13. **Self-service deletion** vs email-only. *[propose: both]*
14. **Threshold N₀ = 50** confirm + hysteresis (reveal 50 / hide < 40).
15. **Merkle inclusion proofs** — defer (hash chain suffices) or build now?
16. **Verify `changes()` propagates across `batch()` statements** in `wrangler d1 execute --local` (write-path lynchpin); confirm the `RETURNING` fallback.
17. **Operator/moderation auth** for remove/restore.

---

## 16. Traceability & Audit Ledger

> **New hard requirement (on top of §3):** every unit of the count must be individually locatable and traceable — any displayed number resolves back to the specific records and events that produced it — and history is **tamper-EVIDENT** to the extent it is externally anchored.
>
> **Tamper-evident, not tamper-proof.** The operator controls the database. An internal hash chain catches accidental corruption and partial edits and enables clean reconciliation, but a motivated operator can rewrite an *un-anchored* chain. Teeth come only from **external anchoring** (T.7), and even then it proves "not silently rewritten since the last anchor," never "every number is a real person." Human-ness comes from the Layer-A admission gate (T.2), not from this ledger.
>
> **Record-level, not person-level.** Anonymous supporters trace to an **opaque row** and no further — by design. The operator can reach a real identity **only** for supporters who submitted a story with explicit public consent (T.6). The public number never exposes identity.

### T.0 Three identifiers + one total
- **`token`** — per-browser random UUID. Idempotency/dedupe key only. Internal; never displayed. Crypto-shreddable on deletion.
- **`receipt`** — opaque, **random, non-sequential** public handle (e.g. `OINP-7F3A2C9K`). The only thing a supporter sees and the only handle used to trace. Not time-sortable (leaks no ordering).
- **`id`** — sequential `AUTOINCREMENT` integer. **Operator-only internal locator.** Never returned to clients; never a public "#N" rank.
- **Displayed total** = `COUNT(*) FROM supporters WHERE status='active'` = ledger head `running_total`. May legitimately decrease when spam is removed (disclosed in aggregate on `/transparency`).

### T.1 Schema (D1 / SQLite DDL)
```sql
-- Mutable, operator-only (pseudonymous; deletable) -----------------------------
CREATE TABLE supporters (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,           -- internal locator; OPERATOR-ONLY, never a public rank
  token         TEXT UNIQUE,                                 -- per-browser UUID; dedupe key; NULLable so it can be shredded
  receipt       TEXT NOT NULL UNIQUE,                        -- opaque random base32 handle shown to the supporter
  update_token  TEXT NOT NULL,                               -- secret capability, stored HASHED; authorizes story edit + self-delete
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','removed')),
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),  -- operator-only; coarsen/erase on deletion
  source        TEXT
);
CREATE INDEX idx_supporters_status ON supporters(status);

-- Ephemeral abuse signals (PII-adjacent; auto-purged) --------------------------
CREATE TABLE abuse_ephemeral (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  hmac_ip   TEXT NOT NULL,   -- HMAC-SHA256 over IPv4 /24 or IPv6 /64 PREFIX, keyed by a rotated Worker Secret
  ua_class  TEXT,            -- coarse UA bucket only (optional)
  dwell_ms  INTEGER,         -- server-computed from the signed init nonce
  seen_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX idx_abuse_seen ON abuse_ephemeral(seen_at);  -- Cron: DELETE WHERE seen_at < now('-30 days')

-- Append-only ledger (ZERO PII; the audit trail) ------------------------------
CREATE TABLE ledger (
  seq           INTEGER PRIMARY KEY,                          -- strict order; genesis = 0
  ts            TEXT NOT NULL,                                -- COARSE date 'YYYY-MM-DD' (no precise time -> no timing correlation)
  event_type    TEXT NOT NULL CHECK (event_type IN ('genesis','support_added','support_removed','support_restored')),
  target_id     TEXT,                                         -- opaque RECEIPT only; NEVER token/email/name/IP
  delta         INTEGER NOT NULL,                             -- +1 / -1 / 0
  running_total INTEGER NOT NULL,                             -- authoritative total after this event
  reason        TEXT CHECK (reason IS NULL OR length(reason) <= 200),  -- moderation note; MUST NOT contain supporter PII
  actor         TEXT NOT NULL,                                -- 'system' or 'mod:<operator>' (operator identity, not supporter)
  prev_hash     TEXT NOT NULL UNIQUE,
  row_hash      TEXT NOT NULL UNIQUE
);
CREATE INDEX idx_ledger_target ON ledger(target_id);
CREATE TRIGGER ledger_no_update BEFORE UPDATE ON ledger BEGIN SELECT RAISE(ABORT,'ledger is append-only'); END;
CREATE TRIGGER ledger_no_delete BEFORE DELETE ON ledger BEGIN SELECT RAISE(ABORT,'ledger is append-only'); END;

-- External anchor publications -------------------------------------------------
CREATE TABLE ledger_anchors (
  anchor_seq   INTEGER PRIMARY KEY,   -- the ledger seq whose row_hash was anchored
  head_hash    TEXT NOT NULL,
  published_at TEXT NOT NULL,
  location     TEXT NOT NULL          -- git commit SHA / OpenTimestamps proof / public post URL
);

-- Stories (PII; mutable; deletable) -------------------------------------------
CREATE TABLE stories (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  receipt        TEXT REFERENCES supporters(receipt),  -- link via opaque handle, not token
  name           TEXT,
  email          TEXT,                                 -- private; never returned publicly; deletable
  comment        TEXT NOT NULL,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  visibility     TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private','public')),
  public_consent INTEGER NOT NULL DEFAULT 0,           -- explicit opt-in checkbox (0/1)
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','removed'))
);
```

### T.2 Admission gate (runs BEFORE any ledger write)
Traceability records faithfully; it does not judge. A unit only earns a ledger entry if it passes:
1. **Turnstile** token verified server-side (mandatory from Phase 1).
2. **Signed init nonce** (issued by `GET /api/support/init`, HMAC with issued-at, short TTL): present, unexpired, unreplayed; **dwell computed server-side**, soft floor.
3. **Prefix rate-limit** (IPv4 /24 + IPv6 /64) via Cloudflare native limiter or `abuse_ephemeral`.
4. Honeypot empty; same-origin + method/length limits.

### T.3 Canonical hashing (reproducible by third parties)
Fixed field order, JSON-escaped, lowercase hex:
```
canonical(r) = JSON.stringify([seq, event_type, target_id ?? null, delta, running_total, ts, reason ?? null, actor])
row_hash     = sha256Hex(prev_hash + "\n" + canonical(r))
```
**Genesis** (inserted once at migration): `seq=0`, `prev_hash` = 64 zeros, `event_type='genesis'`, `target_id=NULL`, `delta=0`, `running_total=0`, `actor='system'`, `reason='genesis'`.

### T.4 Write path — exact transaction order
Relies on verified D1 facts: `batch()` = one atomic transaction, sequential, full rollback on any error; single-threaded writer; no SQL SHA, so the hash is computed in JS between head-read and write and made fork-safe by `UNIQUE(prev_hash)`.

**Add (`POST /api/support`)** — after T.2 passes; bounded retry loop:
1. **Read head:** `SELECT seq,row_hash,running_total FROM ledger ORDER BY seq DESC LIMIT 1` (genesis guarantees a row).
2. **Pre-compute** prospective row: `seq=head.seq+1`; `ts=today (YYYY-MM-DD)`; `running_total=head.running_total+1`; `row_hash=sha256Hex(head.row_hash+"\n"+canonical(support_added))`.
3. **One atomic `batch()`:**
   - a. `INSERT INTO supporters(token,receipt,update_token,status,source) VALUES(?,?,?, 'active', ?) ON CONFLICT(token) DO NOTHING`
   - b. `INSERT INTO ledger(...) SELECT <prospective…> WHERE changes()=1`  *(appends only if (a) inserted)*
   - c. `SELECT receipt,status FROM supporters WHERE token=?`
   - Return `{ ok:true, total: inserted ? running_total : head.running_total, alreadyCounted: !inserted, receipt }` — **no public ordinal**.
   - On `UNIQUE(prev_hash)`/`UNIQUE(seq)` violation (a concurrent event committed between 1 and 3): the whole batch rolls back → **retry from step 1** (idempotent because (a) is `ON CONFLICT DO NOTHING`).

**Correctness:** duplicate token → (a) no-op → (b) appends nothing → no double count; `running_total` is derived from the chain, not a racy `COUNT`; fork-proof via `UNIQUE(prev_hash)` because D1 serializes writers.
**Lynchpin to verify** in `wrangler d1 execute --local`: that `changes()` from (a) is visible to (b) within one `batch()`. **Fallback if not:** `(a) … DO NOTHING RETURNING receipt`, branch in JS (0 rows = duplicate, skip ledger; 1 row = new → second guarded batch for the ledger append); the split loses atomicity, healed by reconciliation R3.

**Moderation remove/restore** (operator-authenticated): same pattern, `delta=-1`/`+1`; (a) `UPDATE supporters SET status=? WHERE receipt=? AND status=?`; (b) ledger insert `WHERE changes()=1` with `reason` + `actor` **required** — so every change to the public number is self-explaining.

### T.5 Reconciliation (proves displayed total is fully explained)
- **R1:** `COUNT(*) FROM supporters WHERE status='active'` == ledger head `running_total`.
- **R2:** `SUM(delta)` over the ledger == head `running_total` **and** `MAX(seq)-MIN(seq)+1 == COUNT(*)` (no gaps).
- **R3** (per-supporter; empty result = healthy): `LEFT JOIN supporters→ledger ON receipt`, group by supporter, `HAVING (status='active' AND net<>1) OR (status='removed' AND net<>0)` where `net=SUM(delta)`.
- **Chain verify (code):** walk `seq 0..max`, recompute `row_hash`, assert `row[n].prev_hash == row[n-1].row_hash`, and assert each `ledger_anchors` row still reproduces the published `head_hash`. First mismatch pinpoints the tampered `seq`.

### T.6 Trace one displayed unit
By opaque **receipt `R`** (or, operator-only, by internal `id`):
1. `SELECT id,receipt,status,created_at FROM supporters WHERE receipt = ?;`
2. `SELECT seq,ts,event_type,delta,running_total,reason,actor,prev_hash,row_hash FROM ledger WHERE target_id = ? ORDER BY seq;`
3. Recompute hashes/links from genesis (or the last anchor) to head; confirm the anchored `seq` still reproduces the published `head_hash`.
4. **Currently counted** iff `SUM(delta)` of its events `= 1` (== `status='active'`).
- **Public self-check:** the receipt holder hits rate-limited `GET /api/verify?receipt=…` → `{ exists, counted_on (coarse date), status }` only. Non-reversible, non-enumerable.
- **Person-level (operator only):** join `stories ON receipt` **only where `public_consent=1`**. Anonymous supporters terminate at the opaque row — there is no identity to reach, by design.

### T.7 External anchoring (what makes tamper-evidence bite)
A Cron (every K events / T minutes) reads the head `(seq,row_hash)`, writes `ledger_anchors`, and **publishes outside the operator's unilateral control**: commit `anchors.jsonl` to the public Git repo (clones/PRs expose silent rewrites) and/or OpenTimestamps (Bitcoin) / a public dated post. Published checksum: `{ as_of, total, ledger_root (head row_hash), prev_root, removed_since_last }`. Verification: each anchor's row at `anchor_seq` must still hash to the published `head_hash`; a mismatch proves a post-anchor rewrite.

### T.8 Deletion / PIPEDA compatibility
On self-service delete (valid `update_token`) or operator request, in one `batch()`:
1. `UPDATE supporters SET status='removed', token=NULL, source=NULL, created_at='' WHERE receipt=? AND status='active'` (**crypto-shred** the pseudonymous key + metadata).
2. Append `support_removed` (`delta=-1`) `WHERE changes()=1`.
3. Hard-delete the supporter's `stories` PII (`name/email/comment`).
The **receipt remains as an opaque tombstone** in the ledger — no PII ever lived there, so the append-only chain and the right to erasure coexist. Note: **D1 Time Travel** retains backups ~30 days; disclose that purges complete "within ~30 days."

### T.9 What this proves — and does not
- **CAN:** detect accidental corruption / single-row edits (chain breaks at the first altered `seq`); let third parties verify internal consistency and that anchors form an append-only prefix; **with anchoring, detect the operator rewriting history after an anchor** (the only property with teeth against the operator).
- **CANNOT:** prove inputs are real humans (fakes are faithfully recorded — that's the Layer-A admission gate's job); protect **un-anchored** history; prove completeness/no-omission unless states are anchored frequently; provide confidentiality.

### T.10 Feasibility & storage
Fully feasible on D1 today — no Durable Object required: prepared statements + atomic `batch()` + `UNIQUE`/triggers + Web Crypto SHA-256 + a periodic anchor publish. Single-threaded writer + `UNIQUE(prev_hash)` give a lock-free, fork-safe chain; retries effectively never fire at advocacy volume. Sizing: `supporters` ~0.3–0.4 KB/row, `ledger` ~0.4–0.6 KB/row; thousands–tens of thousands ≈ a few MB; ~1M lifetime events ≈ ~0.9 GB, well under the 10 GB cap. If approached, archive sealed ledger segments to R2 keeping the head hash in `ledger_anchors`.

---

## 17. Deployment — reuse the existing `oinp` Worker (one Worker: frontend + backend)

**Decision (2026-06-30):** do **not** create a new Worker. Reuse the existing service **`oinp`** on account `715eeba5ac9c4d46450860c95870f56a` (dashboard: Workers → `oinp` → production). Both the **frontend (static assets)** and the **backend (`/api/*`)** run inside this **single Worker** — no separate API service, no second Worker.

**Why reuse is automatic:** `wrangler.toml` already sets `name = "oinp"`, so `wrangler deploy` matches that service by name + account and **updates it in place** — it does not create a new one. Pinning `account_id` (done 2026-06-30) makes the target deterministic so a deploy can't accidentally land on the wrong account or spawn a new Worker.

**How one Worker serves both** — `worker.js` routes by path: `/api/*` is handled in-Worker (with the D1 binding), and everything else falls through to the static-assets binding exactly as it does today:
```js
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env, ctx, url); // backend: D1 + ledger (§9, §16)
    }
    return env.ASSETS.fetch(request);           // frontend: static files in public/
  },
};
```

**`wrangler.toml` changes:**
- `account_id = "715eeba5ac9c4d46450860c95870f56a"` — pin the account (✅ applied).
- A `[[d1_databases]]` binding (binding `DB`) — added **after** `wrangler d1 create oinp-support` prints a `database_id`. Kept **commented** until the DB exists so the running `wrangler dev` doesn't error on a missing database.
- The existing `assets = { directory = "public", binding = "ASSETS" }` binding stays unchanged.

**Secrets** (Turnstile secret key; the rotated HMAC key for prefix rate-limiting) go on the **same** Worker via `wrangler secret put …` — never in source or `wrangler.toml`.

**Environments:** the service has no named envs in config, so the top-level config *is* the `production` deployment shown in the dashboard. Add `[env.staging]` later only if we want a separate throwaway test Worker.

**Local dev unchanged:** `wrangler dev` serves the assets + the same `/api/*` routes locally, against a local D1 (`wrangler d1 execute --local` / `--local` dev) so development never touches production data.

---

## 18. Operator notifications (Telegram)

On each new **story** submission the Worker pings the operator (Joe) on Telegram, so input is visible in real time. Implemented in `worker.js` (`notifyTelegram`, called from `handleDetails` via `ctx.waitUntil` so it never delays or blocks the response).

- **Dormant by default:** no-op unless **both** `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set. Send failures are swallowed — a notification problem can never break a submission.
- **Message:** 🇨🇦 flag, name · email, publish-consent (yes/no), the story text (**HTML-escaped**), and the opaque receipt + current total. PII goes only to the operator's own chat (operator = data controller).
- **Local try:** put `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` in `.dev.vars` (template included) and **restart `wrangler dev`** — it does not reliably hot-reload `.dev.vars`. The dev sandbox reaches `api.telegram.org` fine, so a real token delivers locally.
- **Production:** `wrangler secret put TELEGRAM_BOT_TOKEN` and `wrangler secret put TELEGRAM_CHAT_ID`.
- **Optional:** `TELEGRAM_API_BASE` (defaults to `https://api.telegram.org`) for proxy/testing.
- **Scope:** stories only (rich content). Bare support clicks are counts only and don't notify (avoids noise); a milestone ping could be added later. Slack/Discord would be a drop-in variant of `notifyTelegram`.
- **Browsing everything** (beyond pings): Cloudflare **D1 Console** → `SELECT * FROM stories ORDER BY created_at DESC`, or `wrangler d1 execute`.

**Verification (local):** the exact `notifyTelegram` + message-build logic was unit-tested against a mock — correct endpoint path, `chat_id`, `parse_mode:HTML`, HTML escaping (`<b>`→`&lt;b&gt;`, `&`→`&amp;`), receipt+total, and confirmed no-op when unconfigured; submissions are never blocked. The live send could not be exercised through `wrangler dev` (its sandbox doesn't route worker `fetch` to a host-local mock); production/real-token uses the normal external `api.telegram.org` path.

---

## 19. Hardening implemented (2026-06-30, pass #1)

These §15/§16 items are now in code (local; for the big PR — **not deployed**):

- **Single-use nonces (replay protection)** — `used_nonces` table (migration 0002); `verifyNonce` returns `jti`; `admit()` calls `markNonceUsed` (`INSERT OR IGNORE`) and rejects replays with reason `nonce_used`. Front-end primes a fresh nonce after a successful support and retries on `nonce_used`.
- **Cron purge** — `scheduled()` → `purgeEphemeral` deletes `abuse_ephemeral` older than `ABUSE_RETENTION_DAYS` (7) and `used_nonces` past the nonce TTL; `[triggers] crons = ["0 3 * * *"]`. The opportunistic in-request purge was removed.
- **Operator moderation** — `POST /api/admin/moderate` (auth `x-operator-token` == `OPERATOR_TOKEN`; **dormant 404** unless set): `remove` (recordRemoval + hide stories), `restore` (recordRestore, idempotent), `approve_story` (status=approved, visibility=public iff consent). Routed before the same-origin guard.
- **Turnstile (graceful)** — backend verifies only when `TURNSTILE_SECRET` is set (else skips); `GET /api/config` exposes `turnstileSiteKey`; front-end loads + executes Turnstile **only** when a site key is configured (dormant otherwise), sending `turnstileToken`.

**Verified locally:** backend integration **18/18** (replay rejected; moderation remove/restore/approve; 401 without/wrong token; cron purge via `--test-scheduled`; hash-chain + R1 reconciliation hold); front-end e2e (support + story, no console errors, Turnstile confirmed dormant).

**Still open (pass #2 + legal):** ledger **external anchoring** (T.7) + `/transparency` "how we count" page (the reveal-credibility unlock); privacy collection notice / CASL / cross-border copy; pre-reveal integrity recount. Reveal threshold remains 50; the count stays hidden.

---

## 20. Transparency + anchoring implemented (2026-06-30, pass #2)

- **Public provenance endpoint** — `GET /api/transparency` → `{ threshold, show, since, as_of, ledger_root, last_anchor }`. Numeric count fields (`total`, `ledger_seq`, `removed`) are **withheld below the reveal threshold** so the endpoint can't be used to peek at a hidden count; the **ledger root hash is always public** (it reveals no count) for tamper-evidence.
- **Ledger anchoring** — `anchorLedger()` runs in the daily Cron (with the purge), writing the current head `(seq, row_hash)` into `ledger_anchors` only when the head advances. The published root can be archived by third parties; a later mismatch proves a rewrite. *(Automated external publication to git / OpenTimestamps is still a CI follow-up — the checksum is already publicly fetchable, but not yet auto-pushed to an immutable external store.)*
- **`/transparency` "how we count" page** — `public/transparency/index.html`: methodology (one action/browser, de-duplicated, bot-screened, never seeded, hidden-until-threshold, append-only hash-chained ledger, personal receipt), a live snapshot from `/api/transparency` (respects the gate), the verifiable ledger root + last anchor, and a privacy section.
- **Privacy copy** — support microcopy carries a collection notice + `/transparency` link; the story consent adds CASL ("only to follow up about this message") + cross-border ("stored on Cloudflare, may be processed outside Canada"); the revealed count links to "how we count".

**Verified locally:** `/api/transparency` gated below threshold (no count leak) and full above (**11/11**); Cron anchoring writes `ledger_anchors` (anchor `head_hash` == ledger root); the `/transparency` page renders the number, root hash, anchor, and since with **no console errors**; reconciliation holds. CSS v=76 / JS v=23.

**Still open:** automated external anchor publication (git commit / OpenTimestamps) via CI; pre-reveal integrity recount (process); optional third-party attestation at reveal.
