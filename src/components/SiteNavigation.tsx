"use client";

import React, { useEffect, useState } from "react";
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
  isSubPage?: boolean;
}

export const SiteNavigation = React.memo(function SiteNavigation({
  activeSection,
  onNavigate,
  isPortfolioPage = false,
  isSubPage = false,
}: SiteNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isExternalRoute = isPortfolioPage || isSubPage || !onNavigate;

  // Close mobile navigation on Escape key
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

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
    if (isExternalRoute) {
      return section === "home" ? "/" : `/#${section}`;
    }
    return `#${section}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full h-[clamp(64px,5.6vw,90px)] border-b border-white/[0.11] bg-gradient-to-b from-black/92 via-black/75 to-black/25 flex items-center justify-between pl-[5.8%] pr-[5.8%] select-none transform-gpu will-change-transform">
      {/* Brand Logo (Left) — Preserved exactly */}
      <Link
        href={isExternalRoute ? "/" : "#home"}
        prefetch={false}
        onClick={(e) => handleLinkClick(e, "home")}
        className="relative flex items-center shrink-0 focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500/70 rounded-sm"
        aria-label="VISYNTH Home"
      >
        <Image
          src="/visynth-logo.png"
          alt="VISYNTH"
          width={936}
          height={130}
          sizes="(max-width: 768px) 180px, 240px"
          className="w-[clamp(138px,15.6vw,240px)] h-auto object-contain"
        />
      </Link>

      {/* Desktop Navigation Links (Centered) — Preserved exactly */}
      <nav
        aria-label="Main Navigation"
        className="hidden md:flex items-center gap-[clamp(22px,3.4vw,54px)] absolute left-1/2 -translate-x-1/2"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = !isExternalRoute && activeSection === item.id;
          return (
            <Link
              key={item.id}
              href={getSectionHref(item.id)}
              prefetch={false}
              onClick={(e) => handleLinkClick(e, item.id)}
              aria-current={isActive ? "page" : undefined}
              className={`relative py-2 px-1 text-[clamp(9.5px,0.72vw,11.5px)] font-medium tracking-[0.22em] uppercase transition-colors duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500/70 rounded-sm ${
                isActive ? "text-white" : "text-[#c8c8c8] hover:text-white"
              }`}
            >
              {item.label}

              {/* Active Red Glow Indicator */}
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-[clamp(6px,0.65vw,10px)] flex items-center justify-center w-[clamp(40px,4.2vw,60px)] transition-opacity duration-300 will-change-[opacity] ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              >
                <span className="absolute w-full h-[14px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,26,26,0.45)_0%,rgba(255,26,26,0)_70%)]" />
                <span className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff2a2a] to-transparent opacity-95" />
                <span className="absolute w-[3.5px] h-[3.5px] rounded-full bg-[#ff3b3b] shadow-[0_0_8px_rgba(255,35,35,0.95)]" />
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Right Action Area: Clearly visible PORTFOLIO button at far right */}
      <div className="flex items-center gap-3">
        <Link
          href="/portfolio"
          prefetch={false}
          aria-current={isPortfolioPage ? "page" : undefined}
          className={`relative inline-flex items-center justify-center py-2 px-1 text-[clamp(9.5px,0.72vw,11.5px)] font-medium tracking-[0.22em] uppercase transition-colors duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500/80 rounded-sm ${
            isPortfolioPage
              ? "text-white"
              : "text-white/80 hover:text-white"
          }`}
        >
          <span>PORTFOLIO</span>
          <span
            aria-hidden="true"
            className={`ml-2 w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              isPortfolioPage
                ? "bg-[#ff3b3b] shadow-[0_0_8px_2px_rgba(255,35,35,0.95)]"
                : "bg-[#ff2a2a]/80 shadow-[0_0_6px_1px_rgba(255,35,35,0.6)]"
            }`}
          />
        </Link>

        {/* Mobile Navigation Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation-drawer"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="md:hidden relative z-50 flex flex-col justify-center items-center w-9 h-9 gap-1.5 text-white/85 hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500/80 rounded-sm cursor-pointer"
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
        id="mobile-navigation-drawer"
        data-drag-ignore="true"
        aria-hidden={!mobileMenuOpen}
        className={`md:hidden fixed inset-x-0 top-[clamp(64px,5.6vw,90px)] bg-black/95 border-b border-white/10 transition-all duration-300 overflow-hidden ${
          mobileMenuOpen
            ? "max-h-96 opacity-100 py-6 pointer-events-auto backdrop-blur-md"
            : "max-h-0 opacity-0 py-0 pointer-events-none"
        }`}
      >
        <nav
          aria-label="Mobile Navigation"
          className="flex flex-col items-start gap-4 px-[5.8%]"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = !isExternalRoute && activeSection === item.id;
            return (
              <Link
                key={item.id}
                href={getSectionHref(item.id)}
                prefetch={false}
                onClick={(e) => handleLinkClick(e, item.id)}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 text-xs tracking-[0.24em] uppercase py-1.5 px-1 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500/70 rounded-sm ${
                  isActive ? "text-white font-semibold" : "text-white/70 hover:text-white"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    isActive
                      ? "bg-[#ff2a2a] shadow-[0_0_8px_2px_rgba(255,35,35,0.9)]"
                      : "bg-white/25"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/portfolio"
            prefetch={false}
            onClick={() => setMobileMenuOpen(false)}
            aria-current={isPortfolioPage ? "page" : undefined}
            className={`flex items-center gap-3 text-xs tracking-[0.24em] uppercase py-1.5 px-1 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500/70 rounded-sm ${
              isPortfolioPage ? "text-white font-semibold" : "text-[#ff4d4d] hover:text-white"
            }`}
          >
            <span
              aria-hidden="true"
              className="w-1.5 h-1.5 rounded-full bg-[#ff2a2a] shadow-[0_0_8px_2px_rgba(255,35,35,0.9)]"
            />
            PORTFOLIO
          </Link>
        </nav>
      </div>
    </header>
  );
});
