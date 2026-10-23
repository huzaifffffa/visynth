"use client";

import React, { useState } from "react";
import {
  AnimatedHeading,
  CtaArrowIcon,
  SectionEyebrow,
} from "./AnimatedHeading";

interface ContactSectionProps {
  sectionRef: React.RefObject<HTMLElement | null>;
  onReturnHome: () => void;
}

const DISCIPLINE_OPTIONS = [
  "Branding & Identity",
  "3D Animation",
  "Web & App",
  "Digital Marketing",
  "Cybersecurity",
];

export function ContactSection({
  sectionRef,
  onReturnHome,
}: ContactSectionProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const toggleDiscipline = (discipline: string) => {
    setSelectedDisciplines((prev) =>
      prev.includes(discipline)
        ? prev.filter((d) => d !== discipline)
        : [...prev, discipline]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSubmitted(true);
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      aria-label="Contact"
      className="absolute inset-0 z-20 flex flex-col justify-between w-full h-full pt-[clamp(64px,5.6vw,90px)] pl-[5.95%] pr-[5.95%] opacity-0 pointer-events-none select-none invisible"
    >
      <div className="flex-1 flex items-center w-full py-8">
        <div
          data-contact="container"
          className="w-full max-w-[clamp(330px,46vw,690px)] flex flex-col items-start will-change-transform"
        >
          <SectionEyebrow label="CONTACT" />

          {/* Required Headline: "Let's build what comes next." */}
          <AnimatedHeading
            lines={[
              "Let's build",
              <>
                what comes{" "}
                <span className="text-[#e61e1e] font-light drop-shadow-[0_0_16px_rgba(255,25,25,0.45)]">
                  next.
                </span>
              </>,
            ]}
            className="text-[clamp(28px,3.8vw,58px)] tracking-[0.02em]"
          />

          {/* Required Supporting Copy: "Have an idea in mind? Let's talk." */}
          <p
            data-anim="contact-copy"
            className="mt-[clamp(14px,1.7vw,26px)] text-[clamp(14px,1.35vw,21px)] font-extralight tracking-[0.02em] text-[#dcdcdc] will-change-transform"
          >
            Have an idea in mind? Let&apos;s talk.
          </p>

          {/* Interactive Contact Action / Minimalist Inquiry Form */}
          <div
            data-anim="contact-action"
            className="mt-[clamp(22px,2.6vw,40px)] w-full will-change-transform"
          >
            {!formOpen ? (
              <div className="flex flex-wrap items-center gap-8">
                <button
                  type="button"
                  onClick={() => {
                    setFormOpen(true);
                    setSubmitted(false);
                  }}
                  className="inline-flex items-center gap-[clamp(12px,1.3vw,20px)] group cursor-pointer py-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500/60"
                >
                  <span className="text-[clamp(9px,0.76vw,12px)] font-semibold tracking-[0.24em] text-white uppercase">
                    START A CONVERSATION
                  </span>
                  <CtaArrowIcon />
                </button>
              </div>
            ) : submitted ? (
              <div className="w-full max-w-lg border-t border-b border-white/15 py-6 space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#ff2a2a] shadow-[0_0_8px_2px_rgba(255,35,35,0.9)]" />
                  <span className="text-[11px] font-medium tracking-[0.24em] uppercase text-white">
                    INQUIRY RECEIVED
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-light text-white/75 leading-relaxed">
                  Thank you, <span className="text-white">{name}</span>. Your
                  message has been recorded and our studio team will respond
                  shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormOpen(false);
                    setName("");
                    setEmail("");
                    setMessage("");
                    setSelectedDisciplines([]);
                  }}
                  className="pt-2 text-[10px] tracking-[0.22em] uppercase text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  CLOSE
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="w-full max-w-lg border-t border-white/15 pt-5 space-y-4 select-text"
              >
                {/* Discipline Tags */}
                <div className="flex flex-wrap gap-2">
                  {DISCIPLINE_OPTIONS.map((discipline) => {
                    const active = selectedDisciplines.includes(discipline);
                    return (
                      <button
                        key={discipline}
                        type="button"
                        onClick={() => toggleDiscipline(discipline)}
                        className={`px-3 py-1 text-[9.5px] tracking-[0.18em] uppercase border transition-colors cursor-pointer ${
                          active
                            ? "border-[#ff2a2a] bg-[#ff2a2a]/15 text-white"
                            : "border-white/15 text-white/65 hover:border-white/35 hover:text-white"
                        }`}
                      >
                        {discipline}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="YOUR NAME"
                    aria-label="Your name"
                    className="w-full bg-transparent border-b border-white/20 py-2 text-xs tracking-[0.12em] text-white placeholder:text-white/40 focus:border-[#ff2a2a] focus:outline-none transition-colors"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="YOUR EMAIL"
                    aria-label="Your email"
                    className="w-full bg-transparent border-b border-white/20 py-2 text-xs tracking-[0.12em] text-white placeholder:text-white/40 focus:border-[#ff2a2a] focus:outline-none transition-colors"
                  />
                </div>

                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="TELL US ABOUT YOUR VISION"
                  aria-label="Project details"
                  className="w-full bg-transparent border-b border-white/20 py-2 text-xs tracking-[0.08em] text-white placeholder:text-white/40 focus:border-[#ff2a2a] focus:outline-none transition-colors resize-none"
                />

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-3 group cursor-pointer py-1 focus:outline-none"
                  >
                    <span className="text-[10px] font-semibold tracking-[0.24em] text-white uppercase">
                      SEND INQUIRY
                    </span>
                    <CtaArrowIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    className="text-[9.5px] tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors cursor-pointer"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Subtle Bottom Footer Bar */}
      <footer className="w-full py-5 border-t border-white/[0.1] flex items-center justify-between text-[9.5px] tracking-[0.22em] uppercase text-white/50">
        <span>VISYNTH — CREATIVE TECHNOLOGY STUDIO</span>
        <button
          type="button"
          onClick={onReturnHome}
          className="hover:text-white transition-colors cursor-pointer focus:outline-none"
        >
          BACK TO TOP ↑
        </button>
      </footer>
    </section>
  );
}

