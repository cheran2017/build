import { Box2, Vector2 } from "three";
import { Font, FontLoader, type FontData } from "three/examples/jsm/loaders/FontLoader.js";
import data from "./fonts/inter-tight-800.typeface.json";

let font: Font | null = null;

/** Inter Tight ExtraBold, converted by scripts/make-typeface.mjs. */
export function getFont() {
  if (!font) font = new FontLoader().parse(data as unknown as FontData);
  return font;
}

/** Cap height as a fraction of the font size. */
export const CAP = data.capHeight / data.resolution;

export type LetterBox = { ch: string; x: number; adv: number; minX: number; maxX: number };

/** Horizontal layout of a word, origin at the left of the first advance, baseline at y = 0. */
export function layoutWord(text: string, size: number, tracking = 0) {
  const f = getFont();
  const scale = size / f.data.resolution;
  const letters: LetterBox[] = [];
  let x = 0;
  for (const ch of text) {
    const g = f.data.glyphs[ch];
    const adv = g ? g.ha * scale : size * 0.3;
    letters.push({ ch, x, adv, minX: g?.x_min !== undefined ? g.x_min * scale : 0, maxX: g?.x_max !== undefined ? g.x_max * scale : adv });
    x += adv + tracking * size;
  }
  const first = letters[0];
  const last = letters[letters.length - 1];
  const inkLeft = first ? first.x + first.minX : 0;
  const inkRight = last ? last.x + last.maxX : 0;
  return { letters, inkLeft, width: inkRight - inkLeft, cap: CAP * size };
}

/** Centre of the first counter (hole) of a glyph, relative to the glyph origin. */
export function counterOf(ch: string, size: number) {
  const shapes = getFont().generateShapes(ch, size);
  const hole = shapes.flatMap((s) => s.holes)[0];
  if (!hole) return new Vector2(size * 0.3, (CAP * size) / 2);
  const box = new Box2().setFromPoints(hole.getPoints(8));
  return box.getCenter(new Vector2());
}
