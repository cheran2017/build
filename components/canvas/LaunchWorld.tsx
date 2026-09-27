"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import { BufferGeometry, Color, Float32BufferAttribute, Group, Mesh, MeshStandardMaterial } from "three";
import { ambient, cycle, launches, stories, type Story } from "@/lib/content";
import { COLORS, ramp, type Spot } from "@/lib/journey";
import { scroll } from "@/lib/store";
import { AmbientPanel, ImagePanel, Label, VideoScreen, Word3D, easeInCubic, slabGeometry, useJourney, useLetterMotion, useVisibleBetween } from "./parts";
import { At } from "./IdeaWorld";

const ACCENT = COLORS.accent;

export function LaunchWorld() {
  const j = useJourney();
  const L = j.layout;
  const group = useRef<Group>(null);
  useVisibleBetween(group, j.p("map", -0.5), j.p("final", 1));

  const gloss = useMemo(() => new MeshStandardMaterial({ color: "#f4f5f8", metalness: 0.25, roughness: 0.18 }), []);
  const glow = useMemo(() => new MeshStandardMaterial({ color: ACCENT, emissive: ACCENT, emissiveIntensity: 0.7, metalness: 0.3, roughness: 0.3 }), []);

  const letters = useRef<Mesh[]>([]);
  useLetterMotion(letters, j.p("launch:hold", -0.5), j.p("s0", -0.5), (m, k) => {
    const e = easeInCubic(k);
    m.position.y = e * 70;
    m.rotation.x = -e * 0.35;
    m.visible = k < 1;
  });

  const w = L.words.launch;

  return (
    <>
      {/* Outside the toggled group on purpose: three specialises every shader on the number of *visible* lights,
          so a light that switches on with its world recompiles every material in the scene at that moment
          (multi-second freezes on Windows). Its 60-unit falloff keeps it from touching the other worlds. */}
      <pointLight position={[0, 2, w.center[2] + 8]} color={ACCENT} intensity={600} distance={60} decay={2} />
      <group ref={group}>
      <Grid
        position={[0, 0, -790]}
        args={[180, 280]}
        followCamera={false}
        cellSize={1.5}
        cellThickness={0.7}
        cellColor="#141826"
        sectionSize={9}
        sectionThickness={1.2}
        sectionColor="#2a3fb8"
        fadeDistance={120}
        fadeStrength={1.5}
      />
      <Stars count={j.mobile ? 280 : 620} />
      {/* unfogged: a bright screen in the dark reads better than a muddy one */}
      <AmbientPanel src={ambient.launch} w={L.launch.backdrop.w} position={L.launch.backdrop.pos} fog={false} />

      <Word3D spec={w} material={gloss} letters={letters} />
      <mesh position={[0, 0.05, w.center[2] + w.depth + 1.5]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[w.size * 4.4, 0.35]} />
        <meshBasicMaterial color={ACCENT} toneMapped={false} />
      </mesh>

      {stories.map((s, i) => (
        <Monolith key={s.id} story={s} spot={L.launch.stories[i]} />
      ))}

      <FlyingScreens />

      {L.launch.numbers.map((n) => (
        <group key={n.text} position={n.pos} rotation-y={n.rotY}>
          <Word3D spec={{ text: n.text, size: n.size, depth: 1.2, tracking: -0.02, center: [0, 0, 0] }} material={glow} />
          <Label position={[0, -1.2, 0.6]} fontSize={n.size * 0.14} color="#ffffff" letterSpacing={0.18} weight={700}>
            {n.label}
          </Label>
        </group>
      ))}
      </group>
    </>
  );
}

