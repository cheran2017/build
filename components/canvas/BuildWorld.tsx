"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import { Color, Group, InstancedMesh, Mesh, MeshStandardMaterial, Object3D } from "three";
import { buildersFaces, coachingCall, cycle, framework, launches, membersMap, aspectOf } from "@/lib/content";
import { COLORS, type Spot } from "@/lib/journey";
import { ImagePanel, Label, Word3D, easeOutCubic, slabGeometry, useJourney, useLetterMotion, useVisibleBetween } from "./parts";
import { At } from "./IdeaWorld";

const ACCENT = COLORS.accent;

export function BuildWorld() {
  const j = useJourney();
  const L = j.layout;
  const B = L.build;
  const group = useRef<Group>(null);
  useVisibleBetween(group, j.p("i5"), j.p("launch", 1));

  // silver faces, darker gunmetal walls: reads crisper, and the letter tops no longer blow out
  // to white when the camera rises over them
  const metal = useMemo(
    () =>
      [
        new MeshStandardMaterial({ color: "#d4d7dd", metalness: 0.92, roughness: 0.28, envMapIntensity: 0.9 }),
        new MeshStandardMaterial({ color: "#5d626c", metalness: 0.9, roughness: 0.46, envMapIntensity: 0.45 }),
      ] as [MeshStandardMaterial, MeshStandardMaterial],
    [],
  );

  const buildLetters = useRef<Mesh[]>([]);
  const dayNum = useRef<Mesh[]>([]);
  const dayWord = useRef<Mesh[]>([]);
  const drop = (height: number) => (m: Mesh, k: number) => {
    m.position.y = (1 - easeOutCubic(k)) * height;
    m.visible = k > 0;
  };
  useLetterMotion(buildLetters, j.p("i5:hold", -0.3), j.p("build", -0.1), drop(L.words.build.size * 1.3));
  useLetterMotion(dayNum, j.p("p3:hold", -0.2), j.p("days", -0.2), drop(B.days.sizeNum * 1.6));
  useLetterMotion(dayWord, j.p("p3:hold", 0.1), j.p("days", -0.05), drop(B.days.sizeWord * 2.4));

  const gap = B.days.gap;

  return (
    <group ref={group}>
      <Grid
        position={[0, 0, -470]}
        args={[180, 420]}
        followCamera={false}
        cellSize={1.5}
        cellThickness={0.8}
        cellColor="#20242f"
        sectionSize={9}
        sectionThickness={1.3}
        sectionColor="#3350e6"
        fadeDistance={130}
        fadeStrength={1.4}
      />
      <Cubes count={j.mobile ? 30 : 64} />

      <Word3D spec={L.words.build} material={metal} letters={buildLetters} />

      {B.pillars.map((spot, i) => (
        <Pillar key={i} index={i} spot={spot} />
      ))}

      <Word3D
        spec={{ text: "3", size: B.days.sizeNum, depth: 2.2, tracking: -0.02, center: [B.days.center[0] - gap, B.days.center[1], B.days.center[2]] }}
        material={metal}
        align="right"
        letters={dayNum}
      />
      <Word3D
        spec={{ text: "PHASES", size: B.days.sizeWord, depth: 1.4, tracking: 0.02, center: [B.days.center[0] + gap, B.days.center[1], B.days.center[2]] }}
        material={metal}
        align="left"
        letters={dayWord}
      />

      <CoachMonitor spot={B.coach} w={B.coachW} />
      <Helix />

      <At spot={B.map}>
        <ImagePanel src={membersMap} w={B.mapW} frame="dark" r={0.4} pad={0.2} depth={0.3} />
        <ImagePanel
          src={buildersFaces}
          w={B.mapW / 2}
          frame="none"
          r={0.3}
          position={[0.5, -(B.mapW * aspectOf(membersMap)) / 2 - (B.mapW / 2) * aspectOf(buildersFaces) * 0.62, 0.8]}
        />
      </At>
    </group>
  );
}

function Pillar({ index, spot }: { index: number; spot: Spot }) {
  const f = framework[index];
  const rod = Math.max(0.1, spot.focus[1] - 4.8);
  return (
    <At spot={spot}>
      <mesh geometry={slabGeometry(7.16, 9.76, 0.5, 0.3)} position-z={-0.62}>
        <meshBasicMaterial color={ACCENT} toneMapped={false} />
      </mesh>
      <mesh geometry={slabGeometry(7, 9.6, 0.46, 0.5)} position-z={-0.5}>
        <meshStandardMaterial color="#14161b" metalness={0.3} roughness={0.58} />
      </mesh>
      <group position-z={0.03}>
        <Label position={[-2.9, 3.6, 0]} anchorX="left" fontSize={1.5} color={ACCENT} weight={800}>
          {f.n}
        </Label>
        <ImagePanel src={f.icon} w={1.6} frame="none" r={0.3} position={[2.3, 3.6, 0.01]} />
        <Label position={[-2.9, 0.5, 0]} anchorX="left" anchorY="bottom" fontSize={0.66} maxWidth={5.8} lineHeight={1.05} color="#ffffff" weight={800}>
          {f.title}
        </Label>
        <mesh position={[-2, 0.12, 0]}>
          <planeGeometry args={[1.8, 0.04]} />
          <meshBasicMaterial color={ACCENT} toneMapped={false} />
        </mesh>
        <Label position={[-2.9, -0.3, 0]} anchorX="left" anchorY="top" fontSize={0.36} maxWidth={5.7} lineHeight={1.35} color="#aeb3bf" weight={500}>
          {f.short}
        </Label>
      </group>
      <mesh position={[0, -4.8 - rod / 2, -0.3]}>
        <cylinderGeometry args={[0.035, 0.035, rod, 8]} />
        <meshStandardMaterial color="#2a2d35" metalness={0.8} roughness={0.3} />
      </mesh>
    </At>
  );
}

