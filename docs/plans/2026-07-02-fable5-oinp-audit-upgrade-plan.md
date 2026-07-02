# OINP Site — World-Class Audit & Upgrade Plan

> **Superseded in part (2026-07-02):** after owner review, the structural recommendations (timeline centerpiece, Oswald retirement, hero rewrite length) are revised in `2026-07-02-fable5-oinp-plan-v2-refined.md`. The diagnosis (§1–§3), copy tables (§8), launch strategy (§9), and AEO items (§10) remain the reference.

**Date:** 2026-07-02 · **Auditor:** Claude Fable 5 (orchestrating Opus copy/SEO/launch passes + Codex peer design pass)
**Scope:** Audit only. No implementation yet.
**Verdict in one line:** The site has premium materials — real cinematography, a disciplined token system, careful engineering — assembled with landing-page grammar. The story lives in the videos; the page around them describes the story instead of telling it.

---

## 1. Executive verdict

**What works:**
- The footage is the strongest asset on the page. Joe by the Ottawa river in the orange hoodie, Parliament behind him, is warm, specific, and human. No design change should compete with it.
- The token system (near-black `#050505`, cream ink, one amber accent, 0.5px hairline rings, tuned easing curves) is disciplined and already premium-grade.
- The footer statement — *"This is personal, but it is not only about me. / I am one case of a larger question: who gets to keep building here?"* over the warm workspace photo — is the best-composed moment on the site and the best line of copy. It proves the page knows what world-class feels like.
- Engineering is genuinely good: reduced-motion handled, autoplay fallbacks, IntersectionObserver ambient play, no console errors, accessible details/summary patterns.
- The one-click, no-login support signal is the right civic mechanic.

**What doesn't:**
- The page is 9 sections with 9 different layout ideas: pinned video hero → film stage → centered serif + 3 cards → giant condensed headline + 5-card grid → numbered list → 2-col accordion → photo-backed CTA → form card → cinematic footer. Each is competent; together they read as a well-made dark marketing site, not "one unified conversational experience."
- The first five seconds fail on desktop. At 1440×900 the hero video's burned-in type is crop-amputated ("ES CANADA KN…"), and the type is **first person** ("CANADA HELPED **ME** BECOME A BUILDER") while every line of page copy is third person. The single most important screen has a cropped message in the wrong voice, plus a small serif paragraph with a hard-coded `<br>` competing with it.
- The story's spine — studied → built → registered a company → found community → YC → pathway closed — is never *designed*. It exists only inside the video. Someone who doesn't press play never sees the arc; they see cards describing it.
- Typography is four families doing two jobs. Oswald (condensed, sports-poster energy) and Cormorant Garamond (editorial elegance) are competing display voices; the page's two most tasteful moments are both the serif, and its most generic moments are all Oswald.
- The amber accent is inflated. It is simultaneously: link color, button color, headline-tail highlight (8+ headlines use the identical "white words, amber tail" formula), inline body sprinkles that look like links but aren't, numeral color, tag color. When everything is emphasized, nothing is.

---

## 2. Validation evidence