function Monolith({ story, spot }: { story: Story; spot: Spot }) {
  // keep the screen on the side facing the flight path
  const toPath = spot.focus[0] > 0 ? -1 : spot.focus[0] < 0 ? 1 : -1;
  const mono = -toPath * 2.9;
  return (
    <At spot={spot}>
      <group position={[mono, -1, 0]}>
        <mesh geometry={slabGeometry(5.2, 12, 0.3, 0.7)} position-z={-0.7}>
          <meshStandardMaterial color="#0f1116" metalness={0.4} roughness={0.45} />
        </mesh>
        <mesh position={[0, 5.7, 0.01]}>
          <planeGeometry args={[4.4, 0.08]} />
          <meshBasicMaterial color={ACCENT} toneMapped={false} />
        </mesh>
        <Label position={[-2.2, 4.6, 0.02]} anchorX="left" fontSize={1.1} maxWidth={4.4} color={ACCENT} weight={800}>
          {story.stat}
        </Label>
        <Label position={[-2.2, 3.55, 0.02]} anchorX="left" fontSize={0.32} color="#aeb3bf" letterSpacing={0.08} weight={700}>
          {story.statLabel.toUpperCase()}
        </Label>
        <Label position={[-2.2, 2.6, 0.02]} anchorX="left" anchorY="top" fontSize={0.44} maxWidth={4.4} lineHeight={1.25} color="#ffffff" weight={700}>
          {`“${story.quote}”`}
        </Label>
        <Label position={[-2.2, -4.9, 0.02]} anchorX="left" fontSize={0.3} color="#aeb3bf" weight={500}>
          {`${story.name} · Member`}
        </Label>
      </group>
      <VideoScreen
        w={5.6}
        src={story.screen}
        poster={{ title: story.name, subtitle: `${story.stat} · ${story.statLabel}` }}
        request={{ title: `${story.name}’s story`, video: story.video, poster: story.screen }}
        position={[toPath * 3.4, 0.6, 0.9]}
        rotation-y={toPath * -0.12}
      />
    </At>
  );
}

/** Launch posts drifting outward, pushed further the deeper you go into LAUNCH. */
function FlyingScreens() {
  const j = useJourney();
  const refs = useRef<(Group | null)[]>([]);
  const items = useMemo(() => {
    let seed = 5;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    // start a few items in so these differ from the helix the visitor just flew through
    return cycle(launches, j.mobile ? 6 : 12, 4).map((l, i) => {
      const side = i % 2 ? 1 : -1;
      return {
        ...l,
        side,
        base: [side * (19 + rnd() * 10), 12 + rnd() * 14, -730 - rnd() * 170] as [number, number, number],
        ph: rnd() * 10,
      };
    });
  }, [j.mobile]);
  const from = j.p("launch");
  const to = j.p("numbers");

  useFrame((s) => {
    const push = ramp(scroll.progress, from, to);
    const t = s.clock.elapsedTime;
    items.forEach((it, i) => {
      const g = refs.current[i];
      if (!g) return;
      g.position.set(it.base[0] + it.side * push * 14 + Math.sin(t * 0.3 + it.ph) * 0.8, it.base[1] + push * 6 + Math.cos(t * 0.25 + it.ph) * 0.6, it.base[2]);
      g.rotation.set(0, -it.side * 0.5, Math.sin(t * 0.2 + it.ph) * 0.04);
    });
  });

  return (
    <group>
      {items.map((it, i) => (
        <group key={`${it.src}-${i}`} ref={(g) => void (refs.current[i] = g)}>
          <ImagePanel src={it.src} w={4.6} frame="dark" r={0.2} pad={0.1} depth={0.1} />
        </group>
      ))}
    </group>
  );
}

function Stars({ count }: { count: number }) {
  const geo = useMemo(() => {
    let seed = 17;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const pos: number[] = [];
    const col: number[] = [];
    const white = new Color("#ffffff");
    const blue = new Color(ACCENT);
    for (let i = 0; i < count; i++) {
      pos.push((rnd() - 0.5) * 120, rnd() * 50, -650 - rnd() * 380);
      const c = rnd() < 0.3 ? blue : white;
      col.push(c.r, c.g, c.b);
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(pos, 3));
    g.setAttribute("color", new Float32BufferAttribute(col, 3));
    return g;
  }, [count]);
  return (
    <points geometry={geo}>
      <pointsMaterial size={0.14} vertexColors sizeAttenuation toneMapped={false} transparent opacity={0.85} />
    </points>
  );
}
