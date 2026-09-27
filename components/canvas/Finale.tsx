"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils, MeshStandardMaterial, Vector3 } from "three";
import { cycle, launches, proofQuote, stories } from "@/lib/content";
import { COLORS, ramp } from "@/lib/journey";
import { scroll } from "@/lib/store";
import { ImagePanel, Word3D, useJourney, useVisibleBetween } from "./parts";

const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** Everything seen on the journey gathers into a spiral around the UTN wordmark. */
export function Finale() {
  const j = useJourney();
  const L = j.layout;
  const F = L.finale;
  const group = useRef<Group>(null);
  useVisibleBetween(group, j.p("s3"), 1);

  const ink = useMemo(() => new MeshStandardMaterial({ color: COLORS.ink, roughness: 0.45, metalness: 0.15 }), []);

  const panels = useMemo(() => {
    const wins = [...stories.map((s) => s.screen).filter(Boolean), proofQuote.screen] as string[];
    const srcs = cycle([...wins, ...launches.map((l) => l.src)], F.count);
    let seed = 23;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const [ax, ay] = F.ring;
    return srcs.map((src, i) => {
      const a = i * 2.39996;
      // spiral starts just outside the wordmark so no panel hides behind a letter
      const r = (j.mobile ? 15 : 19) + (i % 4) * 2.5 + i * 0.25;
      const side = rnd() < 0.5 ? -1 : 1;
      let x = Math.cos(a) * r * ax;
      let y = Math.sin(a) * r * ay;
      // keep the bottom of the frame clear for the CTA: push those panels out to the sides (desktop) or mirror them up (phones)
      if (Math.sin(a) < -0.3) {
        if (j.mobile) y = -y;
        else x = (x === 0 ? side : Math.sign(x)) * Math.max(Math.abs(x), 28 + (i % 3) * 3);
      }
      return {
        src,
        start: new Vector3(side * (13 + rnd() * 20), 2 + rnd() * 24, -770 - rnd() * 170),
        end: new Vector3(F.center[0] + x, F.center[1] + y, F.center[2] - 4 - (i % 5) * 2.2),
        w: (j.mobile ? 2.3 : 3.3) + (i % 3) * 0.35,
      };
    });
  }, [F, j.mobile]);

  const refs = useRef<(Group | null)[]>([]);
  const from = j.p("proof");
  const to = j.p("final", -0.1);
  const camEnd = useMemo(() => new Vector3(...j.keys[j.keys.length - 1].pos), [j]);
  const tmp = useMemo(() => new Vector3(), []);

  useFrame((s) => {
    const p = scroll.progress;
    const t = s.clock.elapsedTime;
    const n = panels.length;
    panels.forEach((pl, i) => {
      const g = refs.current[i];
      if (!g) return;
      const delay = (i / n) * 0.35;
      const k = easeInOutCubic(ramp(p, MathUtils.lerp(from, to, delay), MathUtils.lerp(from, to, 0.65 + delay)));
      tmp.lerpVectors(pl.start, pl.end, k);
      tmp.y += Math.sin(Math.PI * k) * 6 + Math.sin(t * 0.5 + i) * 0.25 * k;
      g.position.copy(tmp);
      g.lookAt(camEnd);
    });
  });

  return (
    <group ref={group}>
      <Word3D spec={L.words.utn} material={ink} />
      <mesh position={[0, L.words.utn.center[1] - 1.2, L.words.utn.center[2] + L.words.utn.depth]}>
        <planeGeometry args={[L.words.utn.size * 0.9, 0.18]} />
        <meshBasicMaterial color={COLORS.accent} toneMapped={false} />
      </mesh>
      {panels.map((pl, i) => (
        <group key={`${pl.src}-${i}`} ref={(g) => void (refs.current[i] = g)}>
          <ImagePanel src={pl.src} w={pl.w} frame="dark" r={0.16} pad={0.08} depth={0.1} />
        </group>
      ))}
    </group>
  );
}
