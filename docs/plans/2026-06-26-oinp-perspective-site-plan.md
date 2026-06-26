# OINP Perspective Site Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace `oinp.hubeiqiao.com` with a story-led public support page for Joe's Canada/Ontario builder pathway message, while preserving the current policy-comment website as an archive.

**Architecture:** Keep the site as a small Cloudflare Workers Assets deployment backed by static HTML/CSS/JS. Move the existing long policy-comment page into an archive route, then make the root homepage a focused five-section experience with the cinematic autoplay hook video in the hero, full video section, support form, share actions, and a small hiring link. If support submissions need to persist, add a minimal Worker API backed by Cloudflare D1; do not rely on social login.

**Tech Stack:** Static `index.html`, `styles.css`, `script.js`, `worker.js`, Cloudflare Workers Assets via `wrangler.toml`, optional Cloudflare D1 for support records, MP4/WebM video assets generated from the Remotion output, CSS/WAAPI motion with IntersectionObserver. Use Three.js only if a specific lightweight hero depth effect is approved after static/video-first prototyping.

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

- Source path: `/Users/joehu/Joe/compaign/canada-journey/oinp-feedback-video/hook-remotion/out/oinp-feedback-rebuild-1080p.mp4`
- Format verified with `ffprobe`: 1920x1080, 60 fps, H.264/AAC, about 2:00, about 128 MB.
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
- The hero must still explain what the page is: a personal public message about whether Canada and Ontario can keep early-stage builders who are already contributing here.
- The full video becomes the next step for visitors who are interested.
- The support section converts sympathy into one low-friction public signal.
- The archive preserves policy detail for people who want the longer background.

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
  - `A 2-minute story about fair pathways for builders already here.`
- Keep Joe visible. Do not crop him into a dark, anonymous silhouette.
- Include a small `oinp.hubeiqiao.com` or `Joe Hu` mark only if it does not compete with the headline.

Metadata requirements:

- `og:type`: `website`
- `og:title`: `Canada helped me become a builder. Does Canada know how to keep builders?`
- `og:description`: `Joe Hu's 2-minute story about Canada, Ontario, graduate pathways, and fair recognition for early-stage builders already contributing here.`
- `og:image`: `https://oinp.hubeiqiao.com/share/og-oinp-builder-story.jpg`
- `twitter:card`: `summary_large_image`
- `twitter:title`, `twitter:description`, `twitter:image` matching OG.
- Keep canonical URL as `https://oinp.hubeiqiao.com/`.

Share text:

- LinkedIn/X default:

  ```text
  Canada helped me become a builder. Does Canada know how to keep builders?

  I support fair pathways for students, graduates, and early-stage builders already contributing in Canada.
  ```

- Add `Copy link` and mobile `navigator.share` where supported.
- Do not ask users to authenticate with LinkedIn/X to support the message.

## Product Decision

Recommended approach: **Story-first support signal with archived policy detail.**

Why:

- It matches the new purpose: "This is my story, but it is not only about me."
- It keeps the page emotionally accessible for tech, startup, university, and policy audiences.
- It gives one clear action: "I support fair pathways for builders already here."
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
- Support form with optional name/email/comment and required role/visibility choice.
- Thank-you state and share links after support.
- Small bottom link: "Building a high-agency AI/product team? Build with Joe"
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
- Hiring link: `Building a high-agency AI/product team? Build with Joe`
- Personal links can stay small if needed, but should not compete with support/share actions.

## Content Plan

### Section 1: Hero

Purpose: create a stunning first impression and establish the emotional question before policy detail.

Use this copy as the base:

```text
Canada helped me become a builder. Does Canada know how to keep builders?

I came to Canada to study, build, and contribute. I built products, joined the startup community, registered my company, and started creating value here. But recent immigration changes made the path for early-stage builders much harder to see.
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

If this story resonates with you, you can add your support. This is not a formal petition. It is a public signal that people care about fair pathways for students, graduates, and early-stage builders in Canada.
```

Button:

```text
I support fair pathways for builders
```

After click, reveal a form.

Fields:

- Name, optional
- Email, optional but recommended
- Role, required:
  - Student
  - Graduate
  - Founder
  - Builder
  - Employer
  - Investor
  - Professor / educator
  - Community member
  - Other
- Comment, optional
- Visibility, required:
  - You may show my name/comment publicly
  - Count me privately only

Implementation detail:

- Although the idea says "checkbox", treat the two visibility choices as mutually exclusive choices. Implement as a fieldset with radio behavior or checkbox-style buttons that enforce one selected value. This avoids ambiguous consent.

After submit:

