// Screenshots journey points with the locally installed Chrome, and reports console errors.
//   node scripts/shoot.mjs [baseUrl] [at1,at2,...] [--mobile]
// Output: reference/screens/<at>.png

import { mkdirSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";

const args = process.argv.slice(2);
const mobile = args.includes("--mobile");
// --size=1909x741 for any window shape (file names get the size as a prefix)
const size = args.find((a) => a.startsWith("--size="))?.split("=")[1]?.split("x").map(Number);
const [base = "http://localhost:3100/", list = "r0"] = args.filter((a) => !a.startsWith("--"));
const points = list.split(",");
const out = join(process.cwd(), "reference", "screens");
mkdirSync(out, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
  userDataDir: join(process.cwd(), "reference", ".chrome-profile"),
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--hide-scrollbars"],
});

for (const at of points) {
  const page = await browser.newPage();
  const logs = [];
  page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && logs.push(`[${m.type()}] ${m.text()}`));
  page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
  await page.setViewport(
    size
      ? { width: size[0], height: size[1], deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile }
      : mobile
        ? { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true }
        : { width: 1440, height: 900 },
  );
  // "join" = past the end of the journey, on the plans section
  const url = `${base}${base.includes("?") ? "&" : "?"}view=3d&at=${encodeURIComponent(at === "join" ? "1" : at)}`;
  const t0 = Date.now();
  await page.goto(url, { waitUntil: "networkidle2", timeout: 120000 });
  try {
    await page.waitForFunction(() => !document.querySelector(".loader"), { timeout: 120000 });
  } catch {
    logs.push("[timeout] loader never cleared");
  }
  if (at === "join") await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await new Promise((r) => setTimeout(r, 1500));
  const file = join(out, `${size ? `${size[0]}x${size[1]}-` : ""}${mobile ? "m-" : ""}${at.replace(/[^a-z0-9.:-]/gi, "_").replace(/:/g, "-")}.png`);
  await page.screenshot({ path: file });
  console.log(`${at}  ${((Date.now() - t0) / 1000).toFixed(1)}s  -> ${file}`);
  logs.slice(0, 15).forEach((l) => console.log("   ", l));
  await page.close();
}

await browser.close();
