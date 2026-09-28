import { CatmullRomCurve3, Color, MathUtils, SRGBColorSpace, Vector3, type RGB } from "three";
import { counterOf, layoutWord } from "./type";

export type V3 = [number, number, number];
export type OverlaySide = "left" | "right" | "bottom";

/** Scroll length of one beat, in svh. */
export const BEAT_VH = { desktop: 62, mobile: 56 };

export const COLORS = {
  studio: "#f3f3f0",
  idea: "#efefeb",
  tunnel: "#04050a",
  build: "#08090d",
  launch: "#05060c",
  final: "#f3f3f0",
  accent: "#3355ff",
  ink: "#111216",
};

/* ------------------------------------------------------------------ */
/* Laptop: shared by the camera path and the model                     */
/* ------------------------------------------------------------------ */

export const LAPTOP = {
  deskY: 0.74,
  baseW: 0.36,
  baseD: 0.25,
  baseH: 0.014,
  lidH: 0.235,
  lidT: 0.008,
  /** lid angle measured from closed */
  startDeg: 14,
  openDeg: 106,
};

function screenFrame() {
  const hinge = new Vector3(0, LAPTOP.deskY + LAPTOP.baseH, -LAPTOP.baseD / 2);
  const rx = Math.PI / 2 - MathUtils.degToRad(LAPTOP.openDeg);
  const up = new Vector3(0, Math.cos(rx), Math.sin(rx));
  const normal = new Vector3(0, -Math.sin(rx), Math.cos(rx));
  const center = hinge.clone().addScaledVector(up, LAPTOP.lidH / 2).addScaledVector(normal, 0.001);
  return { center, normal };
}
export const SCREEN = screenFrame();
const onScreen = (d: number): V3 => SCREEN.center.clone().addScaledVector(SCREEN.normal, d).toArray() as V3;

/* ------------------------------------------------------------------ */
/* Layout: where everything sits in the world                          */
/* ------------------------------------------------------------------ */

export type Spot = { focus: V3; from: V3; look: V3; rotY: number; side: OverlaySide };

export type WordSpec = { text: string; size: number; depth: number; tracking: number; center: V3 };

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

function makeSpot(mobile: boolean, focus: V3, offset: V3, side: OverlaySide, shift = 3.2): Spot {
  if (mobile) {
    // cards become bottom sheets: pull the stop in a little, step back, and look low so content sits high.
    // Pulling in further drags wide exhibits across the flight path, so the camera flies through them.
    focus = [focus[0] * 0.85, focus[1], focus[2]];
    offset = [offset[0] * 0.25, offset[1] + 0.6, offset[2] + 7];
    side = "bottom";
  }
  const from = add(focus, offset);
  const f = new Vector3(...focus);
  const dir = f.clone().sub(new Vector3(...from)).normalize();
  const right = dir.clone().cross(new Vector3(0, 1, 0)).normalize();
  const k = side === "left" ? -shift : side === "right" ? shift : 0;
  const look = f.clone().addScaledVector(right, k);
  if (mobile) look.y -= 2.4;
  return {
    focus,
    from,
    look: look.toArray() as V3,
    rotY: Math.atan2(from[0] - focus[0], from[2] - focus[2]),
    side,
  };
}

/** Centre of a letter's counter in world space, for flying through typography. */
export function counterWorld(word: WordSpec, index: number): V3 {
  const lay = layoutWord(word.text, word.size, word.tracking);
  const letter = lay.letters[index];
  const c = counterOf(letter.ch, word.size);
  const left = word.center[0] - lay.width / 2 - lay.inkLeft;
  return [left + letter.x + c.x, word.center[1] + c.y, word.center[2] + word.depth / 2];
}

