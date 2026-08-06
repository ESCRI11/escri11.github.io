# Design Directives — escri11.github.io refresh
### "Ethereal terminal" · pointillist machine aesthetic
**Purpose:** paste this document (whole or per-section) into Claude design or Claude Code as the authoritative style brief for the personal-site refresh. Every directive is concrete on purpose — follow the values, deviate only with reason.

---

## 1. The aesthetic in one paragraph

A dark, quiet, terminal-native page that feels like a machine dreaming. The lineage is the 2025–26 "technical mono" wave (monospace type, command-line restraint, high contrast — Factory AI, Unit Software-style) softened by "dreamy softness": faint aurora color washes, breathing pointillist dot fields, film grain. Pointillism is the core visual language — everything textural is made of dots: the background grid, the drifting particle field, the halftone-rendered portrait. Nothing shouts. The page is 95% near-black and ink; color appears as a phosphor-teal signal and a faint warm counter-glow. Precision (mono type, aligned grids, tabular data) + atmosphere (blur, drift, grain) = ethereal terminal.

**Mood words:** phosphor, observatory, signal, drift, quiet, precise.
**Anti-mood:** SaaS landing page, glassmorphism, neon cyberpunk, purple-gradient "AI slop".

## 2. Context — what exists today

Live at https://escri11.github.io/ (repo `ESCRI11/escri11.github.io`). Static site: `content.yaml` → `build_script.py` → `script.js` populates 4 pages (Home/About, Education, Academia, Work Experience). Already dark, already monospace-intended, already teal-accented — the refresh **elevates**, it does not restart:

