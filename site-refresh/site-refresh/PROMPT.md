# Migration prompt — refresh this site to the "ethereal terminal" design

*(Paste everything below into Claude Code from the root of this repository. The brief and all reference assets live in the `site-refresh/` folder that ships alongside this file.)*

---

You are working inside my personal website repository — the current working directory. It's a dependency-free static site served by GitHub Pages. Migrate its **presentation** to a new design system while preserving 100% of its **content** and its existing build pipeline. Everything you need is in `site-refresh/`.

## Read these first, in this order
1. **`site-refresh/design-directives.md`** — the AUTHORITATIVE design spec: design tokens, typography, color, the three-layer dot/atmosphere system, the hero globe, components, motion, guardrails, and a phased build path. If anything below disagrees with the directives, the directives win.
2. **`site-refresh/style-tile.html`** — a working reference page implementing the whole system on my real content. It is the source of truth for exact CSS token values, the atmosphere layers, and the hero animation. You will lift code from it rather than reinventing it.
3. **`site-refresh/assets/`** — drop-in vanilla modules extracted from the tile:
   - `hero-globe.js` — the CHOSEN hero visual (a skeleton-watch-movement dot-globe: the globe is the mainspring barrel driving an exposed going train). Self-contained Canvas 2D IIFE; needs a `<canvas id="halftone" width="380" height="380">` inside a `.portrait`.
   - `particles.js` — the L2 drifting pointillist field (fixed full-viewport `<canvas id="dots">`).
   - `load-reveal.js` — staggered fade-up of `.reveal` blocks on load.
   - `alternates/` — five other hero globes (worldtimer, escapement, tourbillon, orbital, observatory), same drop-in shape, if I ever want to swap.
4. **The existing repo**, to learn my structure and content: `content.yaml`, `build_script.py`, `script.js`, `index.html`, `about.html`, `education.html`, `academic_work.html`, `work_experience.html`, `style.css`, `Makefile`.

## How this site is built — DO NOT break this
- All content lives ONLY in `content.yaml`.
- `build_script.py` reads it and generates `script.js` (a `const content = {...}` blob plus DOM-populate functions). `make build` runs the generator; `make serve` builds then serves on :8000.
- The `*.html` files are static shells with empty placeholder elements that `script.js` fills at runtime.

Consequences for you: keep `content.yaml` as the single content source; keep `make build` working; and when you change page structure you will usually edit BOTH the HTML shell AND the DOM-building JS inside `build_script.py` (it's a Python string that emits `script.js`). New static assets (the JS modules, fonts) get referenced from the HTML shells. No npm, no bundler, no framework — the only build step is the existing Python.

## Hard constraints
- Vanilla HTML/CSS/JS only. No frameworks, no CSS libraries, no runtime dependencies. Keep total added JS within the directives' perf budget.
- Preserve every existing content item and every link exactly. Never invent, drop, or reword my content (you may re-tag it with new markup/classes).
- Fix the existing bug: `style.css` declares `font-family: "Robot Mono"` — a typo, so the site currently falls back to generic monospace. Replace the whole font strategy per the directives (JetBrains Mono everywhere + rare Newsreader italic accent words); delete the old `cdnfonts` import.
- Respect `prefers-reduced-motion` (every animation gated; canvases render one static frame), visible `:focus-visible` outlines, keyboard-navigable menu, and the contrast floor in the guardrails.
- Obey the directives' **Never** list (no purple/indigo SaaS gradients, no Inter/Roboto, no connecting-line particle networks, no glassmorphism, no big pill radii, no emoji UI, no scroll-jacking, no stock imagery).
- Work in phases. After each phase: run `make build`, confirm the site loads with no console errors, then commit with a clear message. The site must stay coherent and shippable between phases. Do not start a new branch unless I ask — commit on the current branch, or ask me first if that's the default branch.

## Migration plan (each phase = one commit; values from directives, code from the tile)

**Phase 0 — Inventory & plan.** Read the repo and the brief. Report back a short summary: the current architecture, where each content type is rendered (which shell + which populate function), and your concrete step-by-step plan. Wait for nothing obvious — proceed once you've summarized.

**Phase 1 — Tokens & type (directives §3–§4).** Rewrite `style.css` around the `:root` custom properties from the tile. Delete the `cdnfonts` import; add JetBrains Mono (400/500/700 + 400 italic) and Newsreader italic (self-hosted `woff2` preferred, or Google Fonts with `font-display: swap`). Apply the type scale, the section-index label style, and the terminal detail treatments. This is the biggest visible win at near-zero risk — do it first and completely.

**Phase 2 — Atmosphere (directives §5).** Add the three background layers behind all content: the L1 static dot grid (CSS, masked vignette), the two blurred aurora washes (teal `--glow` upper-left, ember `--ember` lower-right), and the film-grain overlay (inline SVG `feTurbulence`). Add the L2 particle field by including `site-refresh/assets/particles.js` and a fixed `<canvas id="dots">`. Get z-index/pointer-events right (layers never intercept clicks, never shift layout). Gate all motion on reduced-motion.

**Phase 3 — Components (directives §7).** Restyle, page by page: sticky blurred header/nav (active link teal with the persistent underline sweep); the hero (name in display size; tagline with 2–3 Newsreader-italic accent words; the coordinates line; social links as bracketed text `[github] [linkedin]`, not icon buttons); flat thin-bordered panels with optional `+` corner ticks and no glass/translucency; the publications list rebuilt as a **dataset** (hairline rows: year in teal tabular figures, title in ink-0, authors in ink-2 with "Escriba-Montagut, X." lifted to ink-1, journal italic, `doi:` link) — NOT cards; work/education entries keeping the `×` markers; the footer build line. Add the `NN / SECTION` index labels and the section count badges — these need small edits to the DOM-building JS in `build_script.py` (indices; and compute the publication/poster/talk counts from `content.yaml` at build time). Keep `::selection` teal.

**Phase 4 — Hero globe (directives §5 L3).** Drop `site-refresh/assets/hero-globe.js` into the Home hero: add the `.portrait` container + `<canvas id="halftone" width="380" height="380">`, include the script, and apply the wide `.portrait canvas` mask from the tile so the gear train dissolves rather than clips. Verify it animates and that it's absent-but-graceful under reduced-motion (one static frame). (To swap globes later, replace this one file with any `alternates/*.js` — same shape; each file's own mask hint is in the tile history, default mask is fine.)

**Phase 5 — Motion & polish (directives §6).** Wire the staggered load reveal (`site-refresh/assets/load-reveal.js` + `.reveal` classes on content blocks) and scroll reveals (IntersectionObserver, once). Redraw the favicon as a small dot-matrix "X". Generate an OG/social image in the same style. Final pass on reduced-motion, focus states, and mobile (halve particle count, static washes, single-column hero).

## Verify (every phase, and a final sweep)
Run `make build`; open the built site; confirm zero console errors, no layout shift from the canvases, keyboard focus visible, and reduced-motion respected (toggle it and reload — canvases must show a static frame, not freeze mid-animation). Check contrast on body text. Aim for Lighthouse ≥ 95 across the board. If you can drive a headless browser, screenshot each page at desktop + mobile widths and eyeball them against `style-tile.html`.

## When done
A working, refreshed site with `make build` green, all content and links intact, no console errors, reduced-motion honored. Give me a concise changelog and a list of anything you deferred or where you deviated from the brief and why.
