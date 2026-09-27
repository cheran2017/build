// Checks that the camera never flies through geometry (needs `npm run dev`).
// Samples the journey every 0.1 beat after the laptop portal, and for every visible mesh tests the camera
// position against the mesh's bounding box in the mesh's own space (exact for rotated panels).
//   node scripts/collide.mjs [baseUrl] [--mobile]

import { join } from "node:path";
import puppeteer from "puppeteer-core";

const args = process.argv.slice(2);
const mobile = args.includes("--mobile");
const base = args.find((a) => !a.startsWith("--")) ?? "http://localhost:3100/";

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
  userDataDir: join(process.cwd(), "reference", ".chrome-profile"),
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport(mobile ? { width: 390, height: 844, isMobile: true, hasTouch: true } : { width: 960, height: 600 });
await page.goto(`${base}?view=3d&at=0`, { waitUntil: "networkidle2", timeout: 120000 });
await page.waitForFunction(() => !document.querySelector(".loader") && window.__utn && window.__utnScene, { timeout: 120000 });

const { samples, throughD } = await page.evaluate(() => {
  const j = window.__utn.journey;
  const start = j.beatOf("cross") + 0.3;
  const out = [];
  for (let b = start; b <= j.total; b += 0.1) out.push(b / j.total);
  // flying through the D's counter is intended: the camera is inside the letter's box but in the hole
  return { samples: out, throughD: [j.p("i5"), j.p("dThrough")] };
});

const hits = [];
for (const p of samples) {
  await page.evaluate((v) => window.__utn.jump(v), p);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const found = await page.evaluate(() => {
    const scene = window.__utnScene;
    const cam = window.__utnCam.position;
    const res = [];
    scene.traverseVisible((o) => {
      if (!o.isMesh || o.isInstancedMesh || o.isLine2 || o.isLineSegments2 || !o.geometry) return;
      const g = o.geometry;
      if (!g.boundingBox) g.computeBoundingBox();
      const bb = g.boundingBox;
      if (!bb || bb.isEmpty()) return;
      const size = { x: bb.max.x - bb.min.x, y: bb.max.y - bb.min.y, z: bb.max.z - bb.min.z };
      // flat things (grids, image planes) get a thin slab so passing a near-miss still counts
      const local = cam.clone().applyMatrix4(o.matrixWorld.clone().invert());
      const s = o.getWorldScale(cam.clone());
      const m = 0.35 / Math.max(1e-6, Math.min(s.x, s.y, s.z));
      const inside =
        local.x > bb.min.x - m && local.x < bb.max.x + m && local.y > bb.min.y - m && local.y < bb.max.y + m && local.z > bb.min.z - m && local.z < bb.max.z + m;
      if (!inside) return;
      // ignore the huge background grids (camera is always above them)
      if (size.x * s.x > 100) return;
      const w = o.getWorldPosition(cam.clone());
      res.push(`${g.type} ${(size.x * s.x).toFixed(1)}x${(size.y * s.y).toFixed(1)}x${(size.z * s.z).toFixed(1)} @ ${w.x.toFixed(1)},${w.y.toFixed(1)},${w.z.toFixed(1)}`);
    });
    return { res, cam: `${cam.x.toFixed(1)},${cam.y.toFixed(1)},${cam.z.toFixed(1)}` };
  });
  if (p > throughD[0] && p < throughD[1]) found.res = found.res.filter((r) => !r.startsWith("TextGeometry"));
  if (found.res.length) hits.push({ p, ...found });
  process.stdout.write(found.res.length ? "x" : ".");
}

const keyAt = await page.evaluate(
  (ps) =>
    ps.map((p) => {
      const j = window.__utn.journey;
      let last = j.keys[0].id;
      for (const k of j.keys) if (j.p(k.id) <= p) last = k.id;
      return last;
    }),
  hits.map((h) => h.p),
);

console.log(`\n${samples.length} samples, ${hits.length} with the camera inside geometry`);
hits.forEach((h, i) => console.log(`  after ${keyAt[i]} (p=${h.p.toFixed(4)}) cam ${h.cam}\n    ${[...new Set(h.res)].slice(0, 4).join("\n    ")}`));
await browser.close();
process.exit(hits.length ? 1 : 0);
