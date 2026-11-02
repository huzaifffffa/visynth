"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  hasSessionPreloadCompleted,
  markSessionPreloadCompleted,
  preloadSiteAssets,
  waitForRevealReady,
} from "@/lib/preloadSiteAssets";

const PRELOADER_TOTAL_MS = 5000;
const PRELOADER_FADE_MS = 400;

export function SitePreloader() {
  const [isUnmounted, setIsUnmounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // If the session has already preloaded this visit, skip immediately
    if (hasSessionPreloadCompleted()) {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
      queueMicrotask(() => setIsUnmounted(true));
      window.dispatchEvent(new CustomEvent("visynth:preloader-exit-start"));
      window.dispatchEvent(new CustomEvent("visynth:preloader-complete"));
      return;
    }

    const root = rootRef.current;
    if (!root) return;

    let isDisposed = false;
    let exitStarted = false;

    // Lock background scroll during preloader
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

    // Keep the first-visit preloader visible for about five seconds in total.
    // Reduced motion has no fade, so it uses the full duration as its hold.
    const minimumHoldMs = prefersReducedMotion
      ? PRELOADER_TOTAL_MS
      : PRELOADER_TOTAL_MS - PRELOADER_FADE_MS;
    let minimumHoldTimer: number | null = null;
    const minimumHoldPromise = new Promise<void>((resolve) => {
      minimumHoldTimer = window.setTimeout(resolve, minimumHoldMs);
    });

    // Begin preloading main assets (critical fonts, first frame, canvas/GSAP initialization)
    const assetController = preloadSiteAssets({
      pathname: window.location.pathname,
      prefersReducedMotion,
      safetyTimeoutMs: 3000,
    });

    window.dispatchEvent(new CustomEvent("visynth:preloader-start"));

    const triggerExit = async () => {
      if (isDisposed || exitStarted) return;
      exitStarted = true;

      setIsExiting(true);
      root.setAttribute("data-exiting", "true");
      window.dispatchEvent(new CustomEvent("visynth:preloader-exit-start"));

      await waitForRevealReady(100);
      if (isDisposed) return;

      if (prefersReducedMotion) {
        markSessionPreloadCompleted();
        unlock();
        setIsUnmounted(true);
        window.dispatchEvent(new CustomEvent("visynth:preloader-complete"));
        return;
      }

      // Smoothly fade out the entire preloader overlay.
      setTimeout(() => {
        if (isDisposed) return;
        markSessionPreloadCompleted();
        unlock();
        setIsUnmounted(true);
        window.dispatchEvent(new CustomEvent("visynth:preloader-complete"));
      }, PRELOADER_FADE_MS);
    };

    // Exit once both the critical assets and minimum display time are ready.
    Promise.all([assetController.promise, minimumHoldPromise]).then(() => {
      if (!isDisposed) {
        void triggerExit();
      }
    });

    // Escape key manual bypass
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        void triggerExit();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      isDisposed = true;
      window.removeEventListener("keydown", onKeyDown);
      if (minimumHoldTimer !== null) {
        window.clearTimeout(minimumHoldTimer);
      }
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
      aria-label="Loading VISYNTH"
      data-testid="site-preloader"
      className={`fixed inset-0 z-[9999] h-[100dvh] min-h-screen w-screen flex items-center justify-center bg-[#000000] select-none ${
        isExiting
          ? "opacity-0 pointer-events-none"
          : "opacity-100 pointer-events-auto"
      }`}
      style={{
        transitionProperty: "opacity",
        transitionDuration: `${PRELOADER_FADE_MS}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div className="relative flex items-center justify-center">
        <Image
          src="/icon.png"
          alt="VISYNTH"
          width={64}
          height={64}
          priority
          sizes="64px"
          className="w-14 h-14 sm:w-16 sm:h-16 object-contain preloader-pulse"
        />
      </div>
    </div>
  );
}
