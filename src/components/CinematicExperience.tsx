"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Observer } from "gsap/Observer";
import { SectionId, SiteNavigation } from "./SiteNavigation";
import { ScrollProgressIndicator } from "./ScrollProgressIndicator";
import { HeroSection } from "./HeroSection";
import { SkillsSection } from "./SkillsSection";
import { WorkSection } from "./WorkSection";
import { AboutSection } from "./AboutSection";
import { ContactSection } from "./ContactSection";

const TOTAL_FRAMES = 300;

function getFrameSrc(indexZeroBased: number): string {
  const num = String(
    Math.min(TOTAL_FRAMES, Math.max(1, indexZeroBased + 1))
  ).padStart(3, "0");
  return `/frames/frame_${num}.webp`;
}

const SECTIONS: SectionId[] = ["home", "skills", "work", "about", "contact"];

// Target normalized scroll progress anchors (0..1) for direct section navigation
const SECTION_SCROLL_ANCHORS: Record<SectionId, number> = {
  home: 0,
  skills: 0.31,
  work: 0.57,
  about: 0.8,
  contact: 0.985,
};

function getSectionFromProgress(progress: number): SectionId {
  if (progress < 0.16) return "home";
  if (progress < 0.445) return "skills";
  if (progress < 0.705) return "work";
  if (progress < 0.875) return "about";
  return "contact";
}

