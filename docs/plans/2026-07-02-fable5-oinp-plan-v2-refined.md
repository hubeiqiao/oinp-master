# OINP Site — Refined Upgrade Plan (v2)

**Date:** 2026-07-02 · **Supersedes:** the structural recommendations (§4–§7, §11 Phase 2) of `2026-07-02-fable5-oinp-audit-upgrade-plan.md`. Copy tables (§8), launch strategy (§9), and AEO items (§10) of v1 remain valid except where amended here.
**Owner constraints applied:** no new timeline section; existing "At a glance" + "Proof behind the story" carry the arc; keep the hook "Does Canada know how to keep builders?"; no blind Oswald removal; hero copy stays equal-or-shorter; no over-engineered scrollytelling.

---

## 1. Updated recommendation

Same diagnosis, different surgery. The page still needs to stop being nine labeled modules and become one story — but instead of adding a spine, we make the two middle sections *become* the spine:

- **"At a glance"** becomes the narrative logic: the four-beat arc, told typographically in the page's serif voice — *Canada helped Joe become a builder → the work is visible → Ontario redesigned the OINP → this raises a bigger question.*
- **"Proof behind the story"** becomes the evidence spine: a designed hierarchy of *Joe's work* (warm, personal exhibits) versus *the official record* (cool, document-like rows), so the visitor feels "real builder, real work, real external signal, real policy context" without reading a word twice.
- **Typography is reassigned by voice, not removed:** Oswald stays where it *is* the film's language (film title, play control, numerals, micro-labels); the serif takes over every argument headline. Validated by live style-injection at both viewports — see §4.
- **Support** becomes the signature moment (§6). Hero copy changes by exactly one word plus one swapped question (§5).

Everything else in v1 that survives these constraints (copy fixes, share pipeline, AEO corrections) carries forward into Phase 1 (§9).

The unified feel comes from three threads running through *existing* sections: one serif voice for every argument line, one restrained amber, and the hook question appearing exactly three times (title/hero, film, footer echo) instead of five near-synonyms.

## 2. "At a glance" → the story logic

**Current (observed 1440×900):** elegant serif head with a defensive line ("…the argument is not sentimental"), then a three-card SaaS row ("What this page is about / What changed / What the ask is"). The cards are the most generic pattern on the page and they *explain the page* instead of telling the story.

**New shape — an editorial passage, not cards.** Four short beats, set in the serif at lede-plus scale (clamp ~22–30px), stacked on the narrow measure (`--maxw-narrow`), each its own line-block with generous spacing. Connecting them: a single 1px hairline rail with four small ticks — desktop: vertical rail left of the text block; mobile: same rail in the left gutter. That is the entire "timeline-like treatment": one hairline, four ticks, no icons, no nodes, no animation beyond the existing reveal (each beat fades in sequence, which the reveal system already does).

**Proposed beats** (subject to §5 copy rules; total word count below the current section):

> *(kicker, quiet)* Personal story. Structural question.
>
> 1. Canada helped Joe become a builder.
> 2. The work is visible — a product, a company, a community. *(points the reader to the next section)*
> 3. Then Ontario redesigned the Ontario Immigrant Nominee Program (OINP). The former graduate streams will issue no more invitations. *(retains first-mention rule + the ontario.ca link, set as a quiet source line, not an amber underline)*
> 4. Joe is one example. The question is bigger: does Canada know how to keep builders?

Beat 3 is the only beat with a second sentence — it's the factual pivot and has earned the weight. Beat 4 hands off to the rest of the page without repeating the film title's phrasing verbatim.

**What this fixes:** the defensive meta-head is gone; the card grammar is gone; the arc is now readable in ~8 seconds in the page's own voice; and it front-loads the next section ("the work is visible") so "Proof behind the story" arrives as a payoff instead of a link dump.

