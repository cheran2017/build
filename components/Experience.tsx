"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Loader } from "./overlays/Chrome";
import { ClassicView } from "./overlays/ClassicView";

// Everything WebGL (three, R3F, journey, overlays) lives behind this import
const Immersive = dynamic(() => import("./Immersive"), { ssr: false });

const MOBILE_QUERY = "(max-width: 767px), (max-aspect-ratio: 4/5)";

type Mode = { mode: "pending" | "classic" | "immersive"; mobile: boolean };

/**
 * "hardware" | "software" | "none". Software renderers (SwiftShader on blocklisted GPUs and in many VMs,
 * llvmpipe, Microsoft Basic Render Driver) run this scene at single-digit fps, so they get the classic view.
 */
function webglSupport() {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return "none";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext(); // free the probe context
    return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer) ? "software" : "hardware";
  } catch {
    return "none";
  }
}

function detect(): Mode {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const view = new URLSearchParams(window.location.search).get("view");
  // ?view=3d forces the tour anyway (the QA scripts use it: they run on software GL)
  const classic = view === "classic" || (view !== "3d" && (reduce || webglSupport() !== "hardware"));
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
