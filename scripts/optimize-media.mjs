// Builds public/media from source images, and writes lib/media.json (path -> [width, height]).
//
//   npm run media                 assets/**  -> public/media/**   (UTN's own files; see assets/README.md)
//   npm run media -- --reference  reference/raw-media -> public/media (how the reference pack was built)
//
// Images become WebP, max 1600px. Videos (.mp4/.webm) are copied as they are.
// In the collection folders (gallery, creators) the assets/ folder *replaces* the published one, so the
// reference images there disappear. Everywhere else a file replaces only the slot with the same name.

import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const OUT = join(ROOT, "public", "media");
const IMAGE = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".tif", ".tiff"]);
const VIDEO = new Set([".mp4", ".webm"]);
const COLLECTIONS = ["gallery", "creators"];

const walk = (dir) =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]))
    : [];
const slash = (p) => p.split("\\").join("/");

async function toWebp(input, outNoExt) {
  const output = `${outNoExt}.webp`;
  mkdirSync(dirname(output), { recursive: true });
  const info = await sharp(input)
    .rotate() // respect EXIF orientation from phone photos
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80, effort: 5 })
    .toFile(output);
  return { output, info, before: statSync(input).size };
}

let jobs = [];

if (process.argv.includes("--reference")) {
  // the reference pack's original file names -> published slot names
  const RAW = join(ROOT, "reference", "raw-media");
  const MAP = {
    "coaching-call.webp": "scenes/coaching-call",
    "founder-skool.webp": "scenes/founder",
    "community-collage.webp": "scenes/community-collage",
    "members-map.webp": "scenes/members-map",
    "builders-faces.webp": "scenes/builders-faces",
    "icon-idea.webp": "scenes/icon-idea",
    "skool-badge.webp": "scenes/skool-badge",
    "framework/part-1-idea.png": "framework/part-1-idea",
    "framework/part-2-build.png": "framework/part-2-build",
    "framework/part-3-launch.png": "framework/part-3-launch",
    "framework/marketing.png": "framework/marketing",
    "benefits/framework.png": "benefits/framework",
    "benefits/coaching.png": "benefits/coaching",
    "benefits/community.png": "benefits/community",
    "benefits/discounts.png": "benefits/discounts",
  };
  for (let i = 1; i <= 17; i++) MAP[`gallery/launch-${String(i).padStart(2, "0")}.png`] = `gallery/launch-${String(i).padStart(2, "0")}`;
  for (let i = 1; i <= 6; i++) MAP[`proof/proof-0${i}.png`] = `creators/creator-0${i}`;
  for (let i = 7; i <= 9; i++) MAP[`proof/proof-0${i}.png`] = `wins/win-0${i - 6}`;
  // never overwrite something UTN has already supplied in assets/
  const own = new Set(walk(join(ROOT, "assets")).map((f) => slash(relative(join(ROOT, "assets"), f)).replace(/\.[^.]+$/, "")));
  const ownColl = COLLECTIONS.filter((c) => [...own].some((s) => s.startsWith(`${c}/`)));
  jobs = Object.entries(MAP)
    .filter(([, dst]) => !own.has(dst) && !ownColl.some((c) => dst.startsWith(`${c}/`)))
    .map(([src, dst]) => ({ input: join(RAW, src), dst }));
} else {
  const SRC = join(ROOT, "assets");
  const files = walk(SRC).filter((f) => IMAGE.has(extname(f).toLowerCase()) || VIDEO.has(extname(f).toLowerCase()));
  if (!files.length) {
    console.log("assets/ has no images or videos yet (see assets/README.md). Rebuilding the manifest only.");
  }
  // a collection folder in assets/ replaces the published one wholesale
  for (const c of COLLECTIONS) {
    if (files.some((f) => slash(relative(SRC, f)).startsWith(`${c}/`)) && existsSync(join(OUT, c))) {
      rmSync(join(OUT, c), { recursive: true, force: true });
      console.log(`replacing public/media/${c}/ with assets/${c}/`);
    }
  }
  jobs = files.map((f) => ({ input: f, dst: slash(relative(SRC, f)).replace(/\.[^.]+$/, ""), video: VIDEO.has(extname(f).toLowerCase()) }));
}

let before = 0;
let after = 0;
for (const job of jobs) {
  if (!existsSync(job.input)) {
    console.warn("missing", job.input);
    continue;
  }
  if (job.video) {
    const out = join(OUT, `${job.dst}${extname(job.input).toLowerCase()}`);
    mkdirSync(dirname(out), { recursive: true });
    // one file per slot: drop the other container if the slot switched between .mp4 and .webm
    for (const ext of VIDEO) if (join(OUT, `${job.dst}${ext}`) !== out) rmSync(join(OUT, `${job.dst}${ext}`), { force: true });
    copyFileSync(job.input, out);
    const mb = statSync(out).size / 1048576;
    console.log(`${job.dst}${extname(job.input)}  video  ${mb.toFixed(1)} MB${mb > 8 ? "  (large: aim for under 8 MB)" : ""}`);
    continue;
  }
  const { output, info, before: b } = await toWebp(job.input, join(OUT, job.dst));
  before += b;
  after += info.size;
  console.log(`${slash(relative(OUT, output))}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
}

// manifest: every published file, so the site knows aspect ratios before textures load
const manifest = {};
for (const f of walk(OUT).sort()) {
  const ext = extname(f).toLowerCase();
  const key = `/media/${slash(relative(OUT, f))}`;
  if (VIDEO.has(ext)) manifest[key] = [0, 0];
  else if (IMAGE.has(ext)) {
    const m = await sharp(f).metadata();
    manifest[key] = [m.width, m.height];
  }
}
writeFileSync(join(ROOT, "lib", "media.json"), JSON.stringify(manifest, null, 2) + "\n");
if (before) console.log(`\nconverted ${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(1)} MB`);
console.log(`manifest: ${Object.keys(manifest).length} files -> lib/media.json`);
