"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, RoundedBox } from "@react-three/drei";
import { BufferGeometry, CanvasTexture, DoubleSide, Float32BufferAttribute, Group, MathUtils, SRGBColorSpace, ShaderMaterial, Texture } from "three";
import { LAPTOP, ramp } from "@/lib/journey";
import { scroll } from "@/lib/store";
import { ambient, brand } from "@/lib/content";
import { useJourney, useLoopTexture, useVisibleBetween } from "./parts";

/** Floor that curves up into the back wall (an infinity cove), so the room has no corners. */
function coveGeometry() {
  const floorFront = 16;
  const coveStart = -3;
  const R = 3;
  const wallTop = 16;
  const pts: [number, number][] = [];
  pts.push([0, floorFront], [0, coveStart]);
  for (let i = 1; i <= 16; i++) {
    const a = (i / 16) * (Math.PI / 2);
    pts.push([R - Math.cos(a) * R, coveStart - Math.sin(a) * R]);
  }
  pts.push([wallTop, coveStart - R]);
  const half = 24;
  const pos: number[] = [];
  const idx: number[] = [];
  pts.forEach(([y, z]) => pos.push(-half, y, z, half, y, z));
  for (let i = 0; i < pts.length - 1; i++) {
    const a = i * 2;
    idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export function Studio() {
  const j = useJourney();
  const group = useRef<Group>(null);
  useVisibleBetween(group, 0, j.p("cross", 0.02));
  const cove = useMemo(coveGeometry, []);

  return (
    <group ref={group}>
      <mesh geometry={cove}>
        {/* emissive lift keeps the cove reading as pure white paper; contact shadows sit on top */}
        <meshStandardMaterial color="#f5f5f2" roughness={1} metalness={0} emissive="#f3f3f0" emissiveIntensity={0.45} side={DoubleSide} />
      </mesh>

      {/* cantilever desk on a single plinth */}
      <RoundedBox args={[1.9, 0.055, 0.86]} radius={0.022} smoothness={4} position={[0, LAPTOP.deskY - 0.0275, 0]}>
        <meshStandardMaterial color="#f7f6f2" roughness={0.5} />
      </RoundedBox>
      <RoundedBox args={[0.42, LAPTOP.deskY - 0.055, 0.58]} radius={0.05} smoothness={4} position={[0.18, (LAPTOP.deskY - 0.055) / 2, -0.05]}>
        <meshStandardMaterial color="#ebe9e3" roughness={0.7} />
      </RoundedBox>

      {/* the one object for balance */}
      <mesh position={[0.68, LAPTOP.deskY + 0.075, 0.16]}>
        <sphereGeometry args={[0.075, 48, 48]} />
        <meshStandardMaterial color="#1a1b1f" roughness={0.35} metalness={0.1} />
      </mesh>

      <Laptop />

      <ContactShadows position={[0, 0.002, 0]} scale={6} far={1.4} blur={2.6} opacity={0.32} resolution={512} frames={1} color="#3a3a36" />
      <ContactShadows position={[0, LAPTOP.deskY + 0.001, 0]} scale={[1.9, 0.86]} far={0.25} blur={1.8} opacity={0.45} resolution={512} frames={1} color="#3a3a36" />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Laptop                                                              */
/* ------------------------------------------------------------------ */

function drawScreen(canvas: HTMLCanvasElement) {
  const W = canvas.width;
  const H = canvas.height;
  const g = canvas.getContext("2d")!;
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0a0c13");
  bg.addColorStop(1, "#0e1330");
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);

  const glow = g.createRadialGradient(W / 2, H * 0.52, 0, W / 2, H * 0.52, W * 0.55);
  glow.addColorStop(0, "rgba(51,85,255,0.55)");
  glow.addColorStop(1, "rgba(51,85,255,0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, W, H);

  g.strokeStyle = "rgba(255,255,255,0.05)";
  g.lineWidth = 2;
  for (let x = 0; x <= W; x += 80) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, H);
    g.stroke();
  }
  for (let y = 0; y <= H; y += 80) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(W, y);
    g.stroke();
  }

  // window chrome
  g.fillStyle = "rgba(255,255,255,0.06)";
  g.fillRect(0, 0, W, 64);
  ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
    g.fillStyle = c;
    g.beginPath();
    g.arc(44 + i * 34, 32, 10, 0, Math.PI * 2);
    g.fill();
  });

  g.textAlign = "center";
  g.fillStyle = "#ffffff";
  g.font = "800 300px 'Inter Tight', 'Inter', sans-serif";
  g.fillText(brand.name, W / 2, H * 0.6);
  g.fillStyle = "#aeb3bf";
  g.font = "600 44px 'Inter Tight', 'Inter', sans-serif";
  g.fillText("IDEA  →  BUILD  →  LAUNCH", W / 2, H * 0.74);
  g.fillStyle = "#3355ff";
  g.fillRect(W / 2 - 70, H * 0.8, 140, 8);
}

