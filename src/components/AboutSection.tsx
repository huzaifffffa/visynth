"use client";

import React from "react";
import { AnimatedHeading, SectionEyebrow } from "./AnimatedHeading";

interface AboutSectionProps {
  sectionRef: React.RefObject<HTMLElement | null>;
}

const STUDIO_PILLARS = [
  {
    index: "01",
    label: "Direction and visual design",
    description:
      "We define the idea, the visual language and the system before adding polish.",
  },
  {
    index: "02",
    label: "3D, motion and websites",
    description:
      "We turn the direction into imagery, animation and a working digital experience.",
  },
  {
    index: "03",
    label: "Delivery and support",
    description:
      "We test the details, prepare the final files and help the work launch cleanly.",
  },
];

export const AboutSection = React.memo(function AboutSection({
  sectionRef,
}: AboutSectionProps) {
  return (
    <section
      ref={sectionRef}
      id="about"
      aria-label="About VISYNTH"
      className="absolute inset-0 z-20 flex items-center w-full h-full pt-[clamp(64px,5.6vw,90px)] pl-[5.95%] pr-[5.95%] opacity-0 pointer-events-none select-none will-change-[opacity,transform]"
    >
      <div
        data-about="container"
        className="w-full max-w-[clamp(330px,44vw,660px)] flex flex-col items-start"
      >
        <SectionEyebrow label="03 / ABOUT" />

        <AnimatedHeading
          lines={[
            "A small studio.",
            "One joined-up process.",
          ]}
          className="text-[clamp(24px,3.1vw,48px)] font-medium uppercase tracking-[0.05em] leading-[1.02]"
        />

        <div className="mt-[clamp(14px,1.8vw,26px)] space-y-3 max-w-[54ch] text-[clamp(11px,0.92vw,14.5px)] font-light leading-[1.7] tracking-[0.015em] text-[#c2c2c2]">
          <p data-anim="about-copy">
            VISYNTH brings designers and developers into the same process. The
            idea, the visuals and the final build are considered together from
            the start.
          </p>
          <p data-anim="about-copy">
            You work with one team from the first conversation through delivery.
            We keep the process clear, show the work as it develops and make
            decisions with the finished product in mind.
          </p>
        </div>

        {/* Studio Pillars */}
        <div className="mt-[clamp(18px,2.2vw,32px)] w-full flex flex-col gap-3 sm:gap-4 border-t border-white/[0.08] pt-4">
          {STUDIO_PILLARS.map((pillar) => (
            <div
              key={pillar.label}
              data-anim="about-pillar"
              className="flex flex-col gap-1 group"
            >
              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-[10px] text-[#ff2a2a] tracking-wider">
                  {pillar.index}
                </span>
                <span className="text-[clamp(9.5px,0.76vw,12px)] font-semibold tracking-[0.18em] text-white uppercase transition-colors group-hover:text-white">
                  {pillar.label}
                </span>
              </div>
              <span className="text-[clamp(10px,0.8vw,12.5px)] font-light leading-[1.6] text-[#9ba1ae] pl-[18px]">
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
          <span className="text-[#ff3b3b] font-semibold">PROCESS</span>
          <span>DISCOVER</span>
          <span className="text-white/20">→</span>
          <span>DEFINE</span>
          <span className="text-white/20">→</span>
          <span>BUILD</span>
          <span className="text-white/20">→</span>
          <span>DELIVERY</span>
        </div>
      </div>
    </section>
  );
});
