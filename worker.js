/**
 * OINP Worker — single Worker serving BOTH the static frontend and the /api backend.
 *  - /api/*  -> JSON API backed by D1 (binding `DB`), with a hash-chained audit ledger.
 *  - else    -> env.ASSETS.fetch (static files in public/).
 * Design + trust model: docs/plans/2026-06-30-support-count-trust-design.md (§9, §16).
 * Phase 1 = "collect quietly": persist support + stories; the public count stays hidden
 * until total >= SUPPORT_THRESHOLD (front-end reveals automatically).
 */

const GENESIS_PREV = "0".repeat(64);
const B32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford-ish (no I,L,O,U)
const enc = new TextEncoder();
const SITE_ORIGIN = "https://oinp.hubeiqiao.com";
const CONTENT_SIGNAL = "ai-train=no, search=yes, ai-input=yes";
const AGENT_LINK_HEADER = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"; title="OINP public API catalog"',
  '</openapi.json>; rel="service-desc"; type="application/openapi+json"; title="OINP public API description"',
  '</llms.txt>; rel="alternate"; type="text/markdown"; title="LLM-readable site summary"',
].join(", ");
const HOME_MARKDOWN = `# Canada helped Joe become a builder. Does Canada know how to keep builders?

[Joe Hu](https://hubeiqiao.com/) is a builder in Ottawa, Canada. Canada helped him study, build an AI product, register a company, and find community. His story asks whether Canada can keep early-stage builders it helped create.

## What this page is about

This is a public-awareness story, not immigration advice. It connects [Joe](https://hubeiqiao.com/)'s personal case to a broader question for Canada and Ontario: can Canada retain early-stage contributors before their value is easy to classify?

## Quick answers

What this page is about:
[Joe Hu](https://hubeiqiao.com/)'s story is one example of a broader question: can Canada retain early-stage contributors it helped train while their value is still early — before the system has a way to measure it?

What changed:
Ontario redesigned the Ontario Immigrant Nominee Program (OINP). Former graduate streams will issue no more invitations, leaving some people who planned around that path in uncertainty.

What the ask is:
Fair transitions, independent graduate pathways, and bridges into Canada's economy, research, and communities.

How people can help:
Support the message, share the video with Canada's tech, startup, university, media, or policy communities, or add a story if they are seeing the same pattern.

## What this is not

This is not a petition, not a fundraiser, and not immigration advice. Joe is not asking for a job or for personal relief — he can find work. The ask is systemic: fair transitions and independent graduate pathways for people already contributing in Canada.

## The short version

Canada helped [Joe](https://hubeiqiao.com/) become a builder. Here, he studied, built his first product, registered a company, and found community.

Then the immigration pathway changed. Joe became one story in a broader question: can Canada keep early-stage contributors it helped create?

## The ask

Build fair pathways for people already contributing. Job offers and language scores matter. So do the products, companies, and research people build first. Some contribution shows up before the immigration system has a category for it — fair policy should protect the people caught in that gap.

## Evidence and resources

- Joe Speaking: AI speaking coach built from Joe's English-speaking struggle, now used by 1,200+ learners across 30+ countries.
- YC Startup School 2026: accepted into YC Startup School 2026, an outside founder-community signal around Joe's AI product work.
- Ontario OINP redesign: official Ontario updates saying no further invitations will be issued under the former graduate streams.
- Former graduate pathway context: official context showing the former structure separated graduate streams from employer-dependent routes.
- Graduate talent context: official context recognizing master's and doctoral students for contributions to Canada's economic growth and innovation.
- Start-Up Visa status: federal founder-route context; the Start-Up Visa is closed to most new applications for now.
- [Joe](https://hubeiqiao.com/)'s Canada journey: the longer essay on leaving an old rhythm, finding confidence in Canada, and building his way back through products.

## Support

The easiest action is to support the message and share the story with people in Canada's tech, startup, university, media, and policy communities.

Canonical URL: ${SITE_ORIGIN}/
Video: ${SITE_ORIGIN}/media/oinp-feedback-story.mp4
`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/.well-known/api-catalog") return handleApiCatalog(request, url);
    if (wantsMarkdown(request, url)) return handleMarkdownHome(request);

    if (url.pathname.startsWith("/api/")) {
      try {
        return await handleApi(request, env, url, ctx);
      } catch (e) {
        return json({ ok: false, error: "server_error" }, 500);
      }
    }
    return withAeoHeaders(request, url, await env.ASSETS.fetch(request));
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil((async () => { await purgeEphemeral(env); await anchorLedger(env); })());
  },
};

