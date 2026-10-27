"use client";

import React from "react";
import { AnimatedHeading, SectionEyebrow } from "./AnimatedHeading";

interface AboutSectionProps {
  sectionRef: React.RefObject<HTMLElement | null>;
}

const STUDIO_PILLARS = [
  {
    label: "CREATIVE DIRECTION",
    description:
      "Distinctive brand identity, visual systems, and cinematic 3D storytelling.",
  },
  {
    label: "INTELLIGENT SYSTEMS",
    description:
      "Modern web, application engineering, and responsive digital architecture.",
  },
  {
    label: "RESILIENT FOUNDATION",
    description:
      "Growth strategy and cybersecurity built into the core of every product.",
  },
];

export const AboutSection = React.memo(function AboutSection({
  sectionRef,
}: AboutSectionProps) {
  return (
    <section
      ref={sectionRef}
      id="about"
      aria-label="About"
      className="absolute inset-0 z-20 flex items-center w-full h-full pt-[clamp(64px,5.6vw,90px)] pl-[5.95%] pr-[5.95%] opacity-0 pointer-events-none select-none will-change-[opacity,transform]"
    >
      <div
        data-about="container"
        className="w-full max-w-[clamp(330px,44vw,660px)] flex flex-col items-start"
      >
        <SectionEyebrow label="03 / ABOUT VISYNTH" />

        <AnimatedHeading
          lines={[
            "WHERE CREATIVE",
            "VISION MEETS",
            <>
              INTELLIGENT{" "}
              <span className="text-[#e61e1e] font-light drop-shadow-[0_0_16px_rgba(255,25,25,0.45)]">
                SYSTEMS.
              </span>
            </>,
          ]}
          className="text-[clamp(24px,3.05vw,46px)] uppercase tracking-[0.06em]"
        />

        <div className="mt-[clamp(16px,2vw,30px)] space-y-3 max-w-[52ch] text-[clamp(10.5px,0.94vw,14.5px)] font-light leading-[1.7] tracking-[0.015em] text-[#c2c2c2]">
          <p data-anim="about-copy">
            VISYNTH is a creative technology studio operating at the convergence
            of design, motion, engineering, and digital security.
          </p>
          <p data-anim="about-copy">
            Instead of treating branding, 3D animation, web and app development,
            marketing, and cybersecurity as separate silos, we bring them
            together into a single coherent vision—so every experience we build
            is both unmistakable on the surface and resilient underneath.
          </p>
        </div>

        {/* Studio Pillars along a clean horizontal divider */}
        <div className="mt-[clamp(22px,2.6vw,40px)] w-full pt-[clamp(16px,1.8vw,26px)] border-t border-white/[0.14] grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
          {STUDIO_PILLARS.map((pillar) => (
            <div
              key={pillar.label}
              data-anim="about-pillar"
              className="flex flex-col gap-1.5"
            >
              <span className="text-[clamp(8.5px,0.68vw,10.5px)] font-semibold tracking-[0.22em] text-white uppercase">
                {pillar.label}
              </span>
              <span className="text-[clamp(9.5px,0.76vw,11.5px)] font-light leading-[1.55] text-[#b8b8b8]">
                {pillar.description}
              </span>
            </div>
          ))}
        </div>

        {/* Studio Process Line */}
        <div
          data-anim="about-copy"
          className="mt-[clamp(16px,2vw,28px)] pt-3 border-t border-white/[0.08] flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-mono tracking-[0.2em] uppercase text-white/50 flex-wrap"
        >
          <span className="text-[#ff3b3b] font-semibold">PROCESS:</span>
          <span>DISCOVERY</span>
          <span className="text-white/20">→</span>
          <span>DIRECTION</span>
          <span className="text-white/20">→</span>
          <span>BUILD</span>
          <span className="text-white/20">→</span>
          <span>DELIVERY</span>
        </div>
      </div>
    </section>
  );
});
