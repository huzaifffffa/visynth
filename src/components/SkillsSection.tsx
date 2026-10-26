"use client";

import React from "react";
import { AnimatedHeading, SectionEyebrow } from "./AnimatedHeading";

interface SkillsSectionProps {
  sectionRef: React.RefObject<HTMLElement | null>;
}

const SKILLS_DISCIPLINES = [
  {
    index: "01",
    title: "BRANDING & VISUAL IDENTITY",
    detail: "Distinctive brand systems, visual architecture, and art direction.",
  },
  {
    index: "02",
    title: "3D ANIMATION & MOTION",
    detail: "Cinematic 3D worlds, real-time rendering, and spatial motion.",
  },
  {
    index: "03",
    title: "WEB & APPLICATION SYSTEMS",
    detail: "High-performance web platforms, interactive UI, and native apps.",
  },
  {
    index: "04",
    title: "DIGITAL MARKETING & GROWTH",
    detail: "Strategic positioning, conversion architecture, and amplification.",
  },
  {
    index: "05",
    title: "CYBERSECURITY SOLUTIONS",
    detail: "Resilient infrastructure defense, security architecture, and protection.",
  },
];

export function SkillsSection({ sectionRef }: SkillsSectionProps) {
  return (
    <section
      ref={sectionRef}
      id="skills"
      aria-label="Skills"
      className="absolute inset-0 z-20 flex items-center w-full h-full pt-[clamp(64px,5.6vw,90px)] pl-[5.95%] pr-[5.95%] opacity-0 pointer-events-none select-none invisible"
    >
      <div
        data-skills="container"
        className="w-full max-w-[clamp(340px,45vw,680px)] flex flex-col items-start will-change-transform"
      >
        <SectionEyebrow label="SKILLS & CAPABILITIES" />

        <AnimatedHeading
          lines={[
            <>
              INTELLIGENT <span className="text-[#e61e1e] font-light">CRAFT.</span>
            </>,
            "ENGINEERED FOR DEPTH.",
          ]}
          className="text-[clamp(24px,3.1vw,48px)] uppercase tracking-[0.06em]"
        />

        <p
          data-anim="body-copy"
          className="mt-[clamp(14px,1.6vw,24px)] max-w-[52ch] text-[clamp(10.5px,0.92vw,14.5px)] font-light leading-[1.68] tracking-[0.015em] text-[#b5b5b5] will-change-transform"
        >
          Every discipline operates as part of a unified creative and technical
          system—designed to move seamlessly from initial concept to resilient
          production.
        </p>

        {/* Typographic Discipline Index (no cards, pure editorial lines) */}
        <div className="mt-[clamp(20px,2.4vw,36px)] w-full border-t border-white/[0.12]">
          {SKILLS_DISCIPLINES.map((item) => (
            <div
              key={item.index}
              data-anim="skill-row"
              className="group relative flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-6 py-[clamp(9px,1.05vw,15px)] border-b border-white/[0.11] transition-colors duration-300 hover:border-white/30 will-change-transform"
            >
              <div className="flex items-baseline gap-3.5">
                <span className="text-[clamp(8.5px,0.68vw,10.5px)] font-mono tracking-[0.2em] text-[#e61e1e]/90">
                  {item.index}
                </span>
                <span className="text-[clamp(11px,0.92vw,14px)] font-medium tracking-[0.18em] text-white uppercase transition-transform duration-300 group-hover:translate-x-1">
                  {item.title}
                </span>
              </div>
              <span className="text-[clamp(9.5px,0.78vw,12px)] font-light tracking-[0.02em] text-[#b8b8b8] sm:text-right">
                {item.detail}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

