// Records a Chrome performance trace while scrolling the journey on the real GPU, then lists what ran
// during every long task. For hunting one-off stalls that frame timing alone can't explain.
//   node scripts/trace-stall.mjs [baseUrl] [--dsf=2] [--seconds=30]
// Output: a summary on stdout; the raw trace in reference/trace.json (open it in chrome://tracing or Perfetto).

import { readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";

const args = process.argv.slice(2);
const base = args.find((a) => !a.startsWith("--")) ?? "http://localhost:3200/";
const dsf = Number(args.find((a) => a.startsWith("--dsf="))?.split("=")[1] ?? 2);
const seconds = Number(args.find((a) => a.startsWith("--seconds="))?.split("=")[1] ?? 30);
const profile = join(process.cwd(), "reference", ".chrome-profile");
rmSync(profile, { recursive: true, force: true }); // cold: no shader cache from earlier runs

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
  userDataDir: profile,
  args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--disable-frame-rate-limit", "--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: dsf });
await page.goto(`${base}?adaptive=0`, { waitUntil: "networkidle2", timeout: 120000 });
await page.waitForFunction(() => document.querySelector(".journey") && !document.querySelector(".loader"), { timeout: 120000 });
await new Promise((r) => setTimeout(r, 1500));

const tracePath = join(process.cwd(), "reference", "trace.json");
await page.tracing.start({
  path: tracePath,
  // lean on purpose: cc/viz/blink make a 30s trace too big to parse
  categories: ["devtools.timeline", "v8", "gpu", "disabled-by-default-v8.gc"],
});
const t0 = await page.evaluate(
  (ms) =>
    new Promise((resolve) => {
      const end = document.querySelector(".journey").offsetHeight - innerHeight;
      const start = performance.now();
      const long = [];
      let last = start;
      const step = (now) => {
        const t = Math.min(1, (now - start) / ms);
        window.scrollTo(0, t * end);
        if (now - last > 100) long.push({ at: +(last - start).toFixed(0), dt: +(now - last).toFixed(0), p: +(t * 100).toFixed(1) });
        last = now;
        if (t < 1) requestAnimationFrame(step);
        else resolve(long);
      };
      requestAnimationFrame(step);
    }),
  seconds * 1000,
);
await page.tracing.stop();
await browser.close();

console.log(`long frames (>100ms) seen by rAF: ${t0.length ? t0.map((f) => `${f.dt}ms @ ${f.p}%`).join(", ") : "none"}`);

const trace = JSON.parse(readFileSync(tracePath, "utf8"));
const events = trace.traceEvents ?? trace;
const names = {};
for (const e of events) if (e.ph === "M" && e.name === "thread_name") names[`${e.pid}:${e.tid}`] = e.args.name;
// complete events longer than 150ms, excluding generic wrappers
const WRAPPERS = new Set(["RunTask", "ThreadControllerImpl::RunTask", "RunNormalPriorityTask", "TaskGraphRunner::RunTask", "Scheduler::RunTask"]);
const longEv = events
  .filter((e) => e.ph === "X" && e.dur > 150_000 && !WRAPPERS.has(e.name))
  .sort((a, b) => b.dur - a.dur)
  .slice(0, 25);
console.log(`\nlongest trace events (>150ms):`);
for (const e of longEv) {
  const thread = names[`${e.pid}:${e.tid}`] ?? `${e.pid}:${e.tid}`;
  const detail = e.args?.data?.functionName || e.args?.data?.url || e.args?.src_func || e.args?.data?.type || "";
  console.log(`  ${(e.dur / 1000).toFixed(0).padStart(6)}ms  ${thread.padEnd(22)} ${e.name}${detail ? `  (${String(detail).slice(0, 80)})` : ""}`);
}