export function getLayout(mobile: boolean) {
  const m = <T,>(desktop: T, phone: T) => (mobile ? phone : desktop);
  const spot = (focus: V3, offset: V3, side: OverlaySide, shift?: number) => makeSpot(mobile, focus, offset, side, shift);

  const words = {
    idea: { text: "IDEA", size: m(34, 21), depth: m(5, 4), tracking: -0.02, center: [0, 0, -252.5] as V3 },
    build: { text: "BUILD", size: m(20, 11), depth: 4, tracking: -0.01, center: [0, 0, -340] as V3 },
    launch: { text: "LAUNCH", size: m(16, 8.5), depth: 3.2, tracking: -0.01, center: [0, 0, -706] as V3 },
    utn: { text: "UTN", size: m(20, 12), depth: 3, tracking: 0.02, center: [0, 6, -1040] as V3 },
  } satisfies Record<string, WordSpec>;

  const dCounter = counterWorld(words.idea, 1);

  return {
    mobile,
    words,
    dCounter,
    idea: {
      // ambient loop screen, high above the IDEA word (letters cover its lower edge from the entry shot)
      backdrop: { pos: [0, m(44, 34), -300] as V3, w: m(64, 44) },
      i1: spot([-10, 6, -128], [6.5, 0.8, 14], "left"),
      i2: spot([10.5, 7, -158], [-6.5, -0.4, 14], "right"),
      i3: spot([-10.5, 7, -188], [6.5, 0.2, 15], "left"),
      i4: spot([10.5, 6.5, -216], [-6.5, 0, 14.5], "right"),
    },
    build: {
      // 01 left, 02 right, 03 overhead. The stop for 03 comes before the camera reaches 02's plane,
      // and the route to 21 DAYS then passes beside 02 and under 03, never through them
      pillars: [
        spot([-9, 8, -386], [6, 0, 14], "right"),
        spot([8, 8, -412], [-5, 0, 14], "left"),
        spot([-1, 21, -432], [1.5, -11, 28], "left", 2.4),
      ],
      // gap between "21" and "DAYS" is the camera's route to the coaching monitor, so keep it wide
      days: { center: [0, 4, -480] as V3, sizeNum: m(13, 8), sizeWord: m(5.2, 3.4), gap: m(4.5, 2.8) },
      // on the right, so after "21 DAYS" the camera turns over the low DAYS word, not past the tall 21
      coach: spot([13.5, 9, -510], [-12.5, 0, 19], "left", 4.3),
      coachW: m(16, 10),
      helix: { z0: -528, z1: -602, y: 8, radius: m(7.5, 5.2), count: m(17, 10) },
      map: spot([-14, 9, -640], [12.5, -1, 26], "right", 4.5),
      mapW: m(18, 11),
    },
    launch: {
      // ambient loop screen revealed as the LAUNCH letters lift off. Its bottom edge (y 16) stays well above
      // the flight path (y 7-9), which continues deep past it toward the stories
      backdrop: { pos: [0, m(34, 30), -760] as V3, w: m(64, 40) },
      stories: [
        spot([11, 7, -752], [-9, 0.5, 21], "left", 4.2),
        spot([-11, 7, -782], [9, 0.5, 21], "right", 4.2),
        spot([11, 7, -812], [-9, 0.5, 21], "left", 4.2),
        spot([-11, 7, -842], [9, 0.5, 21], "right", 4.2),
        spot([11, 7, -872], [-9, 0.5, 21], "left", 4.2),
      ],
      numbers: [
        { text: "500+", label: "BUILDERS", pos: [m(-21, -7), 2.5, -938] as V3, rotY: m(0.4, 0.2), size: m(6, 3.6) },
        { text: "275+", label: "LIVE APPS", pos: [m(21, 7), 5, -948] as V3, rotY: m(-0.4, -0.2), size: m(6, 3.6) },
        { text: "21", label: "DAYS", pos: [0, m(18, 16), -962] as V3, rotY: 0, size: m(6, 4) },
      ],
    },
    finale: {
      center: [0, 13, -1043] as V3,
      ring: m([1.3, 0.72], [0.62, 1.25]) as [number, number],
      count: m(22, 12),
    },
  };
}

