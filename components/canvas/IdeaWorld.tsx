"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { Float, Grid, Line } from "@react-three/drei";
import { Color, Group, InstancedMesh, MeshStandardMaterial, Object3D } from "three";
import { ambient, communityCollage, creatorBadges, founder, ideaIcon, ideaNotes } from "@/lib/content";
import type { Spot } from "@/lib/journey";
import { AmbientPanel, ImagePanel, Label, Word3D, slabGeometry, useJourney, useVisibleBetween } from "./parts";

type GroupProps = Omit<ThreeElements["group"], "ref">;

export function IdeaWorld() {
  const j = useJourney();
  const L = j.layout;
  const group = useRef<Group>(null);
  // appear only under the tunnel exit flash, so nothing from IDEA shows inside the tunnel
  useVisibleBetween(group, j.p("idea", -0.45), j.p("buildRise"));
  const ink = useMemo(() => new MeshStandardMaterial({ color: "#121317", roughness: 0.5, metalness: 0.15 }), []);

  return (
    <group ref={group}>
      <Grid
        position={[0, -0.02, -175]}
        args={[180, 220]}
        followCamera={false}
        cellSize={2}
        cellThickness={0.6}
        cellColor="#dcdcd5"
        sectionSize={12}
        sectionThickness={1}
        sectionColor="#c7c7bf"
        fadeDistance={170}
        fadeStrength={1.6}
      />
      <Particles count={j.mobile ? 36 : 80} />
      <AmbientPanel src={ambient.idea} w={L.idea.backdrop.w} position={L.idea.backdrop.pos} />
      <Word3D spec={L.words.idea} material={ink} />

      <At spot={L.idea.i1}>
        <Wireframe w={6.2} h={4} position={[0.6, 0.4, -1.2]} />
        <Wireframe w={1.9} h={3.6} position={[-2.9, -0.4, 0.4]} color="#15171c" />
        <Note text={ideaNotes[0]} position={[-1.3, 2.7, 0.9]} rotation-z={0.06} />
        <Note text={ideaNotes[1]} position={[3.4, 2.6, 0.2]} rotation-z={-0.05} />
        <Note text={ideaNotes[2]} position={[2.9, -2.3, 0.8]} rotation-z={0.04} />
        <Note text={ideaNotes[3]} position={[-1.2, -2.8, 1.2]} rotation-z={-0.07} />
      </At>

      <At spot={L.idea.i2}>
        <IdeaMap />
        <ImagePanel src={ideaIcon} w={2.2} frame="none" position={[-3.9, 3.8, -0.6]} />
      </At>

      <At spot={L.idea.i3}>
        <ImagePanel src={communityCollage} w={8.4} frame="light" r={0.3} pad={0.14} position={[0.8, 0.3, -2.4]} />
        {/* the column has room for six */}
        {creatorBadges.slice(0, 6).map((src, i) => (
          <ImagePanel
            key={src}
            src={src}
            w={3.3}
            frame="none"
            r={0.12}
            position={[(i % 2 ? 3.4 : -3.1) + i * 0.08, 3.5 - i * 1.4, 0.8 + (i % 2) * 0.7]}
            rotation-z={(i % 2 ? -1 : 1) * 0.03}
          />
        ))}
      </At>

      <At spot={L.idea.i4}>
        <ImagePanel src={founder.photo} w={4.4} frame="light" r={0.3} pad={0.12} position={[0, 0.7, 0]} />
        <ImagePanel src={founder.badge} w={5.2} frame="none" r={0.2} position={[0.4, -3.3, 0.9]} />
      </At>

      {/* scattered fragments along the route */}
      <Float speed={1.2} floatIntensity={2} rotationIntensity={0.3}>
        <Wireframe w={5} h={3.2} position={[-19, 12, -146]} rotation-y={0.5} color="#b8c2dc" />
        <Wireframe w={4} h={2.6} position={[20, 13, -178]} rotation-y={-0.5} color="#b8c2dc" />
        <Wireframe w={3} h={5} position={[-21, 3, -232]} rotation-y={0.4} color="#c9cfdd" />
      </Float>
      <Float speed={1} floatIntensity={2.5} rotationIntensity={0.25}>
        <Note text={ideaNotes[4]} position={[-16, 1.5, -170]} rotation={[0, 0.6, 0.05]} />
        <Note text={ideaNotes[5]} position={[17, 11, -205]} rotation={[0, -0.6, -0.04]} />
        <Note text={ideaNotes[6]} position={[-18, 14, -196]} rotation={[0, 0.5, 0.04]} />
        <Note text={ideaNotes[7]} position={[19, 3, -140]} rotation={[0, -0.5, -0.05]} />
      </Float>
    </group>
  );
}

/** Places a content cluster at a journey stop, turned to face the camera's viewpoint. */
export function At({ spot, children }: { spot: Spot; children: React.ReactNode }) {
  return (
    <group position={spot.focus} rotation-y={spot.rotY}>
      {children}
    </group>
  );
}

