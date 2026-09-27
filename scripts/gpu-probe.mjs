// Which GPU does headless Chrome get with each flag set? Picks the flags scripts should use for real-GPU timing.
//   node scripts/gpu-probe.mjs

import { join } from "node:path";
import puppeteer from "puppeteer-core";

const CHROME = process.env.CHROME ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const SETS = {
  software: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  "d3d11 (hardware)": ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-features=Vulkan"],
  "default + gpu": ["--enable-gpu", "--ignore-gpu-blocklist"],
};

for (const [name, args] of Object.entries(SETS)) {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, userDataDir: join(process.cwd(), "reference", ".chrome-profile"), args });
  const page = await browser.newPage();
  const info = await page.evaluate(() => {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2");
    if (!gl) return { renderer: "no webgl2" };
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return {
      renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      vendor: ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
    };
  });
  console.log(`${name.padEnd(18)} ${info.vendor ?? ""} | ${info.renderer}`);
  await browser.close();
}
