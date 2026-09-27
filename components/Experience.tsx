"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Loader } from "./overlays/Chrome";
import { ClassicView } from "./overlays/ClassicView";

// Everything WebGL (three, R3F, journey, overlays) lives behind this import
const Immersive = dynamic(() => import("./Immersive"), { ssr: false });

const MOBILE_QUERY = "(max-width: 767px), (max-aspect-ratio: 4/5)";

type Mode = { mode: "pending" | "classic" | "immersive"; mobile: boolean };

function detect(): Mode {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const view = new URLSearchParams(window.location.search).get("view");
  let webgl = false;
  try {
    const c = document.createElement("canvas");
    webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webgl = false;
  }
  const classic = view === "classic" || (view !== "3d" && (reduce || !webgl));
  return { mode: classic ? "classic" : "immersive", mobile: window.matchMedia(MOBILE_QUERY).matches };
}

export default function Experience() {
  const [state, setState] = useState<Mode>({ mode: "pending", mobile: false });

  useEffect(() => {
    setState(detect());
    const mq = window.matchMedia(MOBILE_QUERY);
    const onChange = () => setState((s) => ({ ...s, mobile: mq.matches }));
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (state.mode === "classic") return <ClassicView />;

  // Before the mode is known (and in the server HTML) the branded loader covers the page, and the full story
  // is in the DOM, visually hidden, so crawlers and no-JS visitors still get every word.
  return (
    <>
      <Loader />
      {state.mode === "pending" ? (
        <div className="ssr-story">
          <ClassicView textOnly />
        </div>
      ) : (
        <Immersive mobile={state.mobile} />
      )}
    </>
  );
}
