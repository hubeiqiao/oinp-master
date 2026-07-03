# Joe Footer Reuse Package

This package lets another AI reuse the current cinematic Joe Hu footer on OINP, `/co`, or `hubeiqiao.com` without rediscovering the design.

## Source Of Truth

- Live implementation: `public/index.html`
- Styles: `public/styles.css`, section `STORY FOOTER` plus footer responsive rules
- Runtime helpers: `public/script.js`
- Copy-ready partial: `docs/components/joe-footer/footer.html`
- Page copy map: `docs/components/joe-footer/footer-copy.json`

## Required Assets

Copy these assets into the target page with the same relative paths, or update the `src` values in `footer.html`.

- `public/media/photos/footer-award-sharp.jpg`
- `public/media/photos/joe-avatar.jpg`

## Required Fonts

The footer expects the site to load:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Hanken+Grotesk:wght@400;500;600;700&family=Oswald:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&display=swap">
```

## How To Reuse

1. Copy `footer.html` into the target page.
2. Replace the four statement placeholders using `footer-copy.json`.
3. Copy the footer CSS from `public/styles.css`.
4. Copy or keep the footer JS helpers from `public/script.js`:
   - `initCalActions`
   - `initFooterAvatarPop`
   - `initFooterPremiumMotion`
   - `initFooterMagneticBuild`
5. Call those four functions from `DOMContentLoaded`.
6. Keep the Cal embed script if `Book a Talk` remains in the footer.

## Copy Rules

- OINP uses the approved current copy:
  - `This is personal, but it is not only about me.`
  - `I am one case of a larger question: who gets to keep building here?`
- `/co` and the personal site should not reuse the OINP sentence by default.
- The `/co` and `personal` entries in `footer-copy.json` are placeholders only. They need Joe's approval before shipping.

## Link Map

Keep these labels short. Do not expand them into full article titles inside the footer.

- Articles: `Prep for Canada`, `2y Canada Journey`, `Keep Builders in 🍁`
- Artifacts: `Joe Speaking`, `2025: To Be a Builder`, `Joe's AI Usage`
- Share: `Joe Speaking Origin`, `Claude Code Notes`, `Personal AI Usecases`
- More: `About Joe`, `Knowledge Graph`, `Joe's Blog`
- Actions: `Build with Joe`, `Book a Talk`

## Validation Checklist

Run these checks after reuse:

```bash
rg -n "footer-avatar|footer-social|footer-action-build|footer-statement" public/index.html public/styles.css public/script.js
node --check public/script.js
git diff --check
```

Visual checks to do manually:

- Desktop footer keeps the current photo-first cinematic composition.
- Mobile footer keeps the avatar/name line first, then `BUILDING IN CANADA 🇨🇦`, then social icons.
- Mobile bottom copy is two centered lines:
  - `© 2026 • Ottawa, Ontario`
  - `Open to talk, interviews, events, and building with the right team`
- `Joe Hu` opens `https://hubeiqiao.com`.
- `Build with Joe` opens `https://hubeiqiao.com/co`.
- `Book a Talk` opens the Cal booking modal or falls back to `https://cal.com/joe-hu/talk`.