```text
Thank you for supporting this message.
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
- Store the user's visibility preference for future public display.
- Do not collect raw IP unless there is a clear anti-spam reason and a retention policy.

Privacy/consent line near the form:

```text
By submitting, you agree that Joe may store this response to count support for this message. Your email will not be shown publicly. If you choose public visibility, your name/comment may be reviewed before any public display. To remove or update your support, contact Joe through hubeiqiao.com.
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
Building a high-agency AI/product team? Build with Joe
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
  name TEXT,
  email TEXT,
  role TEXT NOT NULL,
  comment TEXT,
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'private')),
  source TEXT NOT NULL DEFAULT 'oinp-homepage'
);

CREATE INDEX IF NOT EXISTS idx_supporters_created_at
ON supporters(created_at);

CREATE INDEX IF NOT EXISTS idx_supporters_visibility
ON supporters(visibility);
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
  - Validate role and visibility against allowlists.
  - Trim strings.
  - Reject overlong fields.
  - Validate `startedAt` server-side so immediate automated submissions are rejected.
  - Insert one row.
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
- Role: allowlist only.
- Comment: 1000 chars.
- Visibility: `public` or `private`.

Spam control:

- Add a hidden honeypot input in the form.
- Add a minimum submit time check client-side and server-side with a `startedAt` timestamp.
- Add route-level Cloudflare rate limiting for `POST /api/support` from day one if D1 persistence is enabled.
- Add Turnstile only if spam appears after those lower-friction controls.

Fallback if backend is postponed:

- Keep the support form UI hidden behind a `data-mode="prototype"` guard or replace the submit action with a mailto/link collection strategy.
- Do not ship a fake success state that implies support was recorded when it was not.

## File-Level Implementation Tasks

### Task 1: Restructure Served Assets

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
5. Do not duplicate the hook headline as a giant HTML hero title; the video carries the hook line.
6. Add accessible hidden text or an `aria-label` that describes the hook video for screen readers without adding visible duplicate typography.
7. Add the full video section with native video controls.
8. Add the three "I hope" panels.
9. Add support form markup with accessible labels and fieldsets.
10. Add thank-you/share state markup.
11. Add final section and quiet footer links.
12. Update title/meta/OG/Twitter copy for the new story page.

Recommended metadata direction:

```text
Title: Canada helped me become a builder. Does Canada know how to keep builders?
Description: Joe Hu's 2-minute story about Canada, Ontario, graduate pathways, and fair recognition for early-stage builders already contributing here.
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
4. Add support form reveal behavior.
5. Add client validation.
6. POST to `/api/support` if backend is enabled.
7. Show loading, success, and error states.
8. Add share-link generation:
   - LinkedIn share URL.
   - X intent URL.
   - Native Web Share API where supported.
   - Clipboard copy with fallback.
9. Keep all JS progressive: the page should still show the video and content if JS fails.

### Task 8: Add Support API

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
7. Validate allowed role and visibility.
8. Validate `startedAt` minimum age and honeypot.
9. Insert into D1.
10. Return a compact JSON response.
11. Keep all other paths delegated to assets.
12. Configure Cloudflare route-level rate limiting for `POST /api/support` before accepting real submissions.

Pseudo-structure:

```js
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/support") {
      return handleSupport(request, env);
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
   - Support button reveals form.
   - Required role/visibility validation works.
   - Optional name/email/comment behave correctly.
   - Submit success shows thank-you/share actions.
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
   - missing/invalid role returns 400.
   - invalid visibility returns 400.
   - too-fast `startedAt` returns 400 or 429.
   - valid support submission returns `{ "ok": true }`.
   - rate limiting is configured in Cloudflare before production.

## Open Decisions For Joe

1. Should support submissions be stored immediately with D1, or should the first pass be a static prototype until the copy/design is approved? Resolve before Task 8.
2. Should the full video be committed as an optimized MP4 only if it is under 25 MiB, or hosted externally through R2/Cloudflare Stream/another approved host? Resolve before Task 3.
3. Should the new page show a public support count in v1, or only collect support privately until there is enough volume and moderation?
4. What should the "Build with Joe" link target be: `https://hubeiqiao.com`, a hiring-specific page, LinkedIn, or a future page? Resolve before Task 5.
5. Should the hero remain video-only in v1, or should a lightweight Three.js atmospheric layer be explored after the video-first prototype is approved?

## Recommended Implementation Order

1. Restructure served assets into `public/` and update `wrangler.toml`.
2. Archive current site under `public/archive/proposal-25-mlitsd019/`.
3. Prepare video/poster/hero-hook assets with the 25 MiB Workers Assets gate.
4. Prepare OG/social sharing assets.
5. Replace homepage static markup and styling.
6. Implement support UI as frontend only against a mocked success state locally.
7. Add real Worker/D1 persistence only after Joe confirms data collection, privacy notice, deletion path, and rate limiting.
8. Run visual validation, form/API verification, public-file exposure checks, and social metadata checks.
9. Deploy only after archive, hero hook, full video, support form, share actions, and mobile layout are verified.
