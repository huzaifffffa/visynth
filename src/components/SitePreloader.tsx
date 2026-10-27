"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import {
  hasSessionPreloadCompleted,
  markSessionPreloadCompleted,
  preloadSiteAssets,
  waitForRevealReady,
} from "@/lib/preloadSiteAssets";

const SESSION_STORAGE_KEY = "visynth_seen_v4";

/**
 * VISYNTH Cinematic Preloader: "FROM IDEA TO FORM"
 *
 * Storyboard:
 * - Frame 01: "01 / THE IDEA" — An architectural inception line and clean typographic proposition.
 * - Frame 02: "02 / TAKING SHAPE" — Geometric framing and directional typographic transformation.
 * - Frame 03: "03 / THE IDENTITY" — Confident resolution into the VISYNTH wordmark climax.
 * - Frame 04: "THE REVEAL" — Restrained editorial curtain reveal seamlessly unveiling the hero.
 */
export function SitePreloader() {
  const [isUnmounted, setIsUnmounted] = useState<boolean>(false);

  const [isExiting, setIsExiting] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const curtainRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Frame elements
  const frame01Ref = useRef<HTMLDivElement | null>(null);
  const frame01LineRef = useRef<HTMLDivElement | null>(null);

  const frame02Ref = useRef<HTMLDivElement | null>(null);
  const frame02LineRef = useRef<HTMLDivElement | null>(null);

  const frame03Ref = useRef<HTMLDivElement | null>(null);
  const logoImgRef = useRef<HTMLDivElement | null>(null);
  const logoSublineRef = useRef<HTMLDivElement | null>(null);

  const exitDividerRef = useRef<HTMLDivElement | null>(null);
  const skipHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const isRepeatVisit =
      typeof window !== "undefined" &&
      (window.sessionStorage.getItem(SESSION_STORAGE_KEY) === "true" ||
        document.documentElement.classList.contains("visynth-preloaded") ||
        hasSessionPreloadCompleted());

    // If already visited this session, unlock instantly
    if (isUnmounted || isRepeatVisit) {
      markSessionPreloadCompleted();
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
      setIsUnmounted(true);
      window.dispatchEvent(new CustomEvent("visynth:preloader-exit-start"));
      window.dispatchEvent(new CustomEvent("visynth:preloader-complete"));
      return;
    }

    let isDisposed = false;
    const root = rootRef.current;
    if (!root) return;

    // Lock page scrolling while preloader is active
    const originalOverflow = document.body.style.overflow;
    const originalOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    const unlock = () => {
      document.body.style.overflow = originalOverflow || "";
      document.body.style.overscrollBehavior = originalOverscroll || "";
    };

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Preload site assets in parallel
    const assetController = preloadSiteAssets({
      pathname: window.location.pathname,
      prefersReducedMotion,
    });

    // Dispatch lifecycle start event
    window.dispatchEvent(new CustomEvent("visynth:preloader-start"));

    let masterTl: gsap.core.Timeline | null = null;

    const triggerExit = async () => {
      if (isDisposed) return;
      setIsExiting(true);
      root.setAttribute("data-exiting", "true");

      window.dispatchEvent(new CustomEvent("visynth:preloader-exit-start"));

      // Fast check for hero readiness
      await waitForRevealReady(120);

      try {
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
      } catch {}
      markSessionPreloadCompleted();

      if (prefersReducedMotion) {
        gsap.to(root, {
          opacity: 0,
          duration: 0.2,
          ease: "power1.out",
          onComplete: () => {
            unlock();
            setIsUnmounted(true);
            window.dispatchEvent(new CustomEvent("visynth:preloader-complete"));
          },
        });
        return;
      }

      // Frame 04: The Reveal — Editorial curtain lift with horizontal crimson sweep
      const exitTl = gsap.timeline({
        onComplete: () => {
          unlock();
          setIsUnmounted(true);
          window.dispatchEvent(new CustomEvent("visynth:preloader-complete"));
        },
      });

      if (exitDividerRef.current) {
        exitTl.fromTo(
          exitDividerRef.current,
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 0.2, ease: "power3.inOut" }
        );
      }

      if (curtainRef.current) {
        exitTl.to(
          curtainRef.current,
          {
            clipPath: "inset(0% 0% 100% 0%)",
            duration: 0.32,
            ease: "power4.inOut",
          },
          "-=0.1"
        );
      }

      exitTl.to(
        root,
        {
          opacity: 0,
          duration: 0.15,
          ease: "none",
        },
        "-=0.1"
      );
    };

    skipHandlerRef.current = () => {
      if (masterTl) {
        masterTl.kill();
      }
      triggerExit();
    };

    // Keyboard shortcut (Escape skips intro)
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        skipHandlerRef.current?.();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    if (prefersReducedMotion) {
      // Reduced motion: immediate resolution
      gsap.set(frame01Ref.current, { display: "none" });
      gsap.set(frame02Ref.current, { display: "none" });
      gsap.set(frame03Ref.current, { opacity: 1, display: "flex" });
      setTimeout(triggerExit, 250);
      return;
    }

    // =========================================================================
    // The "FROM IDEA TO FORM" Choreography Timeline (~0.95s total)
    // =========================================================================
    masterTl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: triggerExit,
    });

    // FRAME 01 — THE IDEA (0.0s -> 0.3s)
    masterTl
      .fromTo(
        frame01Ref.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.18 }
      )
      .fromTo(
        frame01LineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.22, ease: "power2.inOut" },
        "-=0.14"
      )
      .to(
        frame01Ref.current,
        { opacity: 0, y: -6, duration: 0.14, ease: "power2.in" },
        "+=0.08"
      )

      // FRAME 02 — THE TRANSFORMATION / TAKING SHAPE (0.3s -> 0.62s)
      .fromTo(
        frame02Ref.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.18 }
      )
      .fromTo(
        frame02LineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.22, ease: "power2.inOut" },
        "-=0.14"
      )
      .to(
        frame02Ref.current,
        { opacity: 0, y: -6, duration: 0.14, ease: "power2.in" },
        "+=0.08"
      )

      // FRAME 03 — THE IDENTITY: VISYNTH (0.62s -> 0.95s)
      .fromTo(
        frame03Ref.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.14 }
      )
      .fromTo(
        logoImgRef.current,
        { opacity: 0, scale: 0.95, y: 8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.24, ease: "back.out(1.2)" },
        "-=0.08"
      )
      .fromTo(
        logoSublineRef.current,
        { opacity: 0, y: 4 },
        { opacity: 1, y: 0, duration: 0.16 },
        "-=0.12"
      )
      // Concise climax hold
      .to({}, { duration: 0.16 });

    // Safety timeout: never hold users on loading screen longer than 3.2s
    const safetyTimer = setTimeout(() => {
      if (!isDisposed && !root.getAttribute("data-exiting")) {
        triggerExit();
      }
    }, 3200);

    return () => {
      isDisposed = true;
      clearTimeout(safetyTimer);
      window.removeEventListener("keydown", onKeyDown);
      masterTl?.kill();
      assetController.cancel();
      unlock();
    };
  }, [isUnmounted]);

  if (isUnmounted) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      aria-hidden={isExiting ? "true" : undefined}
      data-testid="site-preloader"
      className={`fixed inset-0 z-[9999] w-screen h-[100dvh] min-h-screen overflow-hidden bg-[#050505] text-[#F5F5F5] select-none ${
        isExiting ? "pointer-events-none" : "pointer-events-auto"
      }`}
    >
      {/* Screen Reader Announcement */}
      <span className="sr-only">
        VISYNTH — Creative Technology Studio. From idea to form.
      </span>

      {/* Main Masked Curtain Container for Clean Editorial Reveal */}
      <div
        ref={curtainRef}
        className="relative w-full h-full flex items-center justify-center [clip-path:inset(0%_0%_0%_0%)] will-change-[clip-path]"
      >
        {/* Subtle Architectural Corner Crosshairs & Fine Border Lines */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none overflow-hidden"
        >
          {/* Subtle Radial Crimson Atmospheric Glow */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(230, 30, 30, 0.12) 0%, rgba(5, 5, 5, 0.95) 60%, #050505 100%)",
            }}
          />
          {/* Architectural Perimeter Frame Lines */}
          <div className="absolute top-[6vh] inset-x-[6vw] h-[1px] bg-white/[0.07]" />
          <div className="absolute bottom-[6vh] inset-x-[6vw] h-[1px] bg-white/[0.07]" />
          <div className="absolute left-[6vw] inset-y-[6vh] w-[1px] bg-white/[0.07]" />
          <div className="absolute right-[6vw] inset-y-[6vh] w-[1px] bg-white/[0.07]" />

          {/* Corner Crosshairs */}
          <span className="absolute top-[5.2vh] left-[5.4vw] text-[10px] font-mono text-white/30">
            +
          </span>
          <span className="absolute top-[5.2vh] right-[5.4vw] text-[10px] font-mono text-white/30">
            +
          </span>
          <span className="absolute bottom-[5.2vh] left-[5.4vw] text-[10px] font-mono text-white/30">
            +
          </span>
          <span className="absolute bottom-[5.2vh] right-[5.4vw] text-[10px] font-mono text-white/30">
            +
          </span>
        </div>

        {/* Central Stage Container */}
        <div
          ref={stageRef}
          aria-hidden="true"
          className="relative z-10 w-[calc(100vw-48px)] max-w-[680px] min-h-[220px] flex items-center justify-center text-center"
        >
          {/* ================================================================= */}
          {/* FRAME 01 — THE IDEA                                               */}
          {/* ================================================================= */}
          <div
            ref={frame01Ref}
            className="absolute inset-0 flex flex-col items-center justify-center opacity-0 pointer-events-none"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E61E1E] shadow-[0_0_8px_rgba(255,42,42,0.8)]" />
              <span className="text-[10.5px] sm:text-xs font-mono tracking-[0.34em] uppercase text-white/50">
                01 / THE IDEA
              </span>
            </div>

            <p className="text-[clamp(20px,4.5vw,32px)] font-light tracking-[0.04em] uppercase text-[#F5F5F5] leading-tight">
              THE INCEPTION OF VISION.
            </p>

            <div
              ref={frame01LineRef}
              className="mt-6 h-[1px] w-[110px] origin-center scale-x-0 bg-gradient-to-r from-transparent via-[#FF2A2A] to-transparent shadow-[0_0_10px_rgba(255,42,42,0.4)]"
            />
          </div>

          {/* ================================================================= */}
          {/* FRAME 02 — THE TRANSFORMATION / TAKING SHAPE                     */}
          {/* ================================================================= */}
          <div
            ref={frame02Ref}
            className="absolute inset-0 flex flex-col items-center justify-center opacity-0 pointer-events-none"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E61E1E] shadow-[0_0_8px_rgba(255,42,42,0.8)]" />
              <span className="text-[10.5px] sm:text-xs font-mono tracking-[0.34em] uppercase text-white/50">
                02 / TAKING SHAPE
              </span>
            </div>

            <p className="text-[clamp(20px,4.5vw,32px)] font-light tracking-[0.04em] uppercase text-[#F5F5F5] leading-tight">
              PRECISION IN FORM AND MOTION.
            </p>

            <div
              ref={frame02LineRef}
              className="mt-6 h-[1px] w-[180px] origin-center scale-x-0 bg-gradient-to-r from-transparent via-[#FF2A2A] to-transparent shadow-[0_0_12px_rgba(255,42,42,0.5)]"
            />
          </div>

          {/* ================================================================= */}
          {/* FRAME 03 — THE IDENTITY: VISYNTH WORDMARK (CLIMAX)               */}
          {/* ================================================================= */}
          <div
            ref={frame03Ref}
            className="absolute inset-0 flex flex-col items-center justify-center opacity-0 pointer-events-none"
          >
            <div className="flex items-center gap-2 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E61E1E] shadow-[0_0_8px_rgba(255,42,42,0.8)]" />
              <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.36em] uppercase text-white/60">
                03 / CREATIVE TECHNOLOGY STUDIO
              </span>
            </div>

            <div
              ref={logoImgRef}
              className="relative select-none pointer-events-none opacity-0 drop-shadow-[0_0_24px_rgba(255,42,42,0.32)]"
            >
              <Image
                src="/visynth-logo.png"
                alt="VISYNTH"
                width={936}
                height={130}
                priority
                fetchPriority="high"
                sizes="(max-width: 768px) 180px, 240px"
                className="w-[185px] sm:w-[230px] md:w-[260px] h-auto object-contain"
              />
            </div>

            <div
              ref={logoSublineRef}
              className="mt-6 text-[10px] sm:text-xs font-mono tracking-[0.32em] uppercase text-white/60 opacity-0"
            >
              WHERE VISION BECOMES GROWTH
            </div>
          </div>
        </div>

        {/* Bottom-Right Skip Button */}
        <button
          type="button"
          onMouseEnter={() =>
            window.dispatchEvent(new CustomEvent("visynth:preload-experience"))
          }
          onFocus={() =>
            window.dispatchEvent(new CustomEvent("visynth:preload-experience"))
          }
          onClick={() => skipHandlerRef.current?.()}
          data-testid="preloader-skip-button"
          aria-label="Skip intro"
          className="absolute bottom-6 right-6 md:bottom-10 md:right-[6vw] z-20 px-3 py-1.5 bg-transparent border-0 text-[10.5px] sm:text-xs font-mono tracking-[0.28em] uppercase text-[#F5F5F5] hover:text-[#FF2A2A] hover:[text-shadow:0_0_14px_rgba(255,42,42,0.9),0_0_28px_rgba(230,30,30,0.65)] focus-visible:outline-none focus-visible:text-[#FF2A2A] focus-visible:[text-shadow:0_0_14px_rgba(255,42,42,0.9)] transition-all duration-300 cursor-pointer"
        >
          SKIP
        </button>

        {/* Full-Screen Horizontal Crimson Exit Divider Line */}
        <div
          ref={exitDividerRef}
          aria-hidden="true"
          className="absolute left-0 right-0 top-0 h-[2px] w-full origin-center scale-x-0 opacity-0 bg-gradient-to-r from-transparent via-[#FF2A2A] to-transparent shadow-[0_0_18px_rgba(255,42,42,0.8)] pointer-events-none"
        />
      </div>
    </div>
  );
}
