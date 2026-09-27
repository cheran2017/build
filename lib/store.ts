import { useSyncExternalStore } from "react";
import type Lenis from "lenis";

/**
 * Per-frame scroll state. Written by the scroll driver, read inside useFrame and
 * the overlay ticker. Deliberately not React state: nothing re-renders on scroll.
 */
export const scroll = {
  /** raw ScrollTrigger progress of the journey, 0..1 */
  target: 0,
  /** damped progress that everything renders from */
  progress: 0,
  velocity: 0,
  lenis: null as Lenis | null,
  jump: null as ((progress: number, immediate?: boolean) => void) | null,
};

export type VideoRequest = { title: string; video: string | null; poster: string | null; caption?: string };

type UI = {
  ready: boolean;
  loaded: number;
  video: VideoRequest | null;
};

let ui: UI = { ready: false, loaded: 0, video: null };
const initial = ui;
const listeners = new Set<() => void>();

export function setUI(patch: Partial<UI>) {
  ui = { ...ui, ...patch };
  listeners.forEach((l) => l());
}

export function getUI() {
  return ui;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useUI<T>(select: (u: UI) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => select(ui),
    () => select(initial),
  );
}

export function openVideo(v: VideoRequest) {
  setUI({ video: v });
}