function handleMarkdownHome(request) {
  const body = request.method === "HEAD" ? null : HOME_MARKDOWN;
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Signal": CONTENT_SIGNAL,
      "Link": AGENT_LINK_HEADER,
      "Vary": "Accept",
      "X-Markdown-Tokens": String(Math.ceil(HOME_MARKDOWN.split(/\s+/).length * 1.35)),
    },
  });
}

function handleApiCatalog(request, url) {
  const origin = url.origin || SITE_ORIGIN;
  const body = {
    linkset: [
      {
        anchor: origin + "/",
        "service-desc": [
          { href: origin + "/openapi.json", type: "application/openapi+json", title: "OINP public API description" },
        ],
        "service-doc": [
          { href: origin + "/#support", type: "text/html", title: "Support and story-sharing action" },
          { href: origin + "/transparency/", type: "text/html", title: "Support count and privacy transparency" },
        ],
      },
      {
        anchor: origin + "/api/support/count",
        status: [
          { href: origin + "/api/transparency", type: "application/json", title: "Public support ledger summary" },
        ],
        "service-desc": [
          { href: origin + "/openapi.json", type: "application/openapi+json", title: "Endpoint schema" },
        ],
      },
    ],
  };
  return json(body, 200, {
    "Content-Type": "application/linkset+json; charset=utf-8",
    "Cache-Control": "public, max-age=3600",
    "Link": AGENT_LINK_HEADER,
    "Content-Signal": CONTENT_SIGNAL,
  });
}

async function handleApi(request, env, url, ctx) {
  const p = url.pathname;
  const m = request.method;

  if (p === "/api/support/init" && m === "GET")
    return json({ nonce: await issueNonce(env) }, 200, { "Cache-Control": "no-store" });
  if (p === "/api/support/count" && m === "GET") return handleCount(env);
  if (p === "/api/verify" && m === "GET") return handleVerify(request, env);
  if (p === "/api/config" && m === "GET")
    return json({ turnstileSiteKey: env.TURNSTILE_SITE_KEY || "" }, 200, { "Cache-Control": "public, max-age=300" });
  if (p === "/api/transparency" && m === "GET") return handleTransparency(env);

  // operator moderation — own token auth (not same-origin); dormant unless OPERATOR_TOKEN is set
  if (p === "/api/admin/moderate" && m === "POST") return handleModerate(request, env);

  // mutating endpoints: basic same-origin guard (defense-in-depth; nonce/Turnstile are the real gates)
  if (m === "POST" && !sameOrigin(request, url)) return json({ ok: false, error: "origin" }, 403);

  if (p === "/api/support" && m === "POST") return handleSupport(request, env);
  if (p === "/api/support/details" && m === "POST") return handleDetails(request, env, ctx);
  if (p === "/api/support/delete" && m === "POST") return handleDelete(request, env);

  return json({ ok: false, error: "not_found" }, 404);
}

/* ----------------------------- endpoints ----------------------------- */

async function handleSupport(request, env) {
  const body = await readJSON(request);
  const gate = await admit(request, env, body);
  if (!gate.ok) return json({ ok: false, reason: gate.reason }, gate.status);

  const token = sanitizeToken(body.token);
  if (!token) return json({ ok: false, reason: "token" }, 400);

  const receipt = genReceipt();
  const updateToken = genUpdateToken();
  const updateTokenHash = await sha256Hex(updateToken);
  const r = await recordSupport(env, { token, receipt, updateTokenHash, source: clip(body.source || "oinp", 40) });

  const out = { ok: true, total: r.total, alreadyCounted: r.alreadyCounted, receipt: r.receipt };
  if (!r.alreadyCounted) out.updateToken = updateToken; // plaintext returned ONCE, only for a new supporter
  return json(out, 200);
}

