# site-refresh — handoff package for Claude Code

Everything Claude Code needs to migrate the current personal site (escri11.github.io) from its
old look to the new **"ethereal terminal"** design — a dark, pointillist, monospace aesthetic with a
skeleton-watch-movement dot-globe as the hero.

## How to use it
1. Drop this whole `site-refresh/` folder into the **root of your website repo** (next to `content.yaml`,
   `build_script.py`, `index.html`, …).
2. From that repo root, start Claude Code.
3. Give it the contents of **`PROMPT.md`** (paste it, or say: "follow `site-refresh/PROMPT.md`").
   That prompt tells it to read your old code + content and migrate it phase by phase, preserving your
   `content.yaml` → `build_script.py` → `script.js` build pipeline and all your content.

## What's in here
- **`PROMPT.md`** — the migration prompt to run in Claude Code. Start here.
- **`design-directives.md`** — the authoritative design spec (tokens, type, color, the dot/atmosphere
  system, the hero globe, components, motion, guardrails, phased build path). The single source of truth.
- **`style-tile.html`** — a working reference page implementing the whole system on your real content.
  Open it in a browser to see the target; Claude Code lifts exact code from it.
- **`assets/hero-globe.js`** — the CHOSEN hero: the skeleton-movement dot-globe. Drop-in vanilla
  Canvas 2D (needs a `<canvas id="halftone">` inside `.portrait`).
- **`assets/particles.js`** — the drifting pointillist background field (`<canvas id="dots">`).
- **`assets/load-reveal.js`** — the staggered fade-up on page load.
- **`assets/alternates/`** — five other hero globes you can swap in (same drop-in shape):
  `globe-worldtimer.js`, `globe-escapement.js`, `globe-tourbillon.js`, `globe-orbital.js`,
  `globe-observatory.js`.

## Ground rules baked into the prompt
No frameworks or dependencies (stays vanilla HTML/CSS/JS). Content is never changed — only re-presented.
The `make build` pipeline keeps working. Everything respects `prefers-reduced-motion`, keyboard focus,
and contrast. Work happens in small phases so the site stays shippable throughout.

## Swapping the hero globe
The skeleton globe is the pick. To try another, point the hero `<script>` at one of
`assets/alternates/*.js` instead of `assets/hero-globe.js` — they all target the same `#halftone` canvas.
