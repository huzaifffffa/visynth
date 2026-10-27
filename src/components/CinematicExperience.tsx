"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  getFrameUrl,
  getSharedFrames,
  getSharedFrameStates,
  hasSessionPreloadCompleted,
  notifyExperienceReady,
  notifyRevealReady,
} from "@/lib/preloadSiteAssets";
import { SectionId, SiteNavigation } from "./SiteNavigation";
import { ScrollProgressIndicator } from "./ScrollProgressIndicator";
import { HeroSection } from "./HeroSection";
import { SkillsSection } from "./SkillsSection";
import { WorkSection } from "./WorkSection";
import { AboutSection } from "./AboutSection";
import { ContactSection } from "./ContactSection";

const TOTAL_FRAMES = 300;
const DEFAULT_FRAME_WIDTH = 1280;
const DEFAULT_FRAME_HEIGHT = 720;

// Frame state constants for deduplicated progressive loading
const FRAME_UNLOADED = 0;
const FRAME_LOADING = 1;
const FRAME_LOADED = 2;
const FRAME_FAILED = 3;

// Stable keyframe indices used when prefers-reduced-motion is enabled
const REDUCED_MOTION_KEYFRAMES = [0, 93, 171, 240, 295];

function getFrameSrc(indexZeroBased: number): string {
  return getFrameUrl(indexZeroBased);
}

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

interface CropMetrics {
  cw: number;
  ch: number;
  iw: number;
  ih: number;
  dx: number;
  dy: number;
  dw: number;
  dh: number;
}

