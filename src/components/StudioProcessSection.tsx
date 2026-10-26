import React from "react";

const PROCESS_STEPS = [
  {
    step: "01",
    title: "DISCOVERY",
    subtitle: "Understanding Scope & Requirements",
    description:
      "We begin by unpacking your project objectives, target audience, core constraints, and architectural requirements. No guesswork—clear technical and creative foundations.",
  },
  {
    step: "02",
    title: "DIRECTION",
    subtitle: "Concept Exploration & Visual Blueprints",
    description:
      "Translating strategy into visual language. We explore 3D concepts, layout wireframes, typography systems, and interaction flow before writing code or producing final assets.",
  },
  {
    step: "03",
    title: "BUILD",
    subtitle: "Engineering, Design & Animation",
    description:
      "Disciplined execution across all media: precision 3D modeling, performant web and application code, responsive canvas shaders, and integrated cybersecurity best practices.",
  },
  {
    step: "04",
    title: "DELIVERY",
    subtitle: "Optimization, Testing & Handoff",
    description:
      "Thorough cross-device quality assurance, performance tuning, asset optimization, and coordinated release with full ownership documentation transferred to you.",
  },
];

export function StudioProcessSection() {
  return (
    <section
      aria-label="How We Work — Studio Process"
      className="w-full max-w-[1440px] mx-auto px-[5.8%] py-16 md:py-24 border-t border-white/[0.1] bg-[#050505]"
    >
      <div className="flex flex-col items-start gap-4 mb-12">
        <div className="flex items-center gap-3">
          <span className="w-5 h-[1px] bg-[#ff2a2a]" aria-hidden="true" />
          <span className="text-[10px] font-mono tracking-[0.28em] uppercase text-[#ff3b3b]">
            HOW WE WORK
          </span>
        </div>
        <h2 className="text-[clamp(22px,2.8vw,42px)] font-light tracking-[0.02em] text-white leading-tight">
          A disciplined path from{" "}
          <span className="text-[#e61e1e] font-normal drop-shadow-[0_0_16px_rgba(255,25,25,0.35)]">
            vision to reality.
          </span>
        </h2>
        <p className="text-[13px] md:text-[14.5px] font-light text-white/60 max-w-[68ch] leading-relaxed">
          Every project follows a transparent four-stage progression. No bloated handoffs, no ambiguity—just purposeful creative direction and resilient engineering.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {PROCESS_STEPS.map((item, idx) => (
          <div
            key={item.step}
            className="relative flex flex-col p-6 rounded-sm bg-white/[0.02] border border-white/10 hover:border-[#ff2a2a]/60 hover:bg-white/[0.035] transition-all duration-300 group"
          >
            {/* Step Number & Connector indicator */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono tracking-[0.24em] text-[#ff3b3b]">
                {item.step}
              </span>
              {idx < PROCESS_STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="hidden lg:block text-xs font-mono text-white/20 group-hover:text-[#ff3b3b]/60 transition-colors"
                >
                  →
                </span>
              )}
            </div>

            <h3 className="text-sm font-semibold tracking-[0.16em] uppercase text-white mb-1.5">
              {item.title}
            </h3>

            <p className="text-[11px] font-mono tracking-[0.06em] text-white/50 mb-3">
              {item.subtitle}
            </p>

            <p className="text-xs font-light text-white/70 leading-relaxed">
              {item.description}
            </p>

            {/* Bottom Accent line */}
            <div
              aria-hidden="true"
              className="mt-6 pt-2 w-full h-[1px] bg-gradient-to-r from-[#ff2a2a]/40 via-white/10 to-transparent group-hover:from-[#ff2a2a] transition-all"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

