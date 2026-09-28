"use client";

import { Suspense, useContext, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useProgress, useTexture } from "@react-three/drei";
import { Color, Fog, Material, MathUtils, Mesh, NeutralToneMapping, Object3D, PerspectiveCamera, Scene, Texture, Vector2, Vector3 } from "three";
import { LAPTOP, type CameraSample, type Journey } from "@/lib/journey";
import { sceneTextures } from "@/lib/content";
import { getUI, scroll, setUI } from "@/lib/store";
import { layoutWord } from "@/lib/type";
import { JourneyContext } from "./parts";
import { Studio } from "./Studio";
import { Tunnel } from "./Tunnel";
import { IdeaWorld } from "./IdeaWorld";
import { BuildWorld } from "./BuildWorld";
import { LaunchWorld } from "./LaunchWorld";
import { Finale } from "./Finale";

sceneTextures.forEach((src) => useTexture.preload(src));

/** Pixel ratio range. Starts at the top and is lowered by <AdaptiveQuality> when frames drop. */
const DPR = { desktop: [0.8, 1.75], mobile: [0.75, 1.5] } as const;

export default function Stage({ journey }: { journey: Journey }) {
  const mobile = journey.mobile;
  const start = journey.keys[0].pos;
  // ?adaptive=0 pins the pixel ratio at its maximum, for benchmarking (scripts/perf.mjs)
  const adaptive = useMemo(() => new URLSearchParams(window.location.search).get("adaptive") !== "0", []);
  return (
    <Canvas
      className="stage"
      // decorative: every word and action in the scene is also in the HTML overlays or the classic view
      aria-hidden="true"
      dpr={[1, mobile ? DPR.mobile[1] : DPR.desktop[1]]}
      gl={{ antialias: true, powerPreference: "high-performance", toneMapping: NeutralToneMapping }}
      camera={{ fov: mobile ? 58 : 42, near: 0.01, far: 420, position: start }}
      style={{ position: "fixed", inset: 0, touchAction: "pan-y" }}
    >
      <JourneyContext.Provider value={journey}>
        <CameraRig journey={journey} />
        <hemisphereLight args={["#ffffff", "#c9c9c4", 1.15]} />
        <directionalLight position={[4, 9, 6]} intensity={1.5} />
        <ambientLight intensity={0.15} />
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={2.2} position={[0, 6, -6]} scale={[14, 5, 1]} />
          <Lightformer form="rect" intensity={1.4} position={[-7, 2, 2]} rotation-y={Math.PI / 2} scale={[10, 3, 1]} />
          <Lightformer form="rect" intensity={1.4} position={[7, 2, 2]} rotation-y={-Math.PI / 2} scale={[10, 3, 1]} />
          <Lightformer form="rect" intensity={0.8} position={[0, 1, 8]} rotation-y={Math.PI} scale={[12, 4, 1]} />
        </Environment>
        <Suspense fallback={null}>
          <Studio />
          <Tunnel />
          <IdeaWorld />
          <BuildWorld />
          <LaunchWorld />
          <Finale />
          <Ready />
          {/* inside Suspense so it only starts measuring once everything has loaded and compiled */}
          {adaptive && <AdaptiveQuality range={mobile ? DPR.mobile : DPR.desktop} />}
        </Suspense>
        <LoadReporter />
        <PauseWhenCovered />
      </JourneyContext.Provider>
    </Canvas>
  );
}

/**
 * Scales the pixel ratio with measured frame rate, once a second. Fill rate is the main cost here, so this is
 * the lever that matters. Hopeless frame rates jump straight to the floor instead of stepping down slowly;
 * headroom is only reclaimed after three good seconds, and after a few reversals it stops adjusting.
 */
function AdaptiveQuality({ range }: { range: readonly [number, number] }) {
  const setDpr = useThree((s) => s.setDpr);
  const state = useMemo(() => {
    const [lo, hi] = range;
    const top = Math.max(lo, Math.min(hi, window.devicePixelRatio));
    return { lo, top, dpr: top, frames: 0, time: 0, warmup: 1, good: 0, lastDir: 0, reversals: 0 };
  }, [range]);

  useFrame((_, dt) => {
    const s = state;
    // a gap this long is a tab switch or pause, not a frame time (slow devices really do take ~0.25s per frame)
    if (dt > 1) return;
    if (s.warmup > 0) return void (s.warmup -= dt); // skip first-second shader/texture uploads
    if (s.reversals >= 4) return;
    s.frames++;
    s.time += dt;
    if (s.time < 1) return;
    const fps = s.frames / s.time;
    s.frames = 0;
    s.time = 0;

    let next = s.dpr;
    if (fps < 20) next = s.lo;
    else if (fps < 45) next = Math.max(s.lo, s.dpr - 0.25);
    else if (fps > 57 && ++s.good >= 3) next = Math.min(s.top, s.dpr + 0.25);
    if (fps <= 57) s.good = 0;
    if (next === s.dpr) return;

    const dir = Math.sign(next - s.dpr);
    if (s.lastDir && dir !== s.lastDir) s.reversals++;
    s.lastDir = dir;
    s.good = 0;
    s.dpr = next;
    setDpr(next);
  });
  return null;
}

