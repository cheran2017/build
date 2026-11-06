"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import {
  about,
  brand,
  chapterCards,
  finale,
  founder,
  framework,
  hero,
  industriesCard,
  leadership,
  phasesCard,
  proofQuote,
  solutionsCard,
  stories,
  storiesCard,
  teamCard,
  whoFor,
} from "@/lib/content";
import { CHAPTERS, LEADER_LEAD, LEADER_STEP, windowed, type Journey, type OverlaySide } from "@/lib/journey";
import { openVideo, scroll } from "@/lib/store";
import { JoinButton, Logo } from "./Buttons";

type Place = OverlaySide | "center" | "top";
type OverlayDef = {
  id: string;
  from: [string, number];
  to: [string, number];
  place: Place;
  theme: "light" | "dark";
  card?: boolean;
  interactive?: boolean;
  body: ReactNode;
};

function Chapter({ n, word, line }: { n: string; word: string; line: string }) {
  return (
    <div className="chapter">
      <h2 className="eyebrow center">
        {n} · {word}
      </h2>
      <p className="big-line">{line}</p>
    </div>
  );
}

function PlayButton({ name, video, poster }: { name: string; video: string | null; poster: string | null }) {
  return (
    <button type="button" className="btn btn-ghost btn-sm play" onClick={() => openVideo({ title: name, video, poster })}>
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 4.5v15l12.5-7.5L7 4.5z" fill="currentColor" />
      </svg>
      <span>{video ? `Watch the ${name} video` : `${storiesCard.more} ${name}`}</span>
    </button>
  );
}

