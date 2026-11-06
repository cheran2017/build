"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { brand, engage, faqTitle, faqs, included, leadership, links, storiesCard } from "@/lib/content";import { scroll, setUI, useUI } from "@/lib/store";
import { Arrow, Logo } from "./Buttons";

/** True for the hidden server-rendered copy behind the loader: no <img> requests there (see ClassicView). */
export const TextOnly = createContext(false);

export function Loader() {
  const ready = useUI((u) => u.ready);
  const loaded = useUI((u) => u.loaded);
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setGone(true), 1100);
    return () => clearTimeout(t);
  }, [ready]);
  if (gone) return null;
  return (
    <div className={`loader${ready ? " is-done" : ""}`} role="status" aria-live="polite">
      <Logo className="loader-mark" />
      <div className="loader-bar">
        <span style={{ transform: `scaleX(${Math.max(0.04, loaded / 100)})` }} />
      </div>
      <p className="loader-text">{ready ? "Ready" : `Setting up the studio · ${Math.round(loaded)}%`}</p>
    </div>
  );
}

const isFile = (v: string) => /\.(mp4|webm)(\?|$)/i.test(v);

export function VideoModal() {
  const video = useUI((u) => u.video);
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!video) return;
    scroll.lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setUI({ video: null });
    window.addEventListener("keydown", onKey);
    close.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      scroll.lenis?.start();
      document.body.style.cursor = "";
    };
  }, [video]);

  if (!video) return null;
  const dismiss = () => setUI({ video: null });
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={video.title} onClick={dismiss}>
      <div className="modal-frame" onClick={(e) => e.stopPropagation()}>
        {video.video ? (
          isFile(video.video) ? (
            <video src={video.video} controls autoPlay playsInline />
          ) : (
            <iframe src={video.video} title={video.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
          )
        ) : video.poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={video.poster} alt={video.title} />
        ) : (
          <div className="modal-empty">
            <p className="headline">{video.title}</p>
            <p className="lede">{storiesCard.moreEmpty}</p>
          </div>
        )}
      </div>
      <button ref={close} type="button" className="modal-close" onClick={dismiss} aria-label="Close">
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export function JoinSection() {
  const faq = useRef<HTMLDialogElement>(null);
  const textOnly = useContext(TextOnly);
  return (
    <div className="join">
      <section id="leadership" className="leaders" aria-labelledby="leaders-title">
        <div className="leaders-inner">
          <p className="eyebrow center">{leadership.eyebrow}</p>
          <h2 id="leaders-title" className="section-title center">
            {leadership.title}
          </h2>
          <p className="lede center">{leadership.lede}</p>
          <ul className="leader-grid">
            {leadership.leaders.map((l) => (
              <li key={l.name} className="leader">
                {!textOnly && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.photo} alt={`${l.name}, ${l.role}`} width={286} height={197} loading="lazy" />
                )}
                <h3>{l.name}</h3>
                <p className="leader-role">{l.role}</p>
                <p className="leader-bio">{l.bio}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section id="plans" className="plans" aria-labelledby="plans-title">
        <div className="plans-inner">
          <p className="eyebrow center">{engage.eyebrow}</p>
          <h2 id="plans-title" className="section-title center">
            {engage.title}
          </h2>
          <div className="plan-grid">
            {engage.options.map((p) => (
              <article key={p.name} className={`plan${p.featured ? " plan-featured" : ""}`}>
                {p.featured && <span className="plan-badge">{engage.badge}</span>}
                <h3 className="plan-name">{p.name}</h3>
                <p className="plan-price">
                  <strong>{p.price}</strong>
                  <span>{p.period}</span>
                </p>
                <p className="plan-note">{p.note}</p>
                <a className={`btn ${p.featured ? "btn-primary" : "btn-dark"} btn-block`} href={p.href}>
                  <span>{p.cta}</span>
                  <Arrow />
                </a>
              </article>
            ))}
          </div>
          <div className="plan-included">
            <p className="plan-included-title">{engage.includedTitle}</p>
            <ul className="plan-list">
              {included.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <p className="guarantee">
            <strong>{engage.guarantee}</strong> {engage.guaranteeNote}
          </p>
        </div>
      </section>
      <footer className="footer">
        <span>
          © {new Date().getFullYear()} {brand.name}
        </span>
        <button type="button" className="footer-link" onClick={() => faq.current?.showModal()}>
          FAQ
        </button>
        {links.terms && <a href={links.terms}>Terms</a>}
        <a href={links.privacy}>Privacy</a>
      </footer>
      <dialog
        ref={faq}
        className="faq-dialog"
        aria-labelledby="faq-title"
        data-lenis-prevent
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      >
        <div className="faq-inner">
          <div className="faq-head">
            <h2 id="faq-title">{faqTitle}</h2>
            <button type="button" className="faq-close" aria-label="Close" onClick={() => faq.current?.close()} />
          </div>
          {faqs.map((f) => (
            <details key={f.q} className="faq-item">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </dialog>
    </div>
  );
}
