"use client";

import React from "react";
import { AnimatedHeading, SectionEyebrow } from "./AnimatedHeading";

interface SkillsSectionProps {
  sectionRef: React.RefObject<HTMLElement | null>;
}

const SKILLS_DISCIPLINES = [
  {
    index: "01",
    title: "Branding and visual identity",
    detail: "Identity systems, campaign visuals and practical brand guidelines.",
  },
  {
    index: "02",
    title: "3D animation and motion",
    detail: "Product visuals, environments and motion designed for screens.",
  },
  {
    index: "03",
    title: "AI Content Creation",
    detail: "Generative video, AI-driven visual storytelling and high-impact brand content.",
  },
  {
    index: "04",
    title: "Websites and digital products",
    detail: "Fast, accessible experiences that are straightforward to maintain.",
  },
  {
    index: "05",
    title: "Campaigns and digital content",
    detail: "Campaign direction and content built around a clear goal.",
  },
  {
    index: "06",
    title: "Digital security",
    detail: "Practical safeguards for websites and digital products.",
  },
];

export const SkillsSection = React.memo(function SkillsSection({
  sectionRef,
}: SkillsSectionProps) {
  return (
    <section
      ref={sectionRef}
      id="skills"
      aria-label="Skills & Capabilities"
      className="absolute inset-0 z-20 flex items-center w-full h-full pt-[clamp(64px,5.6vw,90px)] pl-[5.95%] pr-[5.95%] opacity-0 pointer-events-none select-none will-change-[opacity,transform]"
    >
      <div
        data-skills="container"
        className="w-full max-w-[clamp(340px,44vw,660px)] flex flex-col items-start"
      >
        <SectionEyebrow label="01 / WHAT WE DO" />

        <AnimatedHeading
          lines={[
            <>
              Design that{" "}
              <span className="text-[#ff2a2a] font-light">
                holds together.
              </span>
            </>,
            "Technology that works.",
          ]}
          className="text-[clamp(24px,3.1vw,48px)] uppercase tracking-[0.06em] leading-[1.02] font-medium"
        />

        <p
          data-anim="body-copy"
          className="mt-[clamp(10px,1.3vw,20px)] max-w-[54ch] text-[clamp(11px,0.92vw,14.5px)] font-light leading-[1.62] tracking-[0.015em] text-[#b5b5b5]"
        >
          Branding, AI content creation, motion and technology are planned
          together, so the finished work feels consistent instead of pieced
          together by separate teams.
        </p>

        {/* Typographic Discipline Index (Editorial Swiss layout positioned on left half) */}
        <div className="mt-[clamp(14px,1.8vw,26px)] w-full border-t border-white/[0.12]">
          {SKILLS_DISCIPLINES.map((item) => (
            <div
              key={item.index}
              data-anim="skill-row"
              className="group relative flex flex-col gap-0.5 py-[clamp(7px,0.85vw,12px)] border-b border-white/[0.11] transition-colors duration-300 hover:border-white/35"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <span className="text-[clamp(8.5px,0.68vw,10.5px)] font-mono tracking-[0.2em] text-[#ff2a2a] font-medium">
                    {item.index}
                  </span>
                  <span className="text-[clamp(12px,0.95vw,14.5px)] font-medium tracking-[0.14em] text-white uppercase transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:text-white">
                    {item.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-white/20 transition-colors duration-300 group-hover:text-[#ff2a2a]">
                  ↗
                </span>
              </div>
              <p className="text-[clamp(10px,0.8vw,12.5px)] font-light tracking-[0.015em] text-[#9ba1ae] pl-[26px] leading-relaxed transition-colors duration-300 group-hover:text-white/80">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});