function Wireframe({ w, h, color = "#3355ff", ...props }: GroupProps & { w: number; h: number; color?: string }) {
  const segments = useMemo(() => {
    const x = w / 2;
    const y = h / 2;
    const bar = y - Math.min(0.42, h * 0.12);
    const pts: [number, number, number][] = [
      [-x, -y, 0], [x, -y, 0], [x, -y, 0], [x, y, 0], [x, y, 0], [-x, y, 0], [-x, y, 0], [-x, -y, 0],
      [-x, bar, 0], [x, bar, 0],
      [-x + 0.3, bar - 0.55, 0], [-x + w * 0.55, bar - 0.55, 0],
      [-x + 0.3, bar - 0.95, 0], [-x + w * 0.4, bar - 0.95, 0],
      [-x + 0.3, -y + 0.35, 0], [-x + 0.3, -y + h * 0.42, 0],
      [-x + 0.3, -y + h * 0.42, 0], [-x + w * 0.46, -y + h * 0.42, 0],
      [-x + w * 0.46, -y + h * 0.42, 0], [-x + w * 0.46, -y + 0.35, 0],
      [-x + w * 0.46, -y + 0.35, 0], [-x + 0.3, -y + 0.35, 0],
      [x - w * 0.46, -y + h * 0.42, 0], [x - 0.3, -y + h * 0.42, 0],
      [x - w * 0.46, -y + h * 0.3, 0], [x - 0.3, -y + h * 0.3, 0],
      [x - w * 0.46, -y + h * 0.18, 0], [x - 0.8, -y + h * 0.18, 0],
    ];
    return pts;
  }, [w, h]);
  return (
    <group {...props}>
      <Line points={segments} segments color={color} lineWidth={1.4} />
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-w / 2 + 0.3 + i * 0.28, h / 2 - 0.21, 0]}>
          <circleGeometry args={[0.07, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

function Note({ text, ...props }: GroupProps & { text: string }) {
  return (
    <group {...props}>
      <mesh geometry={slabGeometry(2.5, 1.35, 0.12, 0.05)} position-z={-0.05}>
        <meshStandardMaterial color="#ffffff" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.58, 0.003]}>
        <planeGeometry args={[2.3, 0.07]} />
        <meshBasicMaterial color="#3355ff" />
      </mesh>
      <Label position={[0, -0.05, 0.01]} fontSize={0.2} maxWidth={2.1} textAlign="center" color="#111216" weight={500}>
        {text}
      </Label>
    </group>
  );
}

const MAP_NODES: { t: string; p: [number, number, number] }[] = [
  { t: "Problem", p: [-3.4, 2.2, 0.3] },
  { t: "Audience", p: [3.2, 2.6, -0.4] },
  { t: "Price", p: [3.8, -1.2, 0.2] },
  { t: "MVP", p: [-3.6, -1.8, -0.2] },
  { t: "Launch", p: [0.2, -3.2, 0.4] },
];

function IdeaMap() {
  const core = useRef<Group>(null);
  useFrame((s) => {
    if (core.current) core.current.rotation.y = s.clock.elapsedTime * 0.25;
  });
  return (
    <group>
      <group ref={core}>
        <mesh>
          <sphereGeometry args={[0.6, 48, 48]} />
          <meshStandardMaterial color="#3355ff" roughness={0.25} metalness={0.2} emissive="#3355ff" emissiveIntensity={0.35} />
        </mesh>
        <mesh rotation-x={Math.PI / 2}>
          <torusGeometry args={[1.05, 0.012, 8, 96]} />
          <meshBasicMaterial color="#3355ff" />
        </mesh>
      </group>
      <Label position={[0, 1.05, 0]} fontSize={0.34} color="#0b0c0f" weight={800}>
        YOUR IDEA
      </Label>
      {MAP_NODES.map((n) => (
        <group key={n.t}>
          <Line points={[[0, 0, 0], n.p]} color="#9aa6c6" lineWidth={1.2} />
          <mesh position={n.p}>
            <sphereGeometry args={[0.17, 24, 24]} />
            <meshStandardMaterial color="#111216" roughness={0.4} />
          </mesh>
          <Label position={[n.p[0], n.p[1] + 0.46, n.p[2]]} fontSize={0.28} color="#2b2e36" weight={500}>
            {n.t}
          </Label>
        </group>
      ))}
    </group>
  );
}

function Particles({ count }: { count: number }) {
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const items = useMemo(() => {
    let seed = 3;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    return Array.from({ length: count }, () => ({
      x: (rnd() - 0.5) * 80,
      y: rnd() * 30,
      z: -100 - rnd() * 165,
      s: 0.12 + rnd() * 0.35,
      ph: rnd() * 10,
      blue: rnd() < 0.18,
    }));
  }, [count]);

  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const c = new Color();
    items.forEach((it, i) => m.setColorAt(i, c.set(it.blue ? "#3355ff" : "#c8c9c4")));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [items]);

  useFrame((s) => {
    const m = mesh.current;
    if (!m || !m.parent?.visible) return;
    const t = s.clock.elapsedTime;
    items.forEach((it, i) => {
      dummy.position.set(it.x, it.y + Math.sin(t * 0.4 + it.ph) * 0.6, it.z);
      dummy.rotation.set(t * 0.2 + it.ph, t * 0.15 + it.ph, 0);
      dummy.scale.setScalar(it.s);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry />
      <meshStandardMaterial roughness={0.5} />
    </instancedMesh>
  );
}