export type Layout = ReturnType<typeof getLayout>;

/* ------------------------------------------------------------------ */
/* Camera keyframes                                                    */
/* ------------------------------------------------------------------ */

export type Key = {
  id: string;
  pos: V3;
  look: V3;
  /** beats spent travelling here from the previous key */
  travel: number;
  /** beats spent settled here */
  hold: number;
  bg: string;
  fog: [number, number];
  /**
   * Portion of the travel (0..1) over which the colour change happens. Without it the colour blends across
   * the whole leg, which leaves a flat grey limbo when going between the light and dark worlds.
   */
  bgWindow?: [number, number];
};

function buildKeys(L: Layout): Key[] {
  const mob = L.mobile;
  const m = <T,>(desktop: T, phone: T) => (mob ? phone : desktop);
  const S = COLORS;
  const [cx, cy] = L.dCounter;
  const studioFog: [number, number] = [7, 26];
  const ideaFog: [number, number] = [80, 420];
  const darkFog: [number, number] = [25, 190];
  const k = (id: string, pos: V3, look: V3, travel: number, hold: number, bg: string, fog: [number, number], bgWindow?: [number, number]): Key => ({
    id,
    pos,
    look,
    travel,
    hold,
    bg,
    fog,
    bgWindow,
  });
  const at = (id: string, s: Spot, bg: string, fog: [number, number], travel = 1.4, hold = 0.8) => k(id, s.from, s.look, travel, hold, bg, fog);

  const I = L.idea;
  const B = L.build;
  const La = L.launch.stories;
  const bw = L.words.build;
  const lw = L.words.launch;

  return [
    // SCENE 1: white studio
    // desk sits right of centre on desktop so the headline has the left half
    // (phones aim low so the studio sits in the top third, above the headline)
    // desktop: close enough that the desk fills the right half beside the headline (the look point sits left of it)
    k("r0", m([0.5, 1.28, 3.1], [0, 1.7, 6.2]), m([-0.8, 0.8, 0], [0, -0.8, 0]), 0, 1.2, S.studio, studioFog),
    // must stay closer than r0 on each layout, or the push-in toward the laptop runs backwards
    k("r1", m([1.25, 1.18, 2.15], [0.9, 1.45, 4.6]), [0, 0.87, 0], 1.6, 0.2, S.studio, studioFog),
    k("r2", m([-0.45, 1.08, 1.25], [-0.2, 1.12, 1.7]), [0, 0.86, -0.1], 1.4, 0.4, S.studio, studioFog),
    // SCENE 2: laptop portal
    k("r3", onScreen(m(0.32, 0.5)), SCREEN.center.toArray() as V3, 1.2, 0.3, S.studio, studioFog),
    k("cross", onScreen(0.004), onScreen(-0.4), 0.6, 0, S.tunnel, [2, 60]),
    k("t1", [0, 2.2, -38], [0, 3.5, -80], 1.6, 0, S.tunnel, [2, 70]),
    // tunnel stays dark right up to the exit flash; the switch to the light world happens under it
    k("t2", [0, 5, m(-78, -70)], [0, 8, -160], 1.0, 0, S.tunnel, [2, 70]),
    // SCENE 3: IDEA
    k("idea", m([0, 6.5, -92], [0, 6.5, -80]), [0, 11, -252], 0.5, 0.8, S.idea, ideaFog),
    at("i1", I.i1, S.idea, ideaFog),
    at("i2", I.i2, S.idea, ideaFog),
    at("i3", I.i3, S.idea, ideaFog),
    at("i4", I.i4, S.idea, ideaFog),
    k("i5", [cx, cy, m(-212, -200)], [cx, cy, -252], 1.4, 0.8, S.idea, ideaFog),
    // light flips to dark while the camera is inside the D's counter
    k("dThrough", [cx, cy, -262], [cx, cy - 0.5, -300], 1.2, 0, S.build, darkFog, [0.55, 0.9]),
    // SCENE 4: BUILD
    k("build", m([0, 8.5, -291], [0, 5.5, -272]), [0, bw.size * 0.36, bw.center[2]], 1.0, 0.8, S.build, darkFog),
    k("buildRise", m([0, 31, -322], [0, 21, -318]), [0, 10, -372], 1.4, 0.2, S.build, darkFog),
    at("p1", B.pillars[0], S.build, darkFog),
    at("p2", B.pillars[1], S.build, darkFog, 1.2),
    at("p3", B.pillars[2], S.build, darkFog, 1.2),
    k("days", m([0, 8.8, -444], [0, 7, -428]), [0, 8.3, B.days.center[2]], 1.4, 0.8, S.build, darkFog),
    at("coach", B.coach, S.build, darkFog),
    k("helix", [0, B.helix.y, B.helix.z0 + 6], [0, B.helix.y, B.helix.z1], 1.2, 0.3, S.build, darkFog),
    k("helixEnd", [0, B.helix.y, B.helix.z1 - 2], [0, B.helix.y, B.helix.z1 - 60], 2.0, 0, S.build, darkFog),
    at("map", B.map, S.build, darkFog, 1.3),
    // SCENE 5: LAUNCH
    k("launch", m([0, 7, -654], [0, 5, -640]), [0, lw.size * 0.4, lw.center[2]], 1.4, 0.8, S.launch, darkFog),
    at("s0", La[0], S.launch, darkFog),
    at("s1", La[1], S.launch, darkFog, 1.2),
    at("s2", La[2], S.launch, darkFog, 1.2),
    at("s3", La[3], S.launch, darkFog, 1.2),
    at("s4", La[4], S.launch, darkFog, 1.2),
    // phones: swing left so the route from the last story doesn't skim its screen
    k("proof", [m(0, -4), 9, -890], [m(0, -1), 9, -960], 1.2, 0.8, S.launch, darkFog),
    k("numbers", [0, 9, -940], [0, 9, -1040], 1.4, 0.4, S.launch, [30, 220]),
    // SCENE 6: convergence. UTN sits in the upper half, the CTA owns the bottom third
    k("final", m([0, 8, -980], [0, 8, -971]), m([0, 3, -1040], [0, 6, -1040]), 1.6, 2.0, S.final, [70, 320], [0.4, 0.8]),
  ];
}

