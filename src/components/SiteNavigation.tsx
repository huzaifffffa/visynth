"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type SectionId = "home" | "skills" | "work" | "about" | "contact";

export const NAV_ITEMS: { id: SectionId; label: string }[] = [
  { id: "home", label: "HOME" },
  { id: "skills", label: "SKILLS" },
  { id: "work", label: "WORK" },
  { id: "about", label: "ABOUT" },
  { id: "contact", label: "CONTACT" },
];

interface SiteNavigationProps {
  activeSection?: SectionId;
  onNavigate?: (section: SectionId) => void;
  isPortfolioPage?: boolean;
}

export function SiteNavigation({
  activeSection,
  onNavigate,
  isPortfolioPage = false,
}: SiteNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    section: SectionId
  ) => {
    if (onNavigate) {
      e.preventDefault();
      setMobileMenuOpen(false);
      onNavigate(section);
    } else {
      setMobileMenuOpen(false);
    }
  };

  const getSectionHref = (section: SectionId) => {
    if (isPortfolioPage) {
      return section === "home" ? "/" : `/#${section}`;
    }
    return `#${section}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full h-[clamp(64px,5.6vw,90px)] border-b border-white/[0.11] bg-gradient-to-b from-black/85 via-black/50 to-black/10 backdrop-blur-[2px] flex items-center justify-between pl-[5.8%] pr-[5.8%] select-none">
      {/* Brand Logo (Left) — Preserved exactly */}
      <Link
        href={isPortfolioPage ? "/" : "#home"}
        onClick={(e) => handleLinkClick(e, "home")}
        className="relative flex items-center shrink-0 focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500/60"
        aria-label="VISYNTH Home"
      >
        <Image
          src="/visynth-logo.png"
          alt="VISYNTH"
          width={936}
          height={130}
          priority
          className="w-[clamp(138px,15.6vw,240px)] h-auto object-contain"
        />
      </Link>

      {/* Desktop Navigation Links (Centered) — Preserved exactly */}
      <nav
        aria-label="Main Navigation"
        className="hidden md:flex items-center gap-[clamp(22px,3.4vw,54px)] absolute left-1/2 -translate-x-1/2"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = !isPortfolioPage && activeSection === item.id;
          return (
            <Link
              key={item.id}
              href={getSectionHref(item.id)}
              onClick={(e) => handleLinkClick(e, item.id)}
              aria-current={isActive ? "page" : undefined}
              className={`relative py-2 text-[clamp(9.5px,0.72vw,11.5px)] font-medium tracking-[0.22em] uppercase transition-colors duration-300 ${
                isActive ? "text-white" : "text-[#c8c8c8] hover:text-white"
              }`}
            >
              {item.label}

              {/* Active Red Glow Indicator */}
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-[clamp(6px,0.65vw,10px)] flex items-center justify-center w-[clamp(40px,4.2vw,60px)] transition-opacity duration-300 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              >
                <span className="absolute w-full h-[14px] rounded-full bg-[#ff1a1a]/35 blur-[6px]" />
                <span className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff2a2a] to-transparent opacity-95" />
                <span className="absolute w-[3.5px] h-[3.5px] rounded-full bg-[#ff3b3b] shadow-[0_0_8px_2px_rgba(255,35,35,0.95)]" />
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Right Action Area: Clearly visible PORTFOLIO button at far right */}
      <div className="flex items-center gap-3">
        <Link
          href="/portfolio"
          aria-current={isPortfolioPage ? "page" : undefined}
          className={`relative inline-flex items-center justify-center px-[clamp(14px,1.4vw,22px)] py-[clamp(7px,0.6vw,10px)] text-[clamp(9px,0.7vw,11px)] font-medium tracking-[0.22em] uppercase border transition-all duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500/80 ${
            isPortfolioPage
              ? "border-[#ff2a2a]/80 bg-[#ff2a2a]/15 text-white shadow-[0_0_18px_rgba(255,35,35,0.28)]"
              : "border-white/20 bg-white/[0.03] text-white/90 hover:border-[#ff2a2a]/70 hover:bg-[#ff2a2a]/10 hover:text-white hover:shadow-[0_0_16px_rgba(255,35,35,0.22)]"
          }`}
        >
          <span>PORTFOLIO</span>
          <span
            aria-hidden="true"
            className={`ml-2 w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              isPortfolioPage
                ? "bg-[#ff3b3b] shadow-[0_0_8px_2px_rgba(255,35,35,0.95)]"
                : "bg-[#ff2a2a]/75"
            }`}
          />
        </Link>

        {/* Mobile Navigation Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
          className="md:hidden relative z-50 flex flex-col justify-center items-center w-9 h-9 gap-1.5 text-white/85 hover:text-white focus:outline-none"
        >
          <span
            className={`block w-5 h-[1px] bg-current transition-transform duration-300 ${
              mobileMenuOpen ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`block w-5 h-[1px] bg-current transition-opacity duration-300 ${
              mobileMenuOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`block w-5 h-[1px] bg-current transition-transform duration-300 ${
              mobileMenuOpen ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Dropdown Drawer */}
      <div
        className={`md:hidden fixed inset-x-0 top-[clamp(64px,5.6vw,90px)] bg-black/95 border-b border-white/10 backdrop-blur-md transition-all duration-300 overflow-hidden ${
          mobileMenuOpen
            ? "max-h-96 opacity-100 py-6"
            : "max-h-0 opacity-0 py-0 pointer-events-none"
        }`}
      >
        <nav
          aria-label="Mobile Navigation"
          className="flex flex-col items-start gap-4 px-[5.8%]"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = !isPortfolioPage && activeSection === item.id;
            return (
              <Link
                key={item.id}
                href={getSectionHref(item.id)}
                onClick={(e) => handleLinkClick(e, item.id)}
                className={`flex items-center gap-3 text-xs tracking-[0.24em] uppercase py-1.5 transition-colors ${
                  isActive ? "text-white font-semibold" : "text-white/65"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    isActive
                      ? "bg-[#ff2a2a] shadow-[0_0_8px_2px_rgba(255,35,35,0.9)]"
                      : "bg-white/20"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/portfolio"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 text-xs tracking-[0.24em] uppercase py-1.5 transition-colors ${
              isPortfolioPage ? "text-white font-semibold" : "text-[#ff4d4d]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff2a2a] shadow-[0_0_8px_2px_rgba(255,35,35,0.9)]" />
            PORTFOLIO
          </Link>
        </nav>
      </div>
    </header>
  );
}
