// Composes the slot files in assets/ from images collected from https://metayb.ai/ (kept in reference/metayb-src).
// Run once, then `npm run media` to publish them to public/media.
//
//   node scripts/compose-metayb-assets.mjs
//
// Text on generated cards uses a plain sans-serif fallback; swap in designed artwork whenever Metayb supplies it.

import { mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SRC = join(ROOT, "reference", "metayb-src");
const OUT = join(ROOT, "assets");
const src = (f) => join(SRC, f);
const out = (f) => {
  const p = join(OUT, f);
  mkdirSync(join(p, ".."), { recursive: true });
  return p;
};
const need = (f) => {
  if (!existsSync(src(f))) throw new Error(`missing ${src(f)}: download it from metayb.ai first`);
  return src(f);
};

const DARK = "#070b18";
const BLUE = "#3355ff";
const FONT = "Inter Tight, Inter, Arial, sans-serif";
const svg = (w, h, body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${body}</svg>`);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

// --- gallery: capability diagrams from the site, flattened onto the dark world they float in
const gallery = [
  "slide1-BLWiGd3D.png",
  "slide2-DYVSoYJS.png",
  "slide3-BKJovC0R.png",
  "slide4-CBlckP1O.png",
  "slide5-D42wcZHY.png",
  "slide6-BbFv3IP2.png",
  "artificial-intelligence-CTmPkLgz.png",
  "data-analytics-BNAIru5O.png",
  "cloud-engineering-DhkdN1qM.png",
  "intelligent-automation-BtXZ_VNq.png",
  "sap-transformation-FkDTOByf.png",
  "internet-of-things-C-5joX00.png",
  "cybersecurity-C8FVkE68.png",
  "supply-chain-solutions-CibUud9U.png",
  "finance-solutions-BhrefaKF.png",
  "ecommerce-DfAsXpmc.png",
];
for (const [i, f] of gallery.entries()) {
  await sharp(need(f)).flatten({ background: DARK }).resize({ width: 1400, withoutEnlargement: true }).png().toFile(out(`gallery/solution-${String(i + 1).padStart(2, "0")}.png`));
}

// --- framework icons: three capability diagrams on a square dark tile
const pillars = ["artificial-intelligence-CTmPkLgz.png", "cloud-engineering-DhkdN1qM.png", "intelligent-automation-BtXZ_VNq.png"];
const pillarNames = ["part-1-idea", "part-2-build", "part-3-launch"];
for (const [i, f] of pillars.entries()) {
  await sharp(need(f)).flatten({ background: DARK }).resize(560, 560, { fit: "contain", background: DARK }).png().toFile(out(`framework/${pillarNames[i]}.png`));
}

// --- leadership: Amit Todi, Founder & CEO (portrait and credential card)
await sharp(need("Img-8oXGAVO6.png")).flatten({ background: "#e9ebf0" }).resize({ width: 858 }).jpeg({ quality: 90 }).toFile(out("scenes/founder.jpg"));
await sharp(
  svg(
    1200,
    300,
    `<rect width="1200" height="300" rx="44" fill="#ffffff"/>
     <rect x="56" y="62" width="10" height="176" rx="5" fill="${BLUE}"/>
     <text x="96" y="140" font-family="${FONT}" font-weight="800" font-size="76" fill="#111216">Amit Todi</text>
     <text x="96" y="214" font-family="${FONT}" font-weight="600" font-size="46" fill="#4b4f5a">Founder &amp; CEO, Metayb</text>`,
  ),
)
  .png()
  .toFile(out("scenes/skool-badge.png"));

// --- clients: logos shown on the site, on one white card
const logos = ["Multipro.png", "bhn.png", "farro.jpg", "nutrify.png"];
const cell = 380;
const logoLayers = await Promise.all(
  logos.map(async (f, i) => ({
    input: await sharp(need(f)).flatten({ background: "#ffffff" }).resize(cell - 60, 320, { fit: "contain", background: "#ffffff" }).png().toBuffer(),
    left: 40 + i * cell + 30,
    top: 140,
  })),
);
await sharp({ create: { width: 1600, height: 600, channels: 3, background: "#ffffff" } })
  .composite([
    { input: svg(1600, 120, `<text x="40" y="84" font-family="${FONT}" font-weight="800" font-size="52" fill="#111216">Trusted by growing brands</text>`), left: 0, top: 0 },
    ...logoLayers,
  ])
  .png()
  .toFile(out("scenes/community-collage.png"));

// --- idea icon, square on transparent
await sharp(need("impact-4-DMTl9gPS.png")).trim().resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(out("scenes/icon-idea.png"));

// --- people and places
await sharp(need("careers-team-Zo4EV-bX.jpg")).resize({ width: 1600 }).toFile(out("scenes/coaching-call.jpg"));
await sharp(need("linkedimg1-DpKMmH3q.jpg")).resize({ width: 1200 }).toFile(out("scenes/builders-faces.jpg"));

// --- reach: globe from the site's impact section on a dark card
const globe = await sharp(need("impact-1-Dg2bg8Cl.png")).resize({ height: 520 }).png().toBuffer();
await sharp({ create: { width: 1600, height: 900, channels: 3, background: DARK } })
  .composite([
    {
      input: svg(
        1600,
        900,
        `<defs><radialGradient id="g" cx="50%" cy="42%" r="60%"><stop offset="0" stop-color="${BLUE}" stop-opacity="0.45"/><stop offset="1" stop-color="${BLUE}" stop-opacity="0"/></radialGradient></defs>
         <rect width="1600" height="900" fill="url(#g)"/>
         <text x="800" y="745" text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="104" fill="#ffffff">12+ countries</text>
         <text x="800" y="815" text-anchor="middle" font-family="${FONT}" font-weight="600" font-size="40" fill="#aeb3bf">${esc("Head office in Chennai, India")}</text>`,
      ),
      left: 0,
      top: 0,
    },
    { input: globe, left: 800 - 319, top: 120 },
  ])
  .png()
  .toFile(out("scenes/members-map.png"));

// --- proof screens (16:9)
for (const [i, f] of ["myb4-BkKgfe1m.jpg", "myb9-DQlq5L9N.jpeg", "myb3-U3FC_I8v.jpg"].entries()) {
  await sharp(need(f)).resize(1600, 900, { fit: "cover" }).jpeg({ quality: 88 }).toFile(out(`wins/win-0${i + 1}.jpg`));
}

// --- social-proof strips: figures from the site's impact and solutions sections
const strips = [
  ["500+", "Strong team"],
  ["20+", "Brands served"],
  ["$2B", "Portfolio"],
  ["12+", "Countries"],
  ["8+", "Solution areas"],
  ["7", "Industries"],
];
for (const [i, [value, label]] of strips.entries()) {
  await sharp(
    svg(
      1000,
      200,
      `<rect width="1000" height="200" rx="100" fill="#ffffff"/>
       <rect x="14" y="14" width="172" height="172" rx="86" fill="${BLUE}"/>
       <text x="100" y="118" text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="${value.length > 3 ? 52 : 62}" fill="#ffffff">${esc(value)}</text>
       <text x="224" y="124" font-family="${FONT}" font-weight="800" font-size="76" fill="#111216">${esc(label)}</text>`,
    ),
  )
    .png()
    .toFile(out(`creators/stat-0${i + 1}.png`));
}

// --- all leadership portraits (metayb.ai/leadership), flattened onto the neutral grey the site uses behind them
const leaders = {
  s3: "amit-todi", a3: "shweta-todi", l3: "vikash-parmanandka", c3: "varun-selvan", p3: "narendra-anant-patil", d3: "pradeep-manoharan",
  u3: "rameshbabu", f3: "sanjay-kumar", h3: "manish-kumar", g3: "suresh-kumar", y3: "shantham-sood", m3: "sunitha-hattangadi",
};
const roles = {
  "amit-todi": "Founder & CEO", "shweta-todi": "Co-Founder & CFO", "vikash-parmanandka": "Executive Director", "varun-selvan": "Senior Director - Technology",
  "narendra-anant-patil": "Delivery Head – Internet of Things (IoT)", "pradeep-manoharan": "Delivery Head - Cyber Security", rameshbabu: "Director – Data Engineering",
  "sanjay-kumar": "Delivery Head – Supply Chain Management (SCM)", "manish-kumar": "Delivery Head - Senior Solutions Architect (SAP)", "suresh-kumar": "Solution Architect",
  "shantham-sood": "Senior Program Manager", "sunitha-hattangadi": "Head of Human Resources",
};
const names = {
  "amit-todi": "Amit Todi", "shweta-todi": "Shweta Todi", "vikash-parmanandka": "Vikash Parmanandka", "varun-selvan": "Varun Selvan", "narendra-anant-patil": "Narendra Anant Patil",
  "pradeep-manoharan": "Pradeep Manoharan", rameshbabu: "Rameshbabu", "sanjay-kumar": "Sanjay Kumar", "manish-kumar": "Manish Kumar", "suresh-kumar": "Suresh Kumar",
  "shantham-sood": "Shantham Sood", "sunitha-hattangadi": "Sunitha Hattangadi",
};
/** splits a role in two lines at the space nearest its middle when it is long */
function wrap(text, max) {
  if (text.length <= max) return [text];
  const mid = text.length / 2;
  const spaces = [...text].map((c, i) => (c === " " ? i : -1)).filter((i) => i >= 0);
  const cut = spaces.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid))[0];
  return [text.slice(0, cut), text.slice(cut + 1)];
}
for (const [slug, role] of Object.entries(roles)) {
  const lines = wrap(role, 30);
  const size = lines.length > 1 ? 36 : 46;
  const tspans = lines.map((l, i) => `<text x="96" y="${lines.length > 1 ? 200 + i * 42 : 214}" font-family="${FONT}" font-weight="600" font-size="${size}" fill="#4b4f5a">${esc(l)}</text>`).join("");
  await sharp(
    svg(
      1200,
      300,
      `<rect width="1200" height="300" rx="44" fill="#ffffff"/>
       <rect x="56" y="62" width="10" height="176" rx="5" fill="${BLUE}"/>
       <text x="96" y="${lines.length > 1 ? 130 : 140}" font-family="${FONT}" font-weight="800" font-size="${names[slug].length > 18 ? 64 : 76}" fill="#111216">${esc(names[slug])}</text>
       ${tspans}`,
    ),
  )
    .png()
    .toFile(out(`leaders/badge-${slug}.png`));
}

for (const [file, slug] of Object.entries(leaders)) {
  await sharp(need(`leaders/${file}.png`)).flatten({ background: "#d9dce3" }).resize({ width: 572 }).jpeg({ quality: 90 }).toFile(out(`leaders/${slug}.jpg`));
}

console.log("assets/ composed. Now run: npm run media");
