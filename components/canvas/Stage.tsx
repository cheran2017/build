"use client";

import { Suspense, useContext, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useProgress, useTexture } from "@react-three/drei";
import { Color, Fog, Material, MathUtils, Mesh, NeutralToneMapping, Object3D, PerspectiveCamera, Scene, Texture, Vector2, Vector3 } from "three";
import type { CameraSample, Journey } from "@/lib/journey";
import { sceneTextures } from "@/lib/content";
import { getUI, scroll, setUI } from "@/lib/store";
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

    bg.copy(sample.bg);
    fog.color.copy(sample.bg);
    fog.near = sample.fogNear;
    fog.far = sample.fogFar;

    // tight near plane only while inside the studio (laptop close-ups), then a deeper one for the giant worlds
    const near = scroll.progress < nearSwitch ? 0.01 : 0.4;
    if (camera.near !== near) {
      camera.near = near;
      camera.updateProjectionMatrix();
    }
  }, -1);

  return null;
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
      // warm-up draws from every stop, in one task so no real frame interleaves; CameraRig restores the camera next frame
      const s: CameraSample = { pos: new Vector3(), look: new Vector3(), bg: new Color(), fogNear: 10, fogFar: 100 };
      const near = camera.near;
      withAllVisible(scene, () => {
        for (const k of journey.keys) {
          journey.sample(journey.p(k.id), s);
          camera.position.copy(s.pos);
          camera.lookAt(s.look);
          camera.updateMatrixWorld();
          gl.render(scene, camera);
        }
      });
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