function CoachMonitor({ spot, w }: { spot: Spot; w: number }) {
  const h = w * aspectOf(coachingCall);
  const dot = useRef<Mesh>(null);
  useFrame((s) => {
    if (dot.current) dot.current.scale.setScalar(0.75 + 0.25 * Math.abs(Math.sin(s.clock.elapsedTime * 2.4)));
  });
  return (
    <At spot={spot}>
      <ImagePanel src={coachingCall} w={w} frame="dark" r={0.35} pad={0.3} depth={0.4} />
      <group position={[-w / 2 + 1.4, h / 2 - 0.7, 0.08]}>
        <mesh geometry={slabGeometry(1.8, 0.62, 0.31, 0.05)}>
          <meshBasicMaterial color="#ff3b30" toneMapped={false} />
        </mesh>
        <Label position={[0.14, 0, 0.07]} fontSize={0.32} color="#ffffff" weight={800}>
          LIVE
        </Label>
        <mesh ref={dot} position={[-0.52, 0, 0.07]}>
          <circleGeometry args={[0.1, 20]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
      </group>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (w / 2 - 1.5), h / 2 + 16, -0.1]}>
          <cylinderGeometry args={[0.03, 0.03, 32, 6]} />
          <meshStandardMaterial color="#2a2d35" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
    </At>
  );
}

/** Real launch posts spiralling around the flight path. */
function Helix() {
  const j = useJourney();
  const H = j.layout.build.helix;
  const items = useMemo(() => {
    const list = cycle(launches, H.count);
    const span = H.z0 - H.z1 - 10;
    return list.map((l, r) => {
      const side = r % 2 === 0 ? 1 : -1;
      const a = (side === 1 ? 0 : Math.PI) + 0.62 * Math.sin(r * 1.7);
      const radius = H.radius + (r % 3) * 0.6;
      return {
        ...l,
        pos: [Math.cos(a) * radius, H.y + Math.sin(a) * radius, H.z0 - 5 - (r / Math.max(1, list.length - 1)) * span] as [number, number, number],
        rot: [0, side === 1 ? -Math.PI / 2 + 0.35 : Math.PI / 2 - 0.35, Math.sin(r * 2.3) * 0.05] as [number, number, number],
      };
    });
  }, [H]);

  return (
    <group>
      {items.map((it, i) => (
        <ImagePanel key={`${it.src}-${i}`} src={it.src} w={j.mobile ? 4.2 : 5.4} frame="dark" r={0.22} pad={0.1} depth={0.12} position={it.pos} rotation={it.rot} />
      ))}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sy) => (
          <mesh key={`${sx}${sy}`} position={[sx * (H.radius + 2.5), H.y + sy * (H.radius - 0.5), (H.z0 + H.z1) / 2]}>
            <boxGeometry args={[0.05, 0.05, H.z0 - H.z1 + 20]} />
            <meshBasicMaterial color={sy > 0 ? "#ffffff" : ACCENT} toneMapped={false} />
          </mesh>
        )),
      )}
    </group>
  );
}

function Cubes({ count }: { count: number }) {
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const items = useMemo(() => {
    let seed = 11;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const out: { x: number; y: number; z: number; s: number; ph: number; blue: boolean }[] = [];
    while (out.length < count) {
      const x = (rnd() - 0.5) * 80;
      const y = 1 + rnd() * 28;
      const z = -360 - rnd() * 300;
      if (Math.abs(x) < 16) continue;
      out.push({ x, y, z, s: 0.5 + rnd() * 1.6, ph: rnd() * 10, blue: rnd() < 0.14 });
    }
    return out;
  }, [count]);

  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const c = new Color();
    items.forEach((it, i) => m.setColorAt(i, c.set(it.blue ? ACCENT : "#1a1c22")));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [items]);

  useFrame((s) => {
    const m = mesh.current;
    if (!m || !m.parent?.visible) return;
    const t = s.clock.elapsedTime;
    items.forEach((it, i) => {
      dummy.position.set(it.x, it.y + Math.sin(t * 0.5 + it.ph) * 0.5, it.z);
      dummy.rotation.set(t * 0.1 + it.ph, t * 0.14 + it.ph, 0);
      dummy.scale.setScalar(it.s);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry />
      <meshStandardMaterial metalness={0.6} roughness={0.35} />
    </instancedMesh>
  );
}
