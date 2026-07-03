# OINP Site — Phase 1 Final Implementation Plan

**Date:** 2026-07-02 · **Status:** approved for implementation (this doc is the build spec; do not re-litigate direction here)
**Parents:** `2026-07-02-fable5-oinp-audit-upgrade-plan.md` (diagnosis/launch/AEO reference) · `2026-07-02-fable5-oinp-plan-v2-refined.md` (direction)

**Owner decisions locked in:**
- At-a-glance beat 2 says **"The work is visible"** (never "The proof is real").
- Beat 4 ends on the canonical hook: *"Joe is one example. The question is bigger: does Canada know how to keep builders?"*
- Social copy keeps **"Then Ontario closed the graduate pathway."** (blunt is fine; page copy stays with the precise "redesigned… will issue no more invitations").
- **No job-search FAQ** — no visible FAQ or JSON-LD entry about jobs, ever. Misread-prevention lives only in non-visible surfaces (llms.txt, HOME_MARKDOWN).
- Hero copy locked (§2 below); the hook **"Does Canada know how to keep builders?"** is untouchable.
- Typography: reduce Oswald to film language + numerals + micro-labels + stat numerals; serif for argument headlines; Hanken for small UI/directory/legal.
- `Content-Signal: ai-train=no, search=yes, ai-input=yes` stays exactly as is.

**Global rules for every item:** third person everywhere except Joe's own statements (footer statement, portal intro); no copy longer than what it replaces without a rendered wrap check; no new sections; no new colors; `prefers-reduced-motion` must degrade everything to static.

---

## Item 1 — Typography role map

**Files:** `public/styles.css`, `public/index.html` (Google Fonts link, ~line 140; amber-tail spans in headings)

**Change:**
- Serif (Cormorant Garamond, weight 500–600, sizes ~10–15% larger than the Oswald slots they replace, never below 24px):
  - `.resources-head h2` (styles.css ~552)
  - `.ask-title` (~763) — also delete the `.amber` tail spans inside ask titles in index.html
  - the support `h2.display` — cleanest route: locate the existing Cormorant override that already styles the ask head (`grep -n "Cormorant" public/styles.css`) and consolidate: make `.display` serif by default, then the support/ask heads need no per-section override
  - `.faq-head h2` (~809), reduced one step in scale (FAQ is the appendix)
  - `.portal-title` (~938)
- Hanken (600, tightened letter-spacing):
  - `.res-title` (~603) — serif is weak at 18px
  - `.footer-col h3` (~1379), `.footer-bottom p` (~1498)
