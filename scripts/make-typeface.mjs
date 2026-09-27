// Converts Inter Tight ExtraBold (from @fontsource) into a Three.js typeface JSON
// so the giant 3D words use the same typeface as the HTML headlines.
// Same output format as facetype.js, with resolution 1000 = 1 em.

import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import * as opentypeNs from "opentype.js";

const opentype = opentypeNs.default ?? opentypeNs;
const ROOT = process.cwd();
const FILES = join(ROOT, "node_modules", "@fontsource", "inter-tight", "files");
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+$%.,!?&-/'→ ";

const buf = readFileSync(join(FILES, "inter-tight-latin-800-normal.woff"));
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const scale = 1000 / font.unitsPerEm;
const r = (v) => Math.round(v * scale);

// Split a glyph path into contours of segments so we can check (and fix) winding.
function contoursOf(path) {
  const contours = [];
  let cur = null;
  let pen = [0, 0];
  for (const c of path.commands) {
    if (c.type === "M") {
      cur = { start: [c.x, c.y], segs: [] };
      contours.push(cur);
      pen = [c.x, c.y];
    } else if (c.type === "L") {
      cur.segs.push({ t: "l", from: pen, to: [c.x, c.y], cps: [] });
      pen = [c.x, c.y];
    } else if (c.type === "Q") {
      cur.segs.push({ t: "q", from: pen, to: [c.x, c.y], cps: [[c.x1, c.y1]] });
      pen = [c.x, c.y];
    } else if (c.type === "C") {
      cur.segs.push({ t: "b", from: pen, to: [c.x, c.y], cps: [[c.x1, c.y1], [c.x2, c.y2]] });
      pen = [c.x, c.y];
    }
  }
  return contours.filter((k) => k.segs.length);
}

// Shoelace area over segment endpoints (y up). Positive = counter-clockwise.
const area = (k) => k.segs.reduce((a, s) => a + (s.from[0] * s.to[1] - s.to[0] * s.from[1]), 0) / 2;

function reverse(k) {
  const segs = k.segs
    .slice()
    .reverse()
    .map((s) => ({ t: s.t, from: s.to, to: s.from, cps: s.cps.slice().reverse() }));
  return { start: segs[0].from, segs };
}

function encode(contours) {
  let o = "";
  for (const k of contours) {
    o += `m ${r(k.start[0])} ${r(k.start[1])} `;
    for (const s of k.segs) {
      // three.js reads the end point first, then the control point(s)
      o += `${s.t} ${r(s.to[0])} ${r(s.to[1])} `;
      for (const cp of s.cps) o += `${r(cp[0])} ${r(cp[1])} `;
    }
    o += "z ";
  }
  return o.trim();
}

// three.js treats clockwise contours as solids. Detect the font's convention from "O".
const oContours = contoursOf(font.charToGlyph("O").path);
const outer = oContours.reduce((a, b) => (Math.abs(area(a)) > Math.abs(area(b)) ? a : b));
const flip = area(outer) > 0;
console.log(`outer contours are ${flip ? "counter-clockwise, reversing" : "clockwise, keeping"}`);

const glyphs = {};
for (const ch of CHARS) {
  const g = font.charToGlyph(ch);
  if (!g || g.index === 0) {
    console.warn("missing glyph", JSON.stringify(ch));
    continue;
  }
  let contours = contoursOf(g.path);
  if (flip) contours = contours.map(reverse);
  const bb = g.getBoundingBox();
  glyphs[ch] = { ha: r(g.advanceWidth), x_min: r(bb.x1), x_max: r(bb.x2), o: encode(contours) };
}

const head = font.tables.head;
const out = {
  glyphs,
  familyName: font.names.fontFamily?.en ?? "Inter Tight",
  ascender: r(font.ascender),
  descender: r(font.descender),
  underlinePosition: r(font.tables.post.underlinePosition),
  underlineThickness: r(font.tables.post.underlineThickness),
  boundingBox: { xMin: r(head.xMin), yMin: r(head.yMin), xMax: r(head.xMax), yMax: r(head.yMax) },
  resolution: 1000,
  capHeight: r(font.tables.os2.sCapHeight || font.charToGlyph("H").getBoundingBox().y2),
  cssFontWeight: "800",
  cssFontStyle: "normal",
};

mkdirSync(join(ROOT, "lib", "fonts"), { recursive: true });
writeFileSync(join(ROOT, "lib", "fonts", "inter-tight-800.typeface.json"), JSON.stringify(out));
console.log(`wrote ${Object.keys(glyphs).length} glyphs, cap height ${out.capHeight}/1000`);

// woff copies for troika (drei <Text>) small 3D labels
mkdirSync(join(ROOT, "public", "fonts"), { recursive: true });
for (const w of ["500", "700", "800"]) {
  copyFileSync(join(FILES, `inter-tight-latin-${w}-normal.woff`), join(ROOT, "public", "fonts", `inter-tight-${w}.woff`));
}
console.log("copied inter-tight 500/700/800 woff to public/fonts");