async function handleDetails(request, env, ctx) {
  const body = await readJSON(request);
  const gate = await admit(request, env, body);
  if (!gate.ok) return json({ ok: false, reason: gate.reason }, gate.status);

  const comment = clip(body.comment, 1500).trim();
  if (comment.length < 20) return json({ ok: false, reason: "comment" }, 400);
  const name = clip(body.name, 120).trim();
  const email = clip(body.email, 254).trim();
  const publicConsent = body.public_consent ? 1 : 0;

  // Submitting a story also counts as support (stronger signal). Reuse/created supporter by token.
  let token = sanitizeToken(body.token);
  let minted = false;
  if (!token) { token = crypto.randomUUID(); minted = true; }
  const receipt = genReceipt();
  const updateToken = genUpdateToken();
  const updateTokenHash = await sha256Hex(updateToken);
  const r = await recordSupport(env, { token, receipt, updateTokenHash, source: "story-portal" });

  await env.DB.prepare(
    "INSERT INTO stories (receipt,name,email,comment,visibility,public_consent,status) VALUES (?,?,?,?, 'private', ?, 'pending')"
  ).bind(r.receipt, name || null, email || null, comment, publicConsent).run();

  // Operator notification (Telegram) — dormant unless TELEGRAM_* are set; never blocks the response.
  const note =
    "\uD83C\uDDE8\uD83C\uDDE6 <b>New OINP story</b>\n" +
    "\uD83D\uDC64 " + escapeHtml(name || "(no name)") + (email ? " \u00B7 " + escapeHtml(email) : "") + "\n" +
    "\uD83D\uDCE3 Publish consent: " + (publicConsent ? "yes" : "no") + "\n\n" +
    escapeHtml(comment) + "\n\n" +
    "\uD83E\uDDFE " + escapeHtml(r.receipt) + " \u00B7 total supporters: " + r.total;
  if (ctx && ctx.waitUntil) ctx.waitUntil(notifyTelegram(env, note)); else notifyTelegram(env, note);

  const out = { ok: true, total: r.total, alreadyCounted: r.alreadyCounted, receipt: r.receipt };
  if (!r.alreadyCounted) { out.updateToken = updateToken; if (minted) out.token = token; }
  return json(out, 200);
}

async function handleCount(env) {
  const head = await readHead(env);
  const total = head ? head.running_total : 0;
  const threshold = getInt(env, "SUPPORT_THRESHOLD", 50);
  return json({ total, threshold, show: total >= threshold }, 200, {
    "Cache-Control": "public, max-age=30, s-maxage=30",
  });
}

async function handleVerify(request, env) {
  const url = new URL(request.url);
  const receipt = clip(url.searchParams.get("receipt") || "", 32).trim();
  if (!receipt) return json({ ok: false }, 400);
  const row = await env.DB.prepare("SELECT status, created_at FROM supporters WHERE receipt=?").bind(receipt).first();
  if (!row) return json({ exists: false }, 200);
  return json({ exists: true, status: row.status, counted_on: (row.created_at || "").slice(0, 10) }, 200);
}

async function handleDelete(request, env) {
  const body = await readJSON(request);
  const token = sanitizeToken(body.token);
  const updateToken = clip(body.updateToken || body.update_token || "", 80);
  if (!token || !updateToken) return json({ ok: false, reason: "params" }, 400);

  const sup = await env.DB.prepare("SELECT receipt, update_token, status FROM supporters WHERE token=?").bind(token).first();
  if (!sup) return json({ ok: false, reason: "notfound" }, 404);
  if ((await sha256Hex(updateToken)) !== sup.update_token) return json({ ok: false, reason: "auth" }, 403);
  if (sup.status !== "active") return json({ ok: true, alreadyRemoved: true }, 200);

  const r = await recordRemoval(env, sup.receipt, "self-service delete", "system");
  // crypto-shred the pseudonymous key + metadata, hard-delete story PII; opaque receipt stays as a tombstone
  await env.DB.batch([
    env.DB.prepare("UPDATE supporters SET token=NULL, source=NULL, created_at='' WHERE receipt=?").bind(sup.receipt),
    env.DB.prepare("DELETE FROM stories WHERE receipt=?").bind(sup.receipt),
  ]);
  return json({ ok: true, total: r.total }, 200);
}

