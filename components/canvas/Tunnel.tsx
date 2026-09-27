"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, Group, InstancedMesh, Matrix4, MeshBasicMaterial, Quaternion, Vector3 } from "three";
import { useJourney, useVisibleBetween } from "./parts";

const Z = new Vector3(0, 0, 1);

/** Rings and light streaks laid along the camera path between the laptop screen and IDEA. */
export function Tunnel() {
  const j = useJourney();
  const group = useRef<Group>(null);
  const rings = useRef<InstancedMesh>(null);
  const streaks = useRef<InstancedMesh>(null);
  useVisibleBetween(group, j.p("r3"), j.p("idea", -0.4));

  const ringCount = j.mobile ? 44 : 72;
  const streakCount = j.mobile ? 90 : 180;

  const layout = useMemo(() => {
    const from = j.p("cross");
    const to = j.p("idea");
    const frame = (t: number) => {
      const p = from + (to - from) * t;
      const c = j.pointAt(p);
      const ahead = j.pointAt(Math.min(1, p + 0.002)).sub(c).normalize();
      return { c, q: new Quaternion().setFromUnitVectors(Z, ahead), r: 0.08 + 17 * Math.pow(t, 1.8) };
    };
    const ringM: Matrix4[] = [];
    for (let i = 0; i < ringCount; i++) {
      const { c, q, r } = frame(i / (ringCount - 1));
      ringM.push(new Matrix4().compose(c, q, new Vector3(r, r, r)));
    }
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const streakM: Matrix4[] = [];
    const streakBlue: boolean[] = [];
    for (let i = 0; i < streakCount; i++) {
      const t = 0.04 + rnd() * 0.9;
      const { c, q, r } = frame(t);
      const a = rnd() * Math.PI * 2;
      const off = new Vector3(Math.cos(a), Math.sin(a), 0).multiplyScalar(r * (0.75 + rnd() * 0.2)).applyQuaternion(q);
      const len = 0.4 + r * (0.6 + rnd());
      const thick = Math.max(0.004, r * 0.012);
      streakM.push(new Matrix4().compose(c.clone().add(off), q, new Vector3(thick, thick, len)));
      streakBlue.push(rnd() < 0.35);
    }
    return { ringM, streakM, streakBlue };
  }, [j, ringCount, streakCount]);

  useLayoutEffect(() => {
    const white = new Color("#ffffff");
    const blue = new Color("#3355ff");
    const r = rings.current;
    const s = streaks.current;
    if (!r || !s) return;
    layout.ringM.forEach((m, i) => {
      r.setMatrixAt(i, m);
      r.setColorAt(i, i % 4 === 0 ? blue : white);
    });
    layout.streakM.forEach((m, i) => {
      s.setMatrixAt(i, m);
      s.setColorAt(i, layout.streakBlue[i] ? blue : white);
    });
    [r, s].forEach((mesh) => {
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingSphere();
    });
  }, [layout]);

  // shimmer so the tunnel feels alive even when scrolling stops
  useFrame((state) => {
    if (group.current?.visible && streaks.current) {
      (streaks.current.material as MeshBasicMaterial).opacity = 0.65 + 0.35 * Math.sin(state.clock.elapsedTime * 3);
    }
  });

  return (
    <group ref={group}>
      <instancedMesh ref={rings} args={[undefined, undefined, ringCount]} frustumCulled={false}>
        <torusGeometry args={[1, 0.012, 6, 128]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={streaks} args={[undefined, undefined, streakCount]} frustumCulled={false}>
        <boxGeometry />
        <meshBasicMaterial toneMapped={false} transparent />
      </instancedMesh>
    </group>
  );
}
