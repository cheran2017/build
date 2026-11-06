# Metayb assets (composed from metayb.ai by scripts/compose-metayb-assets.mjs; drop your own files here to replace them)

Put Metayb's own images and videos in this folder using the paths below, then run:

```bash
npm run media          # converts to WebP (max 1600px), copies videos, updates lib/media.json
npm run content:check  # lists everything still borrowed from the reference pack
```

Any image format works (`.jpg`, `.png`, `.webp`, `.avif`…); the name is what matters. `assets/scenes/founder.jpg` replaces the founder photo, and so on.

## Collections — the folder replaces the reference set

As soon as one file is in one of these folders, the whole reference folder is dropped and yours is used. Any number of files works, shown in file-name order.

| Folder | What it is | Where it shows |
|---|---|---|
| `gallery/` | Member launch posts, product screenshots, wins | BUILD helix tunnel, LAUNCH flying screens, finale spiral, classic gallery |
| `creators/` | Social-proof badges (creator + follower count), wide ~5:1 | IDEA stop 3 (first six), classic hero |

## Slots — one file replaces one image

| File | What it is | Where it shows |
|---|---|---|
| `scenes/founder` | Founder photo, portrait ~3:4 | IDEA stop 4 |
| `scenes/skool-badge` | Award or credibility badge under the founder, wide | IDEA stop 4 |
| `scenes/community-collage` | Collage of people/creators talking about UTN | IDEA stop 3 |
| `scenes/icon-idea` | Small idea icon, square, transparent PNG | IDEA stop 2 |
| `scenes/coaching-call` | Screenshot of a live coaching call | BUILD suspended LIVE monitor |
| `scenes/members-map` | Where members are, map screenshot | BUILD community screen |
| `scenes/builders-faces` | Faces of members | Under the map |
| `framework/part-1-idea` | Icon for framework part 1, square | BUILD pillar 01 |
| `framework/part-2-build` | Icon for framework part 2, square | BUILD pillar 02 |
| `framework/part-3-launch` | Icon for framework part 3, square | BUILD pillar 03 |
| `wins/win-01`, `wins/win-02`, `wins/win-03` | Screenshots for testimonial screens, 16:9 | LAUNCH monoliths and story modals (which story uses which is set in `lib/content.ts`) |

## Ambient loops (optional) — Higgsfield / Seedance

Muted, seamless loops, 1080p or less, ideally under 8 MB each. Each slot turns on when its file exists.

| File | Shape | Where it plays |
|---|---|---|
| `ambient/laptop-screen.mp4` | 16:10 | On the laptop screen in the white studio |
| `ambient/idea.mp4` | 16:9 | Huge backdrop above the IDEA word |
| `ambient/launch.mp4` | 16:9 | Revealed behind LAUNCH as its letters lift off |

`.webm` works too.

## Words and numbers

Text isn't here. Founder name and bio, testimonials, stats, prices and links are in `lib/content.ts`, each marked `// REF` or `TODO` until replaced.