**Mobile:** identical stack; beats at ~20–22px; rail in the gutter. Nothing to reflow — this shape is mobile-native by construction (it's just text).

## 3. "Proof behind the story" → the evidence spine

**Current (observed both viewports):** five equal cards; ~210px wide each on desktop; mixed-quality screenshot thumbnails including a red-text YouTube-style graphic that punctures the register; mobile is an undiscoverable swipe carousel with a truncated card and ~100px dead space after it.

**New shape — two tiers that *are* the argument:**

**Tier 1 — "What Joe built" (warm, personal, large).** Two exhibits: Joe Speaking and YC Startup School 2026. Generous cards (roughly the width three old cards occupied), re-graded imagery in one consistent treatment (warm lift or duotone in the page's ink/amber — the current red-arrow thumbnail is replaced by a graded still). Surface the numbers as designed elements, not buried prose: **1,200+** learners · **30+** countries (numerals in Oswald — the numeric role it keeps, §4). Labels recast as story beats: *What he built* · *Who noticed*.

**Tier 2 — "The record" (cool, official, quiet).** Three document-style rows, no photo thumbnails: the Canada-journey essay (*Where it started*), the OINP update (*What changed*), the Start-Up Visa status (*What else closed*). Each row: beat label, one factual line (current descriptions, trimmed per v1 §8), domain + arrow. The OINP row is allowed the page's one accent gesture: its hairline separator renders in amber (or carries a small strike) — a whisper of the "rupture," integrated, not a section.

The two-tier contrast does the persuasion silently: warm human evidence above, cold institutional record below. That *is* the story — contribution vs. category — expressed as layout.

**Section head:** serif (validated, §4). **Lede:** v1's rewrite stands: "What Joe built, who's vouched for it, and the official record of what changed."

**Mobile:** Tier 1 stacks (two full-width exhibits), Tier 2 is three slim rows. The carousel dies; total scroll cost is comparable and nothing is hidden behind a swipe.

## 4. Typography: keep / reduce / replace Oswald — with rendered evidence

**Method:** grepped all 13 `var(--display)` rules; mapped computed fonts on the live page at 1440×900 (every visible element grouped by rendered family); then injected the proposed reassignment as a live stylesheet and screenshotted at 1440×900 and 390×844.

**What the rendered map showed:** the incoherence isn't Oswald itself — it's that the split is *by section, not by role*. Cormorant already carries three of the four thesis moments (at-a-glance head, ask head, footer statement) while Oswald carries the fourth (support head "Help this reach people…") plus all section-header duty (proof head 81px, FAQ head, ask titles 53px, card titles, portal title) plus the film language (film title 95px, "Play with sound") plus numerals and micro-labels. Two sections with identical rhetorical jobs (the ask head vs. the support head) use different display faces — that's what reads as "assembled."

**The rule — Oswald is the film's voice; the serif is the argument's voice:**

| Slot (selector) | Current | Decision | Why |
|---|---|---|---|
| `.film-title`, `.film-play-title` | Oswald | **Keep Oswald** | This is the Remotion/video type language extending onto the page — continuity with the burned-in video type is the point. |
| `.ask-num` (01/02/03) | Oswald | **Keep Oswald** | Numerals are Oswald's best register; validated pairing below. |
| `.footer-mode` ("BUILDING IN CANADA"), muted-preview flag | Oswald 13px | **Keep** | Micro-labels tied to the brand/film identity. |
| Tier-1 evidence numerals (1,200+ / 30+, new) | — | **Oswald** | Extends the numeric role. |
| `.resources-head h2` ("Proof behind the story") | Oswald 81px | **→ Serif** | Validated at 1440: sits in the same voice as its serif lede and the section above; the condensed version was the biggest "thumbnail poster" moment on the page. |
| `.ask-title` ×3 | Oswald 53px | **→ Serif** | Validated at 1440 and 390: serif titles + Oswald amber numerals reads as a film-poster pairing — civic and calm where it was shouty. Mobile wraps to two clean lines ("Protect people / caught mid-change"). |
| `.support .display` ("Help this reach…") | Oswald 50px | **→ Serif** | It's a thesis line; fixes the ask-head/support-head voice mismatch. |
| `.faq-head h2` | Oswald | **→ Serif**, smaller | FAQ is the appendix; quiet serif. |
| `.portal-title` | Oswald 30px | **→ Serif** | Same rhetorical family as the support head. |
| `.res-title` (card titles, 18px) | Oswald 18px | **→ Hanken 600** | Serif is weak below ~24px; these are UI-scale product names, i.e. "record" voice. |
| `.footer-col h3`, `.footer-bottom p` | Oswald 12–13px | **→ Hanken** | Directory/legal duty is not film language. |
| `.topmark-name` | Oswald 15px | Keep (negligible) | Fixed mark, 15px, invisible in practice. |

**Resulting system:** Oswald = film language + numerals (≈5 slots, all earned). Cormorant = every argument headline. Source Serif = narrative body. Hanken = record/UI. One caveat from the injection test: Cormorant needs weight 500–600 and slightly larger sizes than Oswald occupied (it's lighter on screen); never use it below ~24px — drop to Hanken instead. The `ft-accent`/amber-tail spans die in the same pass (v1 amber discipline stands).

This also means the Google Fonts payload keeps all four families but can drop Oswald's 400/500 weights (only 600/700 survive).

## 5. Final hero/opening copy rules

**The hook is untouchable:** "Does Canada know how to keep builders?" — title, video end-frame, OG image, and (new) the hero's closing line all converge on it.

**Proposed hero lead — two changes only, net +1 word:**

> Canada helped Joe become a builder. Here, he studied, built, registered a company, and found community. Then the **immigration** pathway changed. **Does Canada know how to keep builders?**

- "immigration" gives "the pathway" its missing antecedent — the audit's #1 clarity failure — for one word.
- The closing question swaps "Can Canada recognize builders in time?" (39 chars, introduces a deadline the page never backs, and a *fourth* variant of the question) for the canonical hook (also 39 chars — identical visual weight). The hero now ends on the exact line people will share.

**Rules going forward:**
1. Sentence 1–2 are frozen. Any future edit touches only sentence 3–4.
2. No `<br>` — remove `.hero-lead-br`; `text-wrap: pretty` handles wrapping (the hard break currently creates the "company, and / found community" widow at 1440).
3. Budget: ≤ 200 characters total; must render ≤ 2 lines at 1440×900 and ≤ 4 lines at 390×844 at current sizes. Check both after any change.
4. **Mobile:** `.hero-lead` is currently `display:none` under 761px, so the premise never appears in text. Un-hide a compact variant — first sentence + question only ("Canada helped Joe become a builder. Does Canada know how to keep builders?" — 75 chars ≈ 2–3 lines at 17px), shown under the eyebrow. The design supports it: the mobile hero grows from a 398px banner toward ~60–70svh, which it needs anyway to feel like an opening rather than a header.
5. Voice: hero copy is third person, always. (The hook video's burned-in "CANADA HELPED ME" remains a content-level fix — re-export in third person with 16:10-safe framing; until then the live text carries the message.)

## 6. Support/share signature — design spec

**Trigger:** unchanged — successful POST swaps `[data-support-ask]` → `[data-support-thanks]` (plumbing exists, including `data-support-count` and `data-support-receipt`).

**The card (desktop):** one composed receipt, max-width ~560px, centered on the existing cinematic background, `--shadow-card` hairline ring, structured top to bottom:

1. Check mark (existing `.support-check`), heart-fill micro-animation on the button click preceding the swap — the only motion.
2. Serif line: **"Thank you — your support is counted."** (existing copy, keep).
3. The number: Oswald numeral **"#247"** (numeric role, §4) + Hanken label "supporter of fair pathways for people already building here". This is the moment's centerpiece.
4. Share row (existing LinkedIn/X/email/copy/native buttons).
5. Quiet attribution footer *inside the card*: "Canada helped Joe become a builder · oinp.hubeiqiao.com" — so a screenshot of the card is self-attributing and spreads the URL without anyone typing it.
6. The transparency link ("how we count & privacy") stays adjacent — it's trust infrastructure.

**Credibility rules (what keeps it from being gimmicky):**
- Modest verbs. "Counted," not "you're changing history." No confetti, no badges, no streaks.
- The number is real (D1-backed) and auditable via the transparency page.
- **Threshold behavior:** below ~25 supporters, suppress the numeral (show only "Your support is counted") — an empty room shouldn't be screenshotted; flip to "#N" once the soft-launch seeds pass the threshold. One `if` in script.js.
- The count appears only *after* supporting — it's a receipt, not a leaderboard; the page never begs with the number.

**Mobile:** same card full-width; native share button (already feature-detected) becomes the first button; share row wraps to two rows. The card must fit one 390×844 viewport without scrolling — that's the screenshot.

**How it serves awareness:** each supporter leaves holding a personal, shareable artifact whose entire content is the campaign message + URL + a growing number. Milestone follow-up posts (v1 §9) then quote the same number the supporters have been posting — the loop closes.

## 7. `ai-train=no` — recommendation: **keep it**

**What the current signal says** (`Content-Signal: ai-train=no, search=yes, ai-input=yes`, set in worker.js + robots.txt):
- `search=yes` — search engines may index and rank the page (Google/Bing discovery: allowed).
- `ai-input=yes` — AI systems may fetch and use the page *at answer time* (RAG/grounding: Perplexity, ChatGPT browsing, Google AI Overviews quoting the live page: allowed).
- `ai-train=no` — asks compliant crawlers not to ingest the content into *training corpora* for future model weights.

**What flipping to `ai-train=yes` would buy:** the story could be absorbed into future models' weights, so a model might "know" Joe's story without retrieving the page. In practice this benefit is small and slow: one small site's marginal influence on a trillion-token corpus is negligible, training cycles lag ~1–2 years behind the campaign's window, and Content-Signal is voluntary anyway — non-compliant trainers ignore it in both directions.

**What it would cost:** training ingestion is irreversible — no takedown reaches shipped weights. The site carries personal narrative, photos of Joe *and other identifiable people* (community event photos, footer workspace photo), and — critically — the story portal will collect **other people's** personal immigration stories, which may later be published on the page. Opting the whole origin into training would opt *their* stories in too, which the consent checkbox ("publish my first name and story on this site") does not cover.

**Recommendation: keep `ai-train=no`.** The campaign's actual AI-visibility goal — being summarized *correctly, now* — is served entirely by `search=yes` + `ai-input=yes` plus the accuracy work (llms.txt, markdown twin, FAQ, the "what this is not" line). Live retrieval is how answer engines cite current pages; training opt-in adds negligible reach on the campaign's timescale while permanently ceding control over Joe's and third parties' personal content. Revisit only if the site becomes a long-term archive *and* the story-submission consent is rewritten to cover training use. (This reverses v1's §10 item 5 lean — v1 flagged the tradeoff; this is the decision.)

No file changes; the existing test literal stays.

## 8. Social sharing improvements (grounded in the current page)

Carried from v1 §9, all still valid, ordered by leverage:

1. **Copy-link copies a hook, not a bare URL** — `copyLink()` currently writes `SHARE_URL` alone; change to `NATIVE_TEXT + "\n\n" + SHARE_URL`. One line in script.js; transforms what lands in Slack/WhatsApp/DMs.
2. **OG set:** keep `og-oinp-builder-story.jpg` as default (third person, legible, Canadian signal). Produce two assets: a third-person face-forward variant for LinkedIn/press ("CANADA HELPED HIM BECOME A BUILDER" over the poster-candidate frame — LinkedIn rewards faces and no compliant face asset exists) and a clean 1200×1200 third-person square (current square says "me" and contains a stray text artifact). Retire all "CANADA HELPED ME" assets from social use.
3. **LinkedIn paste helper:** LinkedIn cannot prefill text — add a "Copy LinkedIn post" action that copies the ready third-person block (v1 §9) then opens the composer.
4. **UTM per channel** (`?utm_source=x|linkedin|email|copy`) and switch to `x.com/intent/post`.
5. **X copy** (203 chars): "Canada helped Joe become a builder. He studied in Ottawa, built an AI product 1,200+ people use, registered a company, got into YC. Then Ontario closed the graduate pathway. Can Canada keep the builders it trains?"
6. **The two screenshot moments, from the current structure:** (a) the **support signature card** (§6); (b) the **revised at-a-glance block** (§2) — four serif beats + hairline rail composed to fit one viewport at both 1440 and 390, so a cropped screenshot carries the whole arc. Design both as self-attributing (URL present, quiet).
7. **Video ↔ page reinforcement:** the film's final frame should land on the hook + URL (end-card); social clips (river open 0–8s; the 15s "what changed" cut) always pair with the page link; the page hosts the full film so every clip has one canonical destination; the hero, OG, film end-card, and share copy all close on the identical hook line — one sentence, everywhere, is what makes a campaign quotable.

## 9. Phase 1 implementation plan (exact files + validation)

> **Superseded (2026-07-02):** the final, approved build spec is `2026-07-02-fable5-oinp-phase1-final.md` — it locks the owner's decisions (beat 2 "The work is visible", beat 4 ends on the hook, **no job-search FAQ**, ai-train unchanged) and carries per-item what-not-to-change lists and validation. Implement from that doc, not this section.

Ordered; each item is independently shippable and testable.

1. **Typography role map** — `public/styles.css`: apply the §4 table (serif for `.resources-head h2`, `.ask-title`, `.support .display`, `.faq-head h2`, `.portal-title`; Hanken for `.res-title`, `.footer-col h3`, `.footer-bottom p`; size/weight retune for Cormorant slots; prune Oswald 400/500 weights from the fonts link in `public/index.html`). Remove `.ft-accent`/headline `.amber` spans in `public/index.html` (amber discipline).
2. **Hero copy** — `public/index.html`: sentence-3 "immigration", question → hook; delete `.hero-lead-br`. `public/styles.css`: un-hide compact mobile lead (two-sentence variant via a `.hero-lead-min` span or mobile-only text), grow mobile hero toward ~60svh.
3. **"At a glance" rebuild** — `public/index.html` (`#answer-brief`): replace `.answer-grid` cards with the four-beat block + hairline rail; keep the ontario.ca link and OINP first-mention. `public/styles.css`: new `.arc` styles, delete `.answer-card` rules. Reveal system untouched.
4. **"Proof" rebuild** — `public/index.html` (`#resources`): 2 exhibit cards + 3 record rows, beat labels, Oswald stat numerals; `public/styles.css`: tier styles, kill mobile carousel (stack); replace the red YouTube-style thumbnail with a graded still (`public/media/resources/article.jpg` re-export — asset task for Joe; ship with a darkened/duotone CSS filter interim).
5. **Support signature card** — `public/index.html` (`[data-support-thanks]`): numeral row + attribution line; `public/styles.css`: card composition; `public/script.js`: count-threshold display logic, heart-fill micro-animation, copy-link hook+URL, UTM params, `x.com/intent/post`, "Copy LinkedIn post" helper.
6. **Copy fixes that survive the new constraints** (from v1 §8) — `public/index.html`: ask lede restructure; ask proof/detail dedupe (merge into one paragraph, drop `<details>`; remove `initAskDetails()` from `public/script.js`); support lede trim; FAQ #1 "hard to classify" fix; footer "larger" → "bigger". Do **not** add a new visible FAQ about whether this is a job search; the page should not introduce that frame unless it becomes a real misread after launch.
7. **AEO quick wins** — `public/index.html`: VideoObject `uploadDate`; `public/llms.txt` + `worker.js` (HOME_MARKDOWN): the "what this is not" line + drift reconciliation; `tests/aeo-worker.test.mjs`: assertions for uploadDate and the new line in both surfaces. `ai-train` stays as-is (§7).

**Validation (every item):**
- `node --test tests/aeo-worker.test.mjs` — must stay green (11 now, +3–4 new).
- Rendered pass at **1440×900 and 390×844**: hero (line counts per §5 rule 3), at-a-glance (beats fit one viewport), proof (tier hierarchy, no carousel), asks (serif titles wrap ≤2 lines mobile), support thanks-state (trigger via dev, card fits one mobile viewport), footer.
- Grep audit: banned phrases (`one permanent job`, `startup-era talent`, `builder evidence`); "Ontario Immigrant Nominee Program (OINP)" precedes any bare "OINP" in DOM order; no first-person copy outside Joe's own statements (footer/portal).
- `prefers-reduced-motion` emulation: heart-fill and reveals degrade to static.

Deferred to Phase 2+ (unchanged from v1 where compatible): merged hero/film opening act, hook-video third-person re-export, captions VTT + transcript, new OG assets, launch kit, Lighthouse/perf pass.

## 10. Risks & things not to change

- **The hook.** "Does Canada know how to keep builders?" is the campaign. It now appears at title, hero close, and film end-card — never rewrite one without the others.
- **Frozen copy:** hero sentences 1–2; the footer statement; ask card 2's factual phrasing ("redesigned… will issue no more invitations"); the support micro-copy + transparency link.
- **At-a-glance must stay text.** The moment beats acquire icons, cards, or node graphics, it has become the infographic the owner vetoed. One hairline, four ticks, maximum.
- **Cormorant below ~24px is a downgrade** — it gets thin and loses authority at small sizes (observed in injection testing). Small headings go to Hanken, never small serif.
- **Oswald removal stops at the film's edge.** The film title, play control, numerals, and micro-labels keep it; removing those would orphan the video's own type language from the page.
- **Don't suppress the count forever** — the threshold rule (§6) is a launch-window guard, not a permanent hedge; wire it to flip automatically.
- **Story-portal consent** currently covers publishing on the site only. If any AI-training or broader reuse of submitted stories is ever contemplated, the consent text must change first (this is also why §7 keeps `ai-train=no`).
- **Copy length is a hard budget.** Any proposed line longer than what it replaces needs a rendered wrap check at 390×844 before merge — no exceptions.
