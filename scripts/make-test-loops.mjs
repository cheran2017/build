// Records clearly-labelled placeholder loops for the ambient slots, to preview where they play
// before the real Higgsfield / Seedance loops exist. Uses headless Chrome's MediaRecorder (WebM/VP9).
//   node scripts/make-test-loops.mjs [outDir]       default: reference/test-loops
// Copy the files into assets/ambient/ and run `npm run media` to see them on the site.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";

const outDir = join(process.cwd(), process.argv[2] ?? join("reference", "test-loops"));
mkdirSync(outDir, { recursive: true });

const SLOTS = [
  { name: "laptop-screen", w: 1280, h: 800 },
  { name: "idea", w: 1280, h: 720 },
  { name: "launch", w: 1280, h: 720 },
];

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
  args: ["--autoplay-policy=no-user-gesture-required"],
});
const page = await browser.newPage();
await page.goto("about:blank");

for (const slot of SLOTS) {
  const b64 = await page.evaluate(
    ({ name, w, h }) =>
      new Promise((resolve, reject) => {
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const g = c.getContext("2d");
        const rec = new MediaRecorder(c.captureStream(30), { mimeType: "video/webm;codecs=vp9", videoBitsPerSecond: 2_500_000 });
        const chunks = [];
        rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
        rec.onerror = reject;
        rec.onstop = async () => {
          const buf = await new Blob(chunks, { type: "video/webm" }).arrayBuffer();
          let s = "";
          const bytes = new Uint8Array(buf);
          for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
          resolve(btoa(s));
        };
        const D = 4000; // one seamless 4s cycle
        const t0 = performance.now();
        const draw = () => {
          const t = ((performance.now() - t0) % D) / D;
          const a = t * Math.PI * 2;
          const grad = g.createLinearGradient(0, 0, w, h);
          grad.addColorStop(0, `hsl(${228 + 10 * Math.sin(a)}, 80%, ${14 + 6 * Math.sin(a)}%)`);
          grad.addColorStop(1, `hsl(${250 + 12 * Math.cos(a)}, 70%, ${30 + 8 * Math.cos(a)}%)`);
          g.fillStyle = grad;
          g.fillRect(0, 0, w, h);
          for (let i = 0; i < 14; i++) {
            const r = ((i / 14 + t) % 1) * Math.max(w, h) * 0.75;
            g.strokeStyle = `rgba(255,255,255,${0.35 * (1 - r / (Math.max(w, h) * 0.75))})`;
            g.lineWidth = 3;
            g.beginPath();
            g.arc(w / 2, h / 2, r, 0, Math.PI * 2);
            g.stroke();
          }
          g.fillStyle = "#fff";
          g.textAlign = "center";
          g.font = `800 ${Math.round(h * 0.12)}px system-ui, sans-serif`;
          g.fillText("TEST LOOP", w / 2, h / 2);
          g.font = `600 ${Math.round(h * 0.05)}px system-ui, sans-serif`;
          g.fillStyle = "rgba(255,255,255,0.75)";
          g.fillText(`ambient/${name}  ·  ${w}×${h}`, w / 2, h / 2 + h * 0.09);
          if (rec.state === "recording") requestAnimationFrame(draw);
        };
        rec.start(250);
        draw();
        setTimeout(() => rec.stop(), D + 150);
      }),
    slot,
  );
  const file = join(outDir, `${slot.name}.webm`);
  writeFileSync(file, Buffer.from(b64, "base64"));
  console.log(`${file}  ${(Buffer.byteLength(b64, "base64") / 1024).toFixed(0)} KB`);
}
await browser.close();