export function CinematicExperience() {
  const [activeSection, setActiveSection] = useState<SectionId>("home");
  const activeSectionRef = useRef<SectionId>("home");

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const masterTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const isMobileRef = useRef<boolean>(false);
  const isNavigatingRef = useRef<boolean>(false);

  // Atmospheric overlay refs
  const heroBlackCurtainRef = useRef<HTMLDivElement | null>(null);
  const workContrastVeilRef = useRef<HTMLDivElement | null>(null);
  const crimsonAtmosphereRef = useRef<HTMLDivElement | null>(null);

  // Section DOM refs
  const homeRef = useRef<HTMLElement | null>(null);
  const skillsRef = useRef<HTMLElement | null>(null);
  const workRef = useRef<HTMLElement | null>(null);
  const aboutRef = useRef<HTMLElement | null>(null);
  const contactRef = useRef<HTMLElement | null>(null);

  // Right-edge progress indicator refs
  const progressFillRef = useRef<HTMLDivElement | null>(null);
  const progressContainerRef = useRef<HTMLDivElement | null>(null);

  // Frame sequence scrubbing state refs (no React re-renders on scroll frames)
  const currentProgressRef = useRef<number>(0);
  const lastDrawnFrameRef = useRef<number>(-1);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(
    new Array(TOTAL_FRAMES).fill(null)
  );

  // Draw a specific frame (or nearest loaded frame) onto the canvas with object-cover sizing
  const drawFrameToCanvas = useCallback((desiredIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d", { alpha: false });
    if (!ctx2d) return;

    ctx2d.imageSmoothingEnabled = true;
    ctx2d.imageSmoothingQuality = "high";

    const images = imagesRef.current;
    let img = images[desiredIndex];
    let resolvedIndex = desiredIndex;

    // Fallback to nearest already-loaded frame if user scrubs ahead of network load
    if (!img) {
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        if (desiredIndex - offset >= 0 && images[desiredIndex - offset]) {
          img = images[desiredIndex - offset];
          resolvedIndex = desiredIndex - offset;
          break;
        }
        if (
          desiredIndex + offset < TOTAL_FRAMES &&
          images[desiredIndex + offset]
        ) {
          img = images[desiredIndex + offset];
          resolvedIndex = desiredIndex + offset;
          break;
        }
      }
    }

    if (!img) return;
    if (lastDrawnFrameRef.current === resolvedIndex) return;
    lastDrawnFrameRef.current = resolvedIndex;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth || 1280;
    const ih = img.naturalHeight || 720;

    // Compute object-cover crop dimensions
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) * 0.5;
    const dy = (ch - dh) * 0.5;

    ctx2d.drawImage(img, dx, dy, dw, dh);
  }, []);

  // Smooth navigation to any section across Desktop & Mobile
  const scrollToSection = useCallback(
    (section: SectionId, instant = false) => {
      activeSectionRef.current = section;
      setActiveSection(section);

      if (typeof window !== "undefined") {
        const hash = section === "home" ? window.location.pathname : `#${section}`;
        window.history.replaceState(null, "", hash);
      }

      const anchor = SECTION_SCROLL_ANCHORS[section];
      const tl = masterTimelineRef.current;

      // Mobile Mode: Drive timeline directly without 650vh document scroll
      if (isMobileRef.current && tl) {
        if (instant) {
          tl.progress(anchor);
          currentProgressRef.current = anchor;
          drawFrameToCanvas(Math.round(anchor * (TOTAL_FRAMES - 1)));
          if (progressFillRef.current) {
            progressFillRef.current.style.transform = `scaleY(${anchor})`;
          }
          if (progressContainerRef.current) {
            progressContainerRef.current.style.opacity =
              anchor > 0.015 ? "1" : "0";
          }
        } else {
          isNavigatingRef.current = true;
          gsap.to(tl, {
            progress: anchor,
            duration: 0.75,
            ease: "power2.inOut",
            overwrite: "auto",
            onUpdate: () => {
              const p = tl.progress();
              currentProgressRef.current = p;
              drawFrameToCanvas(Math.round(p * (TOTAL_FRAMES - 1)));
              if (progressFillRef.current) {
                progressFillRef.current.style.transform = `scaleY(${p})`;
              }
              if (progressContainerRef.current) {
                progressContainerRef.current.style.opacity =
                  p > 0.015 ? "1" : "0";
              }
            },
            onComplete: () => {
              window.setTimeout(() => {
                isNavigatingRef.current = false;
              }, 120);
            },
          });
        }
        return;
      }

      // Desktop Mode: Scroll via ScrollTrigger
      const st = scrollTriggerRef.current;
      if (!st) {
        window.scrollTo({ top: 0, behavior: instant ? "instant" : "smooth" });
        return;
      }

      if (st.end <= st.start) {
        st.refresh();
      }

      if (instant && tl) {
        tl.progress(anchor);
        currentProgressRef.current = anchor;
        drawFrameToCanvas(Math.round(anchor * (TOTAL_FRAMES - 1)));
      }

      const targetScrollY = st.start + (st.end - st.start) * anchor;
      window.scrollTo({
        top: targetScrollY,
        behavior: instant ? "instant" : "smooth",
      });
      if (instant) {
        ScrollTrigger.update();
      }
    },
    [drawFrameToCanvas]
  );

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, Observer);

    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    const homeEl = homeRef.current;
    const skillsEl = skillsRef.current;
    const workEl = workRef.current;
    const aboutEl = aboutRef.current;
    const contactEl = contactRef.current;

    if (!wrapper || !homeEl || !skillsEl || !workEl || !aboutEl || !contactEl) {
      return;
    }

    const checkMobile = () => {
      const isMob =
        typeof window !== "undefined" &&
        (window.innerWidth <= 768 ||
          window.matchMedia("(max-width: 768px)").matches ||
          window.matchMedia("(pointer: coarse)").matches ||
          navigator.maxTouchPoints > 0 ||
          "ontouchstart" in window);
      isMobileRef.current = isMob;
      return isMob;
    };
    const isMobile = checkMobile();

    // Handle responsive canvas sizing
    const updateCanvasSize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(window.innerWidth * dpr);
      const height = Math.round(window.innerHeight * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        lastDrawnFrameRef.current = -1;
        const currentFrame = Math.min(
          TOTAL_FRAMES - 1,
          Math.max(
            0,
            Math.round(currentProgressRef.current * (TOTAL_FRAMES - 1))
          )
        );
        drawFrameToCanvas(currentFrame);
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    // Progressive, prioritized preloader for the 300 frames
    let isCancelled = false;
    const buildLoadOrder = (): number[] => {
      const seen = new Set<number>();
      const order: number[] = [];
      const pushIndex = (idx: number) => {
        if (idx >= 0 && idx < TOTAL_FRAMES && !seen.has(idx)) {
          seen.add(idx);
          order.push(idx);
        }
      };
      pushIndex(0);
      for (let i = 0; i < TOTAL_FRAMES; i += 8) pushIndex(i);
      for (let i = 0; i < TOTAL_FRAMES; i += 2) pushIndex(i);
      for (let i = 0; i < TOTAL_FRAMES; i++) pushIndex(i);
      return order;
    };

    const loadQueue = buildLoadOrder();
    let queueCursor = 0;
    const CONCURRENCY = 8;

    const loadNextBatch = () => {
      if (isCancelled || queueCursor >= loadQueue.length) return;
      const frameIndex = loadQueue[queueCursor++];
      const img = new window.Image();
      img.decoding = "async";
      img.src = getFrameSrc(frameIndex);
      img.onload = () => {
        if (isCancelled) return;
        imagesRef.current[frameIndex] = img;
        const currentTargetFrame = Math.min(
          TOTAL_FRAMES - 1,
          Math.max(
            0,
            Math.round(currentProgressRef.current * (TOTAL_FRAMES - 1))
          )
        );
        if (Math.abs(frameIndex - currentTargetFrame) <= 6) {
          lastDrawnFrameRef.current = -1;
          drawFrameToCanvas(currentTargetFrame);
        }
        loadNextBatch();
      };
      img.onerror = () => {
        if (!isCancelled) loadNextBatch();
      };
    };

    for (let c = 0; c < CONCURRENCY; c++) {
      loadNextBatch();
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Master timeline normalized from t = 0 to t = 100
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        paused: isMobile,
      });

      masterTimelineRef.current = tl;

      if (!isMobile) {
        const st = ScrollTrigger.create({
          trigger: wrapper,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * 6.5)}`,
          pin: true,
          scrub: prefersReducedMotion ? false : 0.25,
          anticipatePin: 1,
          animation: tl,
          onUpdate: (self) => {
            const p = self.progress;
            currentProgressRef.current = p;

            // Direct synchronized canvas frame render (1:1 lockstep with scroll)
            const targetFrame = Math.min(
              TOTAL_FRAMES - 1,
              Math.max(0, Math.round(p * (TOTAL_FRAMES - 1)))
            );
            drawFrameToCanvas(targetFrame);

            // Update right-edge progress bar without React state re-render
            if (progressFillRef.current) {
              progressFillRef.current.style.transform = `scaleY(${p})`;
            }
            if (progressContainerRef.current) {
              progressContainerRef.current.style.opacity =
                p > 0.015 ? "1" : "0";
            }

            // Update active navigation item only when crossing section boundary
            const nextSec = getSectionFromProgress(p);
            if (nextSec !== activeSectionRef.current) {
              activeSectionRef.current = nextSec;
              setActiveSection(nextSec);
            }
          },
        });

        scrollTriggerRef.current = st;
      } else {
        scrollTriggerRef.current = null;
      }

      // Placeholder duration span so timeline explicitly runs from 0 to 100
      tl.to({}, { duration: 100 }, 0);

      // =======================================================================
      // PHASE A — HOME (t: 0 -> 19, Frames 1 -> 57)
      // Initial state at t=0: Pure #000000 black background, preserved Hero intact.
      // t: 0 -> 7: Black curtain gradually opens to reveal the crimson portal scene behind the hero.
      // t: 8 -> 18: Camera pushes into the portal vortex; Hero elements recede in staggered order.
      // =======================================================================
      tl.fromTo(
        heroBlackCurtainRef.current,
        { opacity: 1 },
        { opacity: 0.14, duration: 7, ease: "power1.inOut" },
        0.2
      );

      if (canvas) {
        tl.fromTo(
          canvas,
          { scale: 1.02, filter: "brightness(0.9)" },
          { scale: 1.0, filter: "brightness(1)", duration: 7, ease: "sine.out" },
          0
        );
      }

      const heroEyebrowText = homeEl.querySelector('[data-hero="eyebrow-text"]');
      const heroEyebrowLine = homeEl.querySelector('[data-hero="eyebrow-line"]');
      const heroWordmark = homeEl.querySelector('[data-hero="wordmark"]');
      const heroTagline = homeEl.querySelector('[data-hero="tagline"]');
      const heroDescLines = homeEl.querySelectorAll('[data-hero="desc-line"]');
      const heroCta = homeEl.querySelector('[data-hero="cta"]');
      const heroContainer = homeEl.querySelector('[data-hero="container"]');

      tl.fromTo(
        [heroEyebrowText, heroEyebrowLine],
        { yPercent: 0, opacity: 1 },
        { yPercent: -100, opacity: 0, duration: 3.5, ease: "power2.in" },
        12
      )
        .fromTo(
          heroWordmark,
          { y: 0, scale: 1, opacity: 1, filter: "blur(0px)" },
          {
            y: -22,
            scale: 1.02,
            opacity: 0,
            filter: "blur(6px)",
            duration: 3.8,
            ease: "power2.in",
          },
          12.5
        )
        .fromTo(
          heroTagline,
          { yPercent: 0, opacity: 1 },
          { yPercent: -100, opacity: 0, duration: 3.5, ease: "power2.in" },
          13
        )
        .fromTo(
          heroDescLines,
          { yPercent: 0, opacity: 1 },
          {
            yPercent: -100,
            opacity: 0,
            stagger: 0.25,
            duration: 3.5,
            ease: "power2.in",
          },
          13.2
        )
        .fromTo(
          heroCta,
          { yPercent: 0, opacity: 1 },
          { yPercent: -100, opacity: 0, duration: 3.2, ease: "power2.in" },
          13.5
        )
        .fromTo(
          heroContainer,
          { y: 0 },
          { y: -16, duration: 6, ease: "sine.inOut" },
          12
        )
        // Ensure entire Home section container is strictly hidden when transitioning to subsequent scenes
        .fromTo(
          homeEl,
          { autoAlpha: 1, pointerEvents: "auto" },
          { autoAlpha: 0, pointerEvents: "none", duration: 2, ease: "power1.in" },
          16.5
        );

      // =======================================================================
      // PHASE B — SKILLS (t: 20 -> 44, Frames 60 -> 132 — Futuristic Android)
      // =======================================================================
      const skillsEyebrowText = skillsEl.querySelector(
        '[data-anim="eyebrow-text"]'
      );
      const skillsEyebrowLine = skillsEl.querySelector(
        '[data-anim="eyebrow-line"]'
      );
      const skillsHeadingLines = skillsEl.querySelectorAll(
        '[data-anim="heading-line"]'
      );
      const skillsBody = skillsEl.querySelector('[data-anim="body-copy"]');
      const skillRows = skillsEl.querySelectorAll('[data-anim="skill-row"]');
      const skillsContainer = skillsEl.querySelector(
        '[data-skills="container"]'
      );

      tl.fromTo(
        skillsEl,
        { autoAlpha: 0, pointerEvents: "none" },
        { autoAlpha: 1, pointerEvents: "auto", duration: 2 },
        20
      )
        .fromTo(
          skillsEyebrowText,
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 3.5, ease: "power2.out" },
          20.5
        )
        .fromTo(
          skillsEyebrowLine,
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 4.5, ease: "power2.out" },
          21
        )
        .fromTo(
          skillsHeadingLines,
          { yPercent: 115, opacity: 0, filter: "blur(5px)" },
          {
            yPercent: 0,
            opacity: 1,
            filter: "blur(0px)",
            stagger: 1.1,
            duration: 4.5,
            ease: "power3.out",
          },
          21.5
        )
        .fromTo(
          skillsBody,
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 4, ease: "power2.out" },
          23.5
        )
        .fromTo(
          skillRows,
          { y: 18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.75,
            duration: 3.8,
            ease: "power2.out",
          },
          24.5
        )
        .fromTo(
          skillsContainer,
          { y: 16 },
          { y: -14, duration: 22, ease: "none" },
          20
        )
        // Exit Skills as camera dives into the android's crimson core (t: 39 -> 44)
        .to(
          [skillsEyebrowText, skillsEyebrowLine, skillsBody],
          { y: -16, opacity: 0, duration: 3.5, ease: "power2.in" },
          39
        )
        .to(
          skillsHeadingLines,
          {
            yPercent: -115,
            opacity: 0,
            filter: "blur(4px)",
            stagger: 0.6,
            duration: 3.8,
            ease: "power2.in",
          },
          39.2
        )
        .to(
          skillRows,
          {
            y: -14,
            opacity: 0,
            stagger: 0.4,
            duration: 3.2,
            ease: "power2.in",
          },
          39.5
        )
        .to(
          skillsEl,
          { autoAlpha: 0, pointerEvents: "none", duration: 1.5 },
          43
        );

      // =======================================================================
      // PHASE C — WORK (t: 45 -> 70, Frames 135 -> 210 — Red Sphere Sketch)
      // =======================================================================
      const workEyebrowText = workEl.querySelector(
        '[data-anim="eyebrow-text"]'
      );
      const workEyebrowLine = workEl.querySelector(
        '[data-anim="eyebrow-line"]'
      );
      const workHeadingLines = workEl.querySelectorAll(
        '[data-anim="heading-line"]'
      );
      const workBody = workEl.querySelector('[data-anim="body-copy"]');
      const workRows = workEl.querySelectorAll('[data-anim="work-row"]');
      const workCta = workEl.querySelector('[data-anim="work-cta"]');
      const workContainer = workEl.querySelector('[data-work="container"]');

      tl.fromTo(
        workContrastVeilRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 4.5, ease: "power2.inOut" },
        43.5
      )
        .fromTo(
          workEl,
          { autoAlpha: 0, pointerEvents: "none" },
          { autoAlpha: 1, pointerEvents: "auto", duration: 2 },
          45.5
        )
        .fromTo(
          workEyebrowText,
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 3.5, ease: "power2.out" },
          46
        )
        .fromTo(
          workEyebrowLine,
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 4.5, ease: "power2.out" },
          46.5
        )
        .fromTo(
          workHeadingLines,
          { yPercent: 115, opacity: 0, filter: "blur(5px)" },
          {
            yPercent: 0,
            opacity: 1,
            filter: "blur(0px)",
            stagger: 1.1,
            duration: 4.5,
            ease: "power3.out",
          },
          47
        )
        .fromTo(
          workBody,
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 4, ease: "power2.out" },
          49
        )
        .fromTo(
          workRows,
          { x: -18, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            stagger: 0.75,
            duration: 3.8,
            ease: "power2.out",
          },
          50
        )
        .fromTo(
          workCta,
          { yPercent: 115, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 3.8, ease: "power2.out" },
          52.5
        )
        .fromTo(
          workContainer,
          { y: 16 },
          { y: -14, duration: 23, ease: "none" },
          46
        )
        // Exit Work as camera zooms through the red sphere threads into the subway (t: 65 -> 71)
        .to(
          [workEyebrowText, workEyebrowLine, workBody, workCta],
          { y: -16, opacity: 0, duration: 3.5, ease: "power2.in" },
          65.5
        )
        .to(
          workHeadingLines,
          {
            yPercent: -115,
            opacity: 0,
            filter: "blur(4px)",
            stagger: 0.6,
            duration: 3.6,
            ease: "power2.in",
          },
          65.8
        )
        .to(
          workRows,
          {
            x: 16,
            opacity: 0,
            stagger: 0.4,
            duration: 3.2,
            ease: "power2.in",
          },
          66
        )
        .to(
          workEl,
          { autoAlpha: 0, pointerEvents: "none", duration: 1.5 },
          69.5
        )
        .to(
          workContrastVeilRef.current,
          { opacity: 0.35, duration: 4.5, ease: "power2.inOut" },
          68.5
        );

      // =======================================================================
      // PHASE D — ABOUT (t: 71 -> 88, Frames 213 -> 264 — Red-Lit Subway)
      // =======================================================================
      const aboutEyebrowText = aboutEl.querySelector(
        '[data-anim="eyebrow-text"]'
      );
      const aboutEyebrowLine = aboutEl.querySelector(
        '[data-anim="eyebrow-line"]'
      );
      const aboutHeadingLines = aboutEl.querySelectorAll(
        '[data-anim="heading-line"]'
      );
      const aboutCopies = aboutEl.querySelectorAll('[data-anim="about-copy"]');
      const aboutPillars = aboutEl.querySelectorAll(
        '[data-anim="about-pillar"]'
      );
      const aboutContainer = aboutEl.querySelector('[data-about="container"]');

      tl.fromTo(
        aboutEl,
        { autoAlpha: 0, pointerEvents: "none" },
        { autoAlpha: 1, pointerEvents: "auto", duration: 2 },
        71.5
      )
        .fromTo(
          aboutEyebrowText,
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 3, ease: "power2.out" },
          72
        )
        .fromTo(
          aboutEyebrowLine,
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 4, ease: "power2.out" },
          72.5
        )
        .fromTo(
          aboutHeadingLines,
          { yPercent: 115, opacity: 0, filter: "blur(5px)" },
          {
            yPercent: 0,
            opacity: 1,
            filter: "blur(0px)",
            stagger: 0.9,
            duration: 4,
            ease: "power3.out",
          },
          72.8
        )
        .fromTo(
          aboutCopies,
          { y: 18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 1,
            duration: 3.8,
            ease: "power2.out",
          },
          74.8
        )
        .fromTo(
          aboutPillars,
          { y: 16, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.7,
            duration: 3.5,
            ease: "power2.out",
          },
          76.2
        )
        .fromTo(
          aboutContainer,
          { y: 14 },
          { y: -12, duration: 15, ease: "none" },
          72
        )
        // Exit About into Contact as subway settles (t: 84 -> 88)
        .to(
          [aboutEyebrowText, aboutEyebrowLine, ...Array.from(aboutCopies)],
          { y: -14, opacity: 0, duration: 3, ease: "power2.in" },
          84
        )
        .to(
          aboutHeadingLines,
          {
            yPercent: -115,
            opacity: 0,
            filter: "blur(4px)",
            stagger: 0.45,
            duration: 3.2,
            ease: "power2.in",
          },
          84.2
        )
        .to(
          aboutPillars,
          {
            y: -12,
            opacity: 0,
            stagger: 0.35,
            duration: 2.8,
            ease: "power2.in",
          },
          84.5
        )
        .to(
          aboutEl,
          { autoAlpha: 0, pointerEvents: "none", duration: 1.5 },
          87.2
        );

      // =======================================================================
      // PHASE E — CONTACT (t: 88 -> 100, Frames 264 -> 300 — Final Composition)
      // =======================================================================
      const contactEyebrowText = contactEl.querySelector(
        '[data-anim="eyebrow-text"]'
      );
      const contactEyebrowLine = contactEl.querySelector(
        '[data-anim="eyebrow-line"]'
      );
      const contactHeadingLines = contactEl.querySelectorAll(
        '[data-anim="heading-line"]'
      );
      const contactCopy = contactEl.querySelector('[data-anim="contact-copy"]');
      const contactAction = contactEl.querySelector(
        '[data-anim="contact-action"]'
      );

      tl.to(
        crimsonAtmosphereRef.current,
        { opacity: 0.72, duration: 5, ease: "power2.out" },
        87.5
      )
        .fromTo(
          contactEl,
          { autoAlpha: 0, pointerEvents: "none" },
          { autoAlpha: 1, pointerEvents: "auto", duration: 2 },
          88
        )
        .fromTo(
          contactEyebrowText,
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 3, ease: "power2.out" },
          88.5
        )
        .fromTo(
          contactEyebrowLine,
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 3.8, ease: "power2.out" },
          89
        )
        .fromTo(
          contactHeadingLines,
          { yPercent: 115, opacity: 0, filter: "blur(5px)" },
          {
            yPercent: 0,
            opacity: 1,
            filter: "blur(0px)",
            stagger: 1,
            duration: 4.2,
            ease: "power3.out",
          },
          89.2
        )
        .fromTo(
          contactCopy,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 3.5, ease: "power2.out" },
          91.2
        )
        .fromTo(
          contactAction,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 3.5, ease: "power2.out" },
          92.2
        );
    }, wrapper);

    // Mobile discrete 1-page-at-a-time controller (strictly locked during transition)
    let observer: Observer | null = null;
    if (isMobile) {
      observer = Observer.create({
        target: window,
        type: "wheel,touch,pointer",
        tolerance: 20,
        preventDefault: true,
        onPress: (self) => {
          if (self.event && self.event.cancelable) {
            self.event.preventDefault();
          }
        },
        onUp: () => {
          if (isNavigatingRef.current) return;
          const currentIdx = SECTIONS.indexOf(activeSectionRef.current);
          if (currentIdx < SECTIONS.length - 1) {
            const nextIdx = currentIdx + 1;
            scrollToSection(SECTIONS[nextIdx]);
          }
        },
        onDown: () => {
          if (isNavigatingRef.current) return;
          const currentIdx = SECTIONS.indexOf(activeSectionRef.current);
          if (currentIdx > 0) {
            const prevIdx = currentIdx - 1;
            scrollToSection(SECTIONS[prevIdx]);
          }
        },
      });
    }

    // Handle initial URL hash and in-page hashchange
    const handleHashNavigation = (instant = true) => {
      const hash = window.location.hash.replace("#", "") as SectionId;
      if (hash && hash !== "home" && hash in SECTION_SCROLL_ANCHORS) {
        if (!isMobile) {
          ScrollTrigger.refresh();
        }
        scrollToSection(hash, instant);
      } else if (!hash || hash === "home") {
        scrollToSection("home", instant);
      }
    };

    handleHashNavigation(true);
    const onHashChange = () => handleHashNavigation(false);
    window.addEventListener("hashchange", onHashChange);

    return () => {
      isCancelled = true;
      window.removeEventListener("resize", updateCanvasSize);
      window.removeEventListener("hashchange", onHashChange);
      if (observer) observer.kill();
      if (scrollTriggerRef.current) scrollTriggerRef.current.kill();
      ctx.revert();
    };
  }, [drawFrameToCanvas, scrollToSection]);

  return (
    <div className="relative w-full bg-[#000000] text-white">
      {/* Fixed Navigation Bar (Layer 4) */}
      <SiteNavigation
        activeSection={activeSection}
        onNavigate={scrollToSection}
      />

      {/* Right-Edge Scroll Progress Indicator (Layer 4) */}
      <ScrollProgressIndicator
        activeSection={activeSection}
        progressRef={progressFillRef}
        containerRef={progressContainerRef}
        onNavigate={scrollToSection}
      />

      {/* Pinned Master Viewport */}
      <div
        ref={wrapperRef}
        className="relative w-full h-screen overflow-hidden bg-[#000000]"
      >
        <div ref={stageRef} className="relative w-full h-full">
          {/* Layer 1: 300-Frame High-Performance Canvas Sequence */}
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            aria-hidden="true"
            className="absolute inset-0 z-0 w-full h-full pointer-events-none select-none will-change-transform"
          />

          {/* Layer 2a: Base Left-Side Vignette for Typography Readability */}
          <div
            aria-hidden="true"
            className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(90deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.52)_42%,rgba(0,0,0,0.08)_78%,rgba(0,0,0,0.25)_100%)]"
          />

          {/* Layer 2b: Localized Contrast Veil for Bright Hand-Drawn Sketch Scene (Work) */}
          <div
            ref={workContrastVeilRef}
            aria-hidden="true"
            className="absolute inset-0 z-10 opacity-0 pointer-events-none bg-[linear-gradient(90deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.78)_44%,rgba(0,0,0,0.22)_74%,rgba(0,0,0,0.08)_100%)]"
          />

          {/* Layer 2c: Crimson-Dark Atmospheric Settling Overlay for Final Contact Scene */}
          <div
            ref={crimsonAtmosphereRef}
            aria-hidden="true"
            className="absolute inset-0 z-10 opacity-0 pointer-events-none bg-[radial-gradient(circle_at_75%_55%,rgba(180,15,15,0.16),rgba(0,0,0,0.78)_70%)]"
          />

          {/* Layer 2d: Pure #000000 Curtain Preserving Exact Initial Hero Appearance at Scroll = 0 */}
          <div
            ref={heroBlackCurtainRef}
            aria-hidden="true"
            className="absolute inset-0 z-10 bg-[#000000] pointer-events-none"
          />

          {/* Layer 3: Synchronized Section Content */}
          <HeroSection
            sectionRef={homeRef}
            onExploreWork={() => scrollToSection("work")}
          />

          <SkillsSection sectionRef={skillsRef} />

          <WorkSection
            sectionRef={workRef}
            onNavigateContact={() => scrollToSection("contact")}
          />

          <AboutSection sectionRef={aboutRef} />

          <ContactSection
            sectionRef={contactRef}
            onReturnHome={() => scrollToSection("home")}
          />
        </div>
      </div>
    </div>
  );
}
