// Lists every request the running site makes to anything other than its own server.
// Loads the 3D tour (forced), flies the whole journey, then loads the classic view.
//   node scripts/network-check.mjs [baseUrl]      (needs `npm start` or `npm run dev`)

import { join } from "node:path";
import puppeteer from "puppeteer-core";

const base = process.argv[2] ?? "http://localhost:3000/";
const own = new URL(base).host;
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
  userDataDir: join(process.cwd(), "reference", ".chrome-profile"),
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});

const external = new Map();
let total = 0;
const watch = (page, label) =>
  page.on("request", (r) => {
    const u = new URL(r.url());
    if (u.protocol === "data:" || u.protocol === "blob:") return;
    total++;
    if (u.host !== own) external.set(`${u.protocol}//${u.host}${u.pathname}`, label);
  });

// 3D tour: load, then scroll to the very end so every world, text and lazy asset has had its chance to load
const page = await browser.newPage();
watch(page, "3d tour");
await page.setViewport({ width: 1280, height: 800 });
await page.goto(`${base}?view=3d`, { waitUntil: "networkidle2", timeout: 120000 });
await page.waitForFunction(() => !document.querySelector(".loader"), { timeout: 120000 });
const end = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y <= end; y += 900) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await new Promise((r) => setTimeout(r, 120));
}
// open a story popup too
await page.evaluate(() => document.querySelector(".ov .play")?.click());
await new Promise((r) => setTimeout(r, 2000));

// classic view
const classic = await browser.newPage();
watch(classic, "classic view");
await classic.goto(`${base}?view=classic`, { waitUntil: "networkidle0", timeout: 60000 });
await classic.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await new Promise((r) => setTimeout(r, 2000));

await browser.close();
console.log(`${total} requests, ${external.size} to other sites`);
for (const [url, where] of external) console.log(`  ${where}: ${url}`);
process.exit(external.size ? 1 : 0);