async function handleModerate(request, env) {
  const op = env.OPERATOR_TOKEN;
  if (!op) return json({ ok: false, error: "not_found" }, 404); // dormant unless configured
  if (!timingEq(request.headers.get("x-operator-token") || "", op)) return json({ ok: false, error: "unauthorized" }, 401);
  const body = await readJSON(request);
  const receipt = clip(body.receipt, 32).trim();
  const action = clip(body.action, 20);
  const reason = clip(body.reason || action, 200);
  if (!receipt) return json({ ok: false, error: "receipt" }, 400);
  if (action === "remove") {
    const r = await recordRemoval(env, receipt, "mod: " + reason, "mod");
    await env.DB.prepare("UPDATE stories SET status='removed' WHERE receipt=?").bind(receipt).run();
    return json({ ok: true, action: action, total: r.total }, 200);
  }
  if (action === "restore") {
    const r = await recordRestore(env, receipt, "mod: " + reason, "mod");
    return json({ ok: true, action: action, total: r.total }, 200);
  }
  if (action === "approve_story") {
    await env.DB.prepare("UPDATE stories SET status='approved', visibility=CASE WHEN public_consent=1 THEN 'public' ELSE 'private' END WHERE receipt=?").bind(receipt).run();
    return json({ ok: true, action: action }, 200);
  }
  return json({ ok: false, error: "action" }, 400);
}

/* ----------------------- ledger write-paths ------------------------- */

async function readHead(env) {
  return env.DB.prepare("SELECT seq, row_hash, running_total FROM ledger ORDER BY seq DESC LIMIT 1").first();
}

async function ensureGenesis(env) {
  const head = await readHead(env);
  if (head) return head;
  const ts = todayUTC();
  const g = { seq: 0, event_type: "genesis", target_id: null, delta: 0, running_total: 0, ts, reason: "genesis", actor: "system" };
  const rh = await rowHash(GENESIS_PREV, g);
  await env.DB.prepare(
    "INSERT OR IGNORE INTO ledger (seq,ts,event_type,target_id,delta,running_total,reason,actor,prev_hash,row_hash) VALUES (0,?,?,?,?,?,?,?,?,?)"
  ).bind(ts, "genesis", null, 0, 0, "genesis", "system", GENESIS_PREV, rh).run();
  return readHead(env);
}

// Insert supporter (idempotent by token) + append a support_added ledger row, atomically.
// The ledger append is gated by EXISTS(receipt=R_new AND token) so it fires ONLY when THIS
// request actually inserted the supporter — no dependency on changes() across batch statements.
async function recordSupport(env, { token, receipt, updateTokenHash, source }) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const head = await ensureGenesis(env);
    const seq = head.seq + 1;
    const runningTotal = head.running_total + 1;
    const ts = todayUTC();
    const row = { seq, event_type: "support_added", target_id: receipt, delta: 1, running_total: runningTotal, ts, reason: null, actor: "system" };
    const rh = await rowHash(head.row_hash, row);
    try {
      const res = await env.DB.batch([
        env.DB.prepare("INSERT INTO supporters (token,receipt,update_token,status,source) VALUES (?,?,?, 'active', ?) ON CONFLICT(token) DO NOTHING")
          .bind(token, receipt, updateTokenHash, source),
        env.DB.prepare(
          "INSERT INTO ledger (seq,ts,event_type,target_id,delta,running_total,reason,actor,prev_hash,row_hash) " +
          "SELECT ?,?,?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM supporters WHERE receipt=? AND token=?)"
        ).bind(seq, ts, "support_added", receipt, 1, runningTotal, null, "system", head.row_hash, rh, receipt, token),
        env.DB.prepare("SELECT receipt FROM supporters WHERE token=?").bind(token),
        env.DB.prepare("SELECT running_total FROM ledger ORDER BY seq DESC LIMIT 1"),
      ]);
      const storedReceipt = first(res[2], "receipt");
      const total = first(res[3], "running_total");
      const isNew = storedReceipt === receipt;
      return { ok: true, receipt: storedReceipt, total: total == null ? runningTotal : total, alreadyCounted: !isNew };
    } catch (e) {
      if (attempt === 5) throw e; // exhausted retries on prev_hash/seq contention
    }
  }
}

// Mark a supporter removed + append support_removed (idempotent: won't double-append).
async function recordRemoval(env, receipt, reason, actor) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const head = await ensureGenesis(env);
    const seq = head.seq + 1;
    const runningTotal = head.running_total - 1;
    const ts = todayUTC();
    const row = { seq, event_type: "support_removed", target_id: receipt, delta: -1, running_total: runningTotal, ts, reason: clip(reason, 200), actor };
    const rh = await rowHash(head.row_hash, row);
    try {
      const res = await env.DB.batch([
        env.DB.prepare("UPDATE supporters SET status='removed' WHERE receipt=? AND status='active'").bind(receipt),
        env.DB.prepare(
          "INSERT INTO ledger (seq,ts,event_type,target_id,delta,running_total,reason,actor,prev_hash,row_hash) " +
          "SELECT ?,?,?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM supporters WHERE receipt=? AND status='removed') " +
          "AND NOT EXISTS (SELECT 1 FROM ledger WHERE target_id=? AND event_type='support_removed')"
        ).bind(seq, ts, "support_removed", receipt, -1, runningTotal, clip(reason, 200), actor, head.row_hash, rh, receipt, receipt),
        env.DB.prepare("SELECT running_total FROM ledger ORDER BY seq DESC LIMIT 1"),
      ]);
      const total = first(res[2], "running_total");
      return { ok: true, total: total == null ? runningTotal : total };
    } catch (e) {
      if (attempt === 5) throw e;
    }
  }
}

