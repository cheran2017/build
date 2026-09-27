// Real-GPU frame timing (needs `npm run build && npm start`). Scrolls the whole journey at a steady pace
// and reports frame times per chapter, for several screen profiles.
//   node scripts/perf.mjs [baseUrl] [--adaptive] [--seconds=60]
// Without --adaptive the pixel ratio is pinned at its maximum (?adaptive=0): the raw cost of each scene.

import { join } from "node:path";
import puppeteer from "puppeteer-core";

const args = process.argv.slice(2);
const base = args.find((a) => !a.startsWith("--")) ?? "http://localhost:3200/";
const adaptive = args.includes("--adaptive");
const seconds = Number(args.find((a) => a.startsWith("--seconds="))?.split("=")[1] ?? 60);
const only = args.find((a) => a.startsWith("--only="))?.split("=")[1]; // e.g. --only=@2x
const repeat = Number(args.find((a) => a.startsWith("--repeat="))?.split("=")[1] ?? 1); // same browser: 2nd run is "warm"

const ALL_PROFILES = [
  { name: "laptop 1440x900 @1x", view: { width: 1440, height: 900, deviceScaleFactor: 1 } },
  { name: "laptop 1440x900 @2x", view: { width: 1440, height: 900, deviceScaleFactor: 2 } },
  { name: "phone 390x844 @3x", view: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true } },
];
const PROFILES = ALL_PROFILES.filter((p) => !only || p.name.includes(only)).flatMap((p) =>
  Array.from({ length: repeat }, (_, i) => ({ ...p, name: repeat > 1 ? `${p.name}  run ${i + 1}${i ? " (warm)" : ""}` : p.name })),
);

// --headful: a real (off-screen) window presenting through the OS compositor like a visitor's browser.
// Headless Chrome has no display, and its swap-chain presents can stall in ways real windows don't.
const headful = args.includes("--headful");
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: !headful,
  defaultViewport: null,
  userDataDir: join(process.cwd(), "reference", ".chrome-profile"),
  args: [
    "--use-angle=d3d11",
    "--enable-gpu",
    "--ignore-gpu-blocklist",
    "--hide-scrollbars",
    ...(headful
      ? ["--window-position=-2600,0", "--window-size=1500,1000", "--disable-backgrounding-occluded-windows", "--disable-renderer-backgrounding", "--disable-background-timer-throttling"]
      : ["--disable-frame-rate-limit"]),
  ],
});
console.log(headful ? "real window (off-screen), vsync-limited\n" : "headless\n");

const gpu = await (async () => {
  const p = await browser.newPage();
  const r = await p.evaluate(() => {
    const gl = document.createElement("canvas").getContext("webgl2");
    const ext = gl?.getExtension("WEBGL_debug_renderer_info");
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "unknown";
  });
  await p.close();
  return r;
})();
console.log(`GPU: ${gpu}`);
console.log(`mode: ${adaptive ? "adaptive pixel ratio" : "pixel ratio pinned at max (?adaptive=0)"}, ${seconds}s scroll per profile\n`);

const pct = (arr, q) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(q * s.length))];
};

for (const prof of PROFILES) {
  const page = await browser.newPage();
  await page.setViewport(prof.view);
  const errors = [];
  page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${base}${adaptive ? "" : "?adaptive=0"}`, { waitUntil: "networkidle2", timeout: 120000 });
  await page.waitForFunction(() => document.querySelector(".classic") || (document.querySelector(".journey") && !document.querySelector(".loader")), {
    timeout: 120000,
  });
  if (await page.$(".classic")) {
    const webgl = await page.evaluate(() => !!document.createElement("canvas").getContext("webgl2"));
    console.log(`${prof.name}: fell back to the classic view (webgl2 available: ${webgl})`);
    errors.slice(0, 5).forEach((e) => console.log(`    ${e}`));
    console.log("");
    await page.close();
    continue;
  }
  await new Promise((r) => setTimeout(r, 1500));

  const result = await page.evaluate(
    (durationMs) =>
      new Promise((resolve) => {
        const journey = document.querySelector(".journey");
        const end = journey.offsetHeight - innerHeight;
        const fills = [...document.querySelectorAll(".chapter-fill")];
        const labels = ["idea", "build", "launch", "join"];
        const chapter = () => {
          // the chapter whose progress bar is partly filled; before IDEA it's the studio + portal
          let current = "studio";
          fills.forEach((f, i) => {
            const m = /scaleX\(([\d.]+)\)/.exec(f.style.transform);
            if (m && Number(m[1]) > 0) current = labels[i];
          });
          return current;
        };
        const frames = [];
        const t0 = performance.now();
        let last = t0;
        const step = (now) => {
          const t = Math.min(1, (now - t0) / durationMs);
          window.scrollTo(0, t * end);
          frames.push({ dt: now - last, ch: chapter(), p: t });
          last = now;
          if (t < 1) requestAnimationFrame(step);
          else {
            const canvas = document.querySelector(".stage canvas");
            resolve({ frames: frames.slice(3), canvas: canvas ? `${canvas.width}x${canvas.height}` : "?" });
          }
        };
        requestAnimationFrame(step);
      }),
    seconds * 1000,
  );

  const by = {};
  for (const f of result.frames) (by[f.ch] ??= []).push(f.dt);
  const all = result.frames.map((f) => f.dt);
  console.log(`${prof.name}   (canvas ends at ${result.canvas})`);
  console.log(`  ${"chapter".padEnd(8)} ${"fps".padStart(5)} ${"p50".padStart(7)} ${"p95".padStart(7)} ${"worst".padStart(7)} ${">33ms".padStart(6)}`);
  for (const ch of ["studio", "idea", "build", "launch", "join", "ALL"]) {
    const arr = ch === "ALL" ? all : by[ch];
    if (!arr?.length) continue;
    const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
    const slow = arr.filter((d) => d > 33.4).length / arr.length;
    console.log(
      `  ${ch.padEnd(8)} ${(1000 / avg).toFixed(0).padStart(5)} ${pct(arr, 0.5).toFixed(1).padStart(6)}ms ${pct(arr, 0.95).toFixed(1).padStart(6)}ms ${Math.max(...arr).toFixed(0).padStart(5)}ms ${(slow * 100).toFixed(0).padStart(5)}%`,
    );
  }
  const long = result.frames
    .map((f, i) => ({ ...f, i }))
    .filter((f) => f.dt > 50)
    .sort((a, b) => b.dt - a.dt)
    .slice(0, 5);
  if (long.length) console.log(`  longest frames: ${long.map((f) => `${f.dt.toFixed(0)}ms @ ${(f.p * 100).toFixed(1)}% (frame ${f.i}, ${f.ch})`).join(", ")}`);
  if (errors.length) console.log(`  console: ${[...new Set(errors)].slice(0, 3).join(" | ")}`);
  console.log("");
  await page.close();
}
await browser.close();
