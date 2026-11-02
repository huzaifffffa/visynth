"use client";

import React, { useEffect, useRef, useState } from "react";
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
  isSubPage?: boolean;
}

export const SiteNavigation = React.memo(function SiteNavigation({
  activeSection,
  onNavigate,
  isSubPage = false,
}: SiteNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileDrawerRef = useRef<HTMLDivElement | null>(null);
  const isExternalRoute = isSubPage || !onNavigate;

  // Treat the mobile drawer as a modal navigation surface: move focus in,
  // keep background landmarks inert, and return focus on close.
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const inertTargets = Array.from(
      document.querySelectorAll<HTMLElement>("main, footer")
    ).filter((target) => !target.hasAttribute("inert"));
    const menuButton = menuButtonRef.current;
    inertTargets.forEach((target) => target.setAttribute("inert", ""));

    const getFocusable = () =>
      Array.from(
        mobileDrawerRef.current?.querySelectorAll<HTMLElement>(
          'a[href]:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"])'
        ) ?? []
      );

    const focusFrame = window.requestAnimationFrame(() => {
      getFocusable()[0]?.focus();
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setMobileMenuOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKeyDown);
      inertTargets.forEach((target) => target.removeAttribute("inert"));
      if (document.contains(menuButton)) {
        menuButton?.focus();
      }
    };
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
    <header className="fixed top-0 left-0 right-0 z-50 w-full h-[clamp(64px,5.6vw,90px)] border-b border-white/[0.1] bg-black/45 backdrop-blur-xl flex items-center justify-between pl-[5.8%] pr-[5.8%] select-none transform-gpu will-change-transform shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.06)]">
      {/* Brand Logo (Left) — Preserved exactly with WCAG tap target */}
      <Link
        href={isExternalRoute ? "/" : "#home"}
        prefetch={false}
        onClick={(e) => handleLinkClick(e, "home")}
        tabIndex={mobileMenuOpen ? -1 : undefined}
        className="relative flex items-center min-h-[44px] min-w-[44px] shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-sm"
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

      {/* Desktop Navigation Links (Centered) — Preserved exactly with WCAG tap target */}
      <nav
        aria-label="Main Navigation"
        className="hidden md:flex items-center gap-[clamp(20px,3.2vw,50px)] absolute left-1/2 -translate-x-1/2"
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
              className={`relative min-h-[44px] inline-flex items-center px-2 text-[clamp(10px,0.72vw,12px)] font-medium tracking-[0.22em] uppercase transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-sm ${
                isActive ? "text-white" : "text-[#c8c8c8] hover:text-white"
              }`}
            >
              {item.label}

              {/* Active Red Glow Indicator */}
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-1.5 flex items-center justify-center w-[clamp(40px,4.2vw,60px)] transition-opacity duration-300 will-change-[opacity] ${
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

      {/* Right Action Area: Mobile Navigation Toggle */}
      <div className="flex items-center gap-3">
        {/* Mobile Navigation Toggle */}
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation-drawer"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="md:hidden relative z-50 flex flex-col justify-center items-center min-w-[44px] min-h-[44px] w-11 h-11 gap-1.5 text-white/85 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-sm cursor-pointer"
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
        ref={mobileDrawerRef}
        id="mobile-navigation-drawer"
        data-drag-ignore="true"
        role="dialog"
        aria-modal={mobileMenuOpen ? "true" : undefined}
        aria-label="Site navigation"
        aria-hidden={!mobileMenuOpen}
        className={`md:hidden fixed inset-x-0 top-[clamp(64px,5.6vw,90px)] bg-black/95 border-b border-white/10 transition-[max-height,opacity,padding] duration-300 overflow-hidden ${
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
                tabIndex={mobileMenuOpen ? 0 : -1}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 text-xs tracking-[0.24em] uppercase min-h-[44px] py-1.5 px-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-sm ${
                  isActive ? "text-white font-semibold" : "text-white/70 hover:text-white"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`w-1.5 h-1.5 rounded-full transition-[transform,opacity,color,background-color,border-color,box-shadow] ${
                    isActive
                      ? "bg-[#ff2a2a] shadow-[0_0_8px_2px_rgba(255,35,35,0.9)]"
                      : "bg-white/25"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
});