class ScreenMaterial extends ShaderMaterial {
  constructor(map: Texture) {
    super({
      // mapTransform carries the texture's repeat/offset, so a cover-fitted video loop crops instead of stretching
      uniforms: { map: { value: map }, mapTransform: { value: map.matrix }, glow: { value: 0 }, white: { value: 0 } },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D map;
        uniform mat3 mapTransform;
        uniform float glow;
        uniform float white;
        varying vec2 vUv;
        void main() {
          vec2 uv = (mapTransform * vec3(vUv, 1.0)).xy;
          vec3 c = texture2D(map, uv).rgb * (0.12 + 0.88 * glow);
          float halo = smoothstep(0.75, 0.0, distance(vUv, vec2(0.5)));
          c += vec3(0.2, 0.33, 1.0) * halo * white * 0.8;
          c = mix(c, vec3(1.0), smoothstep(0.35, 1.0, white));
          gl_FragColor = vec4(c, 1.0);
          #include <colorspace_fragment>
        }`,
      toneMapped: false,
    });
  }
}

function Laptop() {
  const j = useJourney();
  const lid = useRef<Group>(null);
  // optional generated loop on the screen; the drawn UTN screen shows until (and unless) it's ready
  const loop = useLoopTexture(ambient.laptopScreen, 1.6, lid);
  const { tex, canvas } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 1000;
    drawScreen(canvas);
    const tex = new CanvasTexture(canvas);
    tex.colorSpace = SRGBColorSpace;
    return { tex, canvas };
  }, []);
  const screen = useMemo(() => new ScreenMaterial(tex), [tex]);

  // redraw once the display face has loaded so the wordmark isn't a fallback font
  useEffect(() => {
    document.fonts?.load("800 300px 'Inter Tight'").then(() => {
      drawScreen(canvas);
      tex.needsUpdate = true;
    });
  }, [canvas, tex]);

  const openFrom = j.p("r0", 0.5);
  const openTo = j.p("r2:hold");
  const glowFrom = j.p("r1");
  const glowTo = j.p("r3");
  const whiteFrom = j.p("r3");
  const whiteTo = j.p("cross", -0.3);

  useFrame(() => {
    const p = scroll.progress;
    const open = 1 - Math.pow(1 - ramp(p, openFrom, openTo), 3);
    if (lid.current) lid.current.rotation.x = Math.PI / 2 - MathUtils.degToRad(MathUtils.lerp(LAPTOP.startDeg, LAPTOP.openDeg, open));
    screen.uniforms.glow.value = ramp(p, glowFrom, glowTo);
    screen.uniforms.white.value = ramp(p, whiteFrom, whiteTo);
    const video = loop && (loop.image as HTMLVideoElement).readyState >= 2 ? loop : null;
    const map = video ?? tex;
    if (screen.uniforms.map.value !== map) {
      screen.uniforms.map.value = map;
      screen.uniforms.mapTransform.value = map.matrix;
    }
  });

  const { deskY, baseW, baseD, baseH, lidH, lidT } = LAPTOP;
  const alu = <meshStandardMaterial color="#cfd2d8" metalness={0.75} roughness={0.3} />;

  return (
    <group>
      <RoundedBox args={[baseW, baseH, baseD]} radius={0.005} smoothness={3} position={[0, deskY + baseH / 2, 0]}>
        {alu}
      </RoundedBox>
      <mesh position={[0, deskY + baseH + 0.0003, -0.03]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[baseW * 0.84, baseD * 0.44]} />
        <meshStandardMaterial color="#1b1c20" roughness={0.6} />
      </mesh>
      <mesh position={[0, deskY + baseH + 0.0003, 0.078]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.12, 0.07]} />
        <meshStandardMaterial color="#c2c5cb" metalness={0.6} roughness={0.35} />
      </mesh>

      <group ref={lid} position={[0, deskY + baseH, -baseD / 2]} rotation-x={Math.PI / 2 - MathUtils.degToRad(LAPTOP.startDeg)}>
        <RoundedBox args={[baseW, lidH, lidT]} radius={0.004} smoothness={3} position={[0, lidH / 2, -lidT / 2]}>
          {alu}
        </RoundedBox>
        <mesh position={[0, lidH / 2, 0.0004]}>
          <planeGeometry args={[baseW - 0.01, lidH - 0.008]} />
          <meshBasicMaterial color="#050507" />
        </mesh>
        <mesh position={[0, lidH / 2 + 0.002, 0.0008]} material={screen}>
          <planeGeometry args={[baseW - 0.026, (baseW - 0.026) / 1.6]} />
        </mesh>
      </group>
    </group>
  );
}