export const CHAPTERS = [
  { id: "idea", label: "Idea", stop: "idea" },
  { id: "build", label: "Build", stop: "build" },
  { id: "launch", label: "Launch", stop: "launch" },
  { id: "join", label: "Join", stop: "final" },
] as const;

/* ------------------------------------------------------------------ */
/* Journey: beats <-> progress, and camera sampling                    */
/* ------------------------------------------------------------------ */

export type CameraSample = { pos: Vector3; look: Vector3; bg: Color; fogNear: number; fogFar: number };

const easeInOutSine = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;
/** fraction of the next segment the camera creeps through while holding, so it never fully stops */
const DRIFT = 0.07;

export class Journey {
  readonly layout: Layout;
  readonly keys: Key[];
  readonly total: number;
  private arrive: number[] = [];
  private leave: number[] = [];
  private index = new Map<string, number>();
  private posCurve: CatmullRomCurve3;
  private lookCurve: CatmullRomCurve3;
  /** background colours in sRGB, so blends look even to the eye (a linear blend brightens far too early) */
  private colors: RGB[];

  constructor(readonly mobile: boolean) {
    this.layout = getLayout(mobile);
    this.keys = buildKeys(this.layout);
    let b = 0;
    this.keys.forEach((key, i) => {
      b += key.travel;
      this.arrive.push(b);
      b += key.hold;
      this.leave.push(b);
      this.index.set(key.id, i);
    });
    this.total = b;
    this.posCurve = new CatmullRomCurve3(this.keys.map((k) => new Vector3(...k.pos)), false, "centripetal");
    this.lookCurve = new CatmullRomCurve3(this.keys.map((k) => new Vector3(...k.look)), false, "centripetal");
    this.colors = this.keys.map((k) => new Color(k.bg).getRGB({ r: 0, g: 0, b: 0 }, SRGBColorSpace));
  }