function buildOverlays(j: Journey): OverlayDef[] {
  const L = j.layout;
  const I = L.idea;
  const P = L.build.pillars;
  return [
    {
      id: "hero",
      from: ["r0", -2],
      to: ["r1", -0.7],
      place: j.mobile ? "bottom" : "left",
      theme: "light",
      interactive: true,
      body: (
        <>
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1 className="display">
            {hero.title[0]}
            <br />
            {hero.title[1]}
          </h1>
          <p className="lede">{hero.lede}</p>
          <div className="actions">
            <JoinButton />
          </div>
          <p className="scroll-hint" aria-hidden="true">
            Scroll to enter
          </p>
        </>
      ),
    },
    { id: "laptop", from: ["r2", -0.5], to: ["r2:hold", 0.15], place: "top", theme: "light", body: <p className="caption">{hero.laptopCaption}</p> },
    // appears as the screen washes to white, dark ink on the glow
    { id: "enter", from: ["cross", -0.4], to: ["cross", -0.12], place: "center", theme: "light", body: <p className="big-line">{hero.enter}</p> },

    { id: "ch-idea", from: ["idea", -0.35], to: ["idea:hold", 0.05], place: "bottom", theme: "light", body: <Chapter n="01" word={chapterCards.idea.word} line={chapterCards.idea.line} /> },
    {
      id: "i1",
      from: ["i1", -0.3],
      to: ["i1:hold", 0.1],
      place: I.i1.side,
      theme: "light",
      card: true,
      body: (
        <>
          <p className="eyebrow">{about.eyebrow}</p>
          <h2 className="headline">{about.headline}</h2>
          <p className="lede">{about.lede}</p>
        </>
      ),
    },
    {
      id: "i2",
      from: ["i2", -0.3],
      to: ["i2:hold", 0.1],
      place: I.i2.side,
      theme: "light",
      card: true,
      body: (
        <>
          <p className="eyebrow">{about.whoEyebrow}</p>
          <h2 className="headline">{about.whoHeadline}</h2>
          <ul className="ticks">
            {whoFor.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </>
      ),
    },
    {
      id: "i3",
      from: ["i3", -0.3],
      to: ["i3:hold", 0.1],
      place: I.i3.side,
      theme: "light",
      card: true,
      body: (
        <>
          <p className="eyebrow">{about.clientsEyebrow}</p>
          <h2 className="headline">{about.clientsHeadline}</h2>
          <p className="lede">{about.clientsLede}</p>
        </>
      ),
    },
    // one card per leader, in the site's order; the 3D strip slides to the next portrait between cards
    ...leadership.leaders.map((l, k): OverlayDef => {
      const c = LEADER_LEAD + k * LEADER_STEP;
      const last = k === leadership.leaders.length - 1;
      return {
        id: `leader-${k}`,
        from: ["i4", c],
        to: ["i4", c + 0.4 * LEADER_STEP],
        place: I.i4.side,
        theme: "light",
        card: true,
        interactive: last,
        body: (
          <>
            <p className="eyebrow">
              {leadership.eyebrow} · {k + 1} of {leadership.leaders.length}
            </p>
            <h2 className="headline">{l.name}</h2>
            <p className="lede">
              <strong>{l.role}.</strong> {l.bio}
            </p>
            {last && (
              <a className="btn btn-ghost btn-sm" href="#leadership">
                {founder.cta}
              </a>
            )}
          </>
        ),
      };
    }),
    {
      id: "i5",
      from: ["i5", -0.25],
      to: ["i5:hold", 0.05],
      place: "bottom",
      theme: "light",
      card: true,
      body: (
        <h2 className="headline center">
          {about.mistakeLine}
          <br />
          <span className="muted">{about.mistakeMuted}</span>
        </h2>
      ),
    },

    { id: "ch-build", from: ["build", -0.3], to: ["build:hold", 0], place: "bottom", theme: "dark", body: <Chapter n="02" word={chapterCards.build.word} line={chapterCards.build.line} /> },
    ...framework.map(
      (f, i): OverlayDef => ({
        id: `p${i + 1}`,
        from: [`p${i + 1}`, -0.3],
        to: [`p${i + 1}:hold`, 0.1],
        place: P[i].side,
        theme: "dark",
        card: true,
        body: (
          <>
            <p className="eyebrow">Capabilities · {i + 1} of {framework.length}</p>
            <h2 className="headline">{f.title}</h2>
            <p className="lede">
              <strong>{f.short}</strong> {f.body}
            </p>
          </>
        ),
      }),
    ),
    {
      id: "days",
      from: ["days", -0.3],
      to: ["days:hold", 0.1],
      place: "bottom",
      theme: "dark",
      card: true,
      body: (
        <>
          <h2 className="headline center">{phasesCard.headline}</h2>
          <p className="lede center">{phasesCard.lede}</p>
        </>
      ),
    },
    {
      id: "coach",
      from: ["coach", -0.3],
      to: ["coach:hold", 0.1],
      place: L.build.coach.side,
      theme: "dark",
      card: true,
      body: (
        <>
          <p className="eyebrow">{teamCard.eyebrow}</p>
          <h2 className="headline">{teamCard.headline}</h2>
          <p className="lede">{teamCard.lede}</p>
        </>
      ),
    },
    {
      id: "helix",
      from: ["helix", -0.2],
      to: ["helixEnd", -0.4],
      place: "bottom",
      theme: "dark",
      card: true,
      body: (
        <>
          <h2 className="headline center">{solutionsCard.headline}</h2>
          <p className="lede center">{solutionsCard.lede}</p>
        </>
      ),
    },
    {
      id: "map",
      from: ["map", -0.3],
      to: ["map:hold", 0.1],
      place: L.build.map.side,
      theme: "dark",
      card: true,
      body: (
        <>
          <p className="eyebrow">{industriesCard.eyebrow}</p>
          <h2 className="headline">{industriesCard.headline}</h2>
          <p className="lede">{industriesCard.lede}</p>
        </>
      ),
    },

    { id: "ch-launch", from: ["launch", -0.3], to: ["launch:hold", 0], place: "bottom", theme: "dark", body: <Chapter n="03" word={chapterCards.scale.word} line={chapterCards.scale.line} /> },
    ...stories.map(
      (s, i): OverlayDef => ({
        id: `s${i}`,
        from: [`s${i}`, -0.3],
        to: [`s${i}:hold`, 0.1],
        place: L.launch.stories[i].side,
        theme: "dark",
        card: true,
        interactive: true,
        body: (
          <>
            <p className="eyebrow">{s.name} · {s.byline}</p>
            <h2 className="headline">“{s.quote}”</h2>
            <p className="lede">{s.detail}</p>
            {(s.video || s.screen) && <PlayButton name={s.name} video={s.video} poster={s.screen} />}
          </>
        ),
      }),
    ),
    {
      id: "proof",
      from: ["proof", -0.3],
      to: ["proof:hold", 0.1],
      place: "bottom",
      theme: "dark",
      card: true,
      body: (
        <>
          <h2 className="headline center">{proofQuote.headline}</h2>
          <p className="lede center">
            “{proofQuote.quote}” <span className="muted">{proofQuote.name}</span>
          </p>
        </>
      ),
    },
    { id: "numbers", from: ["numbers", -0.5], to: ["numbers:hold", 0], place: "bottom", theme: "dark", body: <p className="big-line">{finale.numbersLine}</p> },
    {
      id: "final",
      from: ["final", -0.2],
      to: ["final:hold", 10],
      place: "bottom",
      theme: "light",
      interactive: true,
      body: (
        <div className="final">
          <h2 className="display center">{finale.headline}</h2>
          <p className="lede center">{finale.lede}</p>
          <div className="actions center">
            <JoinButton label={finale.primary} />
            <a className="btn btn-ghost" href="#plans">
              {finale.secondary}
            </a>
          </div>
          <p className="meta center">{finale.note}</p>
        </div>
      ),
    },
  ];
}

/** When the journey is on a dark world, so fixed chrome can flip to light-on-dark. */
function darkAt(j: Journey, p: number) {
  return (p > j.p("cross", -0.2) && p < j.p("idea", -0.2)) || (p > j.p("dThrough", -0.5) && p < j.p("final", -0.6));
}

export function Overlays({ journey: j }: { journey: Journey }) {
  const defs = useMemo(() => buildOverlays(j), [j]);
  const els = useRef<(HTMLElement | null)[]>([]);
  const flash = useRef<HTMLDivElement>(null);
  const chrome = useRef<HTMLDivElement>(null);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const fade = j.beats(0.25);
    const windows = defs.map((d) => [j.p(d.from[0], d.from[1]), j.p(d.to[0], d.to[1])] as const);
    const cross = j.p("cross");
    // peaks as IDEA switches on (see IdeaWorld visibility) and is gone before the camera settles
    const exit = j.p("idea", -0.45);
    const rise = j.beats(0.35);
    const fall = j.beats(0.35);
    const starts = CHAPTERS.map((c) => j.p(c.stop));
    let lastDark: boolean | null = null;

    const tick = () => {
      const p = scroll.progress;
      defs.forEach((d, i) => {
        const el = els.current[i];
        if (!el) return;
        const o = windowed(p, windows[i][0], windows[i][1], fade);
        const inner = el.firstElementChild as HTMLElement;
        if (o <= 0) {
          if (el.style.visibility !== "hidden") el.style.visibility = "hidden";
          return;
        }
        el.style.visibility = "visible";
        inner.style.opacity = o.toFixed(3);
        inner.style.transform = `translate3d(0, ${((1 - o) * 18).toFixed(1)}px, 0)`;
        el.style.pointerEvents = d.interactive && o > 0.6 ? "auto" : "none";
      });

      const bump = (at: number, peak = 1) => {
        if (p < at) return Math.max(0, 1 - (at - p) / rise) * peak;
        return Math.max(0, 1 - (p - at) / fall) * peak;
      };
      const f = Math.max(Math.pow(bump(cross), 1.4), Math.pow(bump(exit, 0.9), 1.6));
      if (flash.current) flash.current.style.opacity = f.toFixed(3);

      starts.forEach((s, i) => {
        const end = i < starts.length - 1 ? starts[i + 1] : 1;
        const el = fills.current[i];
        if (el) el.style.transform = `scaleX(${Math.min(1, Math.max(0, (p - s) / (end - s))).toFixed(3)})`;
      });

      const dark = darkAt(j, p);
      if (dark !== lastDark && chrome.current) {
        chrome.current.dataset.theme = dark ? "dark" : "light";
        lastDark = dark;
      }
    };
    gsap.ticker.add(tick);

    // chapter progress has done its job once the plans are on screen
    const plans = document.querySelector(".join");
    const io = new IntersectionObserver(([e]) => chrome.current?.classList.toggle("is-past", e.isIntersecting), { threshold: 0.05 });
    if (plans) io.observe(plans);

    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
    };
  }, [defs, j]);

  return (
    <>
      <div className="overlays">
        {defs.map((d, i) => (
          <section
            key={d.id}
            ref={(el) => void (els.current[i] = el)}
            className={`ov ov-${d.place} theme-${d.theme}${d.card ? " ov-card" : ""}`}
            data-ov={d.id}
            style={{ visibility: "hidden" }}
          >
            <div className="ov-inner" style={{ opacity: 0 }}>
              {d.body}
            </div>
          </section>
        ))}
      </div>
      <div ref={flash} className="flash" aria-hidden="true" />
      <div ref={chrome} className="chrome" data-theme="light">
        <header className="nav">
          <a href="#top" className="wordmark" aria-label={`${brand.name} home`} onClick={(e) => (e.preventDefault(), scroll.jump?.(0))}>
            <Logo />
          </a>
          <JoinButton small />
        </header>
        <nav className="chapters" aria-label="Chapters">
          {CHAPTERS.map((c, i) => (
            <button key={c.id} type="button" className="chapter-btn" onClick={() => scroll.jump?.(j.p(c.stop, 0.01))}>
              <span className="chapter-label">{c.label}</span>
              <span className="chapter-track">
                <span className="chapter-fill" ref={(el) => void (fills.current[i] = el)} />
              </span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
