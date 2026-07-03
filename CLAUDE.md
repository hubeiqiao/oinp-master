# CLAUDE.md

## Project Context

This repo contains the OINP public-awareness website for Joe Hu.

Current working site:
- Local preview: http://127.0.0.1:8788/
- The public production version is not live yet.
- Page title: "Canada helped Joe become a builder. Does Canada know how to keep builders?"

Primary files:
- Main page: `public/index.html`
- Styles: `public/styles.css`
- Behavior: `public/script.js`
- Worker/AEO behavior: `worker.js`
- AEO/SEO tests: `tests/aeo-worker.test.mjs`
- Archive page: `public/archive/proposal-25-mlitsd019/`
- Full video: `public/media/oinp-feedback-story.mp4`
- Hero hook video: `public/media/hero-hook.mp4`
- OG/social assets: `public/share/`

## Purpose

This website is a story-led public-awareness page. It uses Joe Hu as one concrete example to ask whether Canada can retain early-stage contributors it helped train.

Core message:

> Canada helped Joe become a builder. Here, he studied, built, registered a company, and found community. Then the pathway changed. Can Canada recognize builders in time?

Primary goals:
- Share Joe's perspective.
- Raise public awareness among Canada's tech, startup, university, media, and policy communities.
- Make the story easy to understand, support, and share.

Secondary goals:
- Let people add a support signal.
- Let people share their own story.
- Let people contact Joe if relevant.

Do not turn this into a hiring page, generic founder portfolio, or formal policy memo.

## Copy Constraints

- Preserve Joe's voice: personal, clear, direct, not bureaucratic, not sentimental, not generic founder marketing.
- Keep public-facing copy concise. Mobile line length matters.
- If copy is changed, check both desktop and mobile wrapping.
- Use "Ontario Immigrant Nominee Program (OINP)" the first time OINP appears.
- Be accurate: Ontario redesigned the program; former graduate streams will issue no more invitations.
- Do not imply Joe is asking for job-offer relief. Joe is not asking for a job.
- Avoid weak or rejected phrasing:
  - "one permanent job offer"
  - "one permanent job"
  - "startup-era talent"
  - "builder evidence" unless made substantially clearer
  - employment-relief framing
- Use third-person copy for social sharing contexts: people share the page about Joe, not as Joe.

## Design Constraints

Design is the most important improvement area.

The current site is better than generic, but the design target is much higher:
- super clean
- design-forward
- premium
- unconventional
- cinematic
- fluid
- emotionally memorable
- one unified conversational experience

The design should serve the story. Do not add random decoration.

Important design priorities:
- Desktop and mobile must both feel intentionally designed.
- The video should be integrated naturally, not feel like a generic player.
- Micro-interactions should feel premium and useful.
- Scroll, spacing, line breaks, hover states, and transitions should feel deliberate.
- Accessibility and performance still matter.

## Current Structure

The current page roughly follows:
1. Hero with autoplay hook video.
2. Full 2-minute video.
3. The short version.
4. At a glance.
5. Evidence and resources.
6. The ask.
7. FAQ.
8. Support/share/story submission.
9. Premium footer.

## Verification

Before claiming work is complete, run relevant checks:

```bash
node --test tests/aeo-worker.test.mjs
```

If design or mobile layout changes are made, validate visually on desktop and mobile. Do not rely only on code inspection.

## Git Hygiene

- Do not commit `.DS_Store` metadata changes.
- Keep unrelated changes out of commits.
- Inspect diffs before committing.
- Current main working branch has been `codex/oinp-hero-reference-implementation`.

## Orchestration Workflow

You (Fable) are the orchestrator. Plan, decompose, synthesize.

Reasoning-heavy phases → deep-reasoner

Mechanical work → fast-worker

Codex (/codex:rescue --background) is a cracked engineer on par with deep-reasoner, from a different perspective. Treat as a peer, not a reviewer.

High-stakes decisions: task Opus + Codex on the same problem in parallel, synthesize the best of both, without showing either the other's answer. Keep your own context lean.