function computeCoverMetrics(
  cw: number,
  ch: number,
  iw: number,
  ih: number
): CropMetrics {
  const scale = Math.max(cw / iw, ch / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (cw - dw) * 0.5;
  const dy = (ch - dh) * 0.5;
  return { cw, ch, iw, ih, dx, dy, dw, dh };
}

interface NavigatorConnection {
  saveData?: boolean;
  effectiveType?: string;
}

function detectDeviceCapabilities() {
  if (typeof window === "undefined") {
    return {
      isMobile: false,
      isSlowDevice: false,
      maxDpr: 2,
      concurrency: 4,
      smoothingQuality: "medium" as ImageSmoothingQuality,
    };
  }

  const isMobile =
    window.innerWidth < 768 ||
    window.matchMedia("(pointer: coarse)").matches;

  const nav = window.navigator as Navigator & {
    deviceMemory?: number;
    connection?: NavigatorConnection;
  };

  const cores = nav.hardwareConcurrency || 4;
  const memory = nav.deviceMemory || 4;
  const conn = nav.connection;
  const slowNetwork =
    Boolean(conn?.saveData) ||
    conn?.effectiveType === "slow-2g" ||
    conn?.effectiveType === "2g" ||
    conn?.effectiveType === "3g";

  const isSlowDevice = slowNetwork || cores <= 2 || memory <= 2;

  const maxDpr = isMobile
    ? isSlowDevice
      ? 1.15
      : 1.5
    : isSlowDevice
      ? 1.5
      : 2.0;

  const concurrency = isSlowDevice ? 2 : isMobile ? 3 : 4;
  // Hardware single-pass bilinear filtering ("low") prevents multi-pass CPU/Skia mipmap stalls when upscaling 1280x720 frames to 2x DPR
  const smoothingQuality: ImageSmoothingQuality = "low";

  return {
    isMobile,
    isSlowDevice,
    maxDpr,
    concurrency,
    smoothingQuality,
  };
}

interface NavigationOverlayProps {
  onNavigate: (section: SectionId) => void;
  progressFillRef: React.RefObject<HTMLDivElement | null>;
  progressContainerRef: React.RefObject<HTMLDivElement | null>;
}

const NavigationOverlay = React.memo(function NavigationOverlay({
  onNavigate,
  progressFillRef,
  progressContainerRef,
}: NavigationOverlayProps) {
  const [activeSection, setActiveSection] = useState<SectionId>("home");

  useEffect(() => {
    const handleSectionChange = (e: Event) => {
      const customEvent = e as CustomEvent<SectionId>;
      if (customEvent.detail) {
        React.startTransition(() => {
          setActiveSection(customEvent.detail);
        });
      }
    };
    window.addEventListener("visynth:active-section", handleSectionChange);
    return () =>
      window.removeEventListener("visynth:active-section", handleSectionChange);
  }, []);

  return (
    <>
      <SiteNavigation
        activeSection={activeSection}
        onNavigate={onNavigate}
      />
      <ScrollProgressIndicator
        activeSection={activeSection}
        progressRef={progressFillRef}
        containerRef={progressContainerRef}
        onNavigate={onNavigate}
      />
    </>
  );
});

export function CinematicExperience() {
  const activeSectionRef = useRef<SectionId>("home");

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctx2dRef = useRef<CanvasRenderingContext2D | null>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const masterTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

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
  const progressVisibleRef = useRef<boolean>(false);

  // Frame sequence scrubbing & RAF batching state refs (zero React re-renders per frame)
  const currentProgressRef = useRef<number>(0);
  const targetFrameRef = useRef<number>(0);
  const pendingDrawFrameRef = useRef<number>(0);
  const drawRafIdRef = useRef<number | null>(null);
  const lastDrawnFrameRef = useRef<number>(-1);
  const prefersReducedMotionRef = useRef<boolean>(false);

  const imagesRef = useRef<(HTMLImageElement | null)[]>(getSharedFrames());
  const frameStatesRef = useRef<Uint8Array>(getSharedFrameStates());
  const wakeLoadersRef = useRef<(() => void) | null>(null);

  // Cached canvas dimensions & object-cover crop metrics
  const cropMetricsRef = useRef<CropMetrics>(
    computeCoverMetrics(
      DEFAULT_FRAME_WIDTH,
      DEFAULT_FRAME_HEIGHT,
      DEFAULT_FRAME_WIDTH,
      DEFAULT_FRAME_HEIGHT
    )
  );
  const smoothingQualityRef = useRef<ImageSmoothingQuality>("medium");

  // Internal synchronous draw executed only inside requestAnimationFrame
  const renderFrameNow = useCallback((desiredIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx2d = ctx2dRef.current;
    if (!ctx2d) {
      ctx2d =
        canvas.getContext("2d", { alpha: false, desynchronized: true }) ||
        canvas.getContext("2d", { alpha: false });
      if (!ctx2d) return;
      ctx2d.imageSmoothingEnabled = true;
      ctx2d.imageSmoothingQuality = smoothingQualityRef.current;
      ctx2dRef.current = ctx2d;
    }

    const images = imagesRef.current;
    let targetIdx = desiredIndex;

    // Under prefers-reduced-motion, snap to the nearest section keyframe for a stable backdrop
    if (prefersReducedMotionRef.current) {
      let bestKeyframe = REDUCED_MOTION_KEYFRAMES[0];
      let bestDist = Math.abs(desiredIndex - bestKeyframe);
      for (let i = 1; i < REDUCED_MOTION_KEYFRAMES.length; i++) {
        const kf = REDUCED_MOTION_KEYFRAMES[i];
        const dist = Math.abs(desiredIndex - kf);
        if (dist < bestDist) {
          bestDist = dist;
          bestKeyframe = kf;
        }
      }
      targetIdx = bestKeyframe;
    }

    let img = images[targetIdx];
    let resolvedIndex = targetIdx;

    // Fallback to nearest already-decoded frame if user scrubs ahead of network load
    if (!img) {
      const lastDrawn = lastDrawnFrameRef.current;
      const maxOffset = lastDrawn !== -1 ? 24 : TOTAL_FRAMES;
      for (let offset = 1; offset < maxOffset; offset++) {
        const prev = targetIdx - offset;
        if (prev >= 0 && images[prev]) {
          img = images[prev];
          resolvedIndex = prev;
          break;
        }
        const next = targetIdx + offset;
        if (next < TOTAL_FRAMES && images[next]) {
          img = images[next];
          resolvedIndex = next;
          break;
        }
      }
      if (!img && lastDrawn !== -1) {
        return;
      }
    }

    if (!img) return;
    // Do not redraw if the resolved frame is already on the canvas
    if (lastDrawnFrameRef.current === resolvedIndex) return;
    lastDrawnFrameRef.current = resolvedIndex;

    let metrics = cropMetricsRef.current;
    const iw = img.naturalWidth || DEFAULT_FRAME_WIDTH;
    const ih = img.naturalHeight || DEFAULT_FRAME_HEIGHT;

    if (
      metrics.cw !== canvas.width ||
      metrics.ch !== canvas.height ||
      metrics.iw !== iw ||
      metrics.ih !== ih
    ) {
      metrics = computeCoverMetrics(canvas.width, canvas.height, iw, ih);
      cropMetricsRef.current = metrics;
    }

    ctx2d.drawImage(img, metrics.dx, metrics.dy, metrics.dw, metrics.dh);
  }, []);

  // Schedule a single requestAnimationFrame draw; coalesces multiple scroll ticks per frame
  const scheduleFrameDraw = useCallback(
    (desiredIndex: number, forceRedraw = false) => {
      const clamped = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, desiredIndex)
      );
      targetFrameRef.current = clamped;
      pendingDrawFrameRef.current = clamped;

      if (forceRedraw) {
        lastDrawnFrameRef.current = -1;
      }

      if (drawRafIdRef.current === null) {
        drawRafIdRef.current = window.requestAnimationFrame(() => {
          drawRafIdRef.current = null;
          renderFrameNow(pendingDrawFrameRef.current);
        });
      }

      // Wake background loader workers if they paused on a slow device
      if (wakeLoadersRef.current) {
        wakeLoadersRef.current();
      }
    },
    [renderFrameNow]
  );

  // Smooth navigation to any section across all devices
  const scrollToSection = useCallback(
    (section: SectionId, instant = false) => {
      activeSectionRef.current = section;
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("visynth:active-section", { detail: section })
        );
      }

      if (typeof window !== "undefined") {
        const hash =
          section === "home" ? window.location.pathname : `#${section}`;
        window.history.replaceState(null, "", hash);
      }

      const anchor = SECTION_SCROLL_ANCHORS[section];
      const tl = masterTimelineRef.current;
      const st = scrollTriggerRef.current;
      const lenis = lenisRef.current;

      if (!st) {
        if (tl) tl.progress(anchor);
        if (lenis) {
          lenis.scrollTo(0, { immediate: instant });
        } else {
          window.scrollTo({ top: 0, behavior: instant ? "instant" : "smooth" });
        }
        return;
      }

      if (st.end <= st.start) {
        st.refresh();
      }

      const targetFrame = Math.round(anchor * (TOTAL_FRAMES - 1));
      targetFrameRef.current = targetFrame;

      if (instant && tl) {
        tl.progress(anchor);
        currentProgressRef.current = anchor;
        scheduleFrameDraw(targetFrame, true);
      }

      const targetScrollY = st.start + (st.end - st.start) * anchor;
      if (lenis) {
        lenis.scrollTo(targetScrollY, {
          duration: instant ? 0 : 0.9,
          immediate: instant,
          lock: false,
        });
      } else {
        window.scrollTo({
          top: targetScrollY,
          behavior: instant ? "instant" : "smooth",
        });
      }
      if (instant) {
        ScrollTrigger.update();
      }
    },
    [scheduleFrameDraw]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    const homeEl = homeRef.current;

    if (!wrapper || !homeEl) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    prefersReducedMotionRef.current = prefersReducedMotion;

    let capabilities = detectDeviceCapabilities();
    smoothingQualityRef.current = capabilities.smoothingQuality;

    // Cache viewport dimensions to ignore mobile URL-bar vertical-only micro-resizes
    let lastViewportWidth = window.innerWidth;
    let lastViewportHeight = window.innerHeight;
    let resizeRafId: number | null = null;

    const applyCanvasSize = (force = false) => {
      if (!canvas) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Ignore minor vertical-only address bar height changes on mobile while scrolling
      if (
        !force &&
         capabilities.isMobile &&
        vw === lastViewportWidth &&
        Math.abs(vh - lastViewportHeight) < 120
      ) {
        return;
      }

      const widthChanged = vw !== lastViewportWidth;
      lastViewportWidth = vw;
      lastViewportHeight = vh;

      capabilities = detectDeviceCapabilities();
      smoothingQualityRef.current = capabilities.smoothingQuality;

      const dpr = Math.min(
        window.devicePixelRatio || 1,
        capabilities.maxDpr
      );
      // Cap backing resolution to 1920x1080 (desktop) / 1280 (mobile) so high-DPR screens
      // don't blow up to 5+ Megapixels (which starves GPU fill-rate on 60/120fps scrub)
      const targetMaxDim = capabilities.isMobile ? 1280 : 1920;
      let width = Math.max(1, Math.round(vw * dpr));
      let height = Math.max(1, Math.round(vh * dpr));
      const maxDim = Math.max(width, height);
      if (maxDim > targetMaxDim) {
        const scale = targetMaxDim / maxDim;
        width = Math.max(1, Math.round(width * scale));
        height = Math.max(1, Math.round(height * scale));
      }

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;

        // Re-apply context state because resizing a canvas resets its 2D context state
        const ctx2d =
          ctx2dRef.current ||
          canvas.getContext("2d", { alpha: false, desynchronized: true }) ||
          canvas.getContext("2d", { alpha: false });
        if (ctx2d) {
          ctx2d.imageSmoothingEnabled = true;
          ctx2d.imageSmoothingQuality = capabilities.smoothingQuality;
          ctx2dRef.current = ctx2d;
        }

        cropMetricsRef.current = computeCoverMetrics(
          width,
          height,
          DEFAULT_FRAME_WIDTH,
          DEFAULT_FRAME_HEIGHT
        );

        const currentFrame = Math.min(
          TOTAL_FRAMES - 1,
          Math.max(
            0,
            Math.round(currentProgressRef.current * (TOTAL_FRAMES - 1))
          )
        );
        scheduleFrameDraw(currentFrame, true);
      }

      if (widthChanged && scrollTriggerRef.current) {
        ScrollTrigger.refresh();
      }
    };

    if (hasSessionPreloadCompleted()) {
      applyCanvasSize(true);
    }

    const onWindowResize = () => {
      if (resizeRafId !== null) return;
      resizeRafId = window.requestAnimationFrame(() => {
        resizeRafId = null;
        applyCanvasSize(false);
      });
    };
    window.addEventListener("resize", onWindowResize, { passive: true });

    // =========================================================================
    // Controlled, Scroll-Prioritized Frame Loader with Async Decode
    // =========================================================================
    let isCancelled = false;
    const frameStates = frameStatesRef.current;

    // Recover already-loaded images if component remounts in same session
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      if (imagesRef.current[i]) {
        frameStates[i] = FRAME_LOADED;
      } else if (frameStates[i] === FRAME_LOADING) {
        frameStates[i] = FRAME_UNLOADED;
      }
    }

    // Select the highest-priority unloaded frame relative to the user's current scroll target
    const pickNextFrameToLoad = (): number => {
      if (frameStates[0] === FRAME_UNLOADED) return 0;

      const center = targetFrameRef.current;

      // Reduced motion: only load the 5 stable section keyframes
      if (prefersReducedMotionRef.current) {
        for (const kf of REDUCED_MOTION_KEYFRAMES) {
          if (frameStates[kf] === FRAME_UNLOADED) return kf;
        }
        return -1;
      }

      // Helper to scan outward from `center` within `maxRadius` at a given `stride`
      const findOutward = (maxRadius: number, stride: number): number => {
        for (let offset = 0; offset <= maxRadius; offset++) {
          const right = center + offset;
          if (
            right < TOTAL_FRAMES &&
            right % stride === 0 &&
            frameStates[right] === FRAME_UNLOADED
          ) {
            return right;
          }
          const left = center - offset;
          if (
            left >= 0 &&
            left % stride === 0 &&
            frameStates[left] === FRAME_UNLOADED
          ) {
            return left;
          }
        }
        return -1;
      };

      // Tier 1: Immediate vicinity around current scroll position (±16 frames)
      let candidate = findOutward(16, 2);
      if (candidate !== -1) return candidate;

      if (!capabilities.isSlowDevice) {
        candidate = findOutward(12, 1);
        if (candidate !== -1) return candidate;
      }

      // Tier 2: Coarse keyframes (stride 8) outward from current scroll position
      candidate = findOutward(TOTAL_FRAMES, 8);
      if (candidate !== -1) return candidate;

      // Tier 3: Medium density (stride 4, then stride 2) outward from current scroll position
      candidate = findOutward(TOTAL_FRAMES, 4);
      if (candidate !== -1) return candidate;

      candidate = findOutward(TOTAL_FRAMES, 2);
      if (candidate !== -1) return candidate;

      // Tier 4: Full density (stride 1)
      // On slow devices, only fill stride-1 within ±32 frames of current scroll position
      const denseRadius = capabilities.isSlowDevice ? 32 : TOTAL_FRAMES;
      return findOutward(denseRadius, 1);
    };

    const loadSingleFrame = (
      frameIndex: number,
      highPriority = false
    ): Promise<void> => {
      if (isCancelled || frameStates[frameIndex] !== FRAME_UNLOADED) {
        return Promise.resolve();
      }
      frameStates[frameIndex] = FRAME_LOADING;

      return new Promise<void>((resolve) => {
        const img = new window.Image();
        img.decoding = "async";
        if (highPriority && "fetchPriority" in img) {
          (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority =
            "high";
        }
        img.src = getFrameSrc(frameIndex);

        img.onload = () => {
          if (isCancelled) {
            resolve();
            return;
          }
          const finalize = () => {
            if (isCancelled) {
              resolve();
              return;
            }
            imagesRef.current[frameIndex] = img;
            frameStates[frameIndex] = FRAME_LOADED;

            // Only schedule a canvas update if the canvas has not yet drawn the exact target frame
            // and this newly decoded frame is closer to targetFrame than what is currently drawn
            const currentTarget = targetFrameRef.current;
            const lastDrawn = lastDrawnFrameRef.current;
            if (
              lastDrawn === -1 ||
              (lastDrawn !== currentTarget &&
                Math.abs(frameIndex - currentTarget) <
                  Math.abs(lastDrawn - currentTarget))
            ) {
              scheduleFrameDraw(currentTarget);
            }
            resolve();
          };

          if (typeof img.decode === "function") {
            img.decode().then(finalize, finalize);
          } else {
            finalize();
          }
        };

        img.onerror = () => {
          if (!isCancelled) {
            frameStates[frameIndex] = FRAME_FAILED;
          }
          resolve();
        };
      });
    };

    let activeWorkers = 0;
    let isActivelyScrolling = false;
    let scrollIdleTimer: ReturnType<typeof setTimeout> | null = null;

    const getEffectiveConcurrency = (): number => {
      // While actively scrolling, pause spawning image decodes so 100% of CPU and GPU
      // render budget goes directly to locked 60fps scrolling and canvas presentation
      if (isActivelyScrolling) return 0;
      return capabilities.concurrency;
    };

    const spawnWorker = () => {
      if (isCancelled || !hasSessionPreloadCompleted()) return;
      const limit = getEffectiveConcurrency();
      if (activeWorkers >= limit) return;
      const nextIndex = pickNextFrameToLoad();
      if (nextIndex === -1) return;

      activeWorkers++;
      loadSingleFrame(nextIndex, nextIndex === 0).then(() => {
        activeWorkers--;
        if (!isCancelled) {
          setTimeout(spawnWorker, capabilities.isSlowDevice ? 24 : 8);
        }
      });
    };

    const wakeLoadWorkers = () => {
      if (isCancelled || !hasSessionPreloadCompleted()) return;
      const limit = getEffectiveConcurrency();
      while (activeWorkers < limit) {
        const before = activeWorkers;
        spawnWorker();
        if (activeWorkers === before) break;
      }
    };

    const markScrollActivity = () => {
      isActivelyScrolling = true;
      if (scrollIdleTimer !== null) {
        clearTimeout(scrollIdleTimer);
      }
      scrollIdleTimer = setTimeout(() => {
        isActivelyScrolling = false;
        wakeLoadWorkers();
      }, 90);
    };
    wakeLoadersRef.current = wakeLoadWorkers;

    // 1. Signal experience shell readiness; while preloader is active, SitePreloader
    //    manages initial Frame 0 loading and canvas sizing is deferred until exit start.
    notifyExperienceReady();
    if (hasSessionPreloadCompleted()) {
      if (frameStates[0] === FRAME_LOADED && imagesRef.current[0]) {
        scheduleFrameDraw(targetFrameRef.current, true);
        wakeLoadWorkers();
      } else {
        loadSingleFrame(0, true).then(() => {
          if (!isCancelled) {
            scheduleFrameDraw(targetFrameRef.current, true);
            wakeLoadWorkers();
          }
        });
      }
    }

    // Handle initial URL hash and in-page hashchange
    const handleHashNavigation = (instant = true) => {
      const hash = window.location.hash.replace("#", "") as SectionId;
      if (hash && hash !== "home" && hash in SECTION_SCROLL_ANCHORS) {
        ScrollTrigger.refresh();
        scrollToSection(hash, instant);
      } else if (hash === "home") {
        scrollToSection("home", instant);
      }
    };

    gsap.registerPlugin(ScrollTrigger);
    gsap.ticker.lagSmoothing(0);

    const isMobile = capabilities.isMobile;
    const lenis = new Lenis({
      duration: isMobile ? 0.35 : 0.55,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.0,
      syncTouch: false,
      autoResize: true,
    });
    lenis.on("scroll", ScrollTrigger.update);
    lenisRef.current = lenis;

    const tickerCallback = (time: number) => {
      lenisRef.current?.raf(time * 1000);
      const target = pendingDrawFrameRef.current;
      if (lastDrawnFrameRef.current !== target) {
        renderFrameNow(target);
      }
    };
    gsap.ticker.add(tickerCallback);

    if (!hasSessionPreloadCompleted()) {
      lenis.stop();
    }

    const gsapCtx = gsap.context(() => {}, wrapper);

    // =========================================================================
    // Master GSAP ScrollTrigger Timeline (t = 0 -> 100)
    // =========================================================================
    let timelineInitialized = false;

    const startTimelineSetup = () => {
      if (isCancelled || timelineInitialized) return;
      const skillsEl = skillsRef.current;
      const workEl = workRef.current;
      const aboutEl = aboutRef.current;
      const contactEl = contactRef.current;
      if (!skillsEl || !workEl || !aboutEl || !contactEl)
        return;
      timelineInitialized = true;

      gsapCtx.add(() => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
        });

        masterTimelineRef.current = tl;

        const st = ScrollTrigger.create({
          trigger: wrapper,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * 8.0)}`,
          pin: true,
          // With Lenis smoothly interpolating wheel and touch inputs, scrub: true
          // locks the timeline and canvas 1:1 to the smooth scroll position without lag
          scrub: true,
          fastScrollEnd: true,
          anticipatePin: 1,
          invalidateOnRefresh: false,
          animation: tl,
          onUpdate: (self) => {
            const p = self.progress;
            currentProgressRef.current = p;
            markScrollActivity();

            const targetFrame = Math.min(
              TOTAL_FRAMES - 1,
              Math.max(0, Math.round(p * (TOTAL_FRAMES - 1)))
            );
            targetFrameRef.current = targetFrame;
            pendingDrawFrameRef.current = targetFrame;

            // Direct DOM update for right-edge progress bar (zero React re-renders)
            if (progressFillRef.current) {
              progressFillRef.current.style.transform = `scaleY(${p})`;
            }
            const shouldShowProgress = p > 0.015;
            if (
              progressContainerRef.current &&
              shouldShowProgress !== progressVisibleRef.current
            ) {
              progressVisibleRef.current = shouldShowProgress;
              progressContainerRef.current.style.opacity = shouldShowProgress
                ? "1"
                : "0";
            }

            // Broadcast section boundary change to NavigationOverlay (zero full-page re-renders)
            const nextSec = getSectionFromProgress(p);
            if (nextSec !== activeSectionRef.current) {
              activeSectionRef.current = nextSec;
              window.dispatchEvent(
                new CustomEvent("visynth:active-section", { detail: nextSec })
              );
            }
          },
        });

        scrollTriggerRef.current = st;

        // Placeholder duration span so timeline explicitly runs from 0 to 100
        tl.to({}, { duration: 100 }, 0);

        // =======================================================================
        // PHASE A — HOME (t: 0 -> 19, Frames 1 -> 57)
        // =======================================================================
        tl.fromTo(
          heroBlackCurtainRef.current,
        { opacity: 1 },
        { opacity: 0.14, duration: 7, ease: "power1.inOut" },
        0.2
      );

      if (canvas && !prefersReducedMotion) {
        tl.fromTo(
          canvas,
          { scale: 1.02 },
          { scale: 1.0, duration: 7, ease: "sine.out" },
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
          { y: 0, scale: 1, opacity: 1 },
          {
            y: -22,
            scale: 1.02,
            opacity: 0,
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
        .fromTo(
          homeEl,
          { opacity: 1, pointerEvents: "auto" },
          { opacity: 0, pointerEvents: "none", duration: 2, ease: "power1.in" },
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
        { opacity: 0, pointerEvents: "none" },
        { opacity: 1, pointerEvents: "auto", duration: 2 },
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
          { yPercent: 115, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
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
          { opacity: 0, pointerEvents: "none", duration: 1.5 },
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
          { opacity: 0, pointerEvents: "none" },
          { opacity: 1, pointerEvents: "auto", duration: 2 },
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
          { yPercent: 115, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
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
          { opacity: 0, pointerEvents: "none", duration: 1.5 },
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
        { opacity: 0, pointerEvents: "none" },
        { opacity: 1, pointerEvents: "auto", duration: 2 },
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
          { yPercent: 115, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
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
          { opacity: 0, pointerEvents: "none", duration: 1.5 },
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
        { opacity: 0.85, duration: 5, ease: "power2.out" },
        87.5
      )
        .fromTo(
          contactEl,
          { opacity: 0, pointerEvents: "none" },
          { opacity: 1, pointerEvents: "auto", duration: 2 },
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
          { yPercent: 115, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
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

        if (scrollTriggerRef.current) {
          tl.progress(scrollTriggerRef.current.progress);
        }
        handleHashNavigation(true);
      });
    };

    const onHashChange = () => handleHashNavigation(false);
    window.addEventListener("hashchange", onHashChange);

    const prepareForReveal = () => {
      applyCanvasSize(true);
      const frame0Promise =
        frameStates[0] === FRAME_LOADED && imagesRef.current[0]
          ? Promise.resolve()
          : loadSingleFrame(0, true);

      frame0Promise.then(() => {
        if (!isCancelled) {
          scheduleFrameDraw(targetFrameRef.current, true);
        }
      });

      startTimelineSetup();
      ScrollTrigger.refresh();
      window.requestAnimationFrame(() => {
        notifyRevealReady();
      });
    };

    prepareForReveal();

    const onPreloaderStart = () => {
      lenisRef.current?.stop();
    };

    const onPreloaderComplete = () => {
      lenisRef.current?.start();
      wakeLoadersRef.current?.();
      scheduleFrameDraw(targetFrameRef.current, true);
      ScrollTrigger.refresh();
    };

    window.addEventListener("visynth:preloader-start", onPreloaderStart);
    window.addEventListener("visynth:preloader-complete", onPreloaderComplete);

    if (hasSessionPreloadCompleted()) {
      lenisRef.current?.start();
      wakeLoadersRef.current?.();
      scheduleFrameDraw(targetFrameRef.current, true);
      ScrollTrigger.refresh();
    }

    return () => {
      isCancelled = true;
      wakeLoadersRef.current = null;
      if (scrollIdleTimer !== null) {
        clearTimeout(scrollIdleTimer);
      }
      if (resizeRafId !== null) {
        window.cancelAnimationFrame(resizeRafId);
      }
      if (drawRafIdRef.current !== null) {
        window.cancelAnimationFrame(drawRafIdRef.current);
        drawRafIdRef.current = null;
      }
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("visynth:preloader-start", onPreloaderStart);
      window.removeEventListener(
        "visynth:preloader-complete",
        onPreloaderComplete
      );
      gsap.ticker.remove(tickerCallback);
      lenisRef.current?.destroy();
      lenisRef.current = null;
      if (scrollTriggerRef.current) scrollTriggerRef.current.kill();
      gsapCtx?.revert();
    };
  }, [renderFrameNow, scheduleFrameDraw, scrollToSection]);

  return (
    <div className="relative w-full bg-[#000000] text-white">
      <NavigationOverlay
        onNavigate={scrollToSection}
        progressFillRef={progressFillRef}
        progressContainerRef={progressContainerRef}
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
            width={DEFAULT_FRAME_WIDTH}
            height={DEFAULT_FRAME_HEIGHT}
            aria-hidden="true"
            className="absolute inset-0 z-0 w-full h-full pointer-events-none select-none will-change-[transform]"
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
            className="absolute inset-0 z-10 opacity-0 pointer-events-none bg-[linear-gradient(90deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.78)_44%,rgba(0,0,0,0.22)_74%,rgba(0,0,0,0.08)_100%)] will-change-[opacity]"
          />

          {/* Layer 2c: Crimson-Dark Atmospheric Settling Overlay for Final Contact Scene */}
          <div
            ref={crimsonAtmosphereRef}
            aria-hidden="true"
            className="absolute inset-0 z-10 opacity-0 pointer-events-none bg-[radial-gradient(circle_at_75%_55%,rgba(180,15,15,0.16),rgba(0,0,0,0.78)_70%)] will-change-[opacity]"
          />

          {/* Layer 2d: Pure #000000 Curtain Preserving Exact Initial Hero Appearance at Scroll = 0 */}
          <div
            ref={heroBlackCurtainRef}
            aria-hidden="true"
            className="absolute inset-0 z-10 bg-[#000000] pointer-events-none will-change-[opacity]"
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
