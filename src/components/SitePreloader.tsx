"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import {
  hasSessionPreloadCompleted,
  markSessionPreloadCompleted,
  preloadSiteAssets,
} from "@/lib/preloadSiteAssets";

interface TypewriterSegment {
  text: string;
  className?: string;
  id?: string;
}

/**
 * Reusable DOM-driven typewriter helper that types character-by-character
 * without triggering React state re-renders.
 * Uses natural human cadence (~36ms per character, slight pause on punctuation).
 */
function createTypewriterController() {
  const activeTimers = new Set<ReturnType<typeof setTimeout>>();
  let isCancelled = false;

  const clearAll = () => {
    for (const timer of activeTimers) {
      clearTimeout(timer);
    }
    activeTimers.clear();
  };

  const cancel = () => {
    isCancelled = true;
    clearAll();
  };

  const wait = (ms: number): Promise<void> =>
    new Promise((resolve) => {
      if (isCancelled) {
        resolve();
        return;
      }
      const timer = setTimeout(() => {
        activeTimers.delete(timer);
        resolve();
      }, ms);
      activeTimers.add(timer);
    });

  const typeIntoElement = async (
    targetEl: HTMLElement | null,
    text: string,
    charIntervalMs = 36
  ): Promise<void> => {
    if (!targetEl || isCancelled) return;
    targetEl.textContent = "";

    for (let i = 0; i < text.length; i++) {
      if (isCancelled) return;
      const ch = text[i];
      targetEl.textContent += ch;

      let delay = charIntervalMs;
      if (ch === "," || ch === "—") {
        delay = charIntervalMs + 75;
      } else if (ch === ".") {
        delay = charIntervalMs + 95;
      }
      await wait(delay);
    }
  };

  const typeSegments = async (
    containerEl: HTMLElement | null,
    segments: TypewriterSegment[],
    charIntervalMs = 36,
    onSegmentComplete?: (segId: string, spanEl: HTMLSpanElement) => void
  ): Promise<void> => {
    if (!containerEl || isCancelled) return;
    containerEl.innerHTML = "";

    const spans: { seg: TypewriterSegment; el: HTMLSpanElement }[] =
      segments.map((seg) => {
        const span = document.createElement("span");
        if (seg.className) {
          span.className = seg.className;
        }
        containerEl.appendChild(span);
        return { seg, el: span };
      });

    for (const { seg, el } of spans) {
      if (isCancelled) return;
      for (let i = 0; i < seg.text.length; i++) {
        if (isCancelled) return;
        const ch = seg.text[i];
        el.textContent = (el.textContent || "") + ch;

        let delay = charIntervalMs;
        if (ch === "," || ch === "—") {
          delay = charIntervalMs + 65;
        } else if (ch === ".") {
          delay = charIntervalMs + 85;
        }
        await wait(delay);
      }
      if (seg.id && onSegmentComplete && !isCancelled) {
        onSegmentComplete(seg.id, el);
      }
    }
  };

  return {
    wait,
    typeIntoElement,
    typeSegments,
    clearAll,
    cancel,
    isCancelled: () => isCancelled,
  };
}