// Operator restore: flip a removed supporter back to active + append support_restored (idempotent).
async function recordRestore(env, receipt, reason, actor) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const head = await ensureGenesis(env);
    const seq = head.seq + 1;
    const runningTotal = head.running_total + 1;
    const ts = todayUTC();
    const row = { seq, event_type: "support_restored", target_id: receipt, delta: 1, running_total: runningTotal, ts, reason: clip(reason, 200), actor };
    const rh = await rowHash(head.row_hash, row);
    try {
      const res = await env.DB.batch([
        env.DB.prepare("UPDATE supporters SET status='active' WHERE receipt=? AND status='removed'").bind(receipt),
        env.DB.prepare(
          "INSERT INTO ledger (seq,ts,event_type,target_id,delta,running_total,reason,actor,prev_hash,row_hash) " +
          "SELECT ?,?,?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM supporters WHERE receipt=? AND status='active') " +
          "AND (SELECT COALESCE(SUM(delta),0) FROM ledger WHERE target_id=?) = 0"
        ).bind(seq, ts, "support_restored", receipt, 1, runningTotal, clip(reason, 200), actor, head.row_hash, rh, receipt, receipt),
        env.DB.prepare("SELECT running_total FROM ledger ORDER BY seq DESC LIMIT 1"),
      ]);
      const total = first(res[2], "running_total");
      return { ok: true, total: total == null ? runningTotal : total };
    } catch (e) {
      if (attempt === 5) throw e;
    }
  }
}

/* --------------------------- admission gate -------------------------- */

async function admit(request, env, body) {
  if (body.company) return { ok: false, reason: "rejected", status: 200 }; // honeypot filled
  const tv = await verifyTurnstile(env, body.turnstileToken, request);
  if (!tv.ok) return { ok: false, reason: "verification", status: 200 };
  const nz = await verifyNonce(env, body.nonce);
  if (!nz.ok) return { ok: false, reason: "nonce", status: 200 };
  if (nz.dwell < getInt(env, "DWELL_MIN_MS", 800)) return { ok: false, reason: "too_fast", status: 200 };
  if (!(await markNonceUsed(env, nz.jti))) return { ok: false, reason: "nonce_used", status: 200 };
  const rl = await rateLimit(env, request, nz.dwell);
  if (!rl.ok) return { ok: false, reason: "rate", status: 429 };
  return { ok: true };
}

async function rateLimit(env, request, dwell) {
  const prefix = ipPrefix(clientIP(request));
  const hmacIp = await hmacHex(env.HMAC_SECRET, "ip:" + prefix);
  const windowMs = getInt(env, "RATE_WINDOW_MS", 600000);
  const max = getInt(env, "RATE_LIMIT_MAX", 30);
  const since = new Date(Date.now() - windowMs).toISOString();
  const cnt = await env.DB.prepare("SELECT COUNT(*) AS c FROM abuse_ephemeral WHERE hmac_ip=? AND seen_at>=?").bind(hmacIp, since).first();
  await env.DB.prepare("INSERT INTO abuse_ephemeral (hmac_ip, ua_class, dwell_ms) VALUES (?,?,?)")
    .bind(hmacIp, uaClass(request.headers.get("user-agent")), dwell | 0).run();
  return { ok: (cnt ? cnt.c : 0) < max };
}

// Single-use nonce: true if this jti is fresh (now consumed), false if already used (replay).
async function markNonceUsed(env, jti) {
  if (!jti) return false;
  try {
    const res = await env.DB.prepare("INSERT OR IGNORE INTO used_nonces (jti) VALUES (?)").bind(jti).run();
    return !!(res && res.meta && res.meta.changes === 1);
  } catch (e) { return true; } // never hard-block legitimate users if the replay store errors
}