  /** Beat for "id" (arrival) or "id:hold" (end of hold). */
  beatOf(ref: string) {
    const [id, part] = ref.split(":");
    const i = this.index.get(id);
    if (i === undefined) throw new Error(`Unknown journey key "${id}"`);
    return part === "hold" ? this.leave[i] : this.arrive[i];
  }

  /** Progress (0..1) at a key, optionally offset by a number of beats. */
  p(ref: string, offsetBeats = 0) {
    return MathUtils.clamp((this.beatOf(ref) + offsetBeats) / this.total, 0, 1);
  }

  /** Length of n beats in progress units. */
  beats(n: number) {
    return n / this.total;
  }

  /**
   * Where along the key sequence a progress value falls.
   * i: segment index, w: path fraction (creeps during holds), c: colour fraction (travel only).
   */
  private locate(progress: number) {
    const b = MathUtils.clamp(progress, 0, 1) * this.total;
    const n = this.keys.length;
    for (let i = 0; i < n; i++) {
      if (b <= this.leave[i]) {
        const hold = this.keys[i].hold;
        const inHold = hold > 0 ? MathUtils.clamp((b - this.arrive[i]) / hold, 0, 1) : 0;
        return { i, w: i === n - 1 ? 0 : DRIFT * inHold, c: 0 };
      }
      if (i < n - 1 && b < this.arrive[i + 1]) {
        const e = easeInOutSine((b - this.leave[i]) / this.keys[i + 1].travel);
        return { i, w: DRIFT + (1 - DRIFT) * e, c: e };
      }
    }
    return { i: n - 1, w: 0, c: 0 };
  }

  sample(progress: number, out: CameraSample) {
    const { i, w, c } = this.locate(progress);
    const n = this.keys.length;
    const j = Math.min(i + 1, n - 1);
    const t = Math.min(1, (i + w) / (n - 1));
    this.posCurve.getPoint(t, out.pos);
    this.lookCurve.getPoint(t, out.look);
    const win = this.keys[j].bgWindow;
    const cc = win ? MathUtils.smoothstep(c, win[0], win[1]) : c;
    const a = this.colors[i];
    const b = this.colors[j];
    out.bg.setRGB(MathUtils.lerp(a.r, b.r, cc), MathUtils.lerp(a.g, b.g, cc), MathUtils.lerp(a.b, b.b, cc), SRGBColorSpace);
    out.fogNear = MathUtils.lerp(this.keys[i].fog[0], this.keys[j].fog[0], cc);
    out.fogFar = MathUtils.lerp(this.keys[i].fog[1], this.keys[j].fog[1], cc);
    return out;
  }

  /** Camera position along the path at a progress value (used to build the tunnel). */
  pointAt(progress: number, out = new Vector3()) {
    const { i, w } = this.locate(progress);
    return this.posCurve.getPoint(Math.min(1, (i + w) / (this.keys.length - 1)), out);
  }
}

/** 0 outside [from, to], ramps up over `fadeIn` and down over `fadeOut` (all progress units). */
export function windowed(p: number, from: number, to: number, fadeIn: number, fadeOut = fadeIn) {
  if (p <= from - fadeIn || p >= to + fadeOut) return 0;
  if (p < from) return 1 - (from - p) / fadeIn;
  if (p > to) return 1 - (p - to) / fadeOut;
  return 1;
}

/** 0..1 ramp of p between a and b, clamped. */
export function ramp(p: number, a: number, b: number) {
  return MathUtils.clamp((p - a) / (b - a), 0, 1);
}
