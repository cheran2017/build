// Lists shader programs created *after* loading finished (needs `npm run dev`). Every one of these compiles
// mid-scroll, which on Windows/ANGLE can freeze the page for seconds. The goal is an empty list.
//   node scripts/program-audit.mjs [baseUrl] [--mobile]

import { join } from "node:path";
import puppeteer from "puppeteer-core";

const args = process.argv.slice(2);
const mobile = args.includes("--mobile");
const base = args.find((a) => !a.startsWith("--")) ?? "http://localhost:3100/";

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
  userDataDir: join(process.cwd(), "reference", ".chrome-profile"),
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage();
await page.setViewport(mobile ? { width: 390, height: 844, isMobile: true, hasTouch: true } : { width: 1280, height: 800 });
await page.goto(`${base}?view=3d&at=0`, { waitUntil: "networkidle2", timeout: 120000 });
await page.waitForFunction(() => !document.querySelector(".loader") && window.__utn && window.__utnGL, { timeout: 120000 });

const initial = await page.evaluate(() => {
  window.__seen = new Set(window.__utnGL.info.programs.map((p) => p.cacheKey));
  return window.__seen.size;
});
console.log(`programs after loading: ${initial}`);

const steps = await page.evaluate(() => {
  const j = window.__utn.journey;
  const out = [];
  for (let b = 0; b <= j.total; b += 0.1) out.push(b / j.total);
  return out;
});

const late = [];
for (const p of steps) {
  await page.evaluate((v) => window.__utn.jump(v), p);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const fresh = await page.evaluate(() => {
    const out = [];
    for (const prog of window.__utnGL.info.programs) {
      if (window.__seen.has(prog.cacheKey)) continue;
      window.__seen.add(prog.cacheKey);
      out.push({ name: prog.name, key: prog.cacheKey.slice(0, 160) });
    }
    return out;
  });
  if (fresh.length) {
    const at = await page.evaluate((v) => {
      const j = window.__utn.journey;
      let last = j.keys[0].id;
      for (const k of j.keys) if (j.p(k.id) <= v) last = k.id;
      return last;
    }, p);
    fresh.forEach((f) => late.push({ p, at, ...f }));
  }
}
console.log(`programs created mid-journey: ${late.length}`);
late.forEach((l) => console.log(`  after ${l.at} (p=${l.p.toFixed(3)}): ${l.name}\n    ${l.key}`));
await browser.close();
process.exit(late.length ? 1 : 0);
