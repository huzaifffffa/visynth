import React from "react";

interface SectionEyebrowProps {
  label: string;
  className?: string;
}

export function SectionEyebrow({ label, className = "" }: SectionEyebrowProps) {
  return (
    <div
      className={`w-full flex items-center gap-[clamp(12px,1.25vw,20px)] mb-[clamp(14px,1.6vw,24px)] ${className}`}
    >
      <span
        data-anim="eyebrow-text"
        className="text-[clamp(8.5px,0.72vw,11.5px)] font-normal tracking-[0.31em] text-[#adadad] uppercase whitespace-nowrap"
      >
        {label}
      </span>
      <span
        data-anim="eyebrow-line"
        aria-hidden="true"
        className="h-[1px] flex-1 max-w-[clamp(130px,18vw,260px)] origin-left bg-gradient-to-r from-white/40 via-white/15 to-transparent"
      />
    </div>
  );
}

interface AnimatedHeadingProps {
  lines: React.ReactNode[];
  as?: "h1" | "h2" | "h3";
  className?: string;
  lineClassName?: string;
}

export function AnimatedHeading({
  lines,
  as: Tag = "h2",
  className = "",
  lineClassName = "",
}: AnimatedHeadingProps) {
  return (
    <Tag
      className={`font-extralight tracking-[0.03em] leading-[1.08] text-white ${className}`}
    >
      {lines.map((line, index) => (
        <span
          key={index}
          className={`block overflow-hidden pb-[0.06em] -mb-[0.06em] ${lineClassName}`}
        >
          <span
            data-anim="heading-line"
            className="block will-change-transform"
          >
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}

export function CtaArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 44 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-[clamp(32px,3.7vw,54px)] h-auto text-white/70 transition-transform duration-300 group-hover:translate-x-1.5 ${className}`}
      aria-hidden="true"
    >
      <line
        x1="0"
        y1="5"
        x2="42.5"
        y2="5"
        stroke="currentColor"
        strokeWidth="1"
      />
      <polyline
        points="38.5,1 43,5 38.5,9"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

