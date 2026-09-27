"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { MathUtils } from "three";
import { BEAT_VH, Journey } from "@/lib/journey";
import { scroll, useUI } from "@/lib/store";
import { Overlays } from "./overlays/Overlays";
import { JoinSection, VideoModal } from "./overlays/Chrome";

const Stage = dynamic(() => import("./canvas/Stage"), { ssr: false });

/** The 3D tour. Loaded lazily by Experience so the classic view never downloads three.js. */
export default function Immersive({ mobile }: { mobile: boolean }) {
  const journeyEl = useRef<HTMLDivElement>(null);
  const journey = useMemo(() => new Journey(mobile), [mobile]);
  const ready = useUI((u) => u.ready);

  // master scroll: Lenis smooths the wheel, ScrollTrigger maps the journey element to 0..1,
  // and the damped value in `scroll.progress` is what the camera, worlds and overlays render from
  useEffect(() => {
    if (!journeyEl.current) return;
    gsap.registerPlugin(ScrollTrigger);
    // mobile browsers resize the viewport as the address bar shows/hides; re-measuring on that jumps the journey
    ScrollTrigger.config({ ignoreMobileResize: true });
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const lenis = new Lenis({ autoRaf: false, lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.1, anchors: true });
    scroll.lenis = lenis;
    lenis.on("scroll", (l: Lenis) => {
      scroll.velocity = l.velocity;
      ScrollTrigger.update();
    });

    const trigger = ScrollTrigger.create({
      trigger: journeyEl.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        scroll.target = self.progress;
      },
    });

    const damp = () => {
      const dt = gsap.ticker.deltaRatio(60) / 60;
      scroll.progress = MathUtils.damp(scroll.progress, scroll.target, 9, dt);
      if (Math.abs(scroll.progress - scroll.target) < 1e-5) scroll.progress = scroll.target;
    };
    const raf = (time: number) => lenis.raf(time * 1000);
    // prioritised so they run before the overlay ticker: lenis first, then damping
    gsap.ticker.add(damp, false, true);
    gsap.ticker.add(raf, false, true);
    gsap.ticker.lagSmoothing(0);

    scroll.jump = (p, immediate) => {
      const y = trigger.start + (trigger.end - trigger.start) * p;
      if (!immediate) return lenis.scrollTo(y, { duration: 2.6 });
      lenis.scrollTo(y, { immediate: true, force: true });
      scroll.target = scroll.progress = p;
    };

    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.remove(damp);
      trigger.kill();
      lenis.destroy();
      scroll.lenis = null;
      scroll.jump = null;
    };
  }, [journey]);

  // hold the page still until the studio has loaded
  useEffect(() => {
    const l = scroll.lenis;
    if (!l) return;
    if (!ready) return void l.stop();
    l.start();
    // deep links: ?at=0.42, ?at=i3 (a journey key) or ?at=cross@-0.25 (key plus beats)
    const at = new URLSearchParams(window.location.search).get("at");
    if (at) {
      const [ref, beats] = at.split("@");
      scroll.jump?.(Number.isNaN(Number(ref)) ? journey.p(ref, Number(beats ?? 0)) : Number(ref), true);
    }
    // dev-only hook for scripts/flythrough.mjs and scripts/collide.mjs
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __utn: unknown }).__utn = { journey, jump: (p: number) => scroll.jump?.(p, true) };
    }
  }, [ready, journey]);

  const beat = mobile ? BEAT_VH.mobile : BEAT_VH.desktop;
  return (
    <>
      <a className="skip-link" href="?view=classic">
        Skip the 3D tour
      </a>
      <Stage key={mobile ? "m" : "d"} journey={journey} />
      <main id="top">
        <div ref={journeyEl} className="journey" style={{ height: `calc(${(journey.total * beat).toFixed(1)}svh + 100svh)` }} />
        <JoinSection />
      </main>
      <Overlays journey={journey} />
      <VideoModal />
    </>
  );
}