// Cron: drop expired rate-limit rows and consumed nonces (privacy + size hygiene).
async function purgeEphemeral(env) {
  const days = getInt(env, "ABUSE_RETENTION_DAYS", 7);
  const abuseCut = new Date(Date.now() - days * 86400000).toISOString();
  const nonceCut = new Date(Date.now() - getInt(env, "NONCE_TTL_MS", 1800000) - 60000).toISOString();
  try {
    await env.DB.batch([
      env.DB.prepare("DELETE FROM abuse_ephemeral WHERE seen_at < ?").bind(abuseCut),
      env.DB.prepare("DELETE FROM used_nonces WHERE used_at < ?").bind(nonceCut),
    ]);
  } catch (e) {}
}

// Cron: anchor the current ledger head so history is tamper-evident. The root hash is publicly
// fetchable via /api/transparency; third parties can record it over time to detect any rewrite.
async function anchorLedger(env) {
  const head = await readHead(env);
  if (!head) return;
  const last = await env.DB.prepare("SELECT anchor_seq FROM ledger_anchors ORDER BY anchor_seq DESC LIMIT 1").first();
  if (last && last.anchor_seq >= head.seq) return; // nothing new to anchor
  try {
    await env.DB.prepare("INSERT OR IGNORE INTO ledger_anchors (anchor_seq, head_hash, published_at, location) VALUES (?,?,?,?)")
      .bind(head.seq, head.row_hash, new Date().toISOString(), "public:/api/transparency").run();
  } catch (e) {}
}

// Public provenance + checksum (the "how we count" page reads this). Numeric count fields are
// withheld below the reveal threshold so the endpoint can't be used to peek at a hidden count;
// the ledger root hash is always public (it reveals no count) for tamper-evidence.
async function handleTransparency(env) {
  const head = await readHead(env);
  const threshold = getInt(env, "SUPPORT_THRESHOLD", 50);
  const total = head ? head.running_total : 0;
  const show = total >= threshold;
  const genesis = await env.DB.prepare("SELECT ts FROM ledger WHERE seq=0").first();
  const anchor = await env.DB.prepare("SELECT anchor_seq, head_hash, published_at, location FROM ledger_anchors ORDER BY anchor_seq DESC LIMIT 1").first();
  const out = {
    threshold: threshold,
    show: show,
    since: genesis ? genesis.ts : null,
    as_of: new Date().toISOString(),
    ledger_root: head ? head.row_hash : null,
    last_anchor: anchor ? { seq: anchor.anchor_seq, head_hash: anchor.head_hash, published_at: anchor.published_at, location: anchor.location } : null,
  };
  if (show) {
    const removed = await env.DB.prepare("SELECT COUNT(*) AS c FROM ledger WHERE event_type='support_removed'").first();
    out.total = total;
    out.ledger_seq = head.seq;
    out.removed = removed ? removed.c : 0;
  }
  return json(out, 200, { "Cache-Control": "public, max-age=60, s-maxage=60" });
}

async function verifyTurnstile(env, token, request) {
  if (!env.TURNSTILE_SECRET) return { ok: true, skipped: true }; // not configured (local/Phase 1)
  if (!token) return { ok: false };
  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET);
  form.append("response", token);
  const ip = clientIP(request);
  if (ip) form.append("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
  const data = await res.json().catch(() => ({ success: false }));
  return { ok: !!data.success };
}

async function issueNonce(env) {
  const iat = Date.now();
  const jti = hex(crypto.getRandomValues(new Uint8Array(6)).buffer);
  const payload = iat + "." + jti;
  return payload + "." + (await hmacHex(env.HMAC_SECRET, payload));
}

async function verifyNonce(env, nonce) {
  if (!nonce || typeof nonce !== "string") return { ok: false };
  const parts = nonce.split(".");
  if (parts.length !== 3) return { ok: false };
  const [iatStr, jti, sig] = parts;
  const iat = parseInt(iatStr, 10);
  if (!iat) return { ok: false };
  const expect = await hmacHex(env.HMAC_SECRET, iatStr + "." + jti);
  if (!timingEq(expect, sig)) return { ok: false };
  const now = Date.now();
  const ttl = getInt(env, "NONCE_TTL_MS", 1800000);
  if (iat > now + 5000 || iat < now - ttl) return { ok: false, expired: true };
  return { ok: true, dwell: now - iat, jti: jti };
}

