import { brand, finale, links } from "@/lib/content";

// Shared by the immersive overlays, the join section and the classic view.
// Keep this file free of three / journey imports so the classic view never loads WebGL code.

export function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The Metayb logo. Both colourways are rendered; CSS shows the blue one, or the white one on dark chrome. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`logo ${className}`.trim()}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="logo-blue" src={brand.logo} alt={brand.name} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="logo-white" src={brand.logoWhite} alt="" aria-hidden="true" />
    </span>
  );
}

export function JoinButton({ label = finale.primary, small }: { label?: string; small?: boolean }) {
  return (
    <a className={`btn btn-primary${small ? " btn-sm" : ""}`} href={links.join}>
      <span>{label}</span>
      <Arrow />
    </a>
  );
}
