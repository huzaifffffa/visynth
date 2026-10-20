"use client";

import React from "react";
import Image from "next/image";
import { CtaArrowIcon } from "./AnimatedHeading";

interface HeroSectionProps {
  sectionRef: React.RefObject<HTMLElement | null>;
  onExploreWork: () => void;
}

export function HeroSection({ sectionRef, onExploreWork }: HeroSectionProps) {
  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onExploreWork();
  };

  return (
    <section
      ref={sectionRef}
      id="home"
      aria-label="Home"
      className="absolute inset-0 z-20 flex flex-col justify-between w-full h-full pt-[clamp(64px,5.6vw,90px)] select-none"
    >
      <div className="flex-1 flex items-center w-full pl-[5.95%] pr-[5.95%] py-12">
        <div
          data-hero="container"
          className="w-[clamp(320px,40.23vw,620px)] flex flex-col items-start will-change-transform"
        >
          {/* Eyebrow + Horizontal Gradient Line (Preserved) */}
          <div className="w-full flex items-center gap-[clamp(12px,1.25vw,20px)] mb-[clamp(16px,1.85vw,28px)] overflow-hidden">
            <span
              data-hero="eyebrow-text"
              className="text-[clamp(8.5px,0.72vw,11.5px)] font-normal tracking-[0.31em] text-[#adadad] uppercase whitespace-nowrap will-change-transform"
            >
              CREATIVE TECHNOLOGY STUDIO
            </span>
            <span
              data-hero="eyebrow-line"
              aria-hidden="true"
              className="h-[1px] flex-1 max-w-[clamp(130px,18vw,260px)] origin-left bg-gradient-to-r from-white/35 via-white/15 to-transparent will-change-transform"
            />
          </div>

          {/* Main Display Title: VISYNTH (Preserved) */}
          <h1 className="sr-only">VISYNTH — where vision becomes growth</h1>
          <div
            data-hero="wordmark"
            aria-hidden="true"
            className="relative w-full aspect-[666/92] select-none pointer-events-none will-change-transform"
          >
            <Image
              src="/visynth-wordmark.png"
              alt="VISYNTH"
              width={730}
              height={156}
              priority
              className="absolute -left-[4.805%] -top-[34.78%] w-[109.61%] max-w-none h-auto"
            />
          </div>

          {/* Subtitle: where vision becomes growth (Preserved) */}
          <div className="w-full overflow-hidden mt-[clamp(10px,1.25vw,19px)] pb-1 -mb-1">
            <p
              data-hero="tagline"
              className="w-full text-[clamp(19.5px,2.51vw,38.5px)] font-extralight tracking-[0.022em] leading-[1.1] text-[#e4e4e4] whitespace-nowrap will-change-transform"
            >
              where vision becomes{" "}
              <span className="text-[#e61e1e] font-light drop-shadow-[0_0_16px_rgba(255,25,25,0.45)]">
                growth
              </span>
            </p>
          </div>

          {/* Description Paragraph — Line-by-line readable reveal (Preserved) */}
          <p className="mt-[clamp(18px,2.3vw,35px)] text-[clamp(10.5px,0.96vw,15px)] font-light leading-[1.68] tracking-[0.015em] text-[#b0b0b0]">
            <span className="block overflow-hidden">
              <span data-hero="desc-line" className="block will-change-transform">
                We build distinctive brands, digital experiences, and intelligent
              </span>
            </span>
            <span className="block overflow-hidden">
              <span data-hero="desc-line" className="block will-change-transform">
                technology—from branding and 3D animation to web, app,
              </span>
            </span>
            <span className="block overflow-hidden">
              <span data-hero="desc-line" className="block will-change-transform">
                marketing, and cybersecurity solutions.
              </span>
            </span>
          </p>

          {/* Call To Action: EXPLORE OUR WORK -> (Preserved) */}
          <div className="mt-[clamp(24px,2.85vw,44px)] overflow-hidden py-1 -my-1">
            <a
              data-hero="cta"
              href="#work"
              onClick={handleCtaClick}
              className="inline-flex items-center gap-[clamp(12px,1.3vw,20px)] group cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500/60"
            >
              <span className="text-[clamp(8.5px,0.72vw,11.5px)] font-semibold tracking-[0.24em] text-[#f0f0f0] uppercase transition-colors duration-300 group-hover:text-white">
                EXPLORE OUR WORK
              </span>
              <CtaArrowIcon />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom spacer preserving exact vertical center alignment matching reference */}
      <div className="h-[clamp(24px,2.5vw,44px)] shrink-0" aria-hidden="true" />
    </section>
  );
}

