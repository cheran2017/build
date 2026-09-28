"use client";

import { Suspense, useContext, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useProgress, useTexture } from "@react-three/drei";
import { Color, Fog, Material, MathUtils, Mesh, NeutralToneMapping, Object3D, PerspectiveCamera, Scene, Texture, Vector2, Vector3 } from "three";
import type { CameraSample, Journey } from "@/lib/journey";
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

  const framing = useFinaleFraming(journey, camera);

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

/**
 * Frames the final UTN wordmark in the space the HTML leaves free: below the nav, above the call to action.
 * The 3D shot is fixed but the HTML is sized by the viewport, so on a wide, short window the headline would
 * otherwise cover the word. During the finale this shifts the projection vertically (a lens shift: nothing in
 * the scene moves) and, only if the word can't fit, zooms out. Everywhere else it's the plain camera.
 */
function useFinaleFraming(journey: Journey, camera: PerspectiveCamera) {
  const baseFov = useMemo(() => camera.fov, [camera]);
  const band = useMemo(() => ({ top: 0.8, bottom: 0 }), []);
  const f = useMemo(() => {
    const w = journey.layout.words.utn;
    const lay = layoutWord(w.text, w.size, w.tracking);
    const z = w.center[2] + w.depth;
    const x0 = w.center[0] - lay.width / 2;
    const x1 = w.center[0] + lay.width / 2;
    const yTop = w.center[1] + lay.cap * 1.03;
    const yBottom = w.center[1] - 1.5; // the accent underline sits 1.2 below the baseline
    return {
      corners: [new Vector3(x0, yTop, z), new Vector3(x1, yTop, z), new Vector3(x0, yBottom, z), new Vector3(x1, yBottom, z)],
      from: journey.p("numbers"),
      to: journey.p("final"),
      v: new Vector3(),
    };
  }, [journey]);

  // measure the free band in NDC; the overlay's layout box (offsets ignore its fade-in transform)
  useEffect(() => {
    const measure = () => {
      const H = window.innerHeight;
      const nav = document.querySelector<HTMLElement>(".chrome .nav");
      const sec = document.querySelector<HTMLElement>('[data-ov="final"]');
      const inner = sec?.firstElementChild as HTMLElement | null;
      const navBottom = nav ? nav.offsetTop + nav.offsetHeight : 80;
      const ctaTop = sec && inner ? sec.offsetTop + inner.offsetTop : H * 0.55;
      band.top = 1 - (2 * (navBottom + 8)) / H;
      band.bottom = 1 - (2 * (ctaTop - 28)) / H;
    };
    measure();
    const ro = new ResizeObserver(measure);
    const sec = document.querySelector('[data-ov="final"]');
    if (sec) ro.observe(sec);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [band]);

  return {
    apply(progress: number, near: number) {
      const k = MathUtils.smootherstep(progress, f.from, f.to);
      let fov = baseFov;
      let shift = 0;
      if (k > 0) {
        // where the word lands with the plain lens
        camera.fov = baseFov;
        camera.near = near;
        camera.updateProjectionMatrix();
        let top = -Infinity;
        let bottom = Infinity;
        let left = Infinity;
        let right = -Infinity;
        for (const c of f.corners) {
          f.v.copy(c).project(camera);
          top = Math.max(top, f.v.y);
          bottom = Math.min(bottom, f.v.y);
          left = Math.min(left, f.v.x);
          right = Math.max(right, f.v.x);
        }
        const room = Math.max(0.2, band.top - band.bottom);
        // zoom out only (never in), to fit the band's height and 92% of the width
        const fit = Math.min(1, room / (top - bottom), 1.84 / (right - left));
        const s = 1 + (fit - 1) * k;
        fov = MathUtils.radToDeg(2 * Math.atan(Math.tan(MathUtils.degToRad(baseFov) / 2) / s));
        // zooming scales NDC about the centre by s; then shift the word's centre onto the band's centre
        shift = k * ((band.top + band.bottom) / 2 - (s * (top + bottom)) / 2);
      }
      // compare with the camera's real state: the measuring pass above and R3F's own resize handling
      // both rebuild the projection matrix, which drops the shift
      if (camera.near === near && camera.fov === fov && camera.projectionMatrix.elements[9] === -shift && k === 0) return;
      camera.near = near;
      camera.fov = fov;
      camera.updateProjectionMatrix();
      // lens shift: ndc.y = ... - m23, so m23 = -shift moves everything up by `shift`
      camera.projectionMatrix.elements[9] = -shift;
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