/**
 * Stops rendering once the plans section has scrolled over the canvas (it has an opaque background),
 * so reading the pricing doesn't keep a GPU busy. The journey spacer leaving the viewport is exactly that moment.
 */
function PauseWhenCovered() {
  const setFrameloop = useThree((s) => s.setFrameloop);
  const canvas = useThree((s) => s.gl.domElement);
  useEffect(() => {
    const spacer = document.querySelector(".journey");
    if (!spacer) return;
    const io = new IntersectionObserver(([e]) => {
      setFrameloop(e.isIntersecting ? "always" : "never");
      canvas.dataset.paused = String(!e.isIntersecting);
    });
    io.observe(spacer);
    return () => {
      io.disconnect();
      setFrameloop("always");
    };
  }, [setFrameloop, canvas]);
  return null;
}

/** Writes the journey camera, background and fog every frame. */
function CameraRig({ journey }: { journey: Journey }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const scene = useThree((s) => s.scene);
  const sample = useMemo<CameraSample>(() => ({ pos: new Vector3(), look: new Vector3(), bg: new Color(), fogNear: 10, fogFar: 100 }), []);
  const fog = useMemo(() => new Fog("#f3f3f0", 7, 26), []);
  const bg = useMemo(() => new Color("#f3f3f0"), []);
  const pointer = useMemo(() => new Vector2(), []);
  const nearSwitch = journey.p("cross", 0.25);

  useEffect(() => {
    scene.fog = fog;
    scene.background = bg;
    return () => {
      scene.fog = null;
      scene.background = null;
    };
  }, [scene, fog, bg]);

  const framing = useFraming(journey, camera);

  useFrame((state, dt) => {
    journey.sample(scroll.progress, sample);
    camera.position.copy(sample.pos);
    camera.lookAt(sample.look);

    // a touch of pointer parallax on desktop, damped so it never twitches
    if (!journey.mobile) {
      pointer.x = MathUtils.damp(pointer.x, state.pointer.x, 3, dt);
      pointer.y = MathUtils.damp(pointer.y, state.pointer.y, 3, dt);
      camera.rotateY(-pointer.x * 0.025);
      camera.rotateX(pointer.y * 0.018);
    }
    camera.updateMatrixWorld();

    bg.copy(sample.bg);
    fog.color.copy(sample.bg);
    fog.near = sample.fogNear;
    fog.far = sample.fogFar;

    // tight near plane only while inside the studio (laptop close-ups), then a deeper one for the giant worlds
    const near = scroll.progress < nearSwitch ? 0.01 : 0.4;
    framing.apply(scroll.progress, near);
  }, -1);

  return null;
}

/** A shot framed against the HTML: keep `points` inside the free screen area `band` (NDC) while `weight` > 0. */
type FramedShot = {
  points: Vector3[];
  weight: (progress: number) => number;
  band: { left: number; right: number; top: number; bottom: number };
  shiftX: boolean;
  shiftY: boolean;
  /** reads the free area from the page (px -> NDC); re-run on resize and when the overlays reflow */
  measure: (W: number, H: number) => void;
  watch: string[];
};

/** Offset of an element's layout box inside the fixed overlay layer (offsets ignore the fade-in transforms). */
function boxOf(selector: string) {
  const sec = document.querySelector<HTMLElement>(selector);
  const inner = sec?.firstElementChild as HTMLElement | null;
  if (!sec || !inner) return null;
  const left = sec.offsetLeft + inner.offsetLeft;
  const top = sec.offsetTop + inner.offsetTop;
  return { left, top, right: left + inner.offsetWidth, bottom: top + inner.offsetHeight };
}

const pxToNdc = (x: number, y: number, W: number, H: number) => ({ x: (2 * x) / W - 1, y: 1 - (2 * y) / H });

/**
 * Frames key shots in the space the HTML leaves free. The 3D shots are fixed but the HTML is sized by the
 * viewport, so on some window shapes text would cover the subject or the subject would run off-screen.
 * While a shot is active this zooms out (only if the subject can't fit) and shifts the lens (nothing in the
 * scene moves) so the subject sits centred in its free area. Everywhere else it's the plain camera.
 *   opening (desktop): the desk beside the hero headline, between it and the right edge
 *   finale: the UTN wordmark below the nav and above the call to action
 */
