"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { LuxuryCarouselCard } from "./LuxuryCarouselCard";

export interface WorksWheelItem {
  id?: string;
  title: string;
  category?: string;
  discipline?: string;
  serviceProvided?: string;
  projectType?: string;
  image: string;
  alt: string;
  video?: string;
  cleanCard?: boolean;
}
export interface WorksWheelHandle { setTurn: (turn: number) => void }
interface WorksWheelProps {
  items: WorksWheelItem[];
  onPreview: (index: number, focusPreview?: boolean) => void;
  onSelect: (progress: number) => void;
  label?: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const rad = (deg: number) => deg * Math.PI / 180;

// Ring/drum geometry adapted from the user-supplied WorksWheel component.
// Input is owned by the page's master ScrollTrigger: no intercepted wheel,
// touch drag, settling timer, competing easing, or permanent animation loop.
export const WorksWheel = forwardRef<WorksWheelHandle, WorksWheelProps>(function WorksWheel({ items, onPreview, onSelect, label = "Selected work" }, ref) {
  const stageRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const indexButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const labelRef = useRef<HTMLHeadingElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const turnRef = useRef(0);
  const targetTurnRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);
  const startGlideRef = useRef<() => void>(() => {});
  const drawRef = useRef<() => void>(() => {});
  const gestureRef = useRef<{ x: number; y: number; scrollY: number; moved: boolean } | null>(null);

  useImperativeHandle(ref, () => ({ setTurn(turn) {
    targetTurnRef.current = clamp(turn, 0, items.length);
    startGlideRef.current();
  } }), [items.length]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let metrics = { cardW: 0, cardH: 0, ringR: 0, drumR: 0, bow: 0 };
    let previousActive = -1;
    let previousTurn = Number.NaN;
    const hiddenStates: boolean[] = [];

    const draw = () => {
      const t = turnRef.current;
      if (t === previousTurn) return;
      previousTurn = t;
      stage.dataset.turn = String(t);
      const m = query.matches ? 1 : clamp(t, 0, 1);
      const pos = Math.max(0, t - 1);
      const active = clamp(Math.round(pos), 0, items.length - 1);
      const { ringR, drumR, bow } = metrics;
      if (wheelRef.current) wheelRef.current.style.transform = `translateZ(${-m * drumR}px)`;
      cards.current.forEach((card, i) => {
        if (!card) return;
        const d = i - pos;
        const drumDeg = d * 34;
        const distance = Math.abs(d);
        const hidden = query.matches ? i !== active : m >= 1 && distance > 1.75;
        // A fully culled panel needs no transform, paint or accessibility work
        // until it approaches the feathered visibility boundary again.
        if (hidden && hiddenStates[i] === true) return;
        card.style.transform = query.matches
          ? `translateZ(${drumR}px)`
          : `translateX(${-m * bow * (1 - Math.cos(rad(drumDeg)))}px) rotateZ(${(1-m)*d*360/items.length}deg) translateY(${-(1-m)*ringR}px) rotateX(${m*drumDeg}deg) translateZ(${m*drumR}px)`;
        // Feather the culling boundary instead of visibly popping neighbours.
        const feather = 1 - clamp((distance - 1.3) / .42, 0, 1);
        card.style.opacity = hidden ? "0" : String(query.matches ? 1 : 1-m+m*feather);
        const zIndex = String(Math.round(100 - distance * 2));
        if (card.style.zIndex !== zIndex) card.style.zIndex = zIndex;
        if (hiddenStates[i] !== hidden) {
          hiddenStates[i] = hidden;
          card.style.pointerEvents = hidden ? "none" : "auto";
        }
      });
      if (labelRef.current) labelRef.current.style.opacity = String(1-m);
      if (titleRef.current) titleRef.current.style.opacity = String(m);
      if (active !== previousActive) {
        previousActive = active;
        if (titleRef.current) titleRef.current.textContent = items[active]?.title ?? "";
        indexButtons.current.forEach((button, i) => button?.setAttribute("aria-pressed", String(i === active)));
      }
    };
    drawRef.current = draw;

    const stepGlide = (now: number) => {
      rafRef.current = null;
      const target = targetTurnRef.current;
      const current = turnRef.current;
      const diff = target - current;

      if (query.matches || Math.abs(diff) <= 0.0008) {
        turnRef.current = target;
        lastTickRef.current = 0;
        draw();
        return;
      }

      const dt = lastTickRef.current ? Math.min(0.064, (now - lastTickRef.current) / 1000) : 1 / 60;
      lastTickRef.current = now;
      // Smooth frame-rate-independent damping (~6.5 rad/s) for a weighted, cinematic glide
      const alpha = 1 - Math.exp(-dt * 6.5);
      turnRef.current = current + diff * alpha;
      draw();
      rafRef.current = window.requestAnimationFrame(stepGlide);
    };

    startGlideRef.current = () => {
      if (query.matches) {
        turnRef.current = targetTurnRef.current;
        draw();
        return;
      }
      // If jump is large (e.g. initial hash seek from 0), snap closer if stage isn't visible yet
      if (Number.isNaN(previousTurn)) {
        turnRef.current = targetTurnRef.current;
        draw();
        return;
      }
      if (rafRef.current === null) {
        lastTickRef.current = performance.now();
        rafRef.current = window.requestAnimationFrame(stepGlide);
      }
    };

    const measure = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const cardH = Math.min(Math.round(h * (w < 768 ? 0.48 : 0.52)), 460);
      const cardW = Math.round(cardH / 1.38);
      const ringR = cardH * 1.15;
      metrics = { cardW, cardH, ringR, drumR: cardH * 2.1, bow: cardH * 1.15 };
      stage.style.setProperty("--wheel-card-w", `${cardW}px`);
      stage.style.setProperty("--wheel-card-h", `${cardH}px`);
      stage.style.setProperty("perspective", `${cardH * 2.7}px`);
      previousTurn = Number.NaN;
      draw();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    query.addEventListener("change", measure);
    measure();
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      observer.disconnect();
      query.removeEventListener("change", measure);
      drawRef.current = () => {};
      startGlideRef.current = () => {};
    };
  }, [items]);

  return <div className="works-wheel" aria-label="Selected project carousel" data-works-wheel>
    <div className="works-wheel-stage" ref={stageRef}>
      <div className="works-wheel-drum" ref={wheelRef}>
        {items.map((item, i) => (
          <div
            key={item.title}
            ref={node => { cards.current[i] = node; }}
            className="works-wheel-card"
            role="button"
            tabIndex={0}
            aria-label={`Preview ${item.title}`}
            onPointerDown={event => {
              gestureRef.current = { x: event.clientX, y: event.clientY, scrollY: window.scrollY, moved: false };
            }}
            onPointerMove={event => {
              const gesture = gestureRef.current;
              if (gesture && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 8) gesture.moved = true;
            }}
            onPointerCancel={() => { if (gestureRef.current) gestureRef.current.moved = true; }}
            onClickCapture={event => {
              const gesture = gestureRef.current;
              gestureRef.current = null;
              if (event.detail !== 0 && gesture && (gesture.moved || Math.abs(window.scrollY - gesture.scrollY) > 8)) {
                event.preventDefault();
                event.stopPropagation();
                return;
              }
              if (!(event.target as HTMLElement).closest('button, a')) {
                event.stopPropagation();
                onPreview(i, true);
              }
            }}
            onClick={() => onPreview(i, true)}
            onKeyDown={e => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) e.preventDefault(); }}
            onKeyUp={e => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); e.stopPropagation(); onPreview(i, true); } }}
          >
            <span className="works-wheel-face">
              <LuxuryCarouselCard
                item={{
                  id: item.id,
                  title: item.title,
                  verticalTitle: item.title === "Obsidian Sentinel Study" ? "Obsidian" : item.title.split(" ")[0],
                  category: item.category || "VISYNTH Studio",
                  badge: item.projectType || "Studio project",
                  imageSrc: item.image,
                  imageAlt: item.alt,
                  videoSrc: item.video,
                  cleanCard: item.cleanCard,
                  discipline: item.discipline || item.category || "Creative work",
                  scope: item.serviceProvided || "Design and production",
                  projectType: item.projectType || "Studio project",
                  ctaText: "View project",
                }}
                isActive={true}
                onExplore={() => onPreview(i, true)}
              />
            </span>
          </div>
        ))}
      </div>
    </div>
    <h2 className="works-wheel-label" ref={labelRef}>{label}</h2>
    <p className="works-wheel-title" ref={titleRef} aria-hidden="true" />
    <ol className="works-wheel-index" aria-label="Choose a project">
      {items.map((item, i) => <li key={item.title}><button type="button" ref={node => { indexButtons.current[i] = node; }} aria-label={`Show ${item.title}`} aria-pressed={i === 0} onClick={() => onSelect((i + 1)/items.length)}><span>{String(i+1).padStart(2,"0")}</span><span className="works-wheel-index-name">{item.title}</span></button></li>)}
    </ol>
  </div>;
});
