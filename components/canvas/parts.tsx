"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ComponentProps, type RefObject } from "react";
import { useFrame, useThree, type ThreeElements } from "@react-three/fiber";
import { Text, useTexture } from "@react-three/drei";
import {
  BufferGeometry,
  CanvasTexture,
  ExtrudeGeometry,
  Group,
  MathUtils,
  Material,
  Mesh,
  MeshBasicMaterial as MeshBasicMaterialImpl,
  Object3D,
  SRGBColorSpace,
  Shape,
  ShaderMaterial,
  Texture,
  UniformsLib,
  UniformsUtils,
  Vector2,
  VideoTexture,
} from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { ramp, type Journey, type WordSpec } from "@/lib/journey";
import { aspectOf } from "@/lib/content";
import { openVideo, scroll, type VideoRequest } from "@/lib/store";
import { getFont, layoutWord } from "@/lib/type";

/* ------------------------------------------------------------------ */
/* Journey context                                                     */
/* ------------------------------------------------------------------ */

export const JourneyContext = createContext<Journey | null>(null);
export function useJourney() {
  const j = useContext(JourneyContext);
  if (!j) throw new Error("useJourney outside <JourneyContext>");
  return j;
}

/**
 * Drive each letter of a Word3D through a staggered 0..1 ramp between two progress values.
 * `stagger` is how far into one letter's ramp the next letter starts.
 */
export function useLetterMotion(
  letters: RefObject<Mesh[]>,
  from: number,
  to: number,
  apply: (mesh: Mesh, k: number, index: number) => void,
  stagger = 0.35,
) {
  useFrame(() => {
    const arr = letters.current;
    const n = arr.filter(Boolean).length;
    if (!n) return;
    const each = (to - from) / (1 + stagger * (n - 1));
    let i = 0;
    for (const mesh of arr) {
      if (!mesh) continue;
      const a = from + i * stagger * each;
      apply(mesh, ramp(scroll.progress, a, a + each), i);
      i++;
    }
  });
}

export const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeInCubic = (x: number) => x * x * x;

/** Hide a whole world outside its slice of the journey so it costs nothing to render. */
export function useVisibleBetween(ref: RefObject<Object3D | null>, from: number, to: number) {
  useFrame(() => {
    if (ref.current) ref.current.visible = scroll.progress >= from && scroll.progress <= to;
  });
}

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

const geoCache = new Map<string, BufferGeometry>();
function cached<T extends BufferGeometry>(key: string, make: () => T): T {
  let g = geoCache.get(key);
  if (!g) {
    g = make();
    geoCache.set(key, g);
  }
  return g as T;
}

