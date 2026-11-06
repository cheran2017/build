"use client";

import {
  about,
  brand,
  chapterCards,
  communityCollage,
  coachingCall,
  creatorBadges,
  founder,
  framework,
  hero,
  industriesCard,
  launches,
  membersMap,
  phasesCard,
  proofQuote,
  solutionsCard,
  stories,
  storiesCard,
  teamCard,
  whoFor,
} from "@/lib/content";
import { useContext } from "react";
import { JoinSection, TextOnly, VideoModal } from "./Chrome";
import { JoinButton, Logo } from "./Buttons";

/* eslint-disable @next/next/no-img-element */

function Img(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  return useContext(TextOnly) ? null : <img {...props} />;
}

/**
 * Same story as flat editorial HTML, for reduced motion, no WebGL, or ?view=classic.
 * `textOnly` drops the images: used for the hidden server-rendered copy behind the loader, whose <img> requests
 * would otherwise duplicate the WebGL texture downloads (different CORS mode, so no shared cache entry).
 */
export function ClassicView({ textOnly = false }: { textOnly?: boolean }) {
  return (
    <TextOnly.Provider value={textOnly}>
    <div className="classic">
      <header className="nav nav-static">
        <a href="#top" className="wordmark" aria-label={`${brand.name} home`}>
          <Logo />
        </a>
        <JoinButton small />
      </header>
      <main id="top">
        <section className="c-hero">
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1 className="display">
            {hero.title[0]} {hero.title[1]}
          </h1>
          <p className="lede">{hero.lede}</p>
          <div className="actions">
            <JoinButton />
            <a className="btn btn-ghost" href="?view=3d">
              Take the 3D tour
            </a>
          </div>
          <div className="c-badges">
            {creatorBadges.map((b) => (
              <Img key={b} src={b} alt="" loading="lazy" />
            ))}
          </div>
        </section>

        <section className="c-section">
          <p className="eyebrow">01 · {chapterCards.idea.word}</p>
          <h2 className="section-title">{about.headline}</h2>
          <p className="lede">{about.lede}</p>
          <ul className="ticks">
            {whoFor.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
          <Img className="c-wide" src={communityCollage} alt="" loading="lazy" />
          <div className="c-founder">
            <Img src={founder.photo} alt={founder.photoAlt} loading="lazy" />
            <div>
              <h3 className="headline">{founder.headline}</h3>
              <p className="lede">{founder.bio}</p>
              <ul className="stats">
                {founder.socials.map((s) => (
                  <li key={s.label}>
                    <strong>{s.value}</strong>
                    <span>{s.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="c-section c-dark">
          <p className="eyebrow">02 · {chapterCards.build.word}</p>
          <h2 className="section-title">{phasesCard.headline}</h2>
          <div className="c-grid3">
            {framework.map((f) => (
              <article key={f.n} className="c-card">
                <Img src={f.icon} alt="" width={64} height={64} />
                <span className="c-n">{f.n}</span>
                <h3>{f.title}</h3>
                <p>
                  <strong>{f.short}</strong> {f.body}
                </p>
              </article>
            ))}
          </div>
          <Img className="c-wide" src={coachingCall} alt="" loading="lazy" />
          <p className="lede center">{teamCard.headline}</p>
          <h3 className="headline center">{solutionsCard.headline}</h3>
          <div className="c-gallery">
            {launches.map((l) => (
              <Img key={l.src} src={l.src} alt={l.title} loading="lazy" />
            ))}
          </div>
          <p className="lede center">{industriesCard.lede}</p>
          <Img className="c-wide" src={membersMap} alt="" loading="lazy" />
        </section>

        <section className="c-section">
          <p className="eyebrow">03 · {chapterCards.scale.word}</p>
          <h2 className="section-title">{storiesCard.headline}</h2>
          <div className="c-stories">
            {stories.map((s) => (
              <article key={s.id} className="c-story">
                <strong className="c-stat">{s.stat}</strong>
                <span className="c-stat-label">{s.statLabel}</span>
                <p className="c-quote">“{s.quote}”</p>
                <p className="c-detail">
                  {s.name}, {s.byline} · {s.detail}
                </p>
              </article>
            ))}
          </div>
          <blockquote className="c-quote-big">
            “{proofQuote.quote}” <cite>{proofQuote.name}</cite>
          </blockquote>
        </section>
      </main>
      <JoinSection />
      <VideoModal />
    </div>
    </TextOnly.Provider>
  );
}
