# UTN — immersive 3D site

A single scroll-driven camera journey: white studio → laptop portal → **IDEA** → **BUILD** → **LAUNCH** → everything converges on **UTN** → plans.
The creative brief is [UTN_MASTER_PROMPT.md](UTN_MASTER_PROMPT.md).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Useful URLs while developing:

| URL | What it does |
|---|---|
| `/?at=i3` | Jump to a journey key once loaded (keys are in `lib/journey.ts`, e.g. `r0`, `idea`, `p2`, `helix`, `s0`, `final`). Works in production too, so `?at=launch` is a shareable deep link |
| `/?at=cross@-0.3` | Key plus an offset in beats |
| `/?at=0.42` | Jump to a raw progress value (0–1) |
| `/?view=classic` | The flat HTML fallback (shown automatically for reduced motion or no WebGL) |
| `/?view=3d` | Force the 3D tour even with reduced motion on |

## Where things live

| Path | Purpose |
|---|---|
| `lib/content.ts` | **Every word, number and asset path.** Values marked `// REF` are placeholders (see below) |
| `lib/journey.ts` | Camera keyframes, beats, world layout, chapter stops. Separate desktop and mobile values |
| `components/Experience.tsx` | Mode detection, loader, server-rendered story; lazy-loads `Immersive` |
| `components/Immersive.tsx` | Lenis + GSAP ScrollTrigger master scroll, the canvas, overlays, plans |
| `components/canvas/` | The single R3F scene: `Studio`, `Tunnel`, `IdeaWorld`, `BuildWorld`, `LaunchWorld`, `Finale`, shared `parts`; adaptive quality in `Stage` |
| `components/overlays/` | HTML cards keyed to beats, chrome, loader, video modal, plans/FAQ, classic view |
| `assets/` | **Drop UTN's own images and loops here** (see [assets/README.md](assets/README.md)) |
| `public/media/` | Published WebP textures and loops, built by `npm run media` |
| `lib/fonts/` | Inter Tight ExtraBold as a Three.js typeface (built by `npm run typeface`) |
| `scripts/shoot.mjs` | Screenshots journey points with local Chrome: `node scripts/shoot.mjs http://localhost:3000/ r0,idea,final [--mobile]` |

Tuning a stop means editing its keyframe (`travel`, `hold`, position, look target, optional `bgWindow` for where a colour change happens) in `lib/journey.ts`. Overlay timing uses the same key names in `components/overlays/Overlays.tsx`.

## How it loads

`Experience` is tiny: it picks the mode, shows the loader, and server-renders the whole story as hidden text so crawlers and no-JS visitors get every word. The 3D tour (`Immersive`: three.js, R3F, GSAP, Lenis, overlays) is a lazy chunk. Initial JS is about 176 KB gzipped, and the classic view never downloads three.js.

While running, the scene measures its frame rate every second and lowers the pixel ratio (to 0.8, or 0.75 on phones) when frames drop, jumping straight to the floor below 20 fps, and reclaims resolution after three good seconds. Rendering stops entirely once the plans section covers the canvas, and restarts when the visitor scrolls back up.

## Swapping in UTN's content

1. Put images and loops in `assets/` using the names in [assets/README.md](assets/README.md), then `npm run media`. Gallery and creator folders adapt to any number of files, and layouts cycle images to stay full.
2. Replace every `// REF` and `TODO` line in `lib/content.ts` (founder, testimonials, stats, prices, links).
3. `npm run content:check` lists everything still borrowed or missing and exits non-zero until it's all gone. Use it as the go-live gate.

To preview where ambient loops play before the real Higgsfield / Seedance files exist, `node scripts/make-test-loops.mjs` records labelled placeholders into `reference/test-loops/`; copy them into `assets/ambient/` and run `npm run media`.

## QA scripts (Chrome must be installed; they use it headless)

| Command | Needs | What it checks |
|---|---|---|
| `npm run qa:collide` | `npm run dev` | Samples the camera every 0.1 beat on the desktop and mobile paths and fails if it's ever inside geometry (the fly-through of the D is allowed) |
| `npm run qa:fly` | `npm run dev` | Captures every transition at quarter points into contact sheets in `reference/screens/`, with draw calls per frame. Add `--mobile` via `node scripts/flythrough.mjs <url> --mobile` |
| `npm run qa:smoke` | `npm run build && npm start` | Loader, no dev hooks, skip link first in tab order, chapter nav, video modal + Escape, render loop pauses under the plans and resumes, FAQ dialog, classic view has no canvas, no console errors |
| `node scripts/dpr-check.mjs` | `npm run dev` | Watches the adaptive pixel ratio settle (software GL should drop it to the floor within a couple of seconds) |

Always run `qa:collide` after moving a keyframe or an exhibit: an overlapping path looks fine at the stops and only fails in between.

## Before this goes live

The asset pack was copied from aibuilders.vip/new for this build. The founder, testimonials, member screenshots, creator badges, numbers and pricing all belong to AI Builders. Replace them with UTN's own before publishing (see "Swapping in UTN's content"; `npm run content:check` must pass). Testimonials are quoted verbatim, so replace them whole rather than editing them to say "UTN".
