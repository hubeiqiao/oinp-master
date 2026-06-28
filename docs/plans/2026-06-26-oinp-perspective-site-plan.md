# OINP Perspective Site Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace `oinp.hubeiqiao.com` with a story-led public awareness page for Joe's Canada/Ontario builder pathway message, while preserving the current policy-comment website as an archive.

**Architecture:** Keep the site as a small Cloudflare Workers Assets deployment backed by static HTML/CSS/JS. Move the existing long policy-comment page into an archive route, then make the root homepage a focused five-section experience with the cinematic autoplay hook video in the hero, full video section, one-click support UI, share actions, and a quiet contact/build-with-Joe link. If support submissions need to persist, add a minimal Worker API backed by Cloudflare D1; do not rely on social login.

**Tech Stack:** Static `index.html`, `styles.css`, `script.js`, `worker.js`, Cloudflare Workers Assets via `wrangler.toml`, optional Cloudflare D1 for support records, MP4/WebM video assets generated from the Remotion output, CSS/WAAPI motion with IntersectionObserver. Use Three.js only if a specific lightweight hero depth effect is approved after static/video-first prototyping.

## Implementation Status (updated 2026-06-28)

**Status: homepage + archive shipped as a static front-end served from `public/` (security restructure done & verified via `wrangler dev`). The only remaining deferral is support persistence (Task 8), pending Joe's go-ahead on data collection.**

The five-section homepage, the cinematic full-story video section, the one-click support UI, share actions, social/OG assets, and the policy archive are all built and verified in Chrome (Playwright) at 390 / 768 / 1440 widths. The hero was already in place; this pass updated its copy + page metadata and built everything below it.

### What was implemented

- **Hero (copy + metadata only):** eyebrow `Joe Hu's story · Built in Canada`, updated lead, screen-reader `h1` with the full hook line, and `title`/description/OG/Twitter set to the Option A direction. Hero video, scrim, and fallback logic left intact.
- **Nav:** minimal floating nav (`Joe Hu · Ottawa`, links `Video / Message / Support`, quiet `Support` pill) with a condensed backdrop after scroll. Links hidden on mobile.
- **Section 2 — Video:** chromeless poster + custom play affordance over a native-controls `<video>`; below it an editorial rail with the highlighted essay ("Two Years After Quitting My Job…") plus quiet `Build with Joe` and `Talk to Joe` sidecars (contact bridge).
- **Section 3 — Message:** three numbered asks (01–03) + archive link.
- **Section 4 — Support:** one-click `I support this message` → thank-you/share state (LinkedIn / X / copy / native) → optional comment-or-story form with `private`-default permission, consent note, and a honeypot.
- **Section 5 — Final + footer:** "not only about me" close with support/share/contact actions and the quiet `Build with Joe` + archive links.
- **Assets:** `media/oinp-feedback-story.mp4` (720p, two-pass x264, **22 MB**, faststart — under the 25 MiB Workers limit) + `media/oinp-feedback-story-poster.jpg`; `share/og-oinp-builder-story.jpg` (1200×630) + `…-square.jpg` (1200×1200), composited from a real Ottawa-River still + headline.
- **Archive:** `archive/proposal-25-mlitsd019/` restored from git `0c4e18c` with an "Archived" banner + back-link; fixed a pre-existing `countdownInterval` TDZ crash in the archived script.

### Deviations from the plan (intentional)

- **Reveal motion:** uses a self-removing, rAF-throttled **scroll-driven** reveal instead of IntersectionObserver. The IO version left sections invisible (only 2/10 fired) on fast flicks / anchor jumps; the scroll version reveals 10/10 and disconnects when done. This overrides the "IntersectionObserver, not scroll listeners" guidance for correctness.
- **Typography:** dropped Inter (per "no default Inter/Arial" rule) and use a three-role system — **Oswald** (statements) · **Hanken Grotesk** (UI/body) · **Source Serif 4** (first-person voice) — rather than a strict two-family set. The serif carries the personal-essay tone established in the hero.
- **Video asset:** named `oinp-feedback-story.mp4`, encoded at **720p** (not 1080p) to fit the 25 MiB per-file limit from the 147 MB source. Higher-quality hosting (R2/Stream) remains the long-term option.
- **Served directory:** ✅ resolved 2026-06-28 — servable files moved into `public/` and `wrangler.toml` now serves `directory = "public"`. `wrangler dev` confirms private/source files return 404 (see Task 1).
- **Support persistence:** front-end only. The UI posts optimistically to `/api/support` (+ `/details`) and degrades gracefully when absent, recording the signal in `localStorage`. No D1/Worker API, no fabricated counts (Task 8 deferred).

### Task status

