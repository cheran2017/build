import { brand, links } from "@/lib/content";

// Shared by the immersive overlays, the join section and the classic view.
// Keep this file free of three / journey imports so the classic view never loads WebGL code.

export function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function JoinButton({ label = `Join ${brand.name}`, small }: { label?: string; small?: boolean }) {
  return (
    <a className={`btn btn-primary${small ? " btn-sm" : ""}`} href={links.join}>
      <span>{label}</span>
      <Arrow />
    </a>
  );
}
