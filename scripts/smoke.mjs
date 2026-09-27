// Production smoke test (needs `npm run build && npm start`).
// Loads the page, waits for the studio, checks dev-only hooks are absent, reports what loaded, and exercises
// the skip link, chapter nav, a story video button, and the FAQ dialog.
//   node scripts/smoke.mjs [baseUrl]

import { join } from "node:path";
import puppeteer from "puppeteer-core";

const base = process.argv[2] ?? "http://localhost:3200/";
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
  userDataDir: join(process.cwd(), "reference", ".chrome-profile"),
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setCacheEnabled(false);
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
const bytes = { js: 0, img: 0, font: 0, other: 0 };
page.on("response", async (r) => {
  const len = Number(r.headers()["content-length"] ?? 0) || (await r.buffer().catch(() => Buffer.alloc(0))).length;
  const t = r.request().resourceType();
  bytes[t === "script" ? "js" : t === "image" ? "img" : t === "font" ? "font" : "other"] += len;
});
await page.setViewport({ width: 1280, height: 800 });

const ok = (label, cond) => console.log(`${cond ? "PASS" : "FAIL"}  ${label}`);

const t0 = Date.now();
await page.goto(base, { waitUntil: "domcontentloaded" });
const initialScripts = await page.$$eval("script[src]", (s) => s.map((e) => e.getAttribute("src")));
await page.waitForFunction(() => !document.querySelector(".loader"), { timeout: 120000 });
console.log(`studio ready in ${((Date.now() - t0) / 1000).toFixed(1)}s (software GL)`);
console.log(`initial <script> tags: ${initialScripts.length}`);
console.log(`transferred: js ${(bytes.js / 1024).toFixed(0)} KB, images ${(bytes.img / 1024).toFixed(0)} KB, fonts ${(bytes.font / 1024).toFixed(0)} KB, other ${(bytes.other / 1024).toFixed(0)} KB`);

ok("dev hooks absent in production", await page.evaluate(() => !("__utn" in window) && !("__utnGL" in window)));
ok("canvas is aria-hidden", await page.evaluate(() => document.querySelector(".stage")?.getAttribute("aria-hidden") === "true"));

// skip link is the first tab stop
await page.keyboard.press("Tab");
ok("first Tab focuses 'Skip the 3D tour'", await page.evaluate(() => document.activeElement?.classList.contains("skip-link")));

// chapter nav: jump to Launch
await page.evaluate(() => [...document.querySelectorAll(".chapter-btn")].find((b) => b.textContent?.includes("Launch"))?.click());
await new Promise((r) => setTimeout(r, 3500));
const launchVisible = await page.evaluate(() =>
  [...document.querySelectorAll(".ov")].some((s) => getComputedStyle(s).visibility === "visible" && s.textContent?.includes("Now it happens")),
);
ok("chapter nav 'Launch' lands on the LAUNCH chapter card", launchVisible);

// story button opens the modal, Escape closes it
await page.evaluate(() => window.scrollBy(0, window.innerHeight * 1.6));
await page.waitForFunction(() => [...document.querySelectorAll(".ov .play")].some((b) => getComputedStyle(b.closest(".ov")).visibility === "visible"), {
  timeout: 15000,
}).catch(() => {});
const clicked = await page.evaluate(() => {
  const b = [...document.querySelectorAll(".ov .play")].find((x) => getComputedStyle(x.closest(".ov")).visibility === "visible");
  b?.click();
  return !!b;
});
await new Promise((r) => setTimeout(r, 300));
ok("story button opens the modal", clicked && (await page.$(".modal")) !== null);
await page.keyboard.press("Escape");
await new Promise((r) => setTimeout(r, 300));
ok("Escape closes the modal", (await page.$(".modal")) === null);

// FAQ dialog at the bottom (and the canvas should stop rendering once the plans cover it)
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await new Promise((r) => setTimeout(r, 1500));
ok("render loop pauses under the plans section", await page.evaluate(() => document.querySelector(".stage canvas")?.dataset.paused === "true"));
await page.evaluate(() => window.scrollTo(0, 0));
await new Promise((r) => setTimeout(r, 800));
ok("render loop resumes back in the journey", await page.evaluate(() => document.querySelector(".stage canvas")?.dataset.paused === "false"));
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await new Promise((r) => setTimeout(r, 1200));
await page.evaluate(() => document.querySelector(".footer-link")?.click());
ok("FAQ dialog opens", await page.evaluate(() => document.querySelector(".faq-dialog")?.open === true));

// classic view
const classic = await browser.newPage();
await classic.goto(`${base}?view=classic`, { waitUntil: "networkidle2" });
ok("classic view renders all three chapters", await classic.evaluate(() => ["01 · Idea", "02 · Build", "03 · Launch"].every((t) => document.body.innerText.includes(t.toUpperCase()) || document.body.innerText.includes(t))));
ok("classic view loads no WebGL canvas", (await classic.$("canvas")) === null);

console.log(errors.length ? `console errors:\n  ${[...new Set(errors)].join("\n  ")}` : "no console errors");
await browser.close();
