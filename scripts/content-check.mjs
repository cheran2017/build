// Go-live gate: lists everything still borrowed from the reference pack, placeholder links,
// and media paths in lib/content.ts that don't exist. Exits 1 while anything is left.
//   npm run content:check

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";

const ROOT = process.cwd();
const content = readFileSync(join(ROOT, "lib", "content.ts"), "utf8").split(/\r?\n/);
const manifest = JSON.parse(readFileSync(join(ROOT, "lib", "media.json"), "utf8"));
const ASSETS = join(ROOT, "assets");
const walk = (dir) =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]))
    : [];
const provided = new Set(
  walk(ASSETS)
    .filter((f) => extname(f) && !f.endsWith(".md"))
    .map((f) => relative(ASSETS, f).split("\\").join("/").replace(/\.[^.]+$/, "")),
);

let problems = 0;
const section = (title, lines) => {
  if (!lines.length) return console.log(`✓ ${title}: none`);
  problems += lines.length;
  console.log(`✗ ${title} (${lines.length}):`);
  lines.forEach((l) => console.log(`    ${l}`));
};

// 1. reference words and numbers
section(
  "Reference (AI Builders) text still in lib/content.ts",
  content.flatMap((l, i) => (/\/\/ REF\b/.test(l) ? [`line ${i + 1}: ${l.trim().slice(0, 110)}`] : [])),
);

// 2. placeholder links
section(
  "Placeholder links",
  content.flatMap((l, i) => (/TODO/.test(l) && /["']#/.test(l) ? [`line ${i + 1}: ${l.trim()}`] : [])),
);

// 3. images still from the reference pack (no UTN file in assets/ for that slot or collection)
const collections = ["gallery", "creators"];
const refImages = Object.keys(manifest)
  .map((k) => k.replace(/^\/media\//, ""))
  .filter((p) => !p.startsWith("ambient/") && !p.startsWith("benefits/") && !p.startsWith("framework/marketing"))
  .filter((p) => {
    const slot = p.replace(/\.[^.]+$/, "");
    const coll = collections.find((c) => slot.startsWith(`${c}/`));
    if (coll) return ![...provided].some((s) => s.startsWith(`${coll}/`));
    return !provided.has(slot);
  });
const grouped = {};
for (const p of refImages) (grouped[p.split("/")[0]] ??= []).push(p.split("/").slice(1).join("/"));
section(
  "Images still from the reference pack (add yours to assets/, see assets/README.md)",
  Object.entries(grouped).map(([dir, files]) => `${dir}/: ${files.length > 4 ? `${files.length} files` : files.join(", ")}`),
);

// 4. literal media paths in content.ts that aren't published (code only: doc comments hold example paths)
const code = content
  .filter((l) => !/^\s*(\/\/|\/?\*)/.test(l))
  .map((l) => l.replace(/\/\/.*$/, ""))
  .join("\n");
const literal = [...new Set(code.match(/\/media\/[a-z0-9_\-/]+\.[a-z0-9]+/gi) ?? [])];
section(
  "Media paths in lib/content.ts that don't exist",
  literal.filter((p) => !manifest[p]),
);

console.log(problems ? `\n${problems} item(s) to replace before utn.com goes live.` : "\nReady: nothing borrowed or missing.");
process.exit(problems ? 1 : 0);