- Oswald keeps exactly: `.film-title` (~269), `.film-play-title` (~326), `.ask-num` (~722), `.footer-mode` (~1289), `.topmark-name` (~195), plus the new stat numerals in Item 4.
- Fonts link in index.html: prune Oswald 400/500 (keep 600/700).
- **Amber rule:** amber word-highlights survive only inside Oswald/film-language elements (`.film-title .ft-accent` stays — it mirrors the video's amber word treatment). Serif argument headlines are never amber-highlighted: remove the amber spans from the ask titles and the support head ("pattern"). Inline `.amber` sprinkles in body copy (film lede, ask descriptions) are removed in Item 6 alongside the copy edits.

**Do NOT change:** body/lede fonts (Source Serif), kickers (Hanken, untouched this phase), buttons, film-stage styling, footer statement (already Cormorant), `--display` token itself (keep the variable; reassign per-selector so the film slots keep resolving to Oswald).

**Desktop validation (1440×900):** screenshot proof head, ask list, support head, FAQ head — must match the approved injection-test look (serif heads, Oswald numerals); no heading renders in Oswald except film title/play control.
**Mobile validation (390×844):** ask titles wrap ≤2 lines; proof head fits without shrinking below 34px; `.res-title` legible; footer directory readable.
**Tests/greps:** `node --test tests/aeo-worker.test.mjs` (green); `grep -n "var(--display)" public/styles.css` — result set must be exactly the keep-list + any new stat-numeral rule; `grep -c "Oswald" public/index.html` fonts link shows only 600;700.

---

## Item 2 — Hero copy + mobile hero text

**Files:** `public/index.html` (`.hero-lead`, ~line 171), `public/styles.css` (`.hero-lead-br` rule ~220, mobile hide ~1764, mobile hero height ~1755)

**Change:**
- Lead becomes (two edits only): *"Canada helped Joe become a builder. Here, he studied, built, registered a company, and found community. Then the **immigration** pathway changed. **Does Canada know how to keep builders?**"*
- Delete `<br class="hero-lead-br">` from the markup and the `@media (min-width:1400px)` rule that shows it; rely on `text-wrap: pretty`.
- Mobile: `.hero-lead` is currently `display:none` under 761px. Use the existing `.t-full`/`.t-min` toggle pattern: full lead in a desktop-only span; mobile-only span with *"Canada helped Joe become a builder. Does Canada know how to keep builders?"* (75 chars). Show it under the eyebrow at ~17px.
- Mobile hero height: raise from the current ~398px banner to ~60–70svh (`.hero-pin`/`.hero` mobile rules ~1755) so eyebrow + compact lead + CTAs compose as an opening screen.

**Do NOT change:** sentences 1–2 (frozen); the eyebrow; button markup/labels; the hook wording (no "keep him", no personal variant); do not exceed current total length; no `<br>` anywhere in hero copy.

**Desktop validation (1440×900):** lead renders ≤2 lines, no widow word; re-check at 1280×800.
**Mobile validation (390×844):** compact lead ≤3 lines; hero reads as an opening (video + eyebrow + lead + CTAs visible together); hook video frames still legibly cropped with the taller hero.
**Tests/greps:** `grep -rn "recognize builders in time" public/ worker.js` → 0 (also update `public/llms.txt` if it carries the old question — check with `grep -n "in time" public/llms.txt`); `node --test` green.

---

## Item 3 — "At a glance" redesign (the story logic)

**Files:** `public/index.html` (`#answer-brief`, lines ~247–270), `public/styles.css` (`.answer-brief-head`, `.answer-grid`, `.answer-card` rules)

**Change:**
- Keep the section, its `id="answer-brief"`, and the "At a glance" kicker.
- Replace the h2 + intro + three cards with: h2 **"Personal story. Structural question."** (serif, medium scale), then an `<ol class="arc">` of four beats (serif, clamp ~22–30px desktop / 20–22px mobile, generous spacing, narrow measure):
  1. *Canada helped Joe become a builder.* (keep one `person-link` on "Joe")
  2. *The work is visible — a product, a company, a community.*
  3. *Then Ontario redesigned the Ontario Immigrant Nominee Program (OINP). The former graduate streams will issue no more invitations.* — with the ontario.ca link as a quiet source line beneath the beat (small Hanken, not an amber underline in the sentence)
  4. *Joe is one example. The question is bigger: does Canada know how to keep builders?*
- Rail: one 1px hairline (`.arc::before`) with four small ticks (`.arc li::before`) — vertical, left of the text on desktop, in the left gutter on mobile. No icons, no cards, no nodes, no new animation (beats use the existing `.reveal` sequence).
- Delete `.answer-card`/`.answer-grid` CSS after removal.

**Do NOT change:** the section id (anchors/tests may reference it); the ontario.ca URL; the factual sentence in beat 3 (this is the page's load-bearing accuracy line and it carries the OINP first-mention — it must remain the first OINP expansion in DOM order); do not add a fifth beat; do not let this become an infographic.

**Desktop validation (1440×900):** head + four beats fit one viewport; ticks align to beat first-line baselines; screenshot as the "screenshot-complete" check — cropped to the section, it must tell the whole arc.
**Mobile validation (390×844):** section ≤ ~1.2 viewports; no orphaned single words on beat lines; rail doesn't collide with text at 320px (`min-width: 320px` is the site floor).
**Tests/greps:** `grep -c "not sentimental" public/index.html` → 0; `grep -c "talent-retention" public/index.html` → 0; OINP order check: `grep -n "OINP" public/index.html` — first hit must be the beat-3 full expansion; `node --test` green.

---

## Item 4 — "Proof behind the story" redesign (the evidence spine)

**Files:** `public/index.html` (`#resources`, lines ~273–335), `public/styles.css` (`.res-grid`, `.res-card`, mobile carousel rules), `public/media/resources/article.jpg` (asset re-export — Joe; interim CSS grade acceptable)

**Change:**
- Section head stays "Proof behind the story" (now serif via Item 1). Lede → *"What Joe built, who's vouched for it, and the official record of what changed."*
- **Tier 1 — two exhibits** (Joe Speaking, YC Startup School 2026), side by side on desktop at roughly 3-old-cards width total, labels recast: *What he built* · *Who noticed*. Imagery re-treated in one consistent grade (warm lift/duotone; the red YouTube-style `article.jpg` graphic moves to Tier 2 where it loses its thumbnail entirely). Stats as designed numerals (Oswald 600): **1,200+** learners · **30+** countries on the Joe Speaking exhibit; YC exhibit needs no forced numeral.
- **Tier 2 — three record rows** (no photo thumbnails): essay (*Where it started*), OINP update (*What changed*), Start-Up Visa (*What else closed*). Each row: beat label (Hanken uppercase, quiet), one factual line (current descriptions trimmed — v1 §8 wording), domain + arrow. The OINP row's hairline separator renders amber — the page's single "rupture" whisper.
- Kill the mobile horizontal carousel: Tier 1 stacks, Tier 2 rows are naturally full-width. Remove the dead space before "The ask" (observed ~100px+).

**Do NOT change:** any of the five URLs or `rel="noopener"`; the "1,200+ learners across 30+ countries" claim (verified copy — do not inflate); the kicker "Evidence and resources"; do not add a sixth item; do not give Tier 2 rows imagery.

**Desktop validation (1440×900):** two exhibits visually balanced; records scan as a list; the amber OINP hairline is noticeable but not loud; no gap ≥ ~80px before "The ask".
**Mobile validation (390×844):** no horizontal scrolling anywhere (`document.documentElement.scrollWidth === 390` via console); exhibits stack with legible stats; rows tappable (≥44px height).
**Tests/greps:** `grep -c "external founder signal" public/index.html` → 0; `grep -c "res-card" public/index.html` matches the new structure count; `node --test` green.

---

## Item 5 — Support signature card + share plumbing

**Files:** `public/index.html` (`[data-support-thanks]`, lines ~457–469), `public/styles.css`, `public/script.js` (support success handler, `copyLink()`, share URL builders)

**Change:**
- Compose the thanks state as one receipt card (max-width ~560px desktop, full-width mobile, `--shadow-card` ring): check → serif *"Thank you — your support is counted."* (existing copy) → **"#N"** as Oswald numeral + Hanken label *"supporter of fair pathways for people already building here"* → share row (existing buttons; native button first on mobile) → quiet in-card attribution line *"Canada helped Joe become a builder · oinp.hubeiqiao.com"* → transparency link.
- Threshold: if count < 25, suppress the numeral row (show only the serif line + count line hidden); flip automatically at ≥25. One conditional where `data-support-count` is populated.
- Micro-moment: heart-fill on the support button click before the state swap (CSS transition on the `.ico-heart` fill; no keyframe libraries), gated by `prefers-reduced-motion`.
- Share plumbing in the same file pass: `copyLink()` copies `NATIVE_TEXT + "\n\n" + SHARE_URL` (today: bare URL); add `?utm_source=x|linkedin|email|copy|native` to shared URLs; switch `twitter.com/intent/tweet` → `x.com/intent/post`. Keep all existing share texts (they are third person and approved — including "Then Ontario closed the graduate pathway." if/where used in social copy).

**Do NOT change:** the POST endpoint, dedupe/nonce logic, or receipt plumbing (`data-support-receipt`); the button label "I support fair pathways"; the micro-privacy line and transparency link placement; `SHARE_TITLE`/`SHARE_TEXT` wording (additive changes only); no confetti/badges/animation beyond the heart fill.

**Desktop validation (1440×900):** trigger the thanks state in dev (temporarily call the swap or stub the fetch); screenshot the card — self-contained, self-attributing, calm.
**Mobile validation (390×844):** the card fits one viewport without scrolling (it's the screenshot artifact); share row wraps to 2 rows cleanly; native share appears on mobile UA.
**Tests/greps:** `node --test` (script.js copy assertions must stay green); `grep -c "utm_source" public/script.js` ≥ 4; `grep -c "x.com/intent/post" public/script.js` = 1; manual: click copy-link → paste contains hook + URL.

---

## Item 6 — Copy cleanup (no job-search FAQ)

**Files:** `public/index.html`, `public/script.js` (remove `initAskDetails()`), `public/styles.css` (remove `.ask-detail` rules)

**Change:**
- Ask lede → *"Job offers and language scores matter. So do the products, companies, and research people build before any of that. Some contribution shows up before the immigration system has a category for it — and fair policy should protect the people caught in that gap."* (v1 §8; verify wrap, see validation).
- Ask 1: merge the duplicated proof/detail into one paragraph (*"People made tuition, career, and life decisions around published graduate streams — some were already in the process. When rules change mid-stream, there should be a clear transition, not sudden uncertainty."*); delete the `<details>` blocks from all three asks and the "READ FULL ASK" pattern; trim ask 2/3 five-item lists to three–four items.
- Ask 3 title → *"Reward what graduates actually build"*.
- Support lede → *"If this resonates, one click is enough. It's not a petition — it's a public signal that Canada's tech, startup, university, and policy communities should pay attention to the builders already here."*
- FAQ #1: *"…while their value is still early — before the system has a way to measure it?"* (replaces "emerging and hard to classify"); mirror in JSON-LD FAQ #1.
- Footer: "larger question" → "bigger question" (one word).
- Remove inline `.amber` sprinkles from body copy (film lede, ask descriptions) — they read as links.
- **Explicitly not doing:** no "Is Joe asking for a job?" FAQ, visible or in JSON-LD; no new visible copy that introduces the job frame anywhere. The existing "This is not a petition" line stays as-is.

**Do NOT change:** the FAQ set size (4 questions); FAQ #2's factual answer; the footer statement beyond the one word; the archive-line disclaimer; portal copy voice (Joe's first person is correct there); the film lede pending Phase 2 (opening-act work) — only its amber spans go now.

**Desktop validation (1440×900):** ask section screenshot — 4 elements per ask (numeral, tag, title, paragraph), no expanders.
**Mobile validation (390×844):** ask lede ≤7 lines; each ask card shorter than the current expanded state; FAQ unchanged visually apart from head font.
**Tests/greps:** banned phrases `grep -rniE "one permanent job|startup-era talent|builder evidence" public/ worker.js` → 0; `grep -ci "pathway" public/index.html` ≤ 10 (from 14); `grep -c "Read full ask" public/index.html` → 0; JSON-LD FAQ count still 4 (see Item 7 test); `node --test` green.

---

## Item 7 — AEO quick wins (`ai-train=no` unchanged)

**Files:** `public/index.html` (JSON-LD), `public/llms.txt`, `worker.js` (`HOME_MARKDOWN`), `tests/aeo-worker.test.mjs`

**Change:**
- VideoObject: add `"uploadDate"` (confirm the film's actual publish date with Joe; file mtime suggests 2026-06-28).
- Person entity: add `@id`, add `https://hubeiqiao.com/` to `sameAs`, reference the `@id` from author/publisher.
- llms.txt + HOME_MARKDOWN: add a short **"What this is not"** block — *not a petition, not a fundraiser, not immigration advice; the ask is systemic (fair transitions, independent graduate pathways)* — phrased without leading with the job frame; this text appears **only** on these non-visible surfaces, per the owner's FAQ decision. Reconcile the drift between the two files (same sections, same links, same "what changed" sentence); add a `Last updated:` line to llms.txt.
- Optional if trivial: `speakable` (SpeakableSpecification) on WebPage pointing at the FAQ.

**Do NOT change:** `Content-Signal` literals in worker.js, robots.txt, or the test (stays `ai-train=no, search=yes, ai-input=yes`); the visible FAQ (4 questions) or FAQPage JSON-LD count; sitemap; meta/og descriptions (already third person and on-message — leave alone this phase).

**Desktop/mobile validation:** none (non-visual).
**Tests/greps:** extend `tests/aeo-worker.test.mjs`: (a) VideoObject has `uploadDate`; (b) llms.txt AND HOME_MARKDOWN both contain the "What this is not" line; (c) both contain the identical "will issue no more invitations" sentence (drift guard); (d) FAQPage `mainEntity.length === 4` (guards against a job FAQ ever sneaking in); then `node --test tests/aeo-worker.test.mjs` — all green. Local negotiation check: `curl -s -H "Accept: text/markdown" http://127.0.0.1:8788/ | grep "What this is not"`.

---

## Phase 1 exit checklist

1. `node --test tests/aeo-worker.test.mjs` — green, including the 4 new assertions.
2. Rendered end-to-end pass at **1440×900** and **390×844**: hero (line counts), film, at-a-glance (one-viewport arc), proof (tiers, no carousel), asks (serif titles, no expanders), FAQ, support + triggered thanks card (one mobile viewport), footer.
3. `prefers-reduced-motion` emulation: reveals static, heart-fill static, nothing moves.
4. No horizontal scroll at 390 and 320 widths.
5. Grep sweep: banned phrases 0; "not sentimental" 0; "in time" 0 in hero/llms; OINP full expansion first in DOM; hook string count — `grep -c "Does Canada know how to keep builders?" public/index.html` should hit title/meta/hero/beat-4 (+ og/twitter meta), all identical spelling.
6. Diff review: no changes to worker Content-Signal, robots.txt, endpoints, or the film assets; `.DS_Store` excluded from any commit.