export function SitePreloader() {
  const [isUnmounted, setIsUnmounted] = useState<boolean>(() =>
    hasSessionPreloadCompleted()
  );
  const [isExiting, setIsExiting] = useState<boolean>(false);

  // Refs for zero-rerender GSAP & DOM manipulation
  const rootRef = useRef<HTMLDivElement | null>(null);
  const bgLayerRef = useRef<HTMLDivElement | null>(null);
  const heroPreviewRef = useRef<HTMLDivElement | null>(null);
  const scanLineRef = useRef<HTMLDivElement | null>(null);
  const stageWrapperRef = useRef<HTMLDivElement | null>(null);

  const logoBlockRef = useRef<HTMLDivElement | null>(null);
  const chapterLineRef = useRef<HTMLDivElement | null>(null);

  const narrativeBlockRef = useRef<HTMLDivElement | null>(null);
  const typedTextRef = useRef<HTMLSpanElement | null>(null);
  const cursorRef = useRef<HTMLSpanElement | null>(null);

  const teamCardRef = useRef<HTMLDivElement | null>(null);
  const teamSideBarRef = useRef<HTMLDivElement | null>(null);
  const teamTopLineRef = useRef<HTMLDivElement | null>(null);
  const teamNameRef = useRef<HTMLDivElement | null>(null);
  const teamRoleRef = useRef<HTMLDivElement | null>(null);

  const closingBlockRef = useRef<HTMLDivElement | null>(null);
  const closingPrimaryRef = useRef<HTMLDivElement | null>(null);
  const closingSublineRef = useRef<HTMLDivElement | null>(null);
  const exitSweepLineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (hasSessionPreloadCompleted()) {
      return;
    }

    const root = rootRef.current;
    if (!root) return;
    root.setAttribute("data-hydrated", "true");

    let isDisposed = false;
    const typewriter = createTypewriterController();
    let cursorBlinkTween: gsap.core.Tween | null = null;
    let scanLineTween: gsap.core.Tween | null = null;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // 1. Lock Page Scrolling & Prevent Keyboard Focus Underneath Preloader
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const mainContentEl = document.getElementById("visynth-app-content");
    if (mainContentEl) {
      mainContentEl.setAttribute("inert", "");
      mainContentEl.setAttribute("aria-hidden", "true");
    }

    window.dispatchEvent(new CustomEvent("visynth:preloader-start"));

    // Prevent wheel, touchmove, and scroll keys while preloader is active
    const preventScrollEvent = (e: Event) => {
      if (e.cancelable) {
        e.preventDefault();
      }
    };
    const preventScrollKeys = (e: KeyboardEvent) => {
      const scrollKeys = [
        "ArrowUp",
        "ArrowDown",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        " ",
      ];
      if (scrollKeys.includes(e.key)) {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", preventScrollEvent, { passive: false });
    window.addEventListener("touchmove", preventScrollEvent, {
      passive: false,
    });
    window.addEventListener("keydown", preventScrollKeys, { passive: false });

    const unlockInteractionAndScroll = () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      window.removeEventListener("wheel", preventScrollEvent);
      window.removeEventListener("touchmove", preventScrollEvent);
      window.removeEventListener("keydown", preventScrollKeys);

      if (mainContentEl) {
        mainContentEl.removeAttribute("inert");
        mainContentEl.removeAttribute("aria-hidden");
      }
    };

    // 2. Start Controlled Asset & Sequence Frame Preloading (with 15s hard safety timeout)
    let assetsReady = false;
    let storyCompleted = false;
    let exitStarted = false;

    const currentPathname =
      typeof window !== "undefined" ? window.location.pathname : "/";

    const assetController = preloadSiteAssets({
      pathname: currentPathname,
      prefersReducedMotion,
      safetyTimeoutMs: 15000,
      onFirstFrameLoaded: (img) => {
        if (isDisposed || !heroPreviewRef.current) return;
        heroPreviewRef.current.style.backgroundImage = `url(${img.src})`;
        gsap.to(heroPreviewRef.current, {
          opacity: 0.16,
          duration: 1.1,
          ease: "power2.out",
        });
      },
    });

    // 3. Coordinated Exit Transition once BOTH Story and Assets are Ready
    const triggerExitIfReady = () => {
      if (isDisposed || exitStarted || !storyCompleted || !assetsReady) {
        return;
      }
      exitStarted = true;

      if (cursorBlinkTween) {
        cursorBlinkTween.kill();
      }
      if (cursorRef.current) {
        gsap.to(cursorRef.current, { opacity: 0, duration: 0.2 });
      }

      const exitTl = gsap.timeline({
        onComplete: () => {
          if (isDisposed) return;
          markSessionPreloadCompleted();
          unlockInteractionAndScroll();
          setIsExiting(true);
          window.dispatchEvent(new CustomEvent("visynth:preloader-complete"));
          setIsUnmounted(true);
        },
      });

      if (prefersReducedMotion) {
        exitTl.to(root, {
          opacity: 0,
          duration: 0.4,
          ease: "power1.out",
        });
        return;
      }

      // Hold the final VISYNTH line for ~500ms, sweep crimson line, scale background 1 -> 1.03, and fade out over ~950ms
      exitTl
        .to({}, { duration: 0.5 })
        .fromTo(
          exitSweepLineRef.current,
          { scaleX: 0, opacity: 0.95 },
          {
            scaleX: 1,
            opacity: 1,
            duration: 0.48,
            ease: "power3.inOut",
          }
        )
        .to(
          bgLayerRef.current,
          {
            scale: 1.03,
            duration: 0.95,
            ease: "power2.inOut",
          },
          "-=0.18"
        )
        .to(
          root,
          {
            opacity: 0,
            duration: 0.9,
            ease: "power2.inOut",
          },
          "<"
        );
    };

    assetController.promise.then(() => {
      if (isDisposed) return;
      assetsReady = true;
      triggerExitIfReady();
    });

    // 4. Blinking Cursor & Subtle Moving Light Line
    if (!prefersReducedMotion && cursorRef.current) {
      cursorBlinkTween = gsap.to(cursorRef.current, {
        opacity: 0,
        duration: 0.26,
        repeat: -1,
        yoyo: true,
        ease: "steps(1)",
        repeatDelay: 0.24,
      });
    }

    if (!prefersReducedMotion && scanLineRef.current) {
      scanLineTween = gsap.fromTo(
        scanLineRef.current,
        { yPercent: -10, opacity: 0.04 },
        {
          yPercent: 110,
          opacity: 0.12,
          duration: 5.5,
          repeat: -1,
          ease: "none",
        }
      );
    }

    // 5. Execute Story Sequence
    const runStorySequence = async () => {
      const logoBlock = logoBlockRef.current;
      const chapterLine = chapterLineRef.current;
      const narrativeBlock = narrativeBlockRef.current;
      const typedText = typedTextRef.current;
      const cursor = cursorRef.current;
      const teamCard = teamCardRef.current;
      const teamSideBar = teamSideBarRef.current;
      const teamTopLine = teamTopLineRef.current;
      const teamName = teamNameRef.current;
      const teamRole = teamRoleRef.current;
      const closingBlock = closingBlockRef.current;
      const closingPrimary = closingPrimaryRef.current;
      const closingSubline = closingSublineRef.current;

      if (
        !logoBlock ||
        !chapterLine ||
        !narrativeBlock ||
        !typedText ||
        !teamCard ||
        !teamName ||
        !teamRole ||
        !closingBlock ||
        !closingPrimary ||
        !closingSubline
      ) {
        storyCompleted = true;
        triggerExitIfReady();
        return;
      }

      // Reduced-Motion Fast Static Story Path (no character-by-character typing)
      if (prefersReducedMotion) {
        if (cursor) cursor.style.opacity = "0";
        gsap.set(logoBlock, { opacity: 1, y: 0 });
        gsap.set(chapterLine, { width: 90, opacity: 1 });

        typedText.textContent =
          "We turn imagination into identity, motion, experience, and technology.";
        gsap.set(narrativeBlock, { opacity: 1 });
        await typewriter.wait(450);
        if (isDisposed) return;

        const reducedMembers = [
          {
            line: "A direction gives the vision its purpose.",
            name: "HUZAIFA MANZOOR",
            role: "CHIEF HEAD",
          },
          {
            line: "A creative mind gives the idea its form.",
            name: "MUHAMMAD ANAS",
            role: "CREATIVE HEAD",
          },
          {
            line: "A strong message finds the people who need it.",
            name: "SHAYAN KHAN",
            role: "MARKETING HEAD",
          },
          {
            line: "A connection turns interest into opportunity.",
            name: "FUZAIL AIJAZ",
            role: "SALES HEAD",
          },
        ];

        gsap.set(teamCard, { display: "flex", opacity: 1, x: 0, y: 0, scale: 1 });
        gsap.set(teamSideBar, { display: "block", scaleY: 1, opacity: 1 });
        gsap.set(teamRole, { opacity: 1, y: 0 });

        for (const m of reducedMembers) {
          typedText.textContent = m.line;
          teamName.textContent = m.name;
          teamRole.textContent = m.role;
          await typewriter.wait(320);
          if (isDisposed) return;
        }

        gsap.set([narrativeBlock, teamCard, chapterLine], {
          opacity: 0,
          display: "none",
        });
        gsap.set(closingBlock, { display: "flex", opacity: 1 });
        closingPrimary.innerHTML = `Different minds. <span class="text-[#FF2A2A]">ONE VISION.</span>`;
        gsap.set(closingSubline, { opacity: 1, y: 0 });
        await typewriter.wait(450);
        if (isDisposed) return;

        storyCompleted = true;
        triggerExitIfReady();
        return;
      }

      // =====================================================================
      // SCENE 1 — Opening (~1.2s)
      // "Every vision begins as a signal."
      // =====================================================================
      gsap.fromTo(
        logoBlock,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" }
      );
      await typewriter.wait(160);
      if (isDisposed) return;

      await typewriter.typeIntoElement(
        typedText,
        "Every vision begins as a signal.",
        26
      );
      await typewriter.wait(280);
      if (isDisposed) return;

      // =====================================================================
      // SCENE 2 — Company introduction (~1.4s)
      // "VISYNTH was created for ideas that refuse to stay ordinary."
      // =====================================================================
      await gsap.to(narrativeBlock, {
        opacity: 0,
        y: -4,
        duration: 0.16,
        ease: "power1.in",
      });
      if (isDisposed) return;

      typedText.textContent = "";
      gsap.set(narrativeBlock, { opacity: 1, y: 0 });
      gsap.fromTo(
        chapterLine,
        { width: 0, opacity: 0.9 },
        { width: 90, opacity: 1, duration: 0.65, ease: "power2.out" }
      );

      await typewriter.typeIntoElement(
        typedText,
        "VISYNTH was created for ideas that refuse to stay ordinary.",
        20
      );
      await typewriter.wait(240);
      if (isDisposed) return;

      // =====================================================================
      // SCENE 3 — Company philosophy (~1.5s)
      // "We turn imagination into identity, motion, experience, and technology."
      // Highlight identity, motion, experience, technology in crimson one at a time
      // =====================================================================
      await gsap.to(narrativeBlock, {
        opacity: 0,
        duration: 0.15,
        ease: "power1.in",
      });
      if (isDisposed) return;

      typedText.innerHTML = "";
      gsap.set(narrativeBlock, { opacity: 1 });

      await typewriter.typeSegments(
        typedText,
        [
          { text: "We turn imagination into " },
          {
            id: "identity",
            text: "identity",
            className: "transition-colors duration-200",
          },
          { text: ", " },
          {
            id: "motion",
            text: "motion",
            className: "transition-colors duration-200",
          },
          { text: ", " },
          {
            id: "experience",
            text: "experience",
            className: "transition-colors duration-200",
          },
          { text: ", and " },
          {
            id: "technology",
            text: "technology",
            className: "transition-colors duration-200",
          },
          { text: "." },
        ],
        17,
        (_id, spanEl) => {
          spanEl.style.color = "#FF2A2A";
          spanEl.style.textShadow = "0 0 14px rgba(255,42,42,0.35)";
        }
      );
      await typewriter.wait(260);
      if (isDisposed) return;

      // =====================================================================
      // SCENE 4 — Team introduction (~1.2s)
      // "Behind every frame is a different perspective."
      // -> "Together, those perspectives become one vision."
      // =====================================================================
      await gsap.to(narrativeBlock, {
        opacity: 0,
        duration: 0.15,
        ease: "power1.in",
      });
      if (isDisposed) return;

      typedText.textContent = "";
      gsap.set(narrativeBlock, { opacity: 1 });
      await typewriter.typeIntoElement(
        typedText,
        "Behind every frame is a different perspective.",
        16
      );
      await typewriter.wait(180);
      if (isDisposed) return;

      await gsap.to(narrativeBlock, {
        opacity: 0,
        duration: 0.14,
        ease: "power1.inOut",
      });
      if (isDisposed) return;

      typedText.textContent = "";
      gsap.set(narrativeBlock, { opacity: 1 });
      await typewriter.typeIntoElement(
        typedText,
        "Together, those perspectives become one vision.",
        16
      );
      await typewriter.wait(200);
      if (isDisposed) return;

      // =====================================================================
      // SCENE 5 — Team member: Huzaifa (~1.3s)
      // Intro: "A direction gives the vision its purpose."
      // Card: HUZAIFA MANZOOR — CHIEF HEAD
      // Motion: Horizontal slide ~20px, thin crimson line beside name, role delayed
      // =====================================================================
      await gsap.to(narrativeBlock, { opacity: 0, duration: 0.14 });
      if (isDisposed) return;

      typedText.textContent = "";
      gsap.set(narrativeBlock, { opacity: 1 });
      gsap.set(teamCard, {
        display: "flex",
        opacity: 1,
        x: -20,
        y: 0,
        scale: 1,
      });
      gsap.set(teamSideBar, {
        display: "block",
        scaleY: 0,
        opacity: 1,
      });
      gsap.set(teamTopLine, { display: "none", width: 0 });
      teamName.textContent = "";
      teamRole.textContent = "CHIEF HEAD";
      gsap.set(teamRole, { opacity: 0, y: 6 });

      gsap.to(teamCard, { x: 0, duration: 0.45, ease: "power2.out" });
      gsap.to(teamSideBar, {
        scaleY: 1,
        duration: 0.4,
        ease: "power2.out",
      });

      await typewriter.typeIntoElement(
        typedText,
        "A direction gives the vision its purpose.",
        16
      );
      await typewriter.typeIntoElement(teamName, "HUZAIFA MANZOOR", 22);
      gsap.to(teamRole, {
        opacity: 1,
        y: 0,
        duration: 0.25,
        ease: "power2.out",
      });
      await typewriter.wait(280);
      if (isDisposed) return;

      // =====================================================================
      // SCENE 6 — Team member: Muhammad (~1.3s)
      // Intro: "A creative mind gives the idea its form."
      // Card: MUHAMMAD ANAS — CREATIVE HEAD
      // Motion: Soft fade and upward movement
      // =====================================================================
      await gsap.to([narrativeBlock, teamCard], {
        opacity: 0,
        duration: 0.14,
      });
      if (isDisposed) return;

      typedText.textContent = "";
      teamName.textContent = "";
      teamRole.textContent = "CREATIVE HEAD";
      gsap.set(narrativeBlock, { opacity: 1 });
      gsap.set(teamCard, { opacity: 0, x: 0, y: 16, scale: 1 });
      gsap.set(teamRole, { opacity: 0, y: 6 });

      gsap.to(teamCard, {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: "power2.out",
      });

      await typewriter.typeIntoElement(
        typedText,
        "A creative mind gives the idea its form.",
        16
      );
      await typewriter.typeIntoElement(teamName, "MUHAMMAD ANAS", 22);
      gsap.to(teamRole, {
        opacity: 1,
        y: 0,
        duration: 0.25,
        ease: "power2.out",
      });
      await typewriter.wait(280);
      if (isDisposed) return;

      // =====================================================================
      // SCENE 7 — Team member: Shayan (~1.3s)
      // Intro: "A strong message finds the people who need it."
      // Card: SHAYAN KHAN — MARKETING HEAD
      // Motion: Left-to-right line animation and typewriter reveal
      // =====================================================================
      await gsap.to([narrativeBlock, teamCard], {
        opacity: 0,
        duration: 0.14,
      });
      if (isDisposed) return;

      typedText.textContent = "";
      teamName.textContent = "";
      teamRole.textContent = "MARKETING HEAD";
      gsap.set(narrativeBlock, { opacity: 1 });
      gsap.set(teamCard, { opacity: 1, x: 0, y: 0, scale: 1 });
      gsap.set(teamTopLine, { display: "block", width: 0, opacity: 1 });
      gsap.set(teamRole, { opacity: 0, y: 6 });

      gsap.to(teamTopLine, {
        width: 72,
        duration: 0.45,
        ease: "power2.out",
      });

      await typewriter.typeIntoElement(
        typedText,
        "A strong message finds the people who need it.",
        15
      );
      await typewriter.typeIntoElement(teamName, "SHAYAN KHAN", 22);
      gsap.to(teamRole, {
        opacity: 1,
        y: 0,
        duration: 0.25,
        ease: "power2.out",
      });
      await typewriter.wait(280);
      if (isDisposed) return;

      // =====================================================================
      // SCENE 8 — Team member: Fuzail (~1.3s)
      // Intro: "A connection turns interest into opportunity."
      // Card: FUZAIL AIJAZ — SALES HEAD
      // Motion: Soft scale from 0.98 to 1 and fade in role below
      // =====================================================================
      await gsap.to([narrativeBlock, teamCard], {
        opacity: 0,
        duration: 0.14,
      });
      if (isDisposed) return;

      typedText.textContent = "";
      teamName.textContent = "";
      teamRole.textContent = "SALES HEAD";
      gsap.set(teamTopLine, { display: "none" });
      gsap.set(narrativeBlock, { opacity: 1 });
      gsap.set(teamCard, { opacity: 0, x: 0, y: 0, scale: 0.98 });
      gsap.set(teamRole, { opacity: 0, y: 6 });

      gsap.to(teamCard, {
        opacity: 1,
        scale: 1,
        duration: 0.45,
        ease: "power2.out",
      });

      await typewriter.typeIntoElement(
        typedText,
        "A connection turns interest into opportunity.",
        16
      );
      await typewriter.typeIntoElement(teamName, "FUZAIL AIJAZ", 22);
      gsap.to(teamRole, {
        opacity: 1,
        y: 0,
        duration: 0.25,
        ease: "power2.out",
      });
      await typewriter.wait(280);
      if (isDisposed) return;

      // =====================================================================
      // SCENE 9 — Closing statement (~1.5s)
      // Fade out team info, center closing statement:
      // "Different minds. One vision." (ONE VISION crimson)
      // Reveal "VISYNTH — WHERE VISION BECOMES GROWTH." underneath
      // Stop cursor blinking after final line
      // =====================================================================
      await gsap.to([narrativeBlock, teamCard, chapterLine], {
        opacity: 0,
        duration: 0.22,
        ease: "power2.inOut",
      });
      if (isDisposed) return;

      gsap.set([narrativeBlock, teamCard], { display: "none" });
      gsap.set(closingBlock, { display: "flex", opacity: 1 });
      gsap.set(closingSubline, { opacity: 0, y: 10 });

      await typewriter.typeSegments(
        closingPrimary,
        [
          { text: "Different minds. ", className: "text-[#F5F5F5]" },
          {
            id: "one-vision",
            text: "ONE VISION.",
            className:
              "text-[#FF2A2A] font-medium drop-shadow-[0_0_16px_rgba(255,42,42,0.35)]",
          },
        ],
        28
      );

      // Stop cursor blinking after the final line is typed
      if (cursorBlinkTween) {
        cursorBlinkTween.kill();
      }
      if (cursor) {
        cursor.style.opacity = "0";
      }

      await gsap.to(closingSubline, {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: "power2.out",
      });
      await typewriter.wait(250);
      if (isDisposed) return;

      storyCompleted = true;
      triggerExitIfReady();
    };

    runStorySequence();

    return () => {
      isDisposed = true;
      typewriter.cancel();
      assetController.cancel();
      if (cursorBlinkTween) cursorBlinkTween.kill();
      if (scanLineTween) scanLineTween.kill();
      unlockInteractionAndScroll();
    };
  }, []);

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
      className={`fixed inset-0 z-[9999] w-screen h-[100dvh] min-h-screen overflow-hidden bg-[#050505] text-[#F5F5F5] select-none flex items-center justify-center px-[24px] md:px-[8vw] ${
        isExiting ? "pointer-events-none" : "pointer-events-auto"
      }`}
    >
      {/* Concise Screen Reader Accessible Announcement (Never announces per-character typing) */}
      <span className="sr-only">VISYNTH experience is opening.</span>

      {/* Background Layer (Scales 1 -> 1.03 on exit) */}
      <div
        ref={bgLayerRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none will-change-transform"
      >
        {/* Low-opacity blurred preview of Frame 1 once decoded */}
        <div
          ref={heroPreviewRef}
          className="absolute inset-0 w-full h-full bg-cover bg-center opacity-0 blur-[18px] scale-105 transition-opacity"
        />

        {/* Deep Dark Vignette + Subtle Lower-Right / Center-Right Crimson Atmospheric Glow */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background:
              "radial-gradient(circle at 74% 62%, rgba(230, 30, 30, 0.14) 0%, rgba(255, 42, 42, 0.05) 32%, rgba(5, 5, 5, 0.94) 68%, #050505 100%)",
          }}
        />

        {/* Faint Moving Horizontal Scan Line */}
        <div
          ref={scanLineRef}
          className="absolute inset-x-0 top-0 h-[1px] w-full bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-5"
        />

        {/* Top & Bottom Fine Architectural Framing Lines */}
        <div className="absolute top-[7vh] inset-x-[6vw] h-[1px] bg-white/[0.06]" />
        <div className="absolute bottom-[7vh] inset-x-[6vw] h-[1px] bg-white/[0.06]" />
      </div>

      {/* Main Story Stage Container (Desktop: max-w-[720px], Mobile: w-[calc(100vw-48px)]) */}
      <div
        ref={stageWrapperRef}
        aria-hidden="true"
        className="relative z-10 w-[calc(100vw-48px)] md:w-full max-w-[720px] flex flex-col items-start justify-center"
      >
        {/* Brand Header Block: Logo + Studio Label */}
        <div
          ref={logoBlockRef}
          className="flex flex-col items-start gap-2.5 mb-7 opacity-0 will-change-transform"
        >
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E61E1E] shadow-[0_0_10px_rgba(255,42,42,0.75)]" />
            <span className="text-[10px] font-mono tracking-[0.32em] uppercase text-[rgba(245,245,245,0.62)]">
              CREATIVE TECHNOLOGY STUDIO
            </span>
          </div>

          <Image
            src="/visynth-logo.png"
            alt="VISYNTH"
            width={936}
            height={130}
            priority
            className="w-[168px] md:w-[212px] h-auto object-contain drop-shadow-[0_0_18px_rgba(255,42,42,0.28)]"
          />
        </div>

        {/* Thin Crimson Chapter Line (Grows 0px -> 90px in Scene 2) */}
        <div
          ref={chapterLineRef}
          className="h-[1px] w-0 bg-gradient-to-r from-[#FF2A2A] via-[#E61E1E] to-transparent shadow-[0_0_12px_rgba(255,42,42,0.35)] mb-6"
        />

        {/* Narrative Typewriter Block (Mobile: calc(100vw - 48px) 18-24px, Desktop: max-w-[620px]) */}
        <div
          ref={narrativeBlockRef}
          className="w-[calc(100vw-48px)] md:w-full md:max-w-[620px] min-h-[68px] md:min-h-[76px] flex items-start"
        >
          <p className="text-[clamp(18px,4.5vw,24px)] md:text-[clamp(20px,2vw,24px)] font-light leading-[1.48] tracking-[0.02em] text-[#F5F5F5]">
            <span ref={typedTextRef} data-testid="preloader-typed-text" />
            <span
              ref={cursorRef}
              className="inline-block w-[2px] h-[1.08em] bg-[#FF2A2A] align-middle ml-1.5 shadow-[0_0_8px_rgba(255,42,42,0.6)]"
            />
          </p>
        </div>

        {/* Team Member Feature Card (Scenes 5–8) */}
        <div
          ref={teamCardRef}
          style={{ display: "none" }}
          className="mt-6 flex items-stretch gap-4 will-change-transform"
        >
          {/* Vertical Crimson Accent Line Beside Name */}
          <div
            ref={teamSideBarRef}
            className="w-[2px] bg-[#E61E1E] origin-top shadow-[0_0_12px_rgba(255,42,42,0.45)]"
          />

          <div className="flex flex-col justify-center py-0.5">
            {/* Optional Left-to-Right Top Line (Scene 7) */}
            <div
              ref={teamTopLineRef}
              style={{ display: "none" }}
              className="h-[1px] w-0 bg-[#FF2A2A] mb-2 shadow-[0_0_8px_rgba(255,42,42,0.4)]"
            />

            <div
              ref={teamNameRef}
              data-testid="preloader-team-name"
              className="text-[clamp(22px,4.8vw,30px)] font-semibold tracking-[0.18em] uppercase text-[#F5F5F5] leading-tight min-h-[1.25em]"
            />
            <div
              ref={teamRoleRef}
              data-testid="preloader-team-role"
              className="mt-1.5 text-[11px] sm:text-xs font-mono tracking-[0.28em] uppercase text-[#FF2A2A] drop-shadow-[0_0_10px_rgba(255,42,42,0.35)]"
            />
          </div>
        </div>

        {/* Scene 9 — Centered Closing Statement */}
        <div
          ref={closingBlockRef}
          style={{ display: "none" }}
          className="w-[calc(100vw-48px)] md:w-full md:max-w-[620px] flex-col items-center text-center self-center py-4"
        >
          <div
            ref={closingPrimaryRef}
            data-testid="preloader-closing-primary"
            className="text-[clamp(26px,5.2vw,38px)] font-light tracking-[0.08em] uppercase text-[#F5F5F5] leading-snug"
          />

          <div
            ref={closingSublineRef}
            data-testid="preloader-closing-subline"
            className="mt-4 text-[clamp(12px,2.6vw,15px)] font-mono tracking-[0.28em] uppercase text-[rgba(245,245,245,0.62)]"
          >
            VISYNTH — WHERE VISION BECOMES GROWTH.
          </div>
        </div>
      </div>

      {/* Full-Screen Horizontal Crimson Exit Divider Line */}
      <div
        ref={exitSweepLineRef}
        aria-hidden="true"
        className="absolute left-0 right-0 bottom-1/2 h-[1px] w-full origin-left scale-x-0 opacity-0 bg-gradient-to-r from-transparent via-[#FF2A2A] to-transparent shadow-[0_0_16px_rgba(255,42,42,0.65)] pointer-events-none"
      />
    </div>
  );
}