export function roundedRect(w: number, h: number, r: number) {
  const s = new Shape();
  const x = -w / 2;
  const y = -h / 2;
  r = Math.min(r, w / 2, h / 2);
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** Rounded slab, face centred on the origin, extruded from z = 0 to z = depth. */
export function slabGeometry(w: number, h: number, r: number, depth: number) {
  const key = `slab:${w.toFixed(3)}:${h.toFixed(3)}:${r.toFixed(3)}:${depth.toFixed(3)}`;
  return cached(key, () => new ExtrudeGeometry(roundedRect(w, h, r), { depth, bevelEnabled: false, curveSegments: 10 }));
}

export function letterGeometry(ch: string, size: number, depth: number) {
  const key = `letter:${ch}:${size}:${depth}`;
  return cached(
    key,
    () =>
      new TextGeometry(ch, {
        font: getFont(),
        size,
        depth,
        curveSegments: 6,
        bevelEnabled: true,
        bevelThickness: size * 0.012,
        bevelSize: size * 0.006,
        bevelSegments: 2,
      }),
  );
}

/* ------------------------------------------------------------------ */
/* Rounded image material (fog aware, anti-aliased corners)            */
/* ------------------------------------------------------------------ */

export class RoundedImageMaterial extends ShaderMaterial {
  constructor(map: Texture, w: number, h: number, radius: number) {
    super({
      uniforms: UniformsUtils.merge([
        UniformsLib.fog,
        { map: { value: null }, size: { value: new Vector2(w, h) }, radius: { value: radius }, opacity: { value: 1 } },
      ]),
      vertexShader: /* glsl */ `
        #include <common>
        #include <fog_pars_vertex>
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }`,
      fragmentShader: /* glsl */ `
        #include <common>
        #include <fog_pars_fragment>
        uniform sampler2D map;
        uniform vec2 size;
        uniform float radius;
        uniform float opacity;
        varying vec2 vUv;
        float sdRoundBox(vec2 p, vec2 b, float r) {
          vec2 q = abs(p) - b + r;
          return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
        }
        void main() {
          vec2 p = (vUv - 0.5) * size;
          float d = sdRoundBox(p, size * 0.5, radius);
          float aa = fwidth(d);
          float mask = 1.0 - smoothstep(-aa, aa, d);
          vec4 tex = texture2D(map, vUv);
          gl_FragColor = vec4(tex.rgb, tex.a * mask * opacity);
          #include <colorspace_fragment>
          #include <fog_fragment>
        }`,
      transparent: true,
      fog: true,
    });
    this.uniforms.map.value = map;
  }
}

function useSRGBTexture(src: string) {
  const tex = useTexture(src) as Texture;
  const gl = useThree((s) => s.gl);
  useMemo(() => {
    if (tex.colorSpace !== SRGBColorSpace) {
      tex.colorSpace = SRGBColorSpace;
      tex.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
      tex.needsUpdate = true;
    }
  }, [tex, gl]);
  return tex;
}

/* ------------------------------------------------------------------ */
/* ImagePanel                                                          */
/* ------------------------------------------------------------------ */

type Frame = "light" | "dark" | "none";

type ImagePanelProps = Omit<ThreeElements["group"], "ref"> & {
  src: string;
  w: number;
  frame?: Frame;
  r?: number;
  pad?: number;
  depth?: number;
  panelRef?: RefObject<Group | null>;
  materialRef?: RefObject<RoundedImageMaterial | null>;
};

export function ImagePanel({ src, w, frame = "dark", r = 0.22, pad = 0.12, depth = 0.14, panelRef, materialRef, children, ...group }: ImagePanelProps) {
  const tex = useSRGBTexture(src);
  const h = w * aspectOf(src);
  const mat = useMemo(() => new RoundedImageMaterial(tex, w, h, r), [tex, w, h, r]);
  if (materialRef) materialRef.current = mat;
  return (
    <group ref={panelRef} {...group}>
      {frame !== "none" && (
        <mesh geometry={slabGeometry(w + pad * 2, h + pad * 2, r + pad * 0.6, depth)} position-z={-depth - 0.02}>
          {frame === "light" ? (
            <meshStandardMaterial color="#ffffff" roughness={0.75} metalness={0} />
          ) : (
            <meshStandardMaterial color="#15171c" roughness={0.55} metalness={0.35} />
          )}
        </mesh>
      )}
      <mesh material={mat}>
        <planeGeometry args={[w, h]} />
      </mesh>
      {children}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Text                                                                */
/* ------------------------------------------------------------------ */

type LabelProps = ComponentProps<typeof Text> & { weight?: 500 | 700 | 800 };

/** Small in-world type (SDF). Long readable copy belongs in HTML overlays, not here. */
export function Label({ weight = 700, ...props }: LabelProps) {
  return <Text font={`/fonts/inter-tight-${weight}.woff`} anchorX="center" anchorY="middle" letterSpacing={-0.015} {...props} />;
}

/* ------------------------------------------------------------------ */
/* Word3D                                                              */
/* ------------------------------------------------------------------ */

type Word3DProps = {
  spec: Pick<WordSpec, "text" | "size" | "depth" | "tracking"> & { center: [number, number, number] };
  /** one material, or [faces, sides]: extruded text geometry puts front/back caps in group 0 and walls in group 1 */
  material: Material | [Material, Material];
  align?: "center" | "left" | "right";
  letters?: RefObject<Mesh[]>;
};

/** Giant extruded word, one mesh per letter so letters can animate individually. */
export function Word3D({ spec, material, align = "center", letters }: Word3DProps) {
  const lay = useMemo(() => layoutWord(spec.text, spec.size, spec.tracking), [spec.text, spec.size, spec.tracking]);
  const left = align === "center" ? -lay.width / 2 - lay.inkLeft : align === "left" ? -lay.inkLeft : -lay.width - lay.inkLeft;
  return (
    <group position={spec.center}>
      {lay.letters.map((l, i) =>
        l.ch === " " ? null : (
          <mesh
            key={i}
            ref={(m) => {
              if (letters && m) letters.current[i] = m;
            }}
            geometry={letterGeometry(l.ch, spec.size, spec.depth)}
            material={material}
            position={[left + l.x, 0, 0]}
            userData={{ x: left + l.x }}
          />
        ),
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Ambient loops (generated video)                                     */
/* ------------------------------------------------------------------ */

/** True if the object and all its ancestors are visible (i.e. its world is switched on). */
function isShown(o: Object3D | null) {
  for (let n = o; n; n = n.parent) if (!n.visible) return false;
  return !!o;
}

/**
 * A muted looping video as a texture, cover-fitted to `aspect` (width / height) via the texture's repeat/offset.
 * Returns null until `src` is set. The video only plays while `holder` is shown, so hidden worlds cost nothing.
 */
export function useLoopTexture(src: string | null, aspect: number, holder: RefObject<Object3D | null>) {
  const [tex, setTex] = useState<VideoTexture | null>(null);
  useEffect(() => {
    if (!src) return;
    const v = document.createElement("video");
    Object.assign(v, { src, muted: true, loop: true, playsInline: true, crossOrigin: "anonymous", preload: "auto" });
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    const t = new VideoTexture(v);
    t.colorSpace = SRGBColorSpace;
    const fit = () => {
      const va = v.videoWidth / v.videoHeight || aspect;
      if (va > aspect) {
        t.repeat.set(aspect / va, 1);
        t.offset.set((1 - aspect / va) / 2, 0);
      } else {
        t.repeat.set(1, va / aspect);
        t.offset.set(0, (1 - va / aspect) / 2);
      }
      t.updateMatrix();
    };
    v.addEventListener("loadedmetadata", fit);
    setTex(t);
    return () => {
      v.removeEventListener("loadedmetadata", fit);
      v.pause();
      v.removeAttribute("src");
      v.load();
      t.dispose();
      setTex(null);
    };
  }, [src, aspect]);

  useFrame(() => {
    const v = tex?.image as HTMLVideoElement | undefined;
    if (!v) return;
    const shown = isShown(holder.current);
    if (shown && v.paused) v.play().catch(() => {});
    else if (!shown && !v.paused) v.pause();
  });
  return tex;
}

/** 0..1 that eases in once the video has frames to show, so loops never pop in. */
function useFadeIn(tex: VideoTexture | null, apply: (k: number) => void) {
  const k = useRef(0);
  useFrame((_, dt) => {
    const v = tex?.image as HTMLVideoElement | undefined;
    const target = v && v.readyState >= 2 ? 1 : 0;
    k.current = MathUtils.damp(k.current, target, 2.5, dt);
    apply(k.current);
  });
}

type AmbientPanelProps = Omit<ThreeElements["group"], "ref"> & { src: string | null; w: number; aspect?: number; fog?: boolean };

/** Large backdrop screen for a generated loop. Renders nothing when its slot is empty. */
export function AmbientPanel({ src, w, aspect = 16 / 9, fog = true, ...group }: AmbientPanelProps) {
  const ref = useRef<Group>(null);
  const tex = useLoopTexture(src, aspect, ref);
  const mat = useRef<MeshBasicMaterialImpl>(null);
  useFadeIn(tex, (k) => {
    if (mat.current) mat.current.opacity = k;
  });
  if (!src) return null;
  return (
    <group ref={ref} {...group}>
      {tex && (
        <mesh>
          <planeGeometry args={[w, w / aspect]} />
          <meshBasicMaterial ref={mat} map={tex} toneMapped={false} fog={fog} transparent opacity={0} />
        </mesh>
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* VideoScreen                                                         */
/* ------------------------------------------------------------------ */

/** Designed poster for stories that have no screenshot yet. */
function usePoster(title: string, subtitle: string) {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1280;
    c.height = 720;
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 1280, 720);
    grad.addColorStop(0, "#0b0d14");
    grad.addColorStop(1, "#141a33");
    g.fillStyle = grad;
    g.fillRect(0, 0, 1280, 720);
    const glow = g.createRadialGradient(1000, 160, 0, 1000, 160, 620);
    glow.addColorStop(0, "rgba(51,85,255,0.55)");
    glow.addColorStop(1, "rgba(51,85,255,0)");
    g.fillStyle = glow;
    g.fillRect(0, 0, 1280, 720);
    g.strokeStyle = "rgba(255,255,255,0.06)";
    for (let x = 0; x < 1280; x += 64) g.strokeRect(x, 0, 64, 720);
    g.fillStyle = "#ffffff";
    g.font = "800 128px 'Inter Tight', 'Inter', sans-serif";
    g.fillText(title, 80, 420);
    g.fillStyle = "#aeb3bf";
    g.font = "600 44px 'Inter Tight', 'Inter', sans-serif";
    g.fillText(subtitle, 84, 500);
    g.fillStyle = "#3355ff";
    g.fillRect(84, 560, 140, 8);
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    return t;
  }, [title, subtitle]);
}

type VideoScreenProps = Omit<ThreeElements["group"], "ref"> & {
  w: number;
  src: string | null;
  poster?: { title: string; subtitle: string };
  request: VideoRequest;
};

export function VideoScreen({ w, src, poster, request, ...group }: VideoScreenProps) {
  const ref = useRef<Group>(null);
  const [hover, setHover] = useState(false);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const s = MathUtils.damp(g.scale.x, hover ? 1.045 : 1, 8, dt);
    g.scale.setScalar(s);
  });
  const h = src ? w * aspectOf(src) : (w * 9) / 16;
  const events = {
    onClick: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      openVideo(request);
    },
    onPointerOver: () => {
      setHover(true);
      document.body.style.cursor = "pointer";
    },
    onPointerOut: () => {
      setHover(false);
      document.body.style.cursor = "";
    },
  };
  return (
    <group {...group}>
      <group ref={ref} {...events}>
        {src ? <ImagePanel src={src} w={w} frame="dark" r={0.18} pad={0.16} depth={0.18} /> : <PosterPanel w={w} h={h} poster={poster!} />}
        {/* play button in the corner so it never covers the screenshot or poster title */}
        <group position={[w / 2 - w * 0.11, -h / 2 + w * 0.11, 0.06]}>
          <mesh>
            <circleGeometry args={[w * 0.075, 48]} />
            <meshBasicMaterial color="#3355ff" toneMapped={false} />
          </mesh>
          <mesh position={[w * 0.008, 0, 0.01]} rotation-z={-Math.PI / 2}>
            <circleGeometry args={[w * 0.03, 3]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function PosterPanel({ w, h, poster }: { w: number; h: number; poster: { title: string; subtitle: string } }) {
  const tex = usePoster(poster.title, poster.subtitle);
  const mat = useMemo(() => new RoundedImageMaterial(tex, w, h, 0.18), [tex, w, h]);
  return (
    <group>
      <mesh geometry={slabGeometry(w + 0.32, h + 0.32, 0.28, 0.18)} position-z={-0.2}>
        <meshStandardMaterial color="#15171c" roughness={0.55} metalness={0.35} />
      </mesh>
      <mesh material={mat}>
        <planeGeometry args={[w, h]} />
      </mesh>
    </group>
  );
}
