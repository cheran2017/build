// Watches the adaptive pixel ratio settle (needs `npm run dev`). Software GL is slow, so it should step down.
//   node scripts/dpr-check.mjs [baseUrl]

import { join } from "node:path";
import puppeteer from "puppeteer-core";

const base = process.argv[2] ?? "http://localhost:3100/";
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
  userDataDir: join(process.cwd(), "reference", ".chrome-profile"),
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto(`${base}?at=helix`, { waitUntil: "networkidle2", timeout: 120000 });
await page.waitForFunction(() => !document.querySelector(".loader") && window.__utnGL, { timeout: 120000 });

const read = () => page.evaluate(() => window.__utnGL.getPixelRatio());
const fps = () =>
  page.evaluate(
    () =>
      new Promise((res) => {
        let n = 0;
        const t0 = performance.now();
        const f = () => {
          n++;
          if (performance.now() - t0 < 2000) requestAnimationFrame(f);
          else res(n / 2);
        };
        f();
      }),
  );

const t0 = Date.now();
for (let i = 0; i < 6; i++) {
  console.log(`t=${((Date.now() - t0) / 1000).toFixed(0).padStart(2)}s  dpr ${(await read()).toFixed(2)}  ~${(await fps()).toFixed(0)} fps`);
  await new Promise((r) => setTimeout(r, 1500));
}
await browser.close();