function useFraming(journey: Journey, camera: PerspectiveCamera) {
  const baseFov = useMemo(() => camera.fov, [camera]);
  const v = useMemo(() => new Vector3(), []);

  const shots = useMemo<FramedShot[]>(() => {
    const navBottom = () => {
      const nav = document.querySelector<HTMLElement>(".chrome .nav");
      return nav ? nav.offsetTop + nav.offsetHeight : 80;
    };
    const list: FramedShot[] = [];

    if (!journey.mobile) {
      // desk slab corners, plinth foot, and the sphere's top
      const pts: Vector3[] = [];
      for (const x of [-0.95, 0.95]) for (const z of [-0.43, 0.43]) pts.push(new Vector3(x, LAPTOP.deskY + 0.005, z), new Vector3(x, LAPTOP.deskY - 0.055, z));
      for (const x of [-0.03, 0.39]) for (const z of [-0.34, 0.24]) pts.push(new Vector3(x, 0, z));
      pts.push(new Vector3(0.68, LAPTOP.deskY + 0.15, 0.16));
      const hold = journey.p("r0:hold");
      const leave = journey.p("r1", -0.4);
      const band = { left: 0, right: 0.9, top: 0.7, bottom: -0.8 };
      list.push({
        points: pts,
        weight: (p) => 1 - MathUtils.smootherstep(p, hold, leave),
        band,
        shiftX: true,
        shiftY: false,
        watch: ['[data-ov="hero"]'],
        measure(W, H) {
          const hero = boxOf('[data-ov="hero"]');
          const chapters = document.querySelector<HTMLElement>(".chapters");
          const a = pxToNdc((hero?.right ?? W * 0.4) + 32, navBottom() + 16, W, H);
          const b = pxToNdc(W - 32, (chapters ? chapters.offsetTop : H - 70) - 12, W, H);
          Object.assign(band, { left: a.x, top: a.y, right: b.x, bottom: b.y });
        },
      });
    }

    {
      const w = journey.layout.words.utn;
      const lay = layoutWord(w.text, w.size, w.tracking);
      const z = w.center[2] + w.depth;
      const x0 = w.center[0] - lay.width / 2;
      const x1 = w.center[0] + lay.width / 2;
      const yTop = w.center[1] + lay.cap * 1.03;
      const yBottom = w.center[1] - 1.5; // the accent underline sits 1.2 below the baseline
      const from = journey.p("numbers");
      const to = journey.p("final");
      const band = { left: -0.92, right: 0.92, top: 0.8, bottom: 0 };
      list.push({
        points: [new Vector3(x0, yTop, z), new Vector3(x1, yTop, z), new Vector3(x0, yBottom, z), new Vector3(x1, yBottom, z)],
        weight: (p) => MathUtils.smootherstep(p, from, to),
        band,
        shiftX: false,
        shiftY: true,
        watch: ['[data-ov="final"]'],
        measure(W, H) {
          const cta = boxOf('[data-ov="final"]');
          band.top = pxToNdc(0, navBottom() + 8, W, H).y;
          band.bottom = pxToNdc(0, (cta?.top ?? H * 0.55) - 28, W, H).y;
        },
      });
    }
    return list;
  }, [journey]);

  useEffect(() => {
    const measure = () => shots.forEach((s) => s.measure(window.innerWidth, window.innerHeight));
    measure();
    const ro = new ResizeObserver(measure);
    shots.flatMap((s) => s.watch).forEach((sel) => {
      const el = document.querySelector(sel);
      if (el) ro.observe(el);
    });
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [shots]);

  return {
    apply(progress: number, near: number) {
      let shot: FramedShot | null = null;
      let k = 0;
      for (const s of shots) {
        const w = s.weight(progress);
        if (w > k) {
          k = w;
          shot = s;
        }
      }
      let fov = baseFov;
      let sx = 0;
      let sy = 0;
      if (shot && k > 0) {
        // where the subject lands with the plain lens
        camera.fov = baseFov;
        camera.near = near;
        camera.updateProjectionMatrix();
        let top = -Infinity;
        let bottom = Infinity;
        let left = Infinity;
        let right = -Infinity;
        for (const c of shot.points) {
          v.copy(c).project(camera);
          top = Math.max(top, v.y);
          bottom = Math.min(bottom, v.y);
          left = Math.min(left, v.x);
          right = Math.max(right, v.x);
        }
        const b = shot.band;
        // zoom out only (never in), to fit the free area
        const fit = Math.min(1, Math.max(0.2, b.top - b.bottom) / (top - bottom), Math.max(0.2, b.right - b.left) / (right - left));
        const s = 1 + (fit - 1) * k;
        fov = MathUtils.radToDeg(2 * Math.atan(Math.tan(MathUtils.degToRad(baseFov) / 2) / s));
        // zooming scales NDC about the centre by s; then shift the subject's centre onto the free area's centre
        if (shot.shiftX) sx = k * ((b.left + b.right) / 2 - (s * (left + right)) / 2);
        if (shot.shiftY) sy = k * ((b.top + b.bottom) / 2 - (s * (top + bottom)) / 2);
      }
      // compare with the camera's real state: the measuring pass above and R3F's own resize handling
      // both rebuild the projection matrix, which drops the shift
      const P = camera.projectionMatrix.elements;
      if (k === 0 && camera.near === near && camera.fov === fov && P[8] === -sx && P[9] === -sy) return;
      camera.near = near;
      camera.fov = fov;
      camera.updateProjectionMatrix();
      // lens shift: ndc = ... - m13 / - m23, so setting them to -shift moves everything by `shift`
      P[8] = -sx;
      P[9] = -sy;
      camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
    },
  };
}

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

/** Runs `fn` with every object in the scene visible (worlds hide themselves outside their slice of the journey). */
function withAllVisible(scene: Scene, fn: () => void) {
  const hidden: Object3D[] = [];
  scene.traverse((o) => {
    if (!o.visible) {
      hidden.push(o);
      o.visible = true;
    }
  });
  try {
    fn();
  } finally {
    hidden.forEach((o) => (o.visible = false));
  }
}

/**
 * Mounts once everything inside Suspense has loaded, and pays every first-use cost behind the loader.
 * three's compile() only sees *visible* objects, so with the worlds hidden their shaders would compile the moment
 * each world appears: multi-second freezes on Windows/ANGLE, where every shader goes through the D3D compiler.
 * So: show everything, compile (in parallel where supported), then draw one frame from every camera stop so
 * buffer uploads and driver work happen now too.
 */
function Ready() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const journey = useContext(JourneyContext)!;
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") Object.assign(window, { __utnGL: gl, __utnScene: scene, __utnCam: camera });
    let cancelled = false;
    (async () => {
      // let the environment map render first: materials compiled without it would recompile later
      await nextFrame();
      await nextFrame();
      // in-world text (troika) lays out glyphs in a worker and only has its final material once that's done;
      // wait for it (up to 6s), or the text shader compiles the first time a world with labels appears
      const texts: { _textRenderInfo?: unknown; _isSyncing?: boolean }[] = [];
      scene.traverse((o) => {
        if ("_needsSync" in o && typeof (o as { sync?: unknown }).sync === "function") texts.push(o as never);
      });
      const until = performance.now() + 6000;
      while (!cancelled && performance.now() < until && texts.some((t) => !t._textRenderInfo || t._isSyncing)) await nextFrame();
      if (cancelled) return;
      scene.traverse((o) => {
        const mat = (o as Mesh).material as (Material & { map?: Texture | null; uniforms?: Record<string, { value: unknown }> }) | undefined;
        if (!mat || Array.isArray(mat)) return;
        const tex = mat.map ?? (mat.uniforms?.map?.value as Texture | undefined);
        if (tex instanceof Texture) gl.initTexture(tex);
      });
      let compiling: Promise<unknown> = Promise.resolve();
      withAllVisible(scene, () => (compiling = gl.compileAsync(scene, camera)));
      await compiling;
      if (cancelled) return;
      // warm-up draws from every stop, in one task so no real frame interleaves; CameraRig restores the camera next frame.
      // A 1x1 viewport: the point is compiling and uploading, not pixels (full-size draws cost ~20s on software GL)
      const s: CameraSample = { pos: new Vector3(), look: new Vector3(), bg: new Color(), fogNear: 10, fogFar: 100 };
      const near = camera.near;
      const full = gl.getSize(new Vector2());
      gl.setViewport(0, 0, 1, 1);
      gl.setScissor(0, 0, 1, 1);
      gl.setScissorTest(true);
      try {
        withAllVisible(scene, () => {
          for (const k of journey.keys) {
            journey.sample(journey.p(k.id), s);
            camera.position.copy(s.pos);
            camera.lookAt(s.look);
            camera.updateMatrixWorld();
            gl.render(scene, camera);
          }
        });
      } finally {
        gl.setScissorTest(false);
        gl.setViewport(0, 0, full.x, full.y);
      }
      camera.near = near;
      camera.updateProjectionMatrix();
      await nextFrame();
      if (!cancelled) setUI({ ready: true, loaded: 100 });
    })();
    return () => {
      cancelled = true;
    };
  }, [gl, scene, camera, journey]);
  return null;
}

function LoadReporter() {
  const progress = useProgress((s) => s.progress);
  useEffect(() => {
    if (!getUI().ready) setUI({ loaded: Math.min(99, progress) });
  }, [progress]);
  return null;
}
