// Flies the whole journey in one page load (needs `npm run dev`), captures every transition
// at quarter / mid / three-quarter points, logs renderer stats, and tiles labelled contact sheets.
//   node scripts/flythrough.mjs [baseUrl] [--mobile]
// Output: reference/screens/flythrough-<n>.png

import { mkdirSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";
import sharp from "sharp";

const args = process.argv.slice(2);
const mobile = args.includes("--mobile");
const base = args.find((a) => !a.startsWith("--")) ?? "http://localhost:3100/";
const out = join(process.cwd(), "reference", "screens");
mkdirSync(out, { recursive: true });

const view = mobile ? { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true } : { width: 1280, height: 800 };
const thumb = mobile ? { w: 195, h: 422, cols: 8 } : { w: 400, h: 250, cols: 5 };
const rowsPerSheet = mobile ? 3 : 6;

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
  userDataDir: join(process.cwd(), "reference", ".chrome-profile"),
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--hide-scrollbars"],
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.setViewport(view);
await page.goto(`${base}?view=3d&at=0`, { waitUntil: "networkidle2", timeout: 120000 });
await page.waitForFunction(() => !document.querySelector(".loader") && window.__utn, { timeout: 120000 });

const points = await page.evaluate(() => {
  const j = window.__utn.journey;
  const list = [];
  j.keys.forEach((k, i) => {
    if (i === 0 || k.travel <= 0) return;
    const prev = j.keys[i - 1].id;
    const end = j.beatOf(k.id);
    const fracs = k.travel >= 1.4 ? [0.25, 0.5, 0.75] : [0.5];
    for (const f of fracs) list.push({ label: `${prev}→${k.id} ${Math.round(f * 100)}%`, p: (end - k.travel * (1 - f)) / j.total });
  });
  return list;
});

const frames = [];
for (const pt of points) {
  await page.evaluate((p) => window.__utn.jump(p), pt.p);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 250)))));
  const info = await page.evaluate(() => {
    const i = window.__utnGL.info;
    return { calls: i.render.calls, tris: i.render.triangles, tex: i.memory.textures, geo: i.memory.geometries };
  });
  const png = await page.screenshot({ type: "png" });
  frames.push({ ...pt, info, png });
  process.stdout.write(".");
}
console.log(`\n${frames.length} frames`);

const heavy = [...frames].sort((a, b) => b.info.calls - a.info.calls).slice(0, 8);
console.log("heaviest frames (draw calls / triangles):");
heavy.forEach((f) => console.log(`  ${f.info.calls.toString().padStart(4)} calls  ${Math.round(f.info.tris / 1000).toString().padStart(5)}k tris  ${f.label}`));
console.log(`GPU memory: ${frames[frames.length - 1].info.tex} textures, ${frames[frames.length - 1].info.geo} geometries`);
if (errors.length) console.log("errors:\n  " + [...new Set(errors)].slice(0, 10).join("\n  "));

// contact sheets
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const perSheet = thumb.cols * rowsPerSheet;
for (let s = 0; s * perSheet < frames.length; s++) {
  const chunk = frames.slice(s * perSheet, (s + 1) * perSheet);
  const rows = Math.ceil(chunk.length / thumb.cols);
  const tiles = await Promise.all(
    chunk.map(async (f, i) => {
      const img = await sharp(f.png).resize(thumb.w, thumb.h).toBuffer();
      const label = Buffer.from(
        `<svg width="${thumb.w}" height="22"><rect width="100%" height="100%" fill="rgba(0,0,0,0.72)"/><text x="6" y="15" font-family="Arial" font-size="${mobile ? 10 : 13}" fill="#fff">${esc(f.label)} · ${f.info.calls}dc</text></svg>`,
      );
      const tile = await sharp(img).composite([{ input: label, top: 0, left: 0 }]).toBuffer();
      return { input: tile, left: (i % thumb.cols) * thumb.w, top: Math.floor(i / thumb.cols) * thumb.h };
    }),
  );
  const file = join(out, `${mobile ? "m-" : ""}flythrough-${s + 1}.png`);
  await sharp({ create: { width: thumb.cols * thumb.w, height: rows * thumb.h, channels: 3, background: "#222" } })
    .composite(tiles)
    .png()
    .toFile(file);
  console.log("sheet", file);
}

await browser.close();
