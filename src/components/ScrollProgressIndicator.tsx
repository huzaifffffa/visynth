"use client";

import React from "react";
import { NAV_ITEMS, SectionId } from "./SiteNavigation";

interface ScrollProgressIndicatorProps {
  activeSection: SectionId;
  progressRef: React.RefObject<HTMLDivElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onNavigate: (section: SectionId) => void;
}

export function ScrollProgressIndicator({
  activeSection,
  progressRef,
  containerRef,
  onNavigate,
}: ScrollProgressIndicatorProps) {
  return (
    <div
      ref={containerRef}
      className="fixed right-[2.2%] top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-3 opacity-0 pointer-events-none transition-opacity duration-500"
    >
      {/* Vertical track */}
      <div
        aria-hidden="true"
        className="relative w-[1px] h-36 bg-white/15 overflow-hidden"
      >
        <div
          ref={progressRef}
          className="w-full h-full bg-gradient-to-b from-white/60 via-[#ff2a2a] to-[#ff2a2a] origin-top scale-y-0"
        />
      </div>

      {/* Section dots */}
      <div
        role="group"
        aria-label="Section progress navigation"
        className="flex flex-col gap-2.5 pt-1 pointer-events-auto"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              title={item.label}
              aria-label={`Scroll to ${item.label} section`}
              aria-current={isActive ? "true" : undefined}
              className="group p-1 flex items-center justify-center rounded-full cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#ff2a2a]"
            >
              <span
                aria-hidden="true"
                className={`block rounded-full transition-all duration-300 ${
                  isActive
                    ? "w-1.5 h-1.5 bg-[#ff2a2a] shadow-[0_0_8px_2px_rgba(255,35,35,0.9)]"
                    : "w-1 h-1 bg-white/35 group-hover:bg-white/75"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