**Rendered inspection (Chrome DevTools, local server confirmed up at http://127.0.0.1:8788/, HTTP 200):**
- Desktop **1440×900**: hero (two scroll states, including the hero-pin dim + film-panel slide-over), film head + stage, at-a-glance, resources grid, ask section, FAQ, support CTA, story portal form, footer. 8 full-viewport screenshots.
- Mobile **390×844**: hero, film, resources carousel, ask cards, support, portal, footer. 6 full-viewport screenshots.
- Computed-style probes: `.hero-lead` is `display:none` on mobile (confirmed); mobile hero height ≈ 398px; `.hero-pin` is 160vh with a sticky 100svh hero; page height 7,698px at 1440w.
- Console: zero messages/errors.

**File inspection:** full read of `public/index.html` (662 lines); targeted reads of `public/styles.css` (tokens, hero, buttons, breakpoints at 760/1024/1200/1400, `prefers-reduced-motion` block) and `public/script.js` (interaction inventory); repo layout; share asset inventory.

**Delegated passes (each read the files independently):** copy/persuasion (Opus), SEO/AEO (Opus — ran the 11 AEO tests, all pass), social/launch (Opus — viewed all 9 OG candidates as images), independent design read (Codex, peer perspective).

Everything below marked with a section/viewport is observed, not hypothesized. The few file-only inferences are flagged inline.

---

## 3. The central design diagnosis

Why this is not yet world-class, precisely:

1. **The page describes the story instead of telling it.** The film does the storytelling; the HTML does frame-management ("This page asks whether…", "One story, a bigger question", "This page is personal, but…"). Five near-verbatim restatements of "one example of a bigger question" (film title, short version, at-a-glance card, FAQ #1, footer) — the page keeps telling you it has a point instead of making it. World-class story pages (think NYT features, Apple film pages, the best campaign microsites) make the *scroll itself* the narration.

2. **Landing-page grammar.** Kicker → headline → three cards → accordion → form is the grammar of a SaaS site. The at-a-glance section ("What this page is about / What changed / What the ask is") is literally a feature-card row. The resources section is a link farm with mixed-quality screenshot thumbnails — one of them a red-arrow YouTube-style thumbnail that punctures the premium register in one glance.

3. **Two display voices, one formula.** Oswald condensed says "sports broadcast / YouTube thumbnail"; Cormorant says "civic editorial." The page can't decide, so no headline feels inevitable. And the one emphasis trick — amber on the final phrase — repeats on virtually every headline until it reads as a template, not a choice. The same applies to the section kicker (uppercase amber label + tick): **18 instances** in the HTML. The page keeps stopping the conversation to label itself — "At a glance," "Evidence and resources," "The ask," "Quick answers," "Public signal" — which makes sections feel branded, not spoken. (Independently flagged by the Codex peer pass.)

4. **The first impression is the weakest screen.** Cropped first-person video type + bottom-anchored small copy + two disconnected CTAs. The 5-second test currently depends on which frame of the loop you land on.

5. **The climax belongs to the wrong brand.** The final CTAs on the page are "Build with Joe" and "Book a Talk," and a 12-link personal directory sits above the campaign's closing statement (on mobile, *before* it). The civic story ends on a personal-portfolio note. Hiring/contact can exist — but it must not be the last word.

None of this requires new content. The raw ingredients — footage, tokens, the footer statement, the evidence — are already sufficient for a world-class page. This is a composition problem, not a resource problem.

---

## 4. Three creative directions

### Direction A — "The Film Essay" (disciplined evolution)
Keep the current section order. Merge hero and film into a single opening act (one video, one message). Unify to one display voice, kill the amber-tail formula, redesign at-a-glance and resources out of card grammar, keep everything else. This is a taste pass, not a rethink.
*Feel:* A24 title card → editorial. *Risk:* low. *Cost:* low. *Ceiling:* gets you from "better than generic" to "clearly designed," but the page remains a sequence of blocks; the scroll still doesn't narrate.

### Direction B — "The Civic Document" (unconventional, quiet)
Reframe the entire page as a beautifully typeset public document — an open letter with exhibits. Serif-led, near-typographic-only. Sections become: the letter (story in first person, signed), Exhibits A–E (evidence, presented like a case file with stamped labels), three numbered clauses (the asks), and a signature block (support = adding your signal to a visible count, styled as counter-signatures). Film embeds as "the testimony."
*Feel:* credible, civic, unmistakably not-marketing; policymakers would screenshot it. *Risk:* loses cinematic warmth; the footage gets demoted; harder to make emotionally viral for founders/students. *Cost:* medium-high (mostly rewrite + retypeset).

### Direction C — "One Scroll, One Story" (scroll-narrated film essay)
The page becomes the film. One continuous scroll where the story arc is the spine: the opening act (video + question), then the **pathway timeline as the designed centerpiece** — studied → built (1,200+ learners) → company → community → YC → **the break** (the closed-stream moment rendered as a visible rupture in the line, animated once on scroll) — then evidence as exhibits attached to timeline nodes, then the three asks as the resolution, then the support signature moment, then the cinematic close. Sections stop being blocks and become beats; the timeline break is the screenshot moment the launch strategy needs.
*Feel:* cinematic, memorable, inherently shareable. *Risk:* scroll-driven work must be restrained or it becomes a gimmick; needs careful reduced-motion and mobile treatment. *Cost:* medium-high.

---

## 5. Recommended direction

**C's spine with A's discipline — "One story, told by the scroll."** Concretely: do Direction A's system consolidation (type, amber, card grammar) *and* add Direction C's single structural move — the story timeline with the break — as the page's centerpiece and only major scroll-driven moment. Do not build full scrollytelling; one unforgettable moment beats five clever ones.

Why this over pure B or pure C:
- The footage is too good to demote (kills pure B). The audience spans founders *and* policy people; B serves one at the expense of the other.
- Full scrollytelling (pure C) is over-engineering for a 2-minute story and endangers the performance/accessibility bar already achieved.
- The hybrid keeps every current strength, fixes the diagnosis directly (the page starts telling the story), and produces the two shareable design moments the launch plan needs: **the timeline break** and **the numbered support signature**.
- It also gives the copy fixes somewhere to live: the timeline absorbs the at-a-glance cards' job, which lets the weakest section (defensive meta-commentary + card row) be deleted rather than polished. Independent passes converged here — the launch audit asked for exactly this timeline artifact as a "shareable moment," and the Codex peer design pass (run blind to this audit) picked the same direction as its strongest of three ("Documentary Timeline / The Rupture": replace section modules with causality; the OINP change becomes a stark visual rupture; evidence appears in context, not as a resources grid).

**Refinement adopted from the Codex pass — typography as voices, not levels.** Instead of assigning typefaces to hierarchy (display/body/UI), assign them to speakers: the serif is *Joe's voice* (narrative lines, the statement, the pull-quote); the grotesk is *the record* (official facts, dates, labels, the break node's source line); amber is *the public ask* (actions and the rupture only). This gives the type system a story-logic that survives every future edit — any new line of copy has an obvious home.

---

## 6. Highest-impact opportunities, ranked

1. **One opening act instead of two competing videos** (design). Hero and film both autoplay the same story today; the hook supercut then asks you to watch the same thing again. Merge: hero *is* the film stage. Re-grade or re-frame the hook so its type is crop-safe and third person. *Feeling created:* instant clarity — one screen, one question, one action.
2. **The pathway timeline with the break** (design). The story arc as a designed artifact between the film and the asks, replacing at-a-glance's card row. Screenshot-complete: it must tell the whole story with the page cropped away. *Feeling:* "I get it — and I want to repost this exact image."
3. **One display voice + amber discipline** (design). Retire Oswald; promote the serif to display everywhere; amber restricted to: primary action, the break moment, one accent per screen. Kill the headline-tail formula and inline body sprinkles. *Feeling:* quiet authority; the page stops feeling assembled.
4. **Hero copy in the right voice, mobile hero restored** (design+copy). Third-person crop-safe type; on mobile (where `.hero-lead` is hidden) the premise "Canada helped Joe become a builder" must exist in text, not only in a video frame. *Feeling:* the 5-second test passes on every device at every loop frame.
5. **Kill the refrain, promote the thesis** (copy). Delete 3 of 5 "one story, bigger question" restatements; replace the at-a-glance meta-head with the mechanism; lift "some contribution appears before a standard immigration category can name it" into a designed pull-quote. (Full copy table in §8.)
6. **Support as signature moment** (design). Post-support state becomes a designed, screenshotable card: "You're supporter #247 · Canada helped Joe become a builder" — the count already exists in the code (`data-support-count`). *Feeling:* my click produced an artifact worth posting.
7. **Evidence as exhibits, not a link farm** (design). Five cards → three primary exhibits + two footnote links; all thumbnails re-shot/re-treated in one duotone/graded style (the current YouTube-style thumbnail must go). *Feeling:* evidence, not partner logos.
8. **Campaign-first footer** (design). Statement first, then actions, personal directory collapsed to one quiet row (mobile: behind a disclosure). Fix link legibility over the bright window area. *Feeling:* the page ends on the question, not on a booking link.
9. **Share pipeline fixes** (launch). Copy-link must copy hook + URL (today: bare URL); a third-person face-forward OG variant for LinkedIn; a "copy LinkedIn post" helper (LinkedIn cannot prefill text); UTM per channel. (§9.)
10. **AEO correctness** (SEO). `uploadDate` on VideoObject (required for video rich results — currently missing); captions VTT + transcript (none exist — biggest accessibility + AEO gap); an explicit "what this is not" line everywhere (nothing currently prevents an AI from summarizing this as a job-seeking or petition page); reconcile drifted HOME_MARKDOWN vs llms.txt; reconsider `ai-train=no`. (§10.)

---

## 7. Section-by-section design audit

### Hero (observed 1440×900 + 390×844)
- **Observed:** 160vh pin, sticky 100svh hero, video type cropped at 16:10 ("ES CANADA KN…"), first-person "CANADA HELPED ME"; copy bottom-left at 17–20px serif with a `<br>` that creates the wrap "registered a company, and / found community" at 1440 (the break is gated to ≥1400px and designed for a different measure); CTAs bottom-right, disconnected from the copy block. Mobile: hero is 398px tall, `.hero-lead` hidden, so the premise sentence never renders.
- **Desktop moves:** treat the hero as a title card, not a billboard. Either (a) re-export the hook with type set inside a 16:10-safe area and in third person, or (b) stop relying on burned-in type: run the footage clean (Joe by the river) and set the question in live text — one serif line, large, top-left or centered-low, with the eyebrow and a single primary CTA. Live text is the stronger option: it's crop-proof, translatable, animatable, and always in the right voice. Remove the `<br>`; let `text-wrap: balance` do its job. Bring the two CTAs into the copy block's flow (primary filled, secondary as a text link — two pill buttons of equal weight split attention).
- **Mobile moves:** full-height (100svh) hero. Question in live text over the footage, premise line under it ("Canada helped Joe become a builder. Then the pathway changed." — 2 lines max at 390px), one CTA. The current 398px banner + buttons reads as a header, not an opening.
- **Feeling created:** the thesis lands in the first second, in the page's own voice, on every device.

### Film (observed both viewports)
- **Observed:** strongest section. Full-bleed stage, ambient muted autoplay, rounded panel sliding over the dimmed hero (nice). But: "Play with sound" title + "2-minute story · with sound" subtitle say the same thing twice; "MUTED PREVIEW" pill floats disconnected top-right; the play circle sits on Joe's face at some frames; burned-in captions mean the muted preview already narrates, reducing the reason to engage sound. Film head repeats the amber-tail formula and its lede pre-summarizes the film (spoiler before the play button).
- **Moves:** in the merged opening act this becomes the hero's second beat. One overlay control: the play ring + "Watch with sound · 2 min" as a single line. Move "Muted preview" into the same control as a state ("Previewing muted — tap for sound"), not a separate floating pill. Cut the film lede to one line that adds something the video can't say (where it's going, not what it contains): the copy pass proposal in §8. Full-screen button: keep, but as icon-in-corner of the stage on hover/touch, not a lone button floating under the stage (observed: it sits orphaned below the figure).
- **Feeling:** the video feels like the page's beating heart, not an embedded player with chrome around it.

### "At a glance" (observed 1440×900)
- **Observed:** elegant Cormorant head ("This page is personal, but the argument is not sentimental.") — but it's meta-commentary; then the page's most generic pattern: three uniform cards with uppercase labels. This section is where the design goes from cinema to SaaS.
- **Move:** **delete the section as a card row; replace with the timeline centerpiece.** The three cards' content maps directly onto the timeline: "what this page is about" = the arc itself; "what changed" = the break node (with the ontario.ca link as the node's source line); "what the ask is" = the timeline's resolution caption leading into the asks. The serif headline slot is taken by the promoted thesis pull-quote ("Some contribution appears before a standard immigration category can name it" — sharpened per §8).
- **Timeline spec (desktop):** horizontal, one amber line; nodes: studied (Carleton) → built (Joe Speaking, 1,200+ learners) → registered a company → found community → YC Startup School 2026 → **break**: the line fractures/greys past a node labeled "Feb 2026 — graduate streams: no further invitations," with the question "who gets to keep building here?" set after the rupture. One scroll-triggered animation: the line draws once, then breaks. Static-perfect for reduced-motion and screenshots.
- **Mobile:** vertical spine down the left gutter, nodes as compact rows; the break gets full-width treatment. Vertical works *better* than horizontal here — design it as the primary composition, not an adaptation.
- **Feeling:** the whole story understood in one glance without pressing play; the screenshot people share.

### Evidence / resources (observed both viewports)
- **Observed:** "Proof behind the story" (good headline) in huge Oswald; 5 cards across at 1180px max-width → ~210px cards with tiny mixed-quality screenshot thumbs; one thumbnail is a red-text YouTube-style graphic that breaks the register. Mobile: horizontal swipe carousel with a truncated card ("YC Startup Sc…") as the only affordance, then ~100px of dead space before "The ask."
- **Moves:** three primary exhibits (Joe Speaking, YC ticket, OINP redesign) as generous cards with re-treated imagery — one consistent grade (desaturated + warm lift, or duotone in the page's amber/ink); the essay and Start-Up Visa become one quiet text row of footnote links beneath. Consider attaching exhibits visually to their timeline nodes (numbered ①②③ matching node markers) so evidence reads as documentation of the arc, not a separate directory. Mobile: stack the three; kill the carousel (three stacked cards cost less scroll than a swipe pattern nobody discovers).
- **Feeling:** "this person is documented," with the visual quality of the claims matching the quality of the work.

### The ask (observed both viewports)
- **Observed:** the numbered 01/02/03 editorial list is one of the better patterns on the page — keep its bones. Issues: ghost numerals + pill tag + proof line + title + open details + floating type-tag ("TIME-SENSITIVE") = six elements per ask; the proof line and the details body are near-duplicates (confirmed word-for-word overlap in ask 1); inline amber sprinkles ("tuition, career, and life decisions") read as links; every title repeats the amber-tail formula; "READ FULL ASK" on mobile is an interaction tax for one sentence.
- **Moves:** four elements max per ask: numeral, title, one merged paragraph (proof + consequence, deduped per §8), one-word type-tag aligned to the numeral. Remove the details/summary entirely — nothing here earns progressive disclosure. Amber: numerals only. Keep the lede but restructure per §8 (thesis first).
- **Feeling:** three demands a minister's staffer could paste into a briefing note.

### FAQ (observed 1440×900)
- **Observed:** clean two-column split, standard accordion. Works; doesn't need to be a design moment. Its actual job is AEO.
- **Moves:** keep. Add the 5th "Is Joe asking for a job?" question (§10 — the single most important AEO addition, and honestly useful to human skeptics too). Visually: drop the section head to quiet size; this is the page's appendix, not a beat. (Codex proposed compressing FAQ into share-ready footnotes — directionally right; the quiet-appendix treatment achieves it without sacrificing the FAQPage JSON-LD surface.)

### Support + story portal (observed both viewports)
- **Observed:** photo-backed centered CTA (busy crowd photo fights the form below it); strong one-click mechanic with honest micro-copy; "OR ADD YOUR VOICE" divider; portal form is a standard contact-form card — name/email/story/consent — visually the most generic component on the page. Mobile: 6-line lede; privacy line wraps mid-link ("how we count & / privacy").
- **Moves:** support first, portal demoted. Post-click, the thanks state becomes the **signature card**: supporter number large ("#247"), the page's title line, the count, share row — composed as a screenshotable artifact (the code already tracks `data-support-count`; this is composition, not new backend). Calm the background photo behind the form (heavier scrim or crop to a quiet region — faces at full attention compete with input fields). Tighten the lede to 2 lines (§8). Portal: collapse behind one inviting line + button ("Seeing the same pattern? Add your story") that expands the form — the empty form staring at every visitor costs more than the disclosure tap. Fix the mobile privacy-line wrap (nowrap on the link).
- **Feeling:** supporting feels like signing something; sharing the receipt feels natural.

### Footer (observed both viewports)
- **Observed:** the best cinematic composition on the site (desktop). But: ARTICLES/ARTIFACTS/SHARE/MORE columns are barely legible over the bright window glass; the closing statement sits *below* the directory in DOM order and on mobile renders as: link farm → statement → "Build with Joe" (amber, the page's last strong visual) — the campaign ends as a personal-brand footer. Mobile loses the photo entirely (plain black).
- **Moves:** reorder: statement (with photo) → campaign echo (support/share compact row) → one quiet personal row (name, social icons, "Build with Joe · Book a Talk" as text links, not amber buttons) → legal line. The 12-link directory: desktop, one slim row of small links; mobile, a single "More from Joe ↗" disclosure. Keep the photo on mobile — crop to Joe at the window, even at 40vh; it's the emotional close. Fix desktop column legibility by moving links off the bright glass region (or the reorder solves it).
- **Feeling:** the page ends on "who gets to keep building here?" — and Joe remains findable without the campaign becoming his portfolio.

### Motion & interaction (observed + script.js)
- **Observed inventory:** fade-up reveals everywhere, hero pin+dim, smooth-scroll glide, hover lifts. Competent, generic, and uniform — every element enters the same way.
- **Moves:** three-tier motion vocabulary, nothing else: (1) *narrative* — the timeline draw+break, once, scroll-triggered (the only scroll-driven animation on the page); (2) *structural* — the existing hero dim + panel slide-over (keep, it's good); (3) *micro* — current hover lifts and the button spring, plus one signature micro-moment: the support button's heart filling on click before the state swap. Delete reveal-fade from small elements (FAQ items, footer bits) — reserve entrances for section-level beats so they mean something. All gated behind the existing `prefers-reduced-motion` infrastructure.
- **Feeling:** motion narrates instead of decorates.

---

## 8. Copy changes (current → proposed)

The full line-by-line table lives in the copy pass; these are the changes I endorse after synthesis, in page order. Constraint check: all third-person-safe, no banned phrases, no length inflation without cause, mobile wrap considered.

| Where | Current | Proposed | Why |
|---|---|---|---|
| Hero lead | "…Then the pathway changed. Can Canada recognize builders in time?" | "Canada helped Joe become a builder — he studied, built a product, registered a company, found community here. Then Ontario changed the immigration path. Can Canada keep the builders it helps create?" | "The pathway" currently has no antecedent (nothing has told the reader this is immigration); "in time" implies a countdown the page never backs. Names the domain, echoes the title's verb. |
| Film lede | "This is a 2-minute story about how Canada helped Joe become a builder, what shifted when the pathway changed, and why people already building here need fair ways to be recognized." | "A 2-minute story: how Canada helped Joe become a builder, what broke when the immigration path changed, and why people already building here need fair ways to stay." | Shorter; "broke" > passive "shifted"; "stay" is concrete where "recognized" is abstract. |
| Short version, p2 | "Joe became one story in a broader question: can Canada keep early-stage contributors it helped create?" | "Then the immigration path changed — and Joe's story became a test: can Canada keep the early builders it helped create?" | Kills restatement #2 of the refrain; "a test" advances the frame; "early builders" > "early-stage contributors" (corporate). |
| At-a-glance head | "This page is personal, but the argument is not sentimental." | "Personal story. Structural question." | The current line is defensive meta-commentary that plants the "sentimental" doubt it rebuts. 4 words do the same job. (In the timeline redesign this becomes the centerpiece's kicker.) |
| At-a-glance intro | "This page asks whether Canada can retain people already studying, building, founding, researching, and contributing here while their value is still early and hard to classify." | "Canada trains people, then asks them to prove their value in categories built for a later stage. Can it recognize contribution earlier?" | "Hard to classify" is the policy abstraction leaking into the emotional layer; this states the actual mechanism. Shorter. |
| Ask lede | "…Some contribution appears before a standard immigration category can name it. Fair policy should protect people caught mid-change…" | "Job offers and language scores matter. So do the products, companies, and research people build before any of that. Some contribution shows up before the immigration system has a category for it — and fair policy should protect the people caught in that gap." | The thesis is currently buried mid-paragraph; promote it and end on the human stakes. This is the pull-quote for the timeline moment. |
| Ask 1 body | proof line + details body are near-duplicates | Merge: "People made tuition, career, and life decisions around published graduate streams — some were already in the process. When rules change mid-stream, there should be a clear transition, not sudden uncertainty." | Dedup (reader reads the same sentence twice today); enables removing the details/summary. |
| Ask 3 title | "Bridge graduate talent to impact" | "Reward what graduates actually build" | "Impact" is a filler noun no policymaker can act on; the description is about showing work, so the title should say so. |
| Support head | "Help this reach people who should see the pattern" | "Help this reach the people who can change it" | "See the pattern" is insider language and passive; sharing needs a consequence. |
| Support lede | 3 sentences ending in a four-noun pile-up | "If this resonates, one click is enough. It's not a petition — it's a public signal that Canada's tech, startup, university, and policy communities should pay attention to the builders already here." | Halves the mobile line count; ends plainly. |
| FAQ #1 | "…while their value is still emerging and hard to classify?" | "…while their value is still early — before the system has a way to measure it?" | Same fix as at-a-glance; FAQ is the AI-extraction surface, so the mechanism must be here too. |
| FAQ (new #5) | — | "**Is Joe asking for a job?** No. Joe can find work. This page asks whether immigration policy can recognize early-stage contribution — products, companies, research, community — and provide stable pathways for people already building in Canada. It is not a petition and not a job search." | The single highest-leverage addition on the page: forecloses the most damaging misread for humans and AI simultaneously. Worth the extra length. |
| Footer statement | "I am one case of a larger question…" | "I am one case of a bigger question…" | The site uses broader/bigger/larger interchangeably; standardize on "bigger" so film title and footer bookend deliberately. Keep everything else — this is the best unit on the page. |

**Quotable lines to seed sharing (third person, from the copy pass, endorsed):**
1. "Canada helped Joe become a builder. Then it changed the rules for keeping him."
2. "Some contribution shows up before the immigration system has a category for it."
3. "He built a product used in 30+ countries. The pathway that trained him now issues no invitations."
4. "The question isn't whether Joe can find a job. It's whether Canada can recognize a builder before the paperwork can."
5. "Who gets to keep building here?"

**Repetition budget (from the copy pass, verified counts):** build/builder/building ×27 → cut ~6 from supporting copy so hero/footer stay sharp; pathway(s) ×14 → ~8 (prefer "path" or nothing); retire "hard to classify" (×3) entirely; one "bigger question," used twice (film title + footer).

---

## 9. Social sharing & launch plan

**OG images (launch pass viewed all 9 candidates; endorsed):**
- Default OG: keep `og-oinp-builder-story.jpg` (third person, legible, Canadian signal).
- **Retire from social use** every "CANADA HELPED **ME**" asset (`poster-candidate`, `noface-candidate`, `imagegen-candidate`, `square.jpg`) — first-person voice violation, and `square.jpg` has a stray text artifact ("…pected a credential").
- **Produce two new assets:** (1) a face-forward third-person variant ("CANADA HELPED HIM BECOME A BUILDER" over the poster-candidate frame) for LinkedIn/press — LinkedIn rewards faces and there is currently no compliant face asset; (2) a clean 1200×1200 third-person square for iMessage/WhatsApp center-crops.
- Note the alignment: the same first-person problem exists in the hero hook video's burned-in type (§7 Hero). Fix both in one re-grade session.

**Share pipeline (code-level, verified in script.js):**
- `copyLink()` copies only the bare URL → copy hook + URL (`NATIVE_TEXT + "\n\n" + SHARE_URL`). One line; transforms what lands in group chats.
- LinkedIn share cannot prefill text (platform limitation) → add a "Copy LinkedIn post" helper: copies a paste-ready third-person block, then opens the composer.
- Add `?utm_source=` per share button; switch X intent to `x.com/intent/post`.
- Proposed X text (203 chars): "Canada helped Joe become a builder. He studied in Ottawa, built an AI product 1,200+ people use, registered a company, got into YC. Then Ontario closed the graduate pathway. Can Canada keep the builders it trains?"
- Email body: current is good; trim the triple "here"; subject B-test: "A builder Canada trained — and the pathway that just closed."

**Launch sequence (endorsed from launch pass):**
1. **Day −2, soft launch:** DM 10–20 trusted YC/Ottawa/builder contacts. Catch OG bugs, seed the support count so launch visitors don't see an empty counter, line up 3–5 hour-one resharers.
2. **Day 0, morning ET:** Joe's X + LinkedIn simultaneously. X: 5-tweet thread (hook card → proof → what changed, stated factually → the bigger question + clip → CTA). LinkedIn: paste-ready opener + **native video upload** of the 2-min film, page link in first comment.
3. **Day 0 +1–3h:** warm-circle reshares for early velocity.
4. **Day 1–2:** communities, staggered. Honest risk read: r/ImmigrationCanada skews hostile to individual-case posts — skip at launch; r/ontario or startup/tech subs only, framed as the systemic question, with full engagement in comments. Hacker News: low-probability lottery ticket, only if titled as the policy question, submitted by someone other than Joe; don't build the plan around it.
5. **Clips:** 0–8s river/Parliament open (LinkedIn/X autoplay), the mid-video "here's what changed" 15s cut (policy audiences), text-plate still for carousels.

**Per-audience CTA:** tech — "share with one founder or engineer who came here as an international student"; startup — "if you were an early-stage builder on a graduate pathway, add your story"; university — "forward to your international-student office"; media — "the 2-minute story and Joe's contact are one click away"; policy — "watch the 2 minutes and consider the retention question."

**Follow-up cadence:** (1) "Other builders wrote in" — anonymized aggregate of story submissions, turns one story into a pattern; (2) count milestones ("#500 supporters"); (3) media-pickup reshares; (4) plain-language "what actually changed with OINP graduate streams, in 4 sentences" evergreen post; (5) day-30 "here's what I heard back" close-the-loop.

**Design-created shareable moments (the two the launch depends on):** the timeline break (§7) and the supporter-number signature card (§7 Support).

---

## 10. SEO/AEO improvements (from the SEO pass; all 11 existing tests pass)

Ranked; file → change:
1. **The "what this is not" line** — currently absent from every surface. Add to `llms.txt`, `HOME_MARKDOWN` in `worker.js`, meta description tail, and the new FAQ #5 (visible + JSON-LD): "Joe is not asking for a job or personal relief. This is not a petition or fundraiser. The ask is systemic: fair transitions and independent graduate pathways." Biggest single guard against AI summarizing this as a job-seeking/petition page.
2. **`uploadDate` on VideoObject** (`index.html` JSON-LD) — required for Google video rich results; missing today.
3. **Captions + transcript** — zero caption/transcript files exist. Create `public/media/oinp-feedback-story.vtt`, add `<track kind="captions">`, add `transcript` to VideoObject. Accessibility + makes the video's actual argument legible to AI. (The film has burned-in captions, but those are invisible to crawlers and screen readers.)
4. **Reconcile `HOME_MARKDOWN` (worker.js) with `public/llms.txt`** — they have drifted (different sections, different links). One canonical source; add a consistency test.
5. **Reconsider `Content-Signal: ai-train=no`** — an awareness campaign asking AI systems not to learn its story is self-defeating; `search=yes, ai-input=yes` already allows live retrieval, but flipping `ai-train` is worth a deliberate decision. Update robots.txt + worker + test literal together if changed.
6. **`speakable` (SpeakableSpecification)** on WebPage targeting the FAQ/at-a-glance selectors.
7. **Person entity:** add `@id`, add `https://hubeiqiao.com/` to `sameAs`, reference the same `@id` from author/publisher.
8. **Test additions** (`tests/aeo-worker.test.mjs`): VideoObject uploadDate/duration; Content-Signal consistency across robots/worker/html; canonical + og:image dims; the new "not a job" line present in llms.txt + HOME_MARKDOWN + FAQ.
9. Production check: `Accept-Ranges: bytes` on the 21MB mp4 (Workers Assets should provide it; verify at deploy).

---

## 11. Implementation checklist

### Phase 1 — Highest-impact design + copy fixes (1 session)
*Goal: every §8 copy change, type consolidation, amber discipline, quick AEO wins. No structural moves yet.*
- [ ] Copy: all §8 rows (index.html; mirror relevant lines in llms.txt + worker.js HOME_MARKDOWN + JSON-LD FAQ).
- [ ] FAQ #5 "Is Joe asking for a job?" — visible + JSON-LD + llms.txt + HOME_MARKDOWN.
- [ ] Typography: retire Oswald; serif display scale for section heads; Hanken for labels/UI. Drop the Google Fonts Oswald weights (perf win). (styles.css, index.html font link)
- [ ] Amber discipline: remove headline-tail spans and inline body `.amber` sprinkles; amber = actions, numerals, and the (reduced) kickers only. (index.html, styles.css)
- [ ] Kicker reduction: 18 uppercase amber kickers → keep at most 3–4 where a section label genuinely helps (the ask, FAQ); elsewhere let the headline speak. (index.html, styles.css)
- [ ] Ask cards: merge proof+details into one paragraph, delete `<details>`, remove inline amber. (index.html, styles.css, script.js initAskDetails removal)
- [ ] Hero: remove `.hero-lead-br`; third-person live-text question; restore mobile premise line (un-hide a shortened `.hero-lead` variant); single primary CTA + text-link secondary. (index.html, styles.css)
- [ ] Footer: reorder statement above directory; directory → one slim row (desktop) / disclosure (mobile); actions → text links; keep mobile photo. (index.html, styles.css)
- [ ] AEO: `uploadDate`; "what this is not" line; HOME_MARKDOWN↔llms.txt reconciliation; new tests. (index.html, worker.js, public/llms.txt, tests/aeo-worker.test.mjs)
- **Validate:** `node --test tests/aeo-worker.test.mjs`; visual pass at 1440×900 + 390×844 (hero, asks, footer); check no first-person copy anywhere except Joe's own quotes/footer statement.

### Phase 2 — Structural: the opening act + the timeline (1–2 sessions)
- [ ] Merge hero + film into one opening act; one video narrative; overlay control unification ("Watch with sound · 2 min"); muted-preview state into the control. (index.html, styles.css, script.js initFilm/initHeroVideo merge)
- [ ] Hook video: re-grade burned-in type to third person + 16:10-safe, or switch to clean footage + live text (preferred). (media/hero-hook.mp4 re-export — content task for Joe; page works with live text either way)
- [ ] Build the pathway timeline centerpiece replacing at-a-glance cards: horizontal desktop / vertical mobile; scroll-triggered draw+break (once, reduced-motion-safe); thesis pull-quote; ontario.ca source line on the break node. (index.html, styles.css, script.js)
- [ ] Evidence → 3 exhibits + footnote row; re-treat thumbnails to one grade; number exhibits to match timeline nodes; kill mobile carousel, stack. (index.html, styles.css, media/resources/*)
- [ ] Support signature card post-click state (uses existing `data-support-count`); portal behind disclosure; scrim the crowd photo; fix privacy-line wrap. (index.html, styles.css, script.js)
- **Validate:** visual end-to-end both viewports; timeline screenshot test (crop it out of the page — does it tell the whole story?); reduced-motion pass (`emulate prefers-reduced-motion`); keyboard-through-the-page pass; `node --test`.

### Phase 3 — Sharing + launch readiness (1 session)
- [ ] copy-link → hook + URL; LinkedIn paste helper; UTM params; x.com/intent/post. (script.js)
- [ ] New OG assets: third-person face variant (LinkedIn) + clean 1200×1200 square; retire "ME" assets from any referenced use. (public/share/)
- [ ] Captions VTT + `<track>` + VideoObject `transcript`; `speakable`; Person `@id`. (public/media/, index.html)
- [ ] `ai-train` decision with Joe; if flipped: worker.js + robots.txt + test together.
- [ ] Prepare launch kit as a doc: X thread, LinkedIn block, email, per-audience CTAs, clip list (§9). (docs/)
- **Validate:** `node --test`; OG preview via X/LinkedIn card validators (post-deploy); share each channel from a phone.

### Phase 4 — Polish + verification (1 session)
- [ ] Motion tier cleanup: remove small-element reveals; support-button heart micro-moment; timeline timing tuning.
- [ ] A11y sweep: focus states on all new components, contrast on footer links, `aria` on timeline (it must read as a list to screen readers).
- [ ] Perf: font weights pruned; poster/thumb sizes; confirm Range requests on mp4 in production; Lighthouse ≥ 90 across the board on mobile.
- [ ] Full visual QA at 1440×900, 1280×800, 390×844, 360×740 + real iPhone/Android check.
- [ ] Final copy proof against CLAUDE.md banned-phrase list; `node --test tests/aeo-worker.test.mjs`.

---

## 12. Risks & things NOT to change

- **The footage and its warmth.** Every design move must defer to it. No treatment that cools or stylizes Joe himself.
- **The footer statement.** "This is personal, but it is not only about me / who gets to keep building here?" is the best unit on the site. Reposition it; do not rewrite it (except larger→bigger).
- **The one-click, no-login support mechanic and its honest micro-copy.** The transparency link is trust infrastructure; keep it adjacent to the button.
- **The dark + amber identity.** The fix is discipline, not a new palette. Do not add colors.
- **Policy accuracy.** "Redesigned," "no further invitations," "closed to most new applications" are correctly hedged. The negative test assertions in aeo-worker.test.mjs are doing real work — extend them, never weaken them.
- **Do not make it louder.** Every recommendation here removes elements (a video, a card row, a font, details/summary, reveal-fades, directory links). If an implementation session is adding elements, it has drifted from this plan.
- **Do not let the timeline become an infographic.** One line, six nodes, one break. No icons-per-node, no stat callouts beyond the two that matter (1,200+ learners; no further invitations).
- **Risk to watch — voice consistency:** the footer statement and story portal are legitimately first person (Joe speaking); hero/share/OG must stay third person. The current hook video violates this; fixing it is content work (re-export), not just page work. Until re-exported, prefer live-text hero over burned-in type.
- **Risk to watch — scroll-driven work:** the timeline animation is the only new scroll dependency. It must degrade to a complete static composition (reduced-motion, JS-off, and screenshots all see the finished state).