| Task | Status |
| --- | --- |
| 1 · Restructure served assets into `public/` | ✅ Done & verified (`wrangler dev`: private files 404) |
| 2 · Archive current site | ✅ Done (`public/archive/proposal-25-mlitsd019/`) |
| 3 · Prepare video/poster/hero assets | ✅ Done (720p 22 MB + poster) |
| 4 · Create social/OG assets | ✅ Done (1200×630 + square) |
| 5 · Replace root homepage markup | ✅ Done |
| 6 · Rebuild styles + design system | ✅ Done |
| 7 · Support UI behavior | ✅ Done (front-end, mocked-success preview) |
| 8 · Add Support API (Worker + D1) | ⏳ Deferred (needs Joe's go-ahead) |
| 9 · Verification | ✅ Done (Chrome/Playwright @ 390/768/1440 + archive; no overflow; reveals 10/10; support flow + share work) |

### Next Steps

> ✅ Completed 2026-06-28: the `public/` restructure (private files now return 404 via `wrangler dev`) and the Notion essay link check (renders publicly — "Two Years After Quitting My Job…").

1. **Support persistence (Task 8) — the main remaining item:** only after Joe confirms data collection — add the Worker `/api/support` + `/api/support/details` routes, D1 table + migration, origin/size/honeypot/`startedAt` validation, route-level rate limiting, and publish the privacy + manual-deletion notice. The front-end is already wired for it.
2. **Optional before launch:** higher-quality full video via R2/Cloudflare Stream if 720p/22 MB feels too compressed; add a `.gitignore` (`node_modules`, `.wrangler/`, `.DS_Store`); final favicon/`theme-color` check.
3. **Deploy** once Task 8 is decided — or ship now without persistence if the support signal can stay client-side for v1.

## Current Context

Branch created for this planning work:

- `codex/oinp-perspective-site-plan`

Current website files:

- `index.html`: existing long policy-comment campaign page.
- `styles.css`: existing editorial advocacy design system.
- `script.js`: countdown, scroll animation, nav behavior, template-copy logic.
- `worker.js`: delegates all requests to `env.ASSETS.fetch(request, ctx)`.
- `wrangler.toml`: currently serves static files from the repo root with `assets = { directory = ".", binding = "ASSETS" }`.
- `preview-og.jpg`, `preview.png`: current preview assets.
- `assets/*`: zero-byte Notion-export image placeholders tied to the root markdown source, not active website assets.

Critical current deployment risk:

- Because `assets.directory` is `.`, the Worker may expose non-public repository files as static assets. Before adding migrations, support APIs, or new private source files, restructure public assets into a dedicated served directory such as `public/`.
- Do not add `migrations/`, source docs, temp files, local settings, or raw planning files under the served asset directory.
- Keep `assets/` and `Comment on Proposal 25-MLITSD019 A Pragmatic Path  2bf0df12ec7780ce98c6dbeb273f3407.md` out of `public/`; these are source/export artifacts, not runtime assets.
- During implementation, verify whether existing hidden/local files are currently reachable and remove them from the served tree by changing `assets.directory`, not by ad hoc deleting unrelated files.

Current site content:

- Hero: "Your Voice Matters: Shape Ontario's Future."
- Primary CTA: submit a comment to the Ontario Regulatory Registry before January 1, 2026.
- Long policy sections: recommendations, what is happening, stakeholder impact, AI-era argument, concerns, federal alignment, trust, early-stage builder stream design, author background, comment template, final action CTA.

New source video:

- Final source path: `/Users/joehu/Joe/compaign/canada-journey/oinp-feedback-video/hook-remotion/out/oinp-feedback-final-1080p.mp4`
- Format verified with `ffprobe`: 1920x1080, H.264/AAC, about 2:03, about 147 MB.
- Use this final video as the source for the full video section. Do not use the older `oinp-feedback-rebuild-1080p.mp4` unless the final export is unavailable.
- Hero hook source path: `/Users/joehu/Joe/compaign/canada-journey/oinp-feedback-video/hook-1080p.mp4`
- Hero hook format verified with `ffprobe`: 1920x1080, 60 fps, H.264/AAC, 5.6 seconds, about 5.2 MB.
- Related transcript: `/Users/joehu/Joe/compaign/canada-journey/oinp-feedback-video/transcript/verified-transcript.md`
- Related Remotion design plan: `/Users/joehu/Joe/compaign/canada-journey/oinp-feedback-video/visual-elements-plan.md`

Video narrative:

- Canada helped Joe become a builder.
- Joe came to Ottawa for a master's, found community, and built Joe Speaking from English and immigration pain.
- Joe Speaking reached 1,200+ organic users, led to a Canadian company, and got him handpicked for YC AI Startup School.
- OINP timing removed the master's pathway without a clear transition.
- Early-stage founders face an absurd choice: qualifying Canadian work experience or French, while founder work may not count.
- Closing argument: Canada should reconsider talent immigration policy for people already here.

Video design system to reuse:

- Tone: cinematic founder documentary plus precise policy explainer.
- Typography: heavy condensed statement type for title beats; refined caption/body type for personal text.
- Palette: near black, off-white, amber/orange for builder evidence, cold blue-gray for policy friction, restrained red only for friction or blocked paths.
- Visual language: proof fragments, large quote-like statements, real photos/screens, timeline/gate metaphors, sparse text.
- Avoid: generic startup gradients, patriotic clip art, government-PDF density, cute icons, overexplained policy architecture.

## Design Thesis

Visual thesis:

```text
A cinematic founder-documentary page: the first viewport feels like the opening frame of the Remotion film, with Joe and Ottawa as the visual anchor, amber builder energy colliding with cold policy friction.
```

Content thesis:

- Hero earns attention by showing the actual video hook as a natural autoplaying cinematic surface, not by rebuilding the hook as duplicate page text.
- The hero must still explain what the page is: one builder's story about how Canada helped him build, what recent pathway changes made harder, and what public awareness/request he is sharing now.
- The full video becomes the next step for visitors who are interested.
- The support section converts sympathy into one low-friction public signal and makes sharing easy.
- The team/contact path must be visible for forward-thinking companies without turning the page into a resume.
- The archive preserves policy detail for people who want the longer background.

## Content Revision To Confirm

Status: **copy planning only**. Do not implement these content changes until Joe confirms the copy direction.

This section supersedes the earlier hero/page-copy draft in the plan. The current hero visual direction is the best baseline for now; the next content pass should update copy and metadata first, without redesigning the hero layout.

### Page Purpose

The website should do three jobs, in this order:

```text
1. Share Joe's perspective on how current immigration changes affect early-stage founders and international builders.
2. Raise public awareness in Canada's tech, startup, university, and policy-adjacent communities.
3. Keep a secondary path for people who want to contact Joe directly or explore building with him.
```

This is not a policy memo and not only a petition. It is one builder's story, used to make a broader issue visible: international builders can be studying, building products, registering companies, serving users, joining communities, and still face a path that is hard to see.

The public request should be clear and practical: help more people understand what international builders are facing, support fair recognition of builders already contributing here, and share the story with people in Canada's tech, startup, university, and policy communities.

The contact/team message should exist, but it is not the center of the page. Joe is in Ottawa and open to conversations, interviews, and serious building opportunities in Canada.

Voice anchor:

```text
This is personal, but it is not only about me.

I am sharing this because I believe Canada can be one of the best places in the world for builders. But to do that, the system needs to recognize people who are already here, already building, and already trying to contribute.
```

Primary action:

```text
I support this message
```

Secondary action:

```text
Watch the full story
```

### Hero Copy Options

The hero should not say only "a personal story about building in Canada." That is too generic. The hero also should not lead with `OINP`; that acronym belongs later in the page, metadata, and archived policy context. The first viewport should make the human and startup-talent argument clear: this is one builder's story, but it points to a broader reality for international builders in Canada.

Option A, recommended:

```text
Eyebrow:
Joe Hu's story · Built in Canada

Headline:
Canada helped me become a builder. Does Canada know how to keep builders?

Lead:
Canada did something important for me: it helped me become a builder. I built my first product here, registered my first company here, and found confidence through Canadian communities. I am sharing this because I believe Canada can be one of the best places in the world for builders, but the system needs to recognize people already here, already building, and already trying to contribute.
```

Why: focuses on Joe's story first, repeats the full title, and directly reflects the two primary goals: share perspective and raise awareness. The team/contact path stays secondary.

Option B:

```text
Eyebrow:
Joe Hu's story · International builder in Canada

Headline:
Canada helped me become a builder. Does Canada know how to keep builders?

Lead:
Traditional employment is one signal. French is one signal. But product, users, company-building, and community contribution should also matter when someone is already creating from inside Canada.
```

Why: more policy-direct; strong if the hero visual already carries the personal story.

Option C:

```text
Eyebrow:
Joe Hu's story · Already building here

Headline:
Canada helped me become a builder. Does Canada know how to keep builders?

Lead:
I built my first product here and found the community that made me believe I could keep building. The question is whether Canada can see that contribution before it fits a traditional employment category.
```

Why: most compact startup-policy thesis.

Option D:

```text
Eyebrow:
Joe Hu's story · Two years after quitting my job

Headline:
Canada helped me become a builder. Does Canada know how to keep builders?

Lead:
Two years after quitting my job, I found myself building in Canada. That is the kind of outcome a country should want from graduate talent. This page is about whether the system can recognize this kind of early contribution while it is still taking shape.
```

Why: ties directly to the important article and gives the hero a more literary, personal opening.

Option E:

```text
Eyebrow:
Joe Hu's story · Building what comes next

Headline:
Canada helped me become a builder. Does Canada know how to keep builders?

Lead:
Canada helped me become a builder. Now I am sharing that story because I believe Canada can be one of the best places in the world for builders, if it recognizes people already here, already building, and already trying to contribute.
```

Why: useful as a final-section variant if the page needs a more reflective close, but still keeps the public-awareness goal ahead of the team/contact path.

### Recommended Full Page Copy

Use this as the default full-copy draft if Joe chooses Option A.

#### Metadata

```text
Page title:
Canada helped me become a builder. Does Canada know how to keep builders?

Meta description:
Joe Hu shares one builder's story about Canada, Ontario, early-stage founders, fair pathways, and recognizing people already building here.

OG title:
Canada helped me become a builder. Does Canada know how to keep builders?

OG description:
Joe Hu built his first product, registered his first company, and found confidence through Canadian communities. Now he is sharing what international builders are facing.

Twitter title:
Canada helped me become a builder. Does Canada know how to keep builders?

Twitter description:
One builder's story about products, company-building, community, fair pathways, and people already trying to contribute in Canada.
```

Favicon:

```text
Reuse the previous OINP favicon from the archived site:
https://pbs.twimg.com/profile_images/1926465242164289538/XdrQhdiw_400x400.jpg
```

#### Navigation

```text
Joe Hu
Video
Message
Support
```

#### Section 1: Hero

```text
Eyebrow:
Joe Hu's story · Built in Canada

Headline:
Canada helped me become a builder. Does Canada know how to keep builders?

Lead:
Canada did something important for me: it helped me become a builder. I built my first product here, registered my first company here, and found confidence through Canadian communities. I am sharing this because I believe Canada can be one of the best places in the world for builders, but the system needs to recognize people already here, already building, and already trying to contribute.

Primary CTA:
Watch the full story

Secondary CTA:
I support this message

Tertiary text link:
Talk to Joe in Ottawa
```

Hero copy rules:

- The headline can appear as accessible HTML if the hero design needs it, but do not duplicate the giant in-video hook visually in a way that fights the video.
- If the hook video already displays the same headline in the current frame, place the lead and CTAs in annotation/field-note areas instead of stacking the same title below it.
- Do not put `OINP` in the hero eyebrow. Keep the first viewport human-first and builder-first.
- Use an eyebrow like `Joe Hu's story · Built in Canada`, `Joe Hu's story · International builder in Canada`, or `Joe Hu's story · Ottawa, Ontario`. The eyebrow should have context, but it should still focus on Joe's story, not Canada as an abstract subject.
- If OINP needs to appear above the fold for clarity, use a small secondary note such as `Context: Ontario graduate pathways`, not the acronym as the main label.

#### Section 2: Video

```text
Kicker:
The full story

Title:
Why I am sharing this

Body:
This video explains how Canada helped me become a builder, what changed after Ontario's graduate pathway updates, and why I believe Canada needs a clearer way to recognize early-stage founders who are already building here.

Small note:
Video source: final 1080p export from the OINP feedback film.
```

Feature this related article in the video/story section, directly below the video or beside the video on desktop:

```text
Kicker:
Longer backstory

Title:
Two Years After Quitting My Job I Found Myself Building in Canada

Body:
This essay is the longer personal context behind the video: how leaving my previous path eventually led me to Canada, product-building, and the kind of founder journey I hope Canada can keep.

CTA:
Read the essay

URL:
https://www.notion.so/hubeiqiao/Two-Years-After-Quitting-My-Job-I-Found-Myself-Building-in-Canada-38b0df12ec7780dd8670fecc77f7b51b?source=copy_link
```

Article implementation note:

- This article is important enough to be visually highlighted, not buried in the footer.
- Keep it inside Section 2 so the first flow is: hero hook -> full video -> longer written story.
- Before launch, verify the Notion page is publicly accessible. If the Notion link is private or visually inconsistent, create a public article page/archive copy and link to that instead.

Add a small team-facing bridge near the article, using the visual tone of the `/co` page rather than a generic hiring banner:

```text
Kicker:
Building what comes next?

Title:
I am looking for people serious about building for a better Canada.

Body:
If you are building a small, high-agency product team in Canada, I am open to the right team. Product sense, shipped execution, and proof from real work.

CTA:
Build with Joe

URL:
https://hubeiqiao.com/co
```

Team-link placement rule:

- Put this as a compact sidecar after the video/article, or repeat it quietly in the final section.
- Do not make it the primary action above support.
- The tone should match the screenshot direction from `/co`: serious, high-agency, Canada-specific, and proof-led.

Add a direct contact bridge for people who want to speak with Joe: tech/startup community members, media, hiring teams, university/community leaders, and policy-adjacent people.

```text
Kicker:
Talk to Joe

Title:
I am in Ottawa and open to conversations.

Body:
If you are part of Canada's tech, startup, university, hiring, media, or policy community and want to understand this story directly, I am open to talking, interviews, events, and serious conversations about keeping builders in Canada.

CTA:
Contact Joe directly

Secondary link:
For teams: Build with Joe
```

Contact placement rule:

- Add a visible contact entry point in the hero as a quiet text link or tertiary CTA.
- Add a dedicated contact block after the video/article area, because people who finish the video may want to reach out immediately.
- Add a final-section contact link for people who scroll to the end.
- Do not make contact compete with the main public-support CTA.

Contact page plan:

```text
Route:
/contact/

Page title:
Talk to Joe in Ottawa

Intro:
I am currently in Ottawa and open to direct conversations about this story, the builder pathway question, and serious opportunities to build what comes next.

Contact reasons:
- Policy or community conversation
- Media / interview
- Startup or employer conversation
- University / community event
- Builder or founder conversation
- Other

Suggested fields:
- Name
- Email
- Organization, optional
- Affiliation, optional
- Reason for reaching out
- Message

Primary CTA:
Send message

Secondary CTA:
Build with Joe

Secondary CTA URL:
https://hubeiqiao.com/co
```

Implementation note:

- Before implementation, choose the direct contact mechanism: a Worker form endpoint, a mailto link, or a simple external form.
- If using a form endpoint, add spam protection and a short privacy note before launch.

Video asset:

```text
Source file:
/Users/joehu/Joe/compaign/canada-journey/oinp-feedback-video/hook-remotion/out/oinp-feedback-final-1080p.mp4
```

Implementation note:

- The source file is about 147 MB, so implementation must either optimize it below the deployment limit or host it through an approved video host such as Cloudflare Stream/R2.
- The full video section may use native controls. The hero must not.

#### Section 3: Message

```text
Kicker:
The ask

Title:
What I hope Canada and Ontario will consider

Intro:
Traditional employment is one signal. French is one signal. But product, users, company-building, and community contribution should also count when someone is already building from inside Canada.
```

Item 1:

```text
Title:
Protect students who planned under the old system

Body:
Current students and recent graduates should not be left in uncertainty after making major life, tuition, and career decisions based on previous pathways.
```

Item 2:

```text
Title:
Keep an independent path for graduate talent

Body:
Masters and PhD graduates should have a way to stay based on their education, contribution, and potential, not only through a single employer relationship.
```

Item 3:

```text
Title:
Recognize early-stage builders

Body:
Founders often create value before they fit traditional employment categories. Products, users, pilots, community work, company registration, and startup-building should count as evidence of contribution.
```

Archive link inside or after this section:

```text
For detailed policy context, read my archived December 2025 OINP feedback on Proposal 25-MLITSD019.

Link label:
Read the December 2025 OINP feedback

Target:
/archive/proposal-25-mlitsd019/
```

#### Section 4: Support

```text
Kicker:
Public support

Title:
Support this message

Body:
If this story resonates with you, one click is enough. This is not a formal petition. It is a public signal that people care about fair pathways for students, graduates, and early-stage builders in Canada.

Button:
I support this message

Microcopy:
No account. No social login. You can add a comment or story after supporting, but you do not have to.
```

Support interaction:

```text
Step 1:
Visitor clicks `I support this message`.

Immediate result:
Count the support signal right away and show the thank-you state.

Step 2, optional:
Invite the visitor to add more context if they want.

Optional prompt:
Want to add context?
You can share a short comment, your own story, or why this message matters to you.
```

Optional comment/story form:

```text
Name
Optional

Email
Optional, only if you are open to follow-up

Comment or story
Optional

Public permission
You may show my name/comment publicly
Keep my support private

Consent note:
Your email will not be shown publicly. If you choose public permission, your name/comment may be reviewed before any public display.
```

Thank-you copy:

```text
Thank you. Your support has been counted.
The most helpful next step is to share the video with someone in Canada's tech, startup, university, or policy community.

Share on LinkedIn
Share on X
Copy link

Optional secondary action:
Add a comment or story
```

#### Section 5: Final

```text
Title:
This is personal, but it is not only about me.

Body:
I am sharing this because I believe Canada can be one of the best places in the world for builders. But to do that, the system needs to recognize people who are already here, already building, and already trying to contribute.

Primary CTA:
Support this message

Secondary CTA:
Share the video

Tertiary CTA:
Contact Joe directly

Small link:
Building a high-agency product team in Canada? Build with Joe

Small link URL:
https://hubeiqiao.com/co
```

#### Footer

```text
Earlier policy detail:
Read the December 2025 OINP feedback

Small context:
Archived OINP Proposal 25-MLITSD019 feedback and policy-comment page.
```

### Share Copy

LinkedIn/X default:

```text
Canada helped me become a builder. Does Canada know how to keep builders?

This is one builder's story, but it points to something broader: product, users, company-building, and community contribution can exist before they become traditional employment signals.

I support fair pathways for students, graduates, and early-stage builders already contributing in Canada.

https://oinp.hubeiqiao.com/
```

Native share payload:

```text
Title:
Canada helped me become a builder. Does Canada know how to keep builders?

Text:
Joe Hu built his first product, registered his first company, and found confidence through Canadian communities. Now he is sharing what international builders are facing.

URL:
https://oinp.hubeiqiao.com/
```

Interaction thesis:

- Hero media enters with physical mass: poster frame appears instantly, the muted hook video fades in, title locks into place with a heavy upward settle.
- On scroll, proof/policy elements should feel like they move on rails: translate/scale/opacity only, custom spring-like cubic-beziers, no layout-triggering animation.
- CTAs should feel tactile: press scale, nested arrow/icon motion, and clear loading/success states.

Premium design constraints:

- Treat the first viewport as a poster, not a document.
- Use real video/stills before decorative rendering.
- Avoid a boxed hero, stat strips, generic cards, and old gradient-orb decoration.
- Use two typefaces maximum. Recommended: Anton or Oswald for statement display, Hanken Grotesk or Plus Jakarta Sans for body/UI. Do not introduce generic Inter/Arial-style default typography for the website.
- Cards are allowed only for repeated support/ask items and form surfaces; major sections should be full-width compositions.
- The design should feel premium and current: layered editorial composition, precise spacing, controlled density, tactile motion, real media, and restrained high-contrast typography. Avoid a default campaign template.

## Hero Media Strategy

Recommendation: **use `/Users/joehu/Joe/compaign/canada-journey/oinp-feedback-video/hook-1080p.mp4` as the hero media source, not Three.js as the primary experience.**

Why:

- The hook video already says the page's core line: "Canada helped me become a builder. Does Canada know how to keep builders?"
- It is already a finished 5.6-second 1080p hook and is only about 5.2 MB, comfortably under the 25 MiB Workers Assets limit.
- Showing the hook immediately communicates the story faster than a custom 3D scene.
- Muted autoplay video is broadly supported when `muted`, `playsinline`, and `autoplay` are present.
- A short hook loop is lighter and more controllable than the full 2-minute MP4.
- Three.js would add bundle weight, mobile/GPU risk, and extra verification surface. It should only be used for a narrow atmospheric effect after the video-led hero is working.

Hero media implementation:

- Transcode or copy the hook source into a no-audio hero asset:
  - file: `public/media/hero-hook.mp4`, browser URL: `/media/hero-hook.mp4`
  - optional file: `public/media/hero-hook.webm`, browser URL: `/media/hero-hook.webm`
  - poster file: `public/media/hero-hook-poster.jpg`, browser URL: `/media/hero-hook-poster.jpg`
- Strip audio from the hero version even though the element is muted; this reduces weight and prevents accidental sound behavior.
- Use `<video autoplay muted loop playsinline preload="metadata" poster="/media/hero-hook-poster.jpg">` with no `controls`.
- Do not render visible player chrome in the hero: no progress bar, timestamp, play button, volume, settings, captions button, fullscreen icon, or browser video controls.
- The hook video is motion. A still preview may show only one hook beat at a time; never compose both hook sentences as if they appear simultaneously.
- Integrate the video into the page as a cinematic surface, not an embedded player:
  - desktop: near/full-bleed video surface with soft top/bottom scrims and the page chrome floating over safe areas;
  - mobile: full 16:9 landscape hook frame preserved, blended into the dark page with gradients rather than a bordered player shell.
- Add a dark scrim and a calm UI-safe area. Do not place context copy over the video's own hook typography.
- Respect reduced motion:
  - if `prefers-reduced-motion: reduce`, show `hero-hook-poster.jpg` instead of autoplay motion.
- Add a visible `Watch the video` CTA that scrolls to the full video section. The hero should tease the video, not replace it.

Hero context layer:

The no-player hook alone is visually strong, but it needs a premium context layer so first-time visitors know what they are seeing.

Use compact editorial information around the video, not a repeated headline:

- Top eyebrow or badge: `A public message from Joe Hu`
- One-sentence context line: `A personal story about Canada, Ontario, and fair pathways for builders already contributing here.`
- Small issue deck with 2-3 short signals:
  - `Student -> graduate -> builder`
  - `Company registered in Canada`
  - `Early-stage contribution should count`
- Primary CTA: `Watch the 2-minute story`
- Secondary CTA: `I support this message`
- Optional quiet share affordance near the CTAs: `Share with Canada's tech, startup, university, or policy community`

Do not use a large duplicate HTML headline such as the full hook line above or below the video. The hook line lives inside the video. HTML text around the hero should explain the page and action, not restage the video.

Premium hero composition options:

- Desktop option A: full-bleed video background with a bottom glassless action dock. Context line and CTAs sit in a dark gradient safe zone beneath the current video hook beat.
- Desktop option B: large editorial video surface spanning most of the viewport, with a slim right-side context rail containing the badge, one-sentence context, issue deck, and CTAs.
- Mobile: nav, full 16:9 hook surface, one context sentence, two full-width CTAs, then a small `Why this matters` hint. Keep the whole first viewport legible and action-oriented.

Creative hero reference images:

- Desktop reference: `docs/plans/assets/oinp-hero-desktop-creative-reference.png`
- Mobile reference: `docs/plans/assets/oinp-hero-mobile-creative-reference.png`
- Use these as direction for typography, spacing, annotation areas, and action dock composition. Do not treat generated microcopy as source of truth; the approved copy in this plan should control implementation.

## Mobile Hero Design

Recommendation: **use the same current 16:9 hook video on mobile, without creating a portrait derivative.**

Why:

- The user wants to use the current hook video as-is.
- The hook text is the message. A mobile center-crop could cut away the title and weaken the page.
- The mobile design should preserve the full 16:9 video frame and adapt the surrounding layout around it.

Mobile implementation:

- Use the same `public/media/hero-hook.mp4` source on mobile.
- Do not use `object-fit: cover` for the mobile hero video.
- On narrow screens, render the video as a full-width 16:9 media band near the top of the hero:
  - `width: 100%`
  - `aspect-ratio: 16 / 9`
  - `object-fit: contain`
  - dark page background behind the video
- Do not add a live HTML hook title below the video. The hook text is inside the video.
- Put a short context sentence and CTAs immediately below the video, or partially overlap only the lower dark gradient safe area if it does not cover the video's own hook text.
- Use `min-height: 100svh`, not fixed `100vh`, and keep the first viewport compact enough that the primary CTA remains visible.

Mobile layout rules:

- First viewport order:
  1. tiny nav/name,
  2. full 16:9 hook video or poster,
  3. one short context sentence explaining the page,
  4. `Watch the 2-minute story`,
  5. `I support this message`.
- CTA buttons must be full-width or nearly full-width on narrow screens, with at least 44px tap height.
- Avoid overlaying long paragraphs on the video on mobile. Use at most one short supporting sentence.
- Do not duplicate a giant overlapping title on top of or below the hook video.
- Do not show player UI on mobile hero; tapping `Watch the 2-minute story` should move the visitor to the full video section where native controls can appear.
- Reduced-motion mobile fallback should use `hero-hook-poster.jpg`.

Mobile verification:

- Test at 390x844 and 430x932.
- Confirm the full 16:9 hook frame is visible, not cropped.
- Confirm the hook text inside the video is readable without pinch-zoom.
- Confirm no CTA is pushed below the first viewport by nav/video/title spacing.
- Confirm autoplay failure still leaves a strong poster and usable CTAs.

Three.js decision:

- Do not use Three.js in v1 unless the static/video prototype feels visually weak after review.
- If used, constrain it to a non-essential background layer:
  - subtle depth particles or timeline/gate lines,
  - no text rendered inside canvas,
  - no required interaction,
  - poster/video fallback always visible,
  - canvas disabled on low-power/mobile or reduced-motion contexts.
- Verification must include a canvas-pixel nonblank check, mobile performance pass, and fallback test before shipping any Three.js hero.

## Social Sharing Strategy

The page should be built to be shared, not just visited.

Primary share promise:

```text
Canada helped me become a builder. Does Canada know how to keep builders?
One builder's story about what international builders are facing in Canada.
```

Recommended OG/Twitter assets:

- Create: `public/share/og-oinp-builder-story.jpg` at 1200x630.
- Create: `public/share/og-oinp-builder-story-square.jpg` at 1200x1200 for platforms that crop square.
- Optional: `public/share/og-oinp-builder-story-alt.jpg` for A/B testing later.

OG image direction:

- Use an actual still from the Remotion video, ideally Joe in Ottawa or the opening title frame.
- Add high-contrast overlaid title:
  - `Canada helped me become a builder.`
  - `Does Canada know how to keep builders?`
- Add a small context line if it remains readable:
  - `Joe Hu's story · Built in Canada`
- Keep Joe visible. Do not crop him into a dark, anonymous silhouette.
- Include a small `oinp.hubeiqiao.com` or `Joe Hu` mark only if it does not compete with the headline.

Metadata requirements:

- `og:type`: `website`
- `og:title`: `Canada helped me become a builder. Does Canada know how to keep builders?`
- `og:description`: `Joe Hu built his first product, registered his first company, and found confidence through Canadian communities. Now he is sharing what international builders are facing.`
- `og:image`: `https://oinp.hubeiqiao.com/share/og-oinp-builder-story.jpg`
- `twitter:card`: `summary_large_image`
- `twitter:title`, `twitter:description`, `twitter:image` matching OG.
- Keep canonical URL as `https://oinp.hubeiqiao.com/`.

Share text:

- LinkedIn/X default:

  ```text
  Canada helped me become a builder. Does Canada know how to keep builders?

  This is one builder's story, but it points to something broader: product, users, company-building, and community contribution can exist before they become traditional employment signals.

  I support fair pathways for students, graduates, and early-stage builders already contributing in Canada.
  ```

- Add `Copy link` and mobile `navigator.share` where supported.
- Do not ask users to authenticate with LinkedIn/X to support the message.

## Product Decision

Recommended approach: **Story-first support signal with archived policy detail.**

Why:

- It matches the new purpose: "This is my story, but it is not only about me."
- It keeps the page emotionally accessible for tech, startup, university, and policy audiences.
- It gives one clear action: "I support this message."
- It avoids turning the page into a petition, a government brief, or a hiring page.
- It preserves the current long policy page without letting it dominate the new message.

Alternatives considered:

- **Pure static page with no persisted support:** fastest, but the support action becomes symbolic and cannot create a real public/private signal.
- **External petition/form tool:** fast persistence, but adds third-party branding, privacy concerns, and the social-media/login feel this page should avoid.
- **Full campaign platform:** too large for the immediate goal and likely to dilute the story.

## Scope Boundaries

In scope:

- Moving served website files into a dedicated `public/` directory so repo source and migration files are not publicly served.
- New homepage with exactly five main sections.
- Cinematic muted autoplay hero hook using `/Users/joehu/Joe/compaign/canada-journey/oinp-feedback-video/hook-1080p.mp4`, integrated with no player chrome and supported by a compact context layer.
- Direct full video embed below the hero for interested visitors.
- Archived copy of the current site.
- Small archive link from the new homepage.
- One-click support action with optional name/email/comment-or-story afterward.
- Thank-you state and share links after support.
- Small bottom link: "Building a high-agency product team in Canada? Build with Joe" pointing to `https://hubeiqiao.com/co`
- Updated metadata, social preview image, and share text.
- Responsive/mobile validation.

Out of scope for first implementation:

- Public supporter wall.
- Admin dashboard.
- Email automation.
- Social login.
- Policy whitepaper expansion.
- Redesigning Joe's personal hiring site.
- New Remotion video edits.

Important constraint:

- The current full website content should move to the archive. The new homepage should only show a short archive link, not reuse the old policy sections inline.
- The implementation must not keep Cloudflare Workers Assets pointed at the repo root once private/source files are introduced.

## Blocking Decisions Before Implementation

Resolve before Task 3:

- Where the full 2-minute video will be hosted if the optimized MP4 exceeds the Workers Assets per-file limit.
- Current assumption: hero hook and poster can live in `public/media/`; full video may need R2, Cloudflare Stream, or another approved host.

Resolve before Task 5:

- Final target for `Build with Joe`: `https://hubeiqiao.com`, a hiring-specific page, LinkedIn, or a future page.

Resolve before Task 8:

- Whether real support collection with D1 is approved for v1.
- If D1 is approved, publish the privacy notice and manual deletion path before accepting submissions.

## Information Architecture

The root page should contain only these five sections:

1. Hero
2. Video embed
3. What I hope Canada and Ontario will consider
4. Support this message
5. Final personal/public framing

Navigation should be minimal:

- Logo/name: `Joe Hu`
- Links: `Video`, `Message`, `Support`
- No policy-heavy nav.
- No floating Regulatory Registry submit button on the new homepage.

Footer should be quiet:

- Archive link: `Earlier OINP policy-comment page`
- Hiring link: `Building a high-agency product team in Canada? Build with Joe`
- Personal links can stay small if needed, but should not compete with support/share actions.

## Content Plan

### Section 1: Hero

Purpose: create a stunning first impression and establish the emotional question before policy detail.

Use this copy as the base:

```text
Eyebrow:
Joe Hu's story · Built in Canada

Headline:
Canada helped me become a builder. Does Canada know how to keep builders?

Lead:
Canada did something important for me: it helped me become a builder. I built my first product here, registered my first company here, and found confidence through Canadian communities. I am sharing this because I believe Canada can be one of the best places in the world for builders, but the system needs to recognize people already here, already building, and already trying to contribute.
```

Primary actions:

- `Watch the video`
- `I support this message`

Design:

- Full-bleed, near-full-viewport hero, but leave a hint of the video section visible.
- Use the short muted `hero-hook` video as the visual field.
- Fall back to `hero-hook-poster.jpg` when autoplay is unavailable or reduced motion is enabled.
- Large condensed title inspired by the video opening.
- Amber emphasis only on `builder` / `builders`.
- Avoid a card-based hero. Text should sit directly on the image/video field with a strong dark scrim.
- Add a small inline cue such as `2-minute story` near the `Watch the video` button so users understand the next step.
- Do not put the full 2-minute video controls inside the hero. The hero should act as the cinematic hook; the full watch experience belongs in Section 2.

### Section 2: Video Embed

Purpose: make the video the first proof object and emotional center.

Copy:

```text
My 2-minute story

This video explains why I am disappointed, what changed for builders like me, and why I think Canada needs a better way to recognize people who are already building here.
```

Implementation notes:

- Generate an optimized web MP4 from the 128 MB source before committing any video asset.
- Generate a poster image from the opening frame or a proof frame.
- Use native `<video controls preload="metadata" poster="...">`.
- The `Watch the video` hero CTA scrolls to this section and may focus the video container, but should not force autoplay with sound.
- If the optimized MP4 is still too large for this repo/deployment path, host the MP4 through R2/Cloudflare Stream or another approved media host and keep only the poster in the repo.

Recommended asset paths:

- file: `public/media/oinp-feedback-story-1080p.mp4`, browser URL: `/media/oinp-feedback-story-1080p.mp4`
- file: `public/media/oinp-feedback-story-poster.jpg`, browser URL: `/media/oinp-feedback-story-poster.jpg`

### Section 3: What I Hope Canada And Ontario Will Consider

Purpose: keep the ask short, human, and non-petition-like.

Title:

```text
What I hope Canada and Ontario will consider
```

Three items:

1. **Protect students who planned under the old system**

   Current students and recent graduates should not be left in uncertainty after making major life, tuition, and career decisions based on previous pathways.

2. **Keep an independent path for graduate talent**

   Masters and PhD graduates should have a way to stay based on their education, contribution, and potential, not only through a single employer.

3. **Recognize early-stage builders**

   Founders and builders often create value before they fit traditional employment categories. Products, users, pilots, community work, and company-building should count as evidence of contribution.

Design:

- Three evidence panels are acceptable here because they are repeated items, but do not nest cards inside cards.
- Use small numbered markers rather than decorative icons.
- Keep the section brief. No deep policy architecture.
- Animate the three items with a staggered rail-like reveal: translateY, opacity, and slight scale only.

### Section 4: Support This Message

Purpose: primary conversion point.

Copy:

```text
Support this message

If this story resonates with you, one click is enough. This is not a formal petition. It is a public signal that people care about fair pathways for students, graduates, and early-stage builders in Canada.
```

Button:

```text
I support this message
```

After click, count the support immediately and reveal the thank-you/share state.

Then show an optional prompt:

```text
Want to add context?
You can share a short comment, your own story, or why this message matters to you.
```

Optional fields:

- Name, optional
- Email, optional, only for follow-up
- Comment or story, optional
- Public permission, default private:
  - You may show my name/comment publicly
  - Keep my support private

Implementation detail:

- The support click should be the conversion event. Optional details must not block or delay the support count.
- Do not require an identity category. If audience context is useful later, ask for it in an optional follow-up survey, not in the main support flow.
- Treat public permission as mutually exclusive consent. Implement as a fieldset with radio behavior or checkbox-style buttons that enforce one selected value.

After submit:

```text
Thank you. Your support has been counted.
The most helpful next step is to share the video with someone in Canada's tech, startup, university, or policy community.
```

Share actions:

- `Share on LinkedIn`
- `Share on X`
- `Copy link`
- On mobile, first try native `navigator.share` with the approved share title/text/url, then fall back to platform buttons.

Privacy:

- Email is optional and should not be displayed publicly.
- Do not show name/comment publicly in v1 unless there is moderation or manual review.
- Store the user's public-permission preference for future public display.
- Do not collect raw IP unless there is a clear anti-spam reason and a retention policy.

Privacy/consent line near the form:

```text
By submitting, you agree that Joe may store this response to count support for this message. Your email will not be shown publicly. If you give public permission, your name/comment may be reviewed before any public display. To remove or update your support, contact Joe through hubeiqiao.com.
```

Retention/deletion:

- Store submissions only for this campaign/support signal.
- Provide a manual deletion path through Joe's public contact channel in v1.
- If a public supporter wall is added later, add moderation and a clearer public-display consent flow first.

### Section 5: Final Section

Purpose: close with the personal/public argument and a second support/share opportunity.

Copy:

```text
This is personal, but it is not only about me.

I am sharing this because I believe Canada can be one of the best places in the world for builders. But to do that, the system needs to recognize people who are already here, already building, and already trying to contribute.
```

Buttons:

- `Support this message`
- `Share the video`

Small bottom link:

```text
Building a high-agency product team in Canada? Build with Joe
https://hubeiqiao.com/co
```

Design:

- Use a quieter, warm resolve style from the video.
- Do not let the hiring link become a main CTA.
- The final `Share the video` button should reuse the same share payload as the support thank-you state.

## Archive Plan

Recommended archive route:

```text
/archive/proposal-25-mlitsd019/
```

Files:

- Create: `public/archive/proposal-25-mlitsd019/index.html`
- Create: `public/archive/proposal-25-mlitsd019/styles.css`
- Create: `public/archive/proposal-25-mlitsd019/script.js`
- Keep/copy assets needed by the archive:
  - `public/preview-og.jpg`
  - `public/preview.png`

Archive implementation requirements:

- Copy the current `public/index.html`, `public/styles.css`, and `public/script.js` before rewriting root files.
- Update relative links inside archived HTML:
  - `styles.css` should point to the archived local stylesheet.
  - `script.js` should point to the archived local script.
  - no `assets/...` rewrite should be needed for the current HTML; preview image URLs are already absolute and the favicon uses an external CDN URL.
- Do not copy `assets/` into `public/`. The current files are unused, zero-byte Notion-export placeholders.
- Add a visible archive note at the top of the archived page:

```text
Archived page: this was the earlier OINP Proposal 25-MLITSD019 policy-comment page. The current homepage now focuses on Joe's builder story and support message.
```

New homepage archive link:

```text
Earlier OINP policy-comment page
```

This link should live in the footer only, or in one quiet line after the final section.

## Support Data Plan

Recommended v1: Cloudflare Worker route plus D1.

Why:

- The site already has a Worker entrypoint.
- D1 gives structured records without introducing a separate app.
- The support action becomes real while staying lightweight.

Proposed files:

- Modify: `worker.js`
- Modify: `wrangler.toml`
- Create: `migrations/0001_supporters.sql`

Proposed D1 table:

```sql
CREATE TABLE IF NOT EXISTS supporters (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  update_token_hash TEXT,
  name TEXT,
  email TEXT,
  comment TEXT,
  public_permission TEXT NOT NULL DEFAULT 'private' CHECK (public_permission IN ('public', 'private')),
  detail_status TEXT NOT NULL DEFAULT 'support_only' CHECK (detail_status IN ('support_only', 'with_comment')),
  source TEXT NOT NULL DEFAULT 'oinp-homepage'
);

CREATE INDEX IF NOT EXISTS idx_supporters_created_at
ON supporters(created_at);

CREATE INDEX IF NOT EXISTS idx_supporters_public_permission
ON supporters(public_permission);

CREATE INDEX IF NOT EXISTS idx_supporters_detail_status
ON supporters(detail_status);
```

Manual setup required before deployment:

- Create the D1 database.
- Add the D1 binding to `wrangler.toml`.
- Run the migration.

Expected `wrangler.toml` shape after D1 setup:

```toml
[[d1_databases]]
binding = "DB"
database_name = "oinp_supporters"
database_id = "<cloudflare-d1-database-id>"
```

API routes:

- `POST /api/support`
  - Accept JSON payload.
  - Reject non-JSON content types with `415 Unsupported Media Type`.
  - Reject request bodies over a small fixed limit before parsing.
  - Restrict accepted origins to `https://oinp.hubeiqiao.com` and local dev origins if CORS is needed.
  - Create a support record immediately, even when no name, email, or comment is provided.
  - Trim strings.
  - Reject overlong fields.
  - Validate `startedAt` server-side so immediate automated submissions are rejected.
  - Insert one row with `detail_status = 'support_only'` and `public_permission = 'private'`.
  - Return `{ "ok": true, "supportId": "...", "updateToken": "..." }`.
- `POST /api/support/details`
  - Accept optional `supportId`, `updateToken`, `name`, `email`, `comment`, and `publicPermission`.
  - Verify the update token before changing the existing record.
  - If the token is missing or invalid, reject the update instead of creating a duplicate support count.
  - Validate `publicPermission` against `public` and `private`.
  - Store optional details and set `detail_status = 'with_comment'` when a comment/story exists.
  - Return `{ "ok": true }`.
- `GET /api/support/summary`
  - Optional.
  - Return total support count only.
  - Do not return email or comments in v1.

CORS/content-type:

- Same-origin form posts should work without broad CORS.
- If CORS headers are added, restrict `Access-Control-Allow-Origin` to the production origin and approved localhost dev origins.
- Always return `Content-Type: application/json` for API responses.
- Add `OPTIONS` handling only for the specific API routes if browser preflight becomes necessary.

Worker routing:

- API routes must be checked before `env.ASSETS.fetch`.
- Confirm no static asset path collides with `/api/support` or `/api/support/summary`.
- If Cloudflare Workers Assets routing bypasses the Worker for matching assets, do not create any `public/api/*` files.
- Consider `run_worker_first` only if local/prod testing proves API routes are not reaching the Worker; do not enable it blindly for every asset request.

Validation limits:

- Body: 16 KB maximum.
- Name: 120 chars.
- Email: 254 chars; optional; basic format validation only.
- Comment/story: 1500 chars.
- Public permission: `public` or `private`; default to `private`.
- Support-only submissions must be accepted without name, email, comment, or audience category.

Spam control:

- Add a hidden honeypot input in the form.
- Add a minimum submit time check client-side and server-side with a `startedAt` timestamp.
- Add route-level Cloudflare rate limiting for `POST /api/support` from day one if D1 persistence is enabled.
- Add Turnstile only if spam appears after those lower-friction controls.

Fallback if backend is postponed:

- Keep the support UI hidden behind a `data-mode="prototype"` guard or replace the submit action with a mailto/link collection strategy.
- Do not ship a fake success state that implies support was recorded when it was not.

## File-Level Implementation Tasks

> **Implementation note (updated 2026-06-28):** Tasks 1–7 and 9 are built and verified (see the status table above). Only Task 8 (Worker/D1 support API) remains and is flagged inline below. Servable files now live under `public/`.

### Task 1: Restructure Served Assets

> ✅ **Done (2026-06-28).** Servable files moved into `public/` (`index.html`, `styles.css`, `script.js`, `media/`, `share/`, `archive/`, `preview-og.jpg`, `preview.png`) and `wrangler.toml` now serves `directory = "public"`. `wrangler dev` confirms `/wrangler.toml`, `/worker.js`, `/docs/…`, `/README.md`, `/.DS_Store`, `/assets/…`, and the policy `.md` return 404, while the homepage, media, share assets, and archive serve 200. `assets/`, `docs/`, `worker.js`, `wrangler.toml`, and the source `.md` remain outside `public/`.

**Files:**

- Create: `public/`
- Modify: `wrangler.toml`

**Steps:**

1. Create `public/` as the only Cloudflare-served static directory.
2. Move/copy servable root files into `public/`:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `preview-og.jpg`
   - `preview.png`
3. Do not move private/source artifacts into `public/`:
   - `assets/`
   - `.claude/`
   - `.wrangler/`
   - `.DS_Store`
   - `README.md`
   - `docs/`
   - `Comment on Proposal 25-MLITSD019 A Pragmatic Path  2bf0df12ec7780ce98c6dbeb273f3407.md`
4. Update `wrangler.toml`:

   ```toml
   assets = { directory = "public", binding = "ASSETS" }
   ```

5. Keep `worker.js`, `wrangler.toml`, `migrations/`, `docs/`, local config, and source markdown outside `public/`.
6. Run locally and verify the current site still renders from `/`.
7. Probe representative non-public paths and verify they are not served:
   - `/wrangler.toml`
   - `/worker.js`
   - `/.DS_Store`
   - `/.claude/settings.local.json`
   - `/.wrangler/`
   - `/Comment%20on%20Proposal%2025-MLITSD019%20A%20Pragmatic%20Path%20%202bf0df12ec7780ce98c6dbeb273f3407.md`
   - `/assets/CleanShot_2025-12-04_at_22.00.07_2x-6821e359-06ff-4b7e-8361-5174effa6543.png`
   - `/docs/plans/2026-06-26-oinp-perspective-site-plan.md`
   - `/migrations/0001_supporters.sql` after the migration exists.

### Task 2: Archive Current Site

**Files:**

- Create: `public/archive/proposal-25-mlitsd019/index.html`
- Create: `public/archive/proposal-25-mlitsd019/styles.css`
- Create: `public/archive/proposal-25-mlitsd019/script.js`

**Steps:**

1. Copy current public `index.html`, `styles.css`, and `script.js` into the archive directory.
2. Add the archive note near the top of archived `index.html`.
3. Confirm no legacy `assets/...` rewrites are needed for the current HTML.
4. Verify archived CSS and JS references work from `/archive/proposal-25-mlitsd019/`.
5. Run the archive page locally and confirm the existing long content still renders.

### Task 3: Prepare Video Assets

**Files:**

- Create: `public/media/oinp-feedback-story-1080p.mp4` or external media URL decision.
- Create: `public/media/oinp-feedback-story-poster.jpg`
- Create: `public/media/hero-hook.mp4`
- Create: `public/media/hero-hook.webm` if practical.
- Create: `public/media/hero-hook-poster.jpg`

**Steps:**

1. Generate a web-optimized MP4 from:

   ```text
   /Users/joehu/Joe/compaign/canada-journey/oinp-feedback-video/hook-remotion/out/oinp-feedback-rebuild-1080p.mp4
   ```

2. Generate a full-video poster image from a strong video frame.
3. Generate the muted/no-audio hero hook from:

   ```text
   /Users/joehu/Joe/compaign/canada-journey/oinp-feedback-video/hook-1080p.mp4
   ```

4. Generate `hero-hook-poster.jpg` from the hook's strongest frame.
5. Check final MP4/WebM sizes before committing.
6. Enforce the Cloudflare Workers Assets per-file limit: any static asset over 25 MiB must not be committed under `public/`.
7. If the optimized full video exceeds 25 MiB, host it externally and document the URL before wiring the markup.

Suggested command to test during implementation:

```bash
ffmpeg -y -i "/Users/joehu/Joe/compaign/canada-journey/oinp-feedback-video/hook-remotion/out/oinp-feedback-rebuild-1080p.mp4" -c:v libx264 -crf 26 -preset slow -c:a aac -b:a 128k -movflags +faststart public/media/oinp-feedback-story-1080p.mp4
```

Suggested poster command:

```bash
ffmpeg -y -ss 00:00:02 -i public/media/oinp-feedback-story-1080p.mp4 -frames:v 1 public/media/oinp-feedback-story-poster.jpg
```

Suggested hero hook command:

```bash
ffmpeg -y -i "/Users/joehu/Joe/compaign/canada-journey/oinp-feedback-video/hook-1080p.mp4" -an -c:v libx264 -crf 26 -preset slow -movflags +faststart public/media/hero-hook.mp4
```

Suggested hero poster command:

```bash
ffmpeg -y -ss 00:00:02 -i public/media/hero-hook.mp4 -frames:v 1 public/media/hero-hook-poster.jpg
```

Mobile hero note:

- Use the same 16:9 `hero-hook.mp4` on mobile.
- Do not create or require a portrait derivative.
- Do not center-crop the hook on mobile; preserve the full frame and adapt layout around it.

During implementation, preview the hook in the hero before further compression. If the 5.2 MB source already looks good and the no-audio derivative remains comfortably under 25 MiB, do not over-optimize it into visible compression artifacts.

### Task 4: Create Social Sharing Assets

**Files:**

- Create: `public/share/og-oinp-builder-story.jpg`
- Create: `public/share/og-oinp-builder-story-square.jpg`

**Steps:**

1. Extract candidate stills from the Remotion video.
2. Create one 1200x630 OG image with Joe/video still plus title text.
3. Create one 1200x1200 square fallback image.
4. Verify the title remains readable at small preview sizes.
5. Use the OG asset in `public/index.html` metadata.
6. Run a local visual inspection of the final image before deployment.

### Task 5: Replace Root Homepage Markup

**Files:**

- Modify: `public/index.html`

**Steps:**

1. Replace current root page with five sections only.
2. Add a minimal nav with anchors for video/message/support.
3. Add the full-bleed/no-player hero hook video, mobile-safe source/fallback, poster fallback, compact context layer, and CTAs.
4. Ensure the hero video element has no `controls` attribute and no custom player UI.
5. Use the live page headline `Canada helped me become a builder. Does Canada know how to keep builders?`, but do not recreate the video's animated hook as static transcript text.
6. Add accessible hidden text or an `aria-label` that describes the hook video for screen readers without adding visible duplicate typography.
7. Add the full video section with native video controls.
8. Add the three "I hope" panels.
9. Add one-click support UI markup and optional comment/story markup with accessible labels and fieldsets.
10. Add thank-you/share state markup.
11. Add final section and quiet footer links.
12. Update title/meta/OG/Twitter copy for the new story page.

Recommended metadata direction:

```text
Title: Canada helped me become a builder. Does Canada know how to keep builders?
Description: Joe Hu shares one builder's story about Canada, Ontario, early-stage founders, fair pathways, and recognizing people already building here.
```

### Task 6: Rebuild Styles Around The Video Design System

**Files:**

- Modify: `public/styles.css`

**Steps:**

1. Replace old policy-campaign styles with a smaller design system.
2. Define tokens:

   ```css
   :root {
     --ink: #111318;
     --paper: #fff8eb;
     --white: #fffaf1;
     --amber: #f5b43c;
     --blue: #5eb2d8;
     --red: #e95f55;
     --muted: rgba(255, 255, 255, 0.62);
   }
   ```

3. Use a bold condensed display face for hero/statement moments.
4. Use a readable body face for paragraphs and form controls.
5. Build responsive sections with stable dimensions:
   - Hero min-height should leave part of the next section visible.
   - Video should use a fixed 16:9 aspect ratio.
   - Form controls should not shift layout when validation text appears.
6. Build the premium hero context layer:
   - no framed video-player box;
   - dark gradient/scrim integration around the video;
   - compact context sentence and issue deck;
   - CTAs with tactile states;
   - no visible player controls in the hero.
7. Add physical-feeling motion tokens:

   ```css
   --ease-out-heavy: cubic-bezier(0.32, 0.72, 0, 1);
   --ease-snap: cubic-bezier(0.18, 0.89, 0.32, 1.18);
   ```

8. Keep repeated item panels at 8px radius or less unless the final design direction requires otherwise.
9. Avoid old gradient orbs and generic advocacy styling.
10. Verify mobile line breaks manually for hero context and CTAs.
11. Add `prefers-reduced-motion` rules that stop hero motion and remove non-essential transitions.

Motion requirements:

- Animate only `transform` and `opacity` for scrolling and hover interactions.
- Use IntersectionObserver, not continuous scroll listeners, for reveal timing.
- Keep `backdrop-filter` only on fixed/sticky nav or small overlays; do not blur large scrolling containers.
- Add 2-3 intentional motions:
  - hero context layer settles after the video poster appears,
  - section content reveals with staggered weight,
  - CTA press/hover feels tactile.

### Task 7: Implement Support UI Behavior

**Files:**

- Modify: `public/script.js`

**Steps:**

1. Remove countdown and comment-template logic from the root script.
2. Keep or simplify smooth-scroll logic.
3. Add hero video fallback behavior:
   - if autoplay fails, keep the poster visible and do not show an error.
   - if reduced motion is active, do not start the hero hook video.
   - do not reveal player controls in the hero when autoplay fails; the fallback remains a poster plus CTAs.
4. Add one-click support behavior:
   - pressing `I support this message` immediately posts a support-only signal;
   - success shows the thank-you/share state;
   - optional comment/story fields appear only after support is counted.
5. Add client validation for optional detail fields.
6. POST to `/api/support` for the one-click support signal if backend is enabled.
7. POST to `/api/support/details` only when the visitor adds optional details.
8. Show loading, success, and error states.
9. Add share-link generation:
   - LinkedIn share URL.
   - X intent URL.
   - Native Web Share API where supported.
   - Clipboard copy with fallback.
10. Keep all JS progressive: the page should still show the video and content if JS fails.

### Task 8: Add Support API

> ⏳ **Not done — deferred until Joe confirms data collection.** The front-end already posts optimistically to `/api/support` and `/api/support/details` and degrades gracefully when absent. Before enabling: add the D1 table + migration, validation (origin / size / honeypot / `startedAt`), route-level rate limiting, and a published privacy + manual-deletion notice.

**Files:**

- Modify: `worker.js`
- Modify: `wrangler.toml`
- Create: `migrations/0001_supporters.sql`

**Steps:**

1. Route `/api/support` before `env.ASSETS.fetch`.
2. Validate method is POST.
3. Reject non-JSON content types.
4. Reject request bodies over 16 KB before parsing.
5. Parse JSON safely.
6. Validate allowed origin if CORS is used.
7. Accept support-only submissions without identity category, name, email, or comment.
8. Validate `startedAt` minimum age and honeypot.
9. Insert into D1.
10. Return a compact JSON response.
11. Add `/api/support/details` for optional comment/story updates with token validation.
12. Keep all other paths delegated to assets.
13. Configure Cloudflare route-level rate limiting for `POST /api/support` before accepting real submissions.

Pseudo-structure:

```js
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/support") {
      return handleSupport(request, env);
    }

    if (url.pathname === "/api/support/details") {
      return handleSupportDetails(request, env);
    }

    if (url.pathname === "/api/support/summary") {
      return handleSupportSummary(request, env);
    }

    return env.ASSETS.fetch(request, ctx);
  },
};
```

### Task 9: Verification

**Files:**

- All modified files.

**Steps:**

1. Start local dev server with the Worker if backend is included:

   ```bash
   wrangler dev --local --port 8787
   ```

2. Open:

   ```text
   http://127.0.0.1:8787/
   http://127.0.0.1:8787/archive/proposal-25-mlitsd019/
   ```

3. Verify desktop and mobile:
   - Hero does not duplicate the video hook as a large visible HTML title.
   - Hero hook video autoplays muted where supported.
   - Hero video has no visible player UI: no controls, progress bar, timestamp, play button, volume, settings, captions, or fullscreen icon.
   - A single hero still never shows multiple hook beats at once in generated preview/poster assets.
   - Hero context clearly explains what the page is without turning the first viewport into a policy document.
   - Hero falls back to poster when reduced motion is enabled.
   - Mobile hero shows the full 16:9 hook frame without cropping away the hook text, Joe, or the main visual proof.
   - Mobile CTAs remain visible and tappable in the first viewport.
   - Video loads and poster displays.
   - `Watch the video` scrolls to the full video section.
   - Support button counts support immediately without requiring identity category, name, email, or comment.
   - Thank-you/share actions appear after support is counted.
   - Optional comment/story form appears after support is counted.
   - Optional name/email/comment behave correctly.
   - Public permission defaults to private and only changes with explicit consent.
   - Copy link works.
   - Native share path works on supported mobile browsers or gracefully falls back.
   - Archive link works.
   - Hiring link is present but visually quiet.
   - No console errors.
   - `/wrangler.toml`, `/worker.js`, `/docs/...`, and `/migrations/...` are not publicly served.
   - Currently exposed private/source paths are not publicly served:
     - `/.DS_Store`
     - `/.claude/settings.local.json`
     - `/.wrangler/`
     - `/Comment%20on%20Proposal%2025-MLITSD019%20A%20Pragmatic%20Path%20%202bf0df12ec7780ce98c6dbeb273f3407.md`
     - `/assets/CleanShot_2025-12-04_at_22.00.07_2x-6821e359-06ff-4b7e-8361-5174effa6543.png`
   - No public asset exceeds 25 MiB if served through Workers Assets.

4. If D1 is included, submit a test support and query the database.
5. Remove any test record before production deployment if needed.
6. Run a final visual pass on at least:
   - 390x844 mobile.
   - 768x1024 tablet.
   - 1440x900 desktop.
7. Validate social metadata:
   - Open the generated OG image locally.
   - Inspect `og:*` and `twitter:*` tags in page source.
   - Use platform debuggers before production sharing when network access/deployment is available.
8. If Three.js is introduced after approval, add:
   - canvas nonblank check,
   - reduced-motion fallback check,
   - mobile performance check,
   - no-overlap screenshot verification.
9. Validate API security if D1 is included:
   - non-JSON POST returns 415.
   - oversized body returns 413.
   - support-only submission without name/email/comment returns `{ "ok": true }`.
   - invalid public permission returns 400.
   - invalid optional-details update token returns 403 or 400.
   - too-fast `startedAt` returns 400 or 429.
   - valid support submission returns `{ "ok": true }`.
   - rate limiting is configured in Cloudflare before production.

## Open Decisions For Joe

> Status as of 2026-06-28 implementation. See **Implementation Status** near the top for full detail.

1. **Support storage (D1 vs static prototype).** ⏳ *Open — built as front-end prototype for now.* The support UI ships with optimistic posting + `localStorage`; no D1 yet. Decide whether to wire real persistence (Task 8) with a privacy notice, deletion path, and rate limiting before deploy.
2. **Full video hosting (committed MP4 vs external).** ✅ *Resolved — committed.* Encoded to a 720p, 22 MB MP4 (under the 25 MiB limit) and committed at `media/oinp-feedback-story.mp4`. Revisit R2/Cloudflare Stream only if higher quality is wanted.
3. **Public support count in v1.** ✅ *Resolved — no public count.* The thank-you state shows no total (no real data, no fabricated number); the conversion is the share action. Add a count later only with real D1 data + moderation.
4. **`Build with Joe` link target.** ✅ *Resolved — `https://hubeiqiao.com/co`.* Used in the video sidecar and final section; the direct-contact link points to `https://hubeiqiao.com`.
5. **Three.js atmospheric layer.** ✅ *Resolved — not used.* The video-led hero plus per-section film grain reads as intended; no canvas layer added.

New decision surfaced during implementation:

6. **`public/` restructure.** ✅ *Resolved — done & verified 2026-06-28.* Servable files moved to `public/`; `wrangler dev` confirms `/wrangler.toml`, `/worker.js`, `/docs/…`, `/README.md`, `/.DS_Store`, `/assets/…`, and the policy `.md` all return 404, while the homepage, media, share assets, and archive serve 200.

## Recommended Implementation Order

> Progress as of 2026-06-28 marked inline.

1. Restructure served assets into `public/` and update `wrangler.toml`. — ✅ **Done & verified** (`wrangler dev`: private files 404).
2. Archive current site under `public/archive/proposal-25-mlitsd019/`. — ✅ **Done**.
3. Prepare video/poster/hero-hook assets with the 25 MiB Workers Assets gate. — ✅ **Done** (720p 22 MB + poster; hero hook already in place).
4. Prepare OG/social sharing assets. — ✅ **Done** (1200×630 + square).
5. Replace homepage static markup and styling. — ✅ **Done**.
6. Implement support UI as frontend only against a mocked success state locally. — ✅ **Done**.
7. Add real Worker/D1 persistence only after Joe confirms data collection, privacy notice, deletion path, and rate limiting. — ⏳ **Deferred** (Next Step 2; front-end already wired).
8. Run visual validation, form/API verification, public-file exposure checks, and social metadata checks. — ✅ **Done**: visual + form + social verified in Chrome at 390/768/1440; public-file exposure check passed via `wrangler dev` (private files 404).
9. Deploy only after archive, hero hook, full video, one-click support UI, share actions, and mobile layout are verified. — ⏳ **Pending** (do steps 1 + 3 from Next Steps first).