- Keep: black-base + dot motif, teal `#72DEC2` accent (it's the existing brand), the `×` list markers, the underline-sweep link hover, the yaml→build content pipeline, zero frameworks/dependencies.
- Fix: `font-family: "Robot Mono"` is a typo — the site currently renders in the generic monospace fallback. Replace the cdnfonts import entirely.
- Elevate: static 20px dot grid → layered dot atmosphere (§5); flat white text → tonal ink scale (§3); heavy glass cards (`blur(10px)`) → flat, thin-bordered panels (§7); no motion system → one orchestrated load sequence (§6).

## 3. Design tokens

```css
:root {
  /* Surfaces — never pure black; blue-tinted near-black */
  --bg-0: #08090B;        /* page base */
  --bg-1: #0D0F12;        /* elevated panel */
  --bg-2: #14171B;        /* hover / active panel */

  /* Ink — never pure white */
  --ink-0: #E8EAED;       /* headings, primary text */
  --ink-1: #A9B1B8;       /* body, descriptions */
  --ink-2: #6C757D;       /* meta: dates, locations, labels */
  --ink-3: #3A4046;       /* hairlines borders, disabled */

  /* Signal colors */
  --accent: #72DEC2;      /* phosphor teal — links, active nav, markers, live signals */
  --accent-dim: rgba(114, 222, 194, 0.35);
  --glow: rgba(114, 222, 194, 0.08);   /* aurora wash #1 */
  --ember: rgba(224, 164, 124, 0.05);  /* aurora wash #2 — faint warm counterpoint */

  /* Structure */
  --border: 1px solid rgba(232, 234, 237, 0.09);
  --radius: 4px;          /* small. no pill shapes, no rounded-2xl */
  --grid-gap: 24px;
  --measure: 66ch;        /* max text line length */

  /* Motion */
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --t-fast: 180ms; --t-med: 400ms; --t-slow: 800ms;
}
```

Color usage ratio ≈ 90% surfaces/ink, 8% teal, 2% ember. Teal is a *signal*, not a decoration: if everything is teal, nothing is. Ember never appears as text/UI — only inside aurora washes and the portrait's halftone shadow tint.

## 4. Typography

- **Primary — everything:** `"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace`. Self-host woff2 (weights 400, 500, 700 + 400 italic) or use Google Fonts; delete the cdnfonts import.
- **Accent — the "dreamy" counterpoint (optional but recommended):** `"Newsreader"` italic (Google Fonts, opsz axis), used ONLY for 2–3 emphasized words inside the hero tagline and section epigraphs. A soft italic serif floating inside strict mono is the single cheapest way to buy "ethereal."
- Scale (mono sizes look bigger than proportional — size down):
  - Display/name: `clamp(2.2rem, 5.5vw, 3.6rem)`, weight 500, `letter-spacing: -0.02em`, `line-height: 1.1`
  - h2 section: `1.15rem`, weight 500, preceded by an index label (below)
  - Body: `0.92rem / 1.75`, weight 400, color `--ink-1`, `max-width: var(--measure)`
  - Meta/labels: `0.7rem`, uppercase, `letter-spacing: 0.14em`, color `--ink-2`
- **Section index labels:** every h2 gets a machine prefix, e.g. `01 / EDUCATION`, `02 / ACADEMIA` — index in `--accent`, slash in `--ink-3`.
- **Terminal details (use 2–3, not all):** location line as coordinates — `46.01°N 8.96°E — Ticino, CH`; a blinking block cursor `▮` after the tagline (2s interval, subtle); dates in tabular figures right-aligned; DOIs rendered as `doi:10.1093/…` in `--ink-2` linking out; footer build line `last build: 2026-08-05 · hand-rolled, no frameworks`.
- No Inter, no Roboto, no Arial anywhere. No bold-everything: emphasis via color and spacing, weight 700 reserved for the name.

## 5. The dot language — three layers, one system

Pointillism is the identity. Three layers, all made of dots, all behind content (`position: fixed; pointer-events: none;` where applicable):

**L1 — Static grid (paper texture).** Keep the current idea, refine values: `background-image: radial-gradient(rgba(232,234,237,0.05) 1px, transparent 1px); background-size: 28px 28px;` masked with a radial vignette so it fades to nothing at the viewport edges (`mask-image: radial-gradient(ellipse 90% 80% at 50% 30%, black 40%, transparent 100%)`). It should be *felt*, not seen.

**L2 — Drifting particle field (the dream).** One `<canvas>`, fixed, z-index between grid and content. ~`min(140, viewportArea/14000)` dots; radius 0.5–1.6px; each dot: slow drift (4–10 px/s, individual heading), opacity "breathing" on a sine with individual phase & period 4–9s, base opacity 0.04–0.18. ~6% of dots are teal "signals" at up to 0.5 opacity with a 2px soft glow. Gentle mouse influence: within 120px, dots ease away at most 12px, spring back. **No connecting lines** — the plexus/constellation-with-lines effect is the #1 cliché of this genre; dots only. Pause via `IntersectionObserver`/`visibilitychange`; cap `devicePixelRatio` at 2; skip entirely under `prefers-reduced-motion` (render one static frame).

**L3 — The hero focal object (a dot render, never a plain photo).** The hero's right-hand focal element is a single ~190px canvas that dissolves into the background via a radial mask. **Chosen design → the "skeleton movement globe" (ships in `style-tile.html`):** the dot-globe *is* the mainspring barrel of an open-worked (skeletonised) watch caliber — a slowly rotating lat/long dot-globe, ink dots dense on the lit face, dissolving into ember on the dark limb, that meshes into an exposed **going train** of dotted gear-wheels cascading down-and-right (barrel → centre → third → fourth → escape wheel), each turning at its **correct relative speed** (barrel slow, escape fast) with teeth interleaving at the tangent points. Faint dotted **bridges/plates** sit behind the train; **ruby jewels** glow phosphor-teal at the wheel pivots; home still pulses teal at `46.01°N 8.96°E` on the globe face. It reads as looking into the back of a haute-horlogerie movement with a world for a barrel — a personal fusion of the owner's engineering and horology sides, and a callback to the coordinates motif (§4). Constraints: vanilla Canvas 2D, **dots only** — gear rims, teeth, bridges and balance are all discrete dots, never strokes (stroked rings/lines are the banned plexus cliché); pre-rendered dot sprites with an ink→ember ramp; DPR capped at 2; ~60fps; a single considered static frame under `prefers-reduced-motion` (train posed, teeth meshed). The mask runs wide (`circle at 50% 48%, #000 66%, rgba(0,0,0,0.7) 86%, transparent 99%`) so the train dissolves rather than clips. The full drop-in implementation ships in `style-tile.html`. *(Three alternates were explored and set aside and can be revived from the delivered variant tiles: the worldtimer-complication globe, a Swiss-lever escapement, and a rotating tourbillon cage — plus an orbital rocket-tracking globe and a plain observatory globe.)*
  - *Still relevant for actual photos:* wherever a real photograph appears (e.g. `media/me.jpeg` on an About page), never show it plainly — render it as a halftone dot matrix (sample luminance on a 3–4px grid, circle radius ∝ luminance, ink on transparent with faint ember shadows) at build time via Python/PIL or on a canvas. Photos don't exist on this site; dot renders do.

**Atmosphere on top:** two huge blurred radial washes, fixed, `filter: blur(120px)` or pre-blurred gradients — teal `--glow` upper-left, ember `--ember` lower-right, animating position imperceptibly slowly (60s loop). Plus film grain: inline SVG `feTurbulence` noise tile at 2.5–3.5% opacity, `mix-blend-mode: overlay`. Grain is what stops dark UIs from looking like flat vector mockups.

## 6. Motion

- **One orchestrated page-load, nothing else fancy.** On load: content blocks fade-up 12px, staggered 60ms apart, `--t-slow` `--ease-out`. Dot field fades in over 1.5s. That's the show.
- Scroll: publications/cards reveal once with the same fade-up (IntersectionObserver, `once: true`). No parallax, no scroll-jacking.
- Hover: links keep the underline sweep (existing `::after` pattern) in `--accent`; panels shift `--bg-1 → --bg-2` and border to `--accent-dim` over `--t-fast`. No transform: scale on cards.
- Every animation gated by `@media (prefers-reduced-motion: reduce)`.

## 7. Components (mapped to the real pages)

- **Header/nav:** keep sticky; `background: rgba(8,9,11,0.75); backdrop-filter: blur(8px)`; bottom hairline `--border`. Nav links as mono lowercase or small-caps labels; active page in `--accent` with the sweep underline persistent.
- **Hero (Home):** name in display size; tagline with 2–3 Newsreader-italic words (e.g. *"thoughtfully designed"*); coordinates line; social links as text — `[github]` `[linkedin]` in brackets, teal on hover — not icon buttons. Focal element = the L3 telemetry dot-globe, no border-radius frame, no border; let it dissolve into the background at its edges (radial mask).
- **Panels (education/work/academic items):** `background: --bg-1; border: var(--border); border-radius: var(--radius); padding: 1.25rem 1.5rem;` — **no backdrop-filter, no translucency stacks.** Left meta column or right-aligned meta (dates/location) in `--ink-2`. Optional detail: 6px corner tick marks (`+`) on the top corners of panels, `--ink-3` — a quiet observatory/blueprint touch.
- **Publications list:** the strongest content on the site — treat it like a dataset, not cards. Rows: year in `--accent` tabular figures, title in `--ink-0`, authors `--ink-2` (with "Escriba-Montagut, X." in `--ink-1` so he's findable), journal italic, `doi:` link. Hairline separators, no boxes. Group by year descending; count badge in the section header (`14 papers · 5 posters · 10 talks`) — pull the numbers from the yaml at build time.
- **Work/education entries:** keep `×` list markers in `--accent`. Timeline feel via the meta column, not via drawn timelines.
- **Footer:** hairline top, build-info line (§4), copyright. Nothing else.
- `::selection { background: var(--accent); color: var(--bg-0); }` — keep.

## 8. Guardrails (non-negotiable)

- Contrast: body text ≥ 4.5:1 against its surface (`--ink-1` on `--bg-0/1` passes; never set body text below `--ink-2`).
- Performance: no frameworks, no build-step JS deps; total JS < 30KB; fonts ≤ 2 families, subset woff2, `font-display: swap`; canvas work capped as in §5; Lighthouse ≥ 95 across the board.
- The dot/atmosphere layers never intercept pointer events and never cause layout shift.
- Semantic HTML, visible `:focus-visible` outlines (`2px solid var(--accent)`, offset 2px), keyboard-navigable menu.
- Mobile: particle count halved, mouse-influence off, blur washes static.

**Never:** purple/indigo SaaS gradients · Inter/Roboto · connecting-line particle networks · glassmorphism card stacks · big radii/pill buttons · emoji in UI · three-icon-boxes marketing layouts · typing-effect on body copy · scroll-jacking · stock imagery.

## 9. Implementation path (for Claude Code)

1. **Tokens & type** — rewrite `style.css` around the §3 variables; fix the font import/typo; apply the §4 scale. (Biggest visible win, zero risk.)
2. **Dot atmosphere** — refine L1 grid values; add `dots.js` (L2 canvas, ~80 lines, vanilla) + aurora washes + grain overlay in CSS/inline SVG.
3. **Components** — restyle header, hero, panels, publications-as-dataset, footer per §7; add section index labels (needs a small template tweak in `build_script.py` for indices and count badges).
4. **Hero globe** — drop the skeleton-movement globe (L3) into the hero; it's a self-contained ~18KB vanilla-canvas IIFE in `style-tile.html`, no build step. (Any real photo elsewhere still gets the halftone treatment via a build-time PIL pass.)
5. **Motion & polish** — load stagger, scroll reveals, reduced-motion gates; favicon redrawn as a 5×5 dot-matrix "X"; OG image in the same style.

Each phase ships independently — the site stays live and coherent between phases. Content (`content.yaml`) and the build pipeline stay untouched except where noted.

## 10. One-line brief (for quick prompts)

> Dark ethereal-terminal personal site: near-black `#08090B`, JetBrains Mono everywhere with rare Newsreader-italic accent words, phosphor-teal `#72DEC2` signals, pointillist identity (faint dot grid + slow-breathing particle canvas with no connecting lines + a skeleton-movement dot-globe hero: the globe is the mainspring barrel of an open-worked watch caliber, meshing into a going train of dotted gears turning at correct ratios with teal ruby jewels, home pinging at 46.01°N 8.96°E), aurora blur washes in teal/ember, film grain, flat thin-bordered panels, publications as a dataset with hairline rows, one staggered load animation, `prefers-reduced-motion` respected, no frameworks, never purple gradients / Inter / glassmorphism.

---
*Compiled 2026-08-05 from trend research (technical-mono & dreamy-soft 2026 aesthetics, halftone/dither CSS & WebGL techniques) + audit of the current repo. Companion file: `style-tile.html` — a live demo of these tokens.*