/* ------------------------------ helpers ------------------------------ */

function wantsMarkdown(request, url) {
  if (!isHomePath(url.pathname)) return false;
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  return (request.headers.get("Accept") || "").toLowerCase().includes("text/markdown");
}

function isHomePath(pathname) {
  return pathname === "/" || pathname === "/index.html";
}

function withAeoHeaders(request, url, response) {
  const headers = new Headers(response.headers);
  const type = headers.get("Content-Type") || "";
  if (isHomePath(url.pathname) && type.includes("text/html")) {
    appendHeader(headers, "Link", AGENT_LINK_HEADER);
    appendVary(headers, "Accept");
    headers.set("Content-Signal", CONTENT_SIGNAL);
  } else if (type.includes("text/html") || url.pathname === "/llms.txt" || url.pathname === "/robots.txt") {
    headers.set("Content-Signal", CONTENT_SIGNAL);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function appendHeader(headers, name, value) {
  const current = headers.get(name);
  headers.set(name, current ? current + ", " + value : value);
}

function appendVary(headers, value) {
  const current = headers.get("Vary");
  if (!current) { headers.set("Vary", value); return; }
  const existing = current.split(",").map((v) => v.trim().toLowerCase());
  if (!existing.includes(value.toLowerCase())) headers.set("Vary", current + ", " + value);
}

function json(obj, status = 200, headers = {}) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json", ...headers } });
}
async function readJSON(request) { return request.json().catch(() => ({})); }
function clip(v, n) { return (v == null ? "" : String(v)).slice(0, n); }
function getInt(env, k, d) { const v = parseInt(env[k], 10); return Number.isFinite(v) ? v : d; }
function first(result, key) { const rows = result && result.results; return rows && rows.length ? rows[0][key] : null; }

function sanitizeToken(t) { t = (t == null ? "" : String(t)); return /^[A-Za-z0-9._-]{8,80}$/.test(t) ? t : null; }
function genReceipt() {
  const r = crypto.getRandomValues(new Uint8Array(10));
  let s = ""; for (let i = 0; i < 10; i++) s += B32[r[i] & 31];
  return "OINP-" + s;
}
function genUpdateToken() { return hex(crypto.getRandomValues(new Uint8Array(24)).buffer); }

function canonical(r) { return JSON.stringify([r.seq, r.event_type, r.target_id ?? null, r.delta, r.running_total, r.ts, r.reason ?? null, r.actor]); }
async function rowHash(prevHash, r) { return sha256Hex(prevHash + "\n" + canonical(r)); }
function todayUTC() { return new Date().toISOString().slice(0, 10); }

async function sha256Hex(str) { return hex(await crypto.subtle.digest("SHA-256", enc.encode(str))); }
async function hmacHex(secret, msg) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret || ""), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, enc.encode(msg)));
}
function hex(buf) { const b = new Uint8Array(buf); let s = ""; for (let i = 0; i < b.length; i++) s += b[i].toString(16).padStart(2, "0"); return s; }
function timingEq(a, b) { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }

function clientIP(request) {
  return request.headers.get("CF-Connecting-IP") ||
    (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "127.0.0.1";
}
function ipPrefix(ip) {
  if (ip.includes(":")) return ip.split(":").slice(0, 4).join(":") + "::/64";
  const o = ip.split("."); return o.length === 4 ? o.slice(0, 3).join(".") + ".0/24" : ip;
}
function uaClass(ua) { ua = (ua || "").toString(); return /bot|crawl|spider|curl|wget|python|node-fetch|headless/i.test(ua) ? "bot" : "browser"; }

// Operator notification via Telegram Bot API. No-op unless both secrets are set, so it stays
// dormant locally/until configured. Failures are swallowed so they never affect a submission.
async function notifyTelegram(env, text) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;
  const base = env.TELEGRAM_API_BASE || "https://api.telegram.org";
  try {
    await fetch(base + "/bot" + env.TELEGRAM_BOT_TOKEN + "/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: text, parse_mode: "HTML", disable_web_page_preview: true }),
    });
  } catch (e) { /* notification failure must never affect the request */ }
}
function escapeHtml(s) { return (s == null ? "" : String(s)).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

function sameOrigin(request, url) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-CORS same-origin requests omit Origin; nonce/Turnstile still gate
  try { return new URL(origin).host === url.host; } catch { return false; }
}
