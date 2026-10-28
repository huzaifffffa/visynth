"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  hasSessionPreloadCompleted,
  notifyExperienceReady,
} from "@/lib/preloadSiteAssets";
import { HeroSection } from "./HeroSection";

let cachedExperienceComponent: React.ComponentType | null = null;
let experienceImportPromise: Promise<React.ComponentType> | null = null;

function preloadCinematicExperience(): Promise<React.ComponentType> {
  if (cachedExperienceComponent) {
    return Promise.resolve(cachedExperienceComponent);
  }
  if (!experienceImportPromise) {
    experienceImportPromise = import("./CinematicExperience").then((mod) => {
      cachedExperienceComponent = mod.CinematicExperience;
      return mod.CinematicExperience;
    });
  }
  return experienceImportPromise;
}

if (typeof window !== "undefined" && hasSessionPreloadCompleted()) {
  preloadCinematicExperience();
}

export function HomeEntry() {
  const [Experience, setExperience] = useState<React.ComponentType | null>(
    () => cachedExperienceComponent
  );
  const homeShellRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let isCancelled = false;
    notifyExperienceReady();

    const activateExperience = () => {
      preloadCinematicExperience().then((Comp) => {
        if (!isCancelled) {
          setExperience(() => Comp);
        }
      });
    };

    const isRepeat =
      typeof window !== "undefined" && hasSessionPreloadCompleted();

    if (isRepeat) {
      activateExperience();
      return () => {
        isCancelled = true;
      };
    }

    const onPreloadHint = () => {
      preloadCinematicExperience();
    };

    const onExitStartOrComplete = () => {
      activateExperience();
    };

    window.addEventListener("visynth:preload-experience", onPreloadHint);
    window.addEventListener(
      "visynth:preloader-exit-start",
      onExitStartOrComplete
    );
    window.addEventListener(
      "visynth:preloader-complete",
      onExitStartOrComplete
    );

    return () => {
      isCancelled = true;
      window.removeEventListener("visynth:preload-experience", onPreloadHint);
      window.removeEventListener(
        "visynth:preloader-exit-start",
        onExitStartOrComplete
      );
      window.removeEventListener(
        "visynth:preloader-complete",
        onExitStartOrComplete
      );
    };
  }, []);

  if (Experience) {
    return <Experience />;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#000000] text-white">
      <HeroSection sectionRef={homeShellRef} onExploreWork={() => {}} />
    </div>
  );
}

