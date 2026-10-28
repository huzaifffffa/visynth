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

const TEAM = [
  { name: "Huzaifa Manzoor", role: "Chief Head" },
  { name: "Muhammad Anas", role: "Creative Head" },
  { name: "Shayan Khan", role: "Marketing Head" },
  { name: "Fuzail Aijaz", role: "Sales Head" },
] as const;

const STUDIO_CHAPTERS = [
  { number: "04", title: "Give the idea an identity.", discipline: "Branding / Art direction", copy: "A name. A mark. A visual language that belongs to you." },
  { number: "05", title: "Give the story movement.", discipline: "3D / Motion", copy: "From the first frame to the final detail, every movement has a purpose." },
  { number: "06", title: "Build what comes next.", discipline: "Web / Applications", copy: "Design becomes an experience. Thoughtful on the surface. Considered underneath." },
  { number: "07", title: "Make the work travel.", discipline: "Marketing / Growth", copy: "Bring the right message to the right people, then give them a reason to stay." },
  { number: "08", title: "Protect what you build.", discipline: "Cybersecurity / Systems", copy: "Creative ambition needs a resilient foundation." },
] as const;

export function SitePreloader() {
  const [isUnmounted, setIsUnmounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const storyStageRef = useRef<HTMLDivElement | null>(null);
  const actOneRef = useRef<HTMLDivElement | null>(null);
  const teamRef = useRef<HTMLDivElement | null>(null);
  const finalRef = useRef<HTMLDivElement | null>(null);
  const chaptersRef = useRef<HTMLDivElement | null>(null);
  const progressLineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (hasSessionPreloadCompleted()) {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
      queueMicrotask(() => setIsUnmounted(true));
      window.dispatchEvent(new CustomEvent("visynth:preloader-exit-start"));
      window.dispatchEvent(new CustomEvent("visynth:preloader-complete"));
      return;
    }

    const root = rootRef.current;
    const storyStage = storyStageRef.current;
    const actOne = actOneRef.current;
    const team = teamRef.current;
    const final = finalRef.current;
    if (!root || !storyStage || !actOne || !team || !final) return;

    let isDisposed = false;
    let exitStarted = false;
    let storyResolved = false;
    let resolveStory: () => void = () => {};
    const storyPromise = new Promise<void>((resolve) => {
      resolveStory = () => {
        if (storyResolved) return;
        storyResolved = true;
        resolve();
      };
    });

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

    const assetController = preloadSiteAssets({
      pathname: window.location.pathname,
      prefersReducedMotion,
      safetyTimeoutMs: 45000,
    });

    window.dispatchEvent(new CustomEvent("visynth:preloader-start"));

    let masterTimeline: gsap.core.Timeline | null = null;
    let exitTimeline: gsap.core.Timeline | null = null;
    let waitingTimeline: gsap.core.Timeline | null = null;
    let assetsReady = false;
    assetController.promise.then(() => { assetsReady = true; });

    const continueStory = () => {
      resolveStory();
      if (isDisposed || exitStarted || assetsReady || prefersReducedMotion) return;
      const chapters = chaptersRef.current?.querySelectorAll<HTMLElement>("[data-waiting-chapter]");
      if (!chapters?.length) return;
      waitingTimeline = gsap.timeline({ repeat: -1 });
      waitingTimeline.to(final, { autoAlpha: 0, duration: 0.45 });
      for (const chapter of chapters) {
        waitingTimeline
          .fromTo(chapter, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.65, ease: "power2.out" })
          .to(chapter, { autoAlpha: 1, duration: 3.5 })
          .to(chapter, { autoAlpha: 0, y: -10, duration: 0.45, ease: "power2.in" });
      }
    };

    const finishExit = () => {
      if (isDisposed) return;
      // Returning null does not unmount this component or run effect cleanup.
      // Release the intro's keyboard lock at dismissal, not just on navigation.
      window.removeEventListener("keydown", onKeyDown, { capture: true });
      window.clearTimeout(storyFallbackTimer);
      masterTimeline?.kill();
      waitingTimeline?.kill();
      markSessionPreloadCompleted();
      try { window.sessionStorage.setItem("visynth_intro_seen", "true"); } catch {}
      unlock();
      setIsUnmounted(true);
      window.dispatchEvent(new CustomEvent("visynth:preloader-complete"));
    };

    const triggerExit = async () => {
      if (isDisposed || exitStarted) return;
      exitStarted = true;
      waitingTimeline?.kill();
      setIsExiting(true);
      root.setAttribute("data-exiting", "true");
      window.dispatchEvent(new CustomEvent("visynth:preloader-exit-start"));

      await waitForRevealReady(100);
      if (isDisposed) return;

      if (prefersReducedMotion) {
        finishExit();
        return;
      }

      exitTimeline = gsap.timeline({ onComplete: finishExit });
      exitTimeline
        .to(progressLineRef.current, {
          scaleX: 1,
          duration: 0.36,
          ease: "power3.inOut",
        })
        .to(
          storyStage,
          {
            opacity: 0,
            y: -10,
            duration: 0.32,
            ease: "power2.in",
          },
          "-=0.18"
        )
        .to(
          root,
          {
            clipPath: "inset(50% 0% 50% 0%)",
            duration: 0.78,
            ease: "power4.inOut",
          },
          "-=0.05"
        );
    };

    const storyFallbackTimer = window.setTimeout(resolveStory, 8000);

    if (prefersReducedMotion) {
      gsap.set(actOne, { display: "none" });
      gsap.set(team, { display: "none" });
      gsap.set(final, { autoAlpha: 1, display: "flex" });
      window.setTimeout(resolveStory, 900);
    } else {
      const creditRows = team.querySelectorAll("[data-credit-row]");
      const actOneLines = actOne.querySelectorAll("[data-story-line]");
      const finalElements = final.querySelectorAll("[data-final-element]");

      gsap.set(team, { autoAlpha: 0 });
      gsap.set(final, { autoAlpha: 0 });
      gsap.set(actOneLines, { yPercent: 115, opacity: 0 });
      gsap.set(creditRows, { y: 18, opacity: 0 });
      gsap.set(finalElements, { y: 16, opacity: 0 });

      masterTimeline = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: continueStory,
      });
      try {
        masterTimeline.timeScale(window.sessionStorage.getItem("visynth_intro_seen") === "true" ? 3 : 1);
      } catch {
        masterTimeline.timeScale(1);
      }

      masterTimeline
        .fromTo(
          "[data-preloader-chrome]",
          { opacity: 0 },
          { opacity: 1, duration: 0.55, stagger: 0.06 },
          0
        )
        .to(
          actOneLines,
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.72,
            stagger: 0.12,
            ease: "expo.out",
          },
          0.35
        )
        .to(actOne, { autoAlpha: 0, y: -12, duration: 0.5 }, 1.85)
        .to(team, { autoAlpha: 1, duration: 0.35 }, 2.15)
        .to(
          creditRows,
          {
            y: 0,
            opacity: 1,
            duration: 0.58,
            stagger: 0.22,
            ease: "expo.out",
          },
          2.28
        )
        .to(team, { autoAlpha: 0, y: -10, duration: 0.48 }, 4.78)
        .to(final, { autoAlpha: 1, duration: 0.34 }, 5.02)
        .to(
          finalElements,
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            stagger: 0.12,
            ease: "expo.out",
          },
          5.12
        )
        .to({}, { duration: 1.05 });
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        [
          " ",
          "ArrowDown",
          "ArrowUp",
          "PageDown",
          "PageUp",
          "Home",
          "End",
        ].includes(event.key)
      ) {
        event.preventDefault();
      }
      if (event.key === "Escape" && masterTimeline) {
        masterTimeline.progress(1, false);
      }
    };
    window.addEventListener("keydown", onKeyDown, { capture: true });

    Promise.all([assetController.promise, storyPromise]).then(([result]) => {
      if (isDisposed) return;
      window.clearTimeout(storyFallbackTimer);
      root.setAttribute(
        "data-readiness",
        result.timedOut ? "safe-fallback" : "ready"
      );
      void triggerExit();
    });

    return () => {
      isDisposed = true;
      window.clearTimeout(storyFallbackTimer);
      window.removeEventListener("keydown", onKeyDown, { capture: true });
      masterTimeline?.kill();
      waitingTimeline?.kill();
      exitTimeline?.kill();
      assetController.cancel();
      unlock();
    };
  }, []);

  if (isUnmounted) return null;

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      aria-busy={!isExiting}
      aria-hidden={isExiting ? "true" : undefined}
      data-testid="site-preloader"
      className={`fixed inset-0 z-[9999] h-[100dvh] min-h-screen w-screen touch-none overflow-hidden bg-[#050505] text-[#f4f1eb] [clip-path:inset(0%_0%_0%_0%)] ${
        isExiting ? "pointer-events-none" : "pointer-events-auto"
      }`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:8vw_8vw]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(199,20,32,0.10),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.015),transparent_32%)]"
      />

      <header
        data-preloader-chrome
        className="absolute inset-x-[clamp(22px,4.2vw,72px)] top-[clamp(22px,4vw,58px)] z-20 flex items-start justify-between border-t border-white/20 pt-3 text-[9px] font-medium uppercase tracking-[0.28em] text-white/55 sm:text-[10px]"
      >
        <span>Visynth / Opening Titles</span>
        <span className="text-right">
          Production 001
          <br />
          Karachi — PK
        </span>
      </header>

      <main
        ref={storyStageRef}
        className="relative z-10 flex h-full w-full items-center px-[clamp(22px,8vw,132px)] py-[clamp(100px,14vh,160px)]"
      >
        <section
          ref={actOneRef}
          aria-label="Opening statement"
          className="absolute left-[clamp(22px,8vw,132px)] right-[clamp(22px,8vw,132px)] top-1/2 -translate-y-1/2"
        >
          <p
            data-story-line
            className="mb-5 overflow-hidden text-[9px] font-medium uppercase tracking-[0.42em] text-[#e51c2a] sm:text-[10px]"
          >
            Act I — The Signal
          </p>
          <div className="overflow-hidden">
            <p
              data-story-line
              className="max-w-[11ch] text-[clamp(42px,8.4vw,132px)] font-extralight uppercase leading-[0.84] tracking-[-0.065em]"
            >
              Every idea
            </p>
          </div>
          <div className="overflow-hidden pl-[clamp(20px,10vw,170px)]">
            <p
              data-story-line
              className="text-[clamp(42px,8.4vw,132px)] font-semibold uppercase leading-[0.84] tracking-[-0.065em]"
            >
              starts as a signal.
            </p>
          </div>
        </section>

        <section
          ref={teamRef}
          aria-label="VISYNTH team"
          className="absolute left-[clamp(22px,8vw,132px)] right-[clamp(22px,8vw,132px)] top-1/2 -translate-y-1/2"
        >
          <div className="mb-[clamp(24px,5vh,54px)] flex items-end justify-between gap-6">
            <div>
              <p className="mb-3 text-[9px] font-medium uppercase tracking-[0.42em] text-[#e51c2a] sm:text-[10px]">
                Act II — The Collective
              </p>
              <h2 className="text-[clamp(34px,5.5vw,78px)] font-light uppercase leading-none tracking-[-0.055em]">
                Four disciplines.
                <br />
                One direction.
              </h2>
            </div>
            <span className="hidden pb-1 text-[9px] uppercase tracking-[0.3em] text-white/35 md:block">
              Studio Credits / 2026
            </span>
          </div>

          <div className="border-t border-white/25">
            {TEAM.map((member, index) => (
              <div
                key={member.name}
                data-credit-row
                className="grid grid-cols-[32px_1fr] gap-3 border-b border-white/12 py-[clamp(10px,1.45vh,17px)] sm:grid-cols-[48px_1.35fr_1fr] sm:items-center"
              >
                <span className="text-[9px] font-medium tracking-[0.24em] text-[#e51c2a]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-[clamp(15px,1.6vw,24px)] font-medium uppercase tracking-[-0.015em]">
                  {member.name}
                </span>
                <span className="col-start-2 text-[9px] uppercase tracking-[0.25em] text-white/45 sm:col-start-auto sm:text-right sm:text-[10px]">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section
          ref={finalRef}
          aria-label="VISYNTH identity"
          className="invisible absolute inset-x-[clamp(22px,8vw,132px)] top-1/2 flex -translate-y-1/2 flex-col items-center text-center"
        >
          <p
            data-final-element
            className="mb-[clamp(22px,4vh,42px)] text-[9px] font-medium uppercase tracking-[0.42em] text-[#e51c2a] sm:text-[10px]"
          >
            Act III — The Form
          </p>
          <div
            data-final-element
            className="relative h-[clamp(42px,8vw,102px)] w-[min(78vw,880px)]"
          >
            <Image
              src="/visynth-wordmark.png"
              alt="VISYNTH"
              fill
              priority
              sizes="(max-width: 768px) 78vw, 880px"
              className="object-contain"
            />
          </div>
          <p
            data-final-element
            className="mt-[clamp(22px,4vh,40px)] text-[10px] font-light uppercase tracking-[0.38em] text-white/55 sm:text-[12px]"
          >
            Where vision becomes growth
          </p>
        </section>
        <div ref={chaptersRef} className="pointer-events-none absolute inset-x-[clamp(22px,8vw,132px)] top-1/2 -translate-y-1/2" aria-hidden="true">
          {STUDIO_CHAPTERS.map((chapter) => (
            <section key={chapter.number} data-waiting-chapter className="invisible absolute inset-x-0 top-1/2 -translate-y-1/2 opacity-0">
              <p className="mb-6 text-[10px] font-medium uppercase tracking-[0.28em] text-[#e51c2a]">{chapter.number} / {chapter.discipline}</p>
              <h2 className="max-w-[14ch] text-[clamp(36px,6.8vw,94px)] font-light uppercase leading-[0.98] tracking-[-0.055em]">{chapter.title}</h2>
              <div className="mt-7 h-px w-16 bg-[#e51c2a]" />
              <p className="mt-6 max-w-[42ch] text-[clamp(13px,1.2vw,17px)] font-light leading-relaxed text-white/70">{chapter.copy}</p>
            </section>
          ))}
        </div>
      </main>

      <footer
        data-preloader-chrome
        className="absolute inset-x-[clamp(22px,4.2vw,72px)] bottom-[clamp(20px,3.8vw,54px)] z-20"
      >
        <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-white/65">Preparing the experience</p>
        <div className="relative h-px w-full overflow-hidden bg-white/15">
          <div
            ref={progressLineRef}
            className="absolute inset-y-0 left-0 w-full origin-left bg-[#e51c2a] transition-transform duration-300 ease-out"
            style={{ transform: "scaleX(0.2)" }}
          />
        </div>
      </footer>
    </div>
  );
}
