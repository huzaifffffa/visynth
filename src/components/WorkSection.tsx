"use client";

import React from "react";
import {
  AnimatedHeading,
  CtaArrowIcon,
  SectionEyebrow,
} from "./AnimatedHeading";

interface WorkSectionProps {
  sectionRef: React.RefObject<HTMLElement | null>;
  onNavigateContact: () => void;
}

const WORK_DOMAINS = [
  {
    code: "I",
    domain: "BRAND ARCHITECTURE",
    focus: "Identity Systems · Visual Language · Art Direction",
  },
  {
    code: "II",
    domain: "3D & MOTION PRODUCTION",
    focus: "Cinematic Sequences · Spatial Design · Real-Time Worlds",
  },
  {
    code: "III",
    domain: "WEB & APP PLATFORMS",
    focus: "Interactive Experiences · Scalable Engineering · Native Apps",
  },
  {
    code: "IV",
    domain: "CYBERSECURITY & GROWTH",
    focus: "Resilient Infrastructure · Digital Strategy · Security Systems",
  },
];

export function WorkSection({
  sectionRef,
  onNavigateContact,
}: WorkSectionProps) {
  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onNavigateContact();
  };

  return (
    <section
      ref={sectionRef}
      id="work"
      aria-label="Work"
      className="absolute inset-0 z-20 flex items-center w-full h-full pt-[clamp(64px,5.6vw,90px)] pl-[5.95%] pr-[5.95%] opacity-0 pointer-events-none select-none invisible"
    >
      <div
        data-work="container"
        className="w-full max-w-[clamp(330px,42vw,630px)] flex flex-col items-start will-change-transform"
      >
        <SectionEyebrow label="SELECTED WORK & PRACTICE" />

        <AnimatedHeading
          lines={[
            "RELENTLESS CRAFT.",
            <>
              BUILT FOR{" "}
              <span className="text-[#e61e1e] font-light drop-shadow-[0_0_16px_rgba(255,25,25,0.4)]">
                MOMENTUM.
              </span>
            </>,
          ]}
          className="text-[clamp(24px,3.1vw,48px)] uppercase tracking-[0.06em]"
        />

        <p
          data-anim="body-copy"
          className="mt-[clamp(14px,1.6vw,24px)] max-w-[48ch] text-[clamp(10.5px,0.94vw,14.5px)] font-light leading-[1.68] tracking-[0.015em] text-[#cfcfcf] will-change-transform"
        >
          Turning ambitious vision into enduring digital form requires both
          human artistry and disciplined engineering—pushing complex ideas
          forward until every detail is resolved.
        </p>

        {/* Practice Domains */}
        <div className="mt-[clamp(18px,2.2vw,32px)] w-full border-t border-white/[0.15]">
          {WORK_DOMAINS.map((item) => (
            <div
              key={item.code}
              data-anim="work-row"
              className="group flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4 py-[clamp(9px,1vw,14px)] border-b border-white/[0.14] will-change-transform"
            >
              <div className="flex items-baseline gap-3">
                <span className="w-5 text-[clamp(8.5px,0.68vw,10.5px)] font-mono tracking-[0.18em] text-[#ff3333]">
                  {item.code}
                </span>
                <span className="text-[clamp(10.5px,0.88vw,13.5px)] font-medium tracking-[0.18em] text-white uppercase">
                  {item.domain}
                </span>
              </div>
              <span className="text-[clamp(9px,0.75vw,11.5px)] font-light tracking-[0.03em] text-white/75 sm:text-right">
                {item.focus}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-[clamp(20px,2.4vw,36px)] overflow-hidden py-1 -my-1">
          <a
            data-anim="work-cta"
            href="#contact"
            onClick={handleCtaClick}
            className="inline-flex items-center gap-[clamp(12px,1.3vw,20px)] group cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500/60 rounded-sm"
          >
            <span className="text-[clamp(8.5px,0.72vw,11.5px)] font-semibold tracking-[0.24em] text-white uppercase">
              START A CONVERSATION
            </span>
            <CtaArrowIcon />
          </a>
        </div>
      </div>
    </section>
  );
}

