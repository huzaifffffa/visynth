"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import gsap from "gsap";
import {
  DISCIPLINE_CATEGORIES,
  PORTFOLIO_ITEMS,
  PortfolioCategory,
  PortfolioItem,
} from "@/data/portfolioItems";

interface ViewportConfig {
  cardWidth: number;
  cardHeight: number;
  baseSpacing: number;
  depthStep: number;
  maxVisibleOffset: number;
  sideRotateY: number;
  activeRotateY: number;
  isMobile: boolean;
}

function getViewportConfig(totalViewportWidth: number): ViewportConfig {
  if (totalViewportWidth < 768) {
    // Mobile (< 768px): full width available (horizontal filter bar above)
    const cardWidth = Math.round(
      Math.min(300, Math.max(220, totalViewportWidth * 0.72))
    );
    return {
      cardWidth,
      cardHeight: Math.round(cardWidth * 1.26),
      baseSpacing: Math.round(cardWidth * 0.54),
      depthStep: 95,
      maxVisibleOffset: 2,
      sideRotateY: 16,
      activeRotateY: -3,
      isMobile: true,
    };
  }

  // Subtract left sidebar width on tablet & desktop
  const sidebarWidth =
    totalViewportWidth < 1024 ? 220 : totalViewportWidth < 1440 ? 255 : 280;
  const stageWidth = Math.max(480, totalViewportWidth - sidebarWidth);

  if (totalViewportWidth < 1024) {
    // Tablet (768px - 1023px)
    const cardWidth = Math.round(Math.min(285, Math.max(220, stageWidth * 0.38)));
    return {
      cardWidth,
      cardHeight: Math.round(cardWidth * 1.26),
      baseSpacing: Math.round(cardWidth * 0.52),
      depthStep: 110,
      maxVisibleOffset: 2,
      sideRotateY: 22,
      activeRotateY: -6,
      isMobile: false,
    };
  }

  if (totalViewportWidth < 1440) {
    // Standard laptop (1024px - 1439px)
    const cardWidth = Math.round(Math.min(335, Math.max(265, stageWidth * 0.3)));
    return {
      cardWidth,
      cardHeight: Math.round(cardWidth * 1.26),
      baseSpacing: Math.round(cardWidth * 0.54),
      depthStep: 120,
      maxVisibleOffset: 3,
      sideRotateY: 26,
      activeRotateY: -8,
      isMobile: false,
    };
  }

  // Large desktop (1440px+)
  const cardWidth = Math.round(Math.min(380, Math.max(320, stageWidth * 0.275)));
  return {
    cardWidth,
    cardHeight: Math.round(cardWidth * 1.26),
    baseSpacing: Math.round(cardWidth * 0.55),
    depthStep: 130,
    maxVisibleOffset: 3,
    sideRotateY: 28,
    activeRotateY: -8,
    isMobile: false,
  };
}

function CategoryOutlineIcon({
  category,
  className = "",
}: {
  category: PortfolioCategory;
  className?: string;
}) {
  switch (category) {
    case "All Work":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          className={className}
          aria-hidden="true"
        >
          <rect x="3" y="3" width="5.5" height="5.5" rx="1.2" />
          <rect x="11.5" y="3" width="5.5" height="5.5" rx="1.2" />
          <rect x="3" y="11.5" width="5.5" height="5.5" rx="1.2" />
          <rect x="11.5" y="11.5" width="5.5" height="5.5" rx="1.2" />
        </svg>
      );
    case "Character Design":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <circle cx="10" cy="6.5" r="3.2" />
          <path d="M4.2 16.8c0-2.9 2.6-4.8 5.8-4.8s5.8 1.9 5.8 4.8" />
        </svg>
      );
    case "3D Models":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M10 2.5 16.5 6.2v7.6L10 17.5 3.5 13.8V6.2L10 2.5Z" />
          <path d="M3.5 6.2 10 10l6.5-3.8" />
          <path d="M10 10v7.5" />
        </svg>
      );
    case "Video Editing":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <circle cx="10" cy="10" r="7" />
          <polygon points="8.5,7.2 13.2,10 8.5,12.8" fill="none" />
        </svg>
      );
    case "Website Development":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <rect x="2.8" y="3.5" width="14.4" height="10" rx="1.4" />
          <path d="M7 16.8h6" />
          <path d="M10 13.5v3.3" />
        </svg>
      );
    case "Graphic Design":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M13.8 3.5 16.5 6.2 7.2 15.5 3.5 16.5l1-3.7L13.8 3.5Z" />
          <path d="m11.8 5.5 2.7 2.7" />
        </svg>
      );
    case "Branding":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M10 2.6 17.4 10 10 17.4 2.6 10 10 2.6Z" />
          <circle cx="10" cy="10" r="2.2" />
        </svg>
      );
    case "3D Animation":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M10 3.2 16 6.7 10 10.2 4 6.7 10 3.2Z" />
          <path d="m4 10.2 6 3.5 6-3.5" />
          <path d="m4 13.6 6 3.5 6-3.5" />
        </svg>
      );
    case "UI/UX Design":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <rect x="3" y="3.2" width="14" height="13.6" rx="1.6" />
          <path d="M3 7.5h14" />
          <path d="M8 7.5v9.3" />
        </svg>
      );
  }
}

export function PortfolioGallery3D() {
  const [selectedCategory, setSelectedCategory] =
    useState<PortfolioCategory>("All Work");
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [viewportWidth, setViewportWidth] = useState<number>(1440);
  const [prefersReducedMotion, setPrefersReducedMotion] =
    useState<boolean>(false);
  const [hasEntered, setHasEntered] = useState<boolean>(false);

  const headerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragStartXRef = useRef<number | null>(null);
  const dragDeltaXRef = useRef<number>(0);
  const didDragRef = useRef<boolean>(false);

  // Single source of truth for real category filtering
  const filteredItems: PortfolioItem[] = useMemo(() => {
    if (selectedCategory === "All Work") return PORTFOLIO_ITEMS;
    return PORTFOLIO_ITEMS.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const totalItems = filteredItems.length;
  const safeActiveIndex =
    totalItems > 0 ? Math.min(activeIndex, totalItems - 1) : 0;
  const activeItem: PortfolioItem | undefined = filteredItems[safeActiveIndex];

  // Measure viewport & reduced motion preference
  useEffect(() => {
    const updateViewport = () => {
      setViewportWidth(window.innerWidth);
    };
    updateViewport();

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const onMqChange = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);

    window.addEventListener("resize", updateViewport);
    mq.addEventListener("change", onMqChange);
    return () => {
      window.removeEventListener("resize", updateViewport);
      mq.removeEventListener("change", onMqChange);
    };
  }, []);

  // Initial entrance animation (clipping mask heading + staggered 3D panels)
  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (rm) {
      setHasEntered(true);
      return;
    }

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        const maskItems = headerRef.current.querySelectorAll(
          '[data-portfolio-anim="mask"]'
        );
        const lineItem = headerRef.current.querySelector(
          '[data-portfolio-anim="line"]'
        );
        gsap.fromTo(
          maskItems,
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.75,
            stagger: 0.09,
            ease: "power3.out",
          }
        );
        if (lineItem) {
          gsap.fromTo(
            lineItem,
            { scaleX: 0, opacity: 0 },
            { scaleX: 1, opacity: 1, duration: 0.85, ease: "power2.out" }
          );
        }
      }
    });

    const timer = window.setTimeout(() => {
      setHasEntered(true);
    }, 80);

    return () => {
      window.clearTimeout(timer);
      ctx.revert();
    };
  }, []);

  const goPrev = useCallback(() => {
    if (totalItems <= 1) return;
    setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems);
  }, [totalItems]);

  const goNext = useCallback(() => {
    if (totalItems <= 1) return;
    setActiveIndex((prev) => (prev + 1) % totalItems);
  }, [totalItems]);

  const handleCategoryChange = useCallback((category: PortfolioCategory) => {
    setSelectedCategory(category);
    setActiveIndex(0);
    setHoveredIndex(null);
  }, []);

  // Keyboard navigation (Left / Right arrows)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev]);

  // Pointer / Touch drag-swipe handlers on the 3D stage
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStartXRef.current = e.clientX;
    dragDeltaXRef.current = 0;
    didDragRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartXRef.current === null) return;
    const dx = e.clientX - dragStartXRef.current;
    dragDeltaXRef.current = dx;
    if (Math.abs(dx) > 12) {
      didDragRef.current = true;
    }
  };

  const handlePointerUp = () => {
    if (dragStartXRef.current === null) return;
    const dx = dragDeltaXRef.current;
    dragStartXRef.current = null;
    dragDeltaXRef.current = 0;

    if (Math.abs(dx) > 42) {
      if (dx < 0) {
        goNext();
      } else {
        goPrev();
      }
    }
  };

  const vp = getViewportConfig(viewportWidth);

  // Compute signed circular offset around active card so adjacent panels appear on both sides
  // and recede progressively into depth without collisions when totalItems is 1 or 2
  const getSignedOffset = (index: number): number => {
    if (totalItems <= 1) return 0;
    if (totalItems === 2) return index - safeActiveIndex;
    let diff = index - safeActiveIndex;
    const half = Math.floor(totalItems / 2);
    if (diff > half) diff -= totalItems;
    if (diff < -half) diff += totalItems;
    return diff;
  };

  const formattedIndex =
    totalItems > 0 ? String(safeActiveIndex + 1).padStart(2, "0") : "00";
  const formattedTotal = String(totalItems).padStart(2, "0");

  return (
    <div className="w-full min-h-[100svh] pt-[clamp(64px,5.6vw,90px)] bg-[#050505] text-white flex flex-col md:flex-row">
      {/* =====================================================================
          LEFT COLUMN: Permanent Vertical Category Sidebar (Desktop & Tablet)
          ===================================================================== */}
      <aside
        aria-label="Filter Portfolio by Discipline"
        className="hidden md:flex flex-col w-[220px] lg:w-[255px] xl:w-[280px] shrink-0 border-r border-white/[0.08] bg-[#050505] px-5 lg:px-7 pt-9 pb-10 select-none"
      >
        {/* Sidebar Heading: FILTER BY DISCIPLINE + Subtle Red Accent Line */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-[10px] font-medium tracking-[0.22em] text-[#8d9199] uppercase whitespace-nowrap">
            FILTER BY DISCIPLINE
          </span>
          <span
            aria-hidden="true"
            className="h-[1px] flex-1 bg-gradient-to-r from-[#ff2a2a]/60 to-white/10"
          />
        </div>

        {/* Vertical Discipline List with Left Rail */}
        <nav
          role="tablist"
          aria-orientation="vertical"
          aria-label="Work Categories"
          className="relative flex flex-col border-l border-white/[0.08]"
        >
          {DISCIPLINE_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleCategoryChange(category)}
                className={`group relative flex items-center justify-between w-full py-3.5 pl-5 pr-3 text-left transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#ff2a2a] ${
                  isSelected
                    ? "border-y border-white/[0.08] bg-gradient-to-r from-[#ff1e1e]/[0.13] via-[#ff1e1e]/[0.03] to-transparent text-white"
                    : "border-y border-transparent text-[#8c9098] hover:text-white/90 hover:bg-white/[0.02]"
                }`}
              >
                {/* Active Crimson Left Indicator Bar + Glowing Dot */}
                {isSelected && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-[1.5px] inset-y-0 flex items-center justify-center"
                  >
                    {/* Soft radial red ambient glow */}
                    <span className="absolute w-6 h-8 rounded-full bg-[#ff1e1e]/35 blur-[8px]" />
                    {/* Vertical crimson bar */}
                    <span className="w-[2px] h-full bg-gradient-to-b from-transparent via-[#ff2a2a] to-transparent" />
                    {/* Glowing red center node */}
                    <span className="absolute w-[5px] h-[5px] rounded-full bg-[#ff3b3b] shadow-[0_0_10px_2px_rgba(255,35,35,0.95)]" />
                  </span>
                )}

                <span className="flex items-center gap-3.5 min-w-0">
                  <CategoryOutlineIcon
                    category={category}
                    className={`w-[18px] h-[18px] shrink-0 transition-colors duration-300 ${
                      isSelected
                        ? "text-[#ff3b3b] drop-shadow-[0_0_8px_rgba(255,45,45,0.65)]"
                        : "text-white/45 group-hover:text-white/80"
                    }`}
                  />
                  <span
                    className={`text-[12.5px] lg:text-[13px] tracking-[0.03em] truncate transition-colors duration-300 ${
                      isSelected ? "font-medium text-white" : "font-normal"
                    }`}
                  >
                    {category}
                  </span>
                </span>

                {/* Directional Arrow for Selected / Hovered Category */}
                <span
                  aria-hidden="true"
                  className={`text-xs transition-all duration-300 ${
                    isSelected
                      ? "opacity-90 translate-x-0 text-white"
                      : "opacity-0 -translate-x-1.5 group-hover:opacity-50 group-hover:translate-x-0 text-white/70"
                  }`}
                >
                  →
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* =====================================================================
          RIGHT COLUMN: Main Gallery Content Area (Heading + 3D Carousel + Controls)
          ===================================================================== */}
      <div className="flex-1 min-w-0 flex flex-col justify-between bg-[#050505] px-[5%] md:px-8 lg:px-12 pt-6 pb-8">
        {/* 1. Heading Block Above the Gallery */}
        <div
          ref={headerRef}
          className="w-full flex flex-col items-start shrink-0"
        >
          {/* Uppercase Eyebrow: SELECTED WORK */}
          <div className="w-full flex items-center gap-3.5 mb-2.5 overflow-hidden">
            <span
              data-portfolio-anim="mask"
              className="text-[clamp(9px,0.72vw,11px)] font-normal tracking-[0.32em] text-[#a8a8a8] uppercase whitespace-nowrap block"
            >
              SELECTED WORK
            </span>
            <span
              data-portfolio-anim="line"
              aria-hidden="true"
              className="h-[1px] w-[clamp(90px,14vw,200px)] origin-left bg-gradient-to-r from-[#ff2a2a]/60 via-white/15 to-transparent"
            />
          </div>

          {/* Main Heading with Left Crimson Accent Bar */}
          <div className="flex items-stretch gap-3.5">
            <span
              aria-hidden="true"
              className="w-[2px] my-1 bg-gradient-to-b from-[#ff2a2a] via-[#ff2a2a]/80 to-transparent shadow-[0_0_10px_rgba(255,35,35,0.65)] shrink-0"
            />
            <div className="flex flex-col gap-1.5">
              <h1 className="overflow-hidden pb-1 -mb-1 text-[clamp(26px,3.1vw,48px)] font-light tracking-[0.015em] leading-[1.08] text-white">
                <span data-portfolio-anim="mask" className="block">
                  Ideas into{" "}
                  <span className="text-[#e61e1e] font-normal drop-shadow-[0_0_16px_rgba(255,25,25,0.38)]">
                    experiences.
                  </span>
                </span>
              </h1>

              <p className="overflow-hidden text-[clamp(11px,0.92vw,14px)] font-light tracking-[0.015em] text-[#9e9e9e]">
                <span data-portfolio-anim="mask" className="block">
                  A collection of creative, digital, and visual explorations.
                </span>
              </p>
            </div>
          </div>

          {/* Mobile Horizontal Scrollable Category Filter Bar (< md) */}
          <div className="md:hidden w-full mt-5 pt-4 border-t border-white/[0.08]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[9.5px] font-medium tracking-[0.24em] text-[#8d9199] uppercase">
                FILTER BY DISCIPLINE
              </span>
              <span className="text-[9.5px] font-mono tracking-[0.18em] text-[#ff3b3b]">
                {selectedCategory}
              </span>
            </div>
            <div
              role="tablist"
              aria-label="Filter Portfolio by Discipline"
              className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar"
            >
              {DISCIPLINE_CATEGORIES.map((category) => {
                const isSelected = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => handleCategoryChange(category)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-none text-[10.5px] tracking-[0.14em] uppercase whitespace-nowrap border shrink-0 transition-all duration-300 cursor-pointer focus:outline-none ${
                      isSelected
                        ? "border-[#ff2a2a] bg-[#ff2a2a]/15 text-white shadow-[0_0_14px_rgba(255,35,35,0.25)]"
                        : "border-white/15 bg-white/[0.02] text-white/65 hover:text-white"
                    }`}
                  >
                    <CategoryOutlineIcon
                      category={category}
                      className={`w-3.5 h-3.5 ${
                        isSelected ? "text-[#ff3b3b]" : "text-white/45"
                      }`}
                    />
                    <span>{category}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Main 3D Gallery Stage (Isolated Clipping Boundary, Centered in Right Column) */}
        <div className="w-full flex-1 flex items-center justify-center my-2 overflow-x-clip">
          {totalItems === 0 ? (
            /* Clean Empty State if a category has no projects */
            <div className="w-full py-20 flex flex-col items-center justify-center text-center border border-white/[0.08] bg-white/[0.01]">
              <p className="text-sm sm:text-base font-light tracking-[0.06em] text-white/75">
                No projects in this category yet.
              </p>
              <button
                type="button"
                onClick={() => handleCategoryChange("All Work")}
                className="mt-4 px-4 py-2 text-[10px] font-medium tracking-[0.22em] uppercase border border-[#ff2a2a]/70 bg-[#ff2a2a]/10 text-white hover:bg-[#ff2a2a]/20 transition-colors cursor-pointer"
              >
                VIEW ALL WORK
              </button>
            </div>
          ) : (
            <div
              ref={stageRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              role="region"
              aria-roledescription="carousel"
              aria-label={`Interactive 3D Portfolio Gallery — ${selectedCategory}`}
              style={{
                height: `${Math.round(vp.cardHeight * 1.24)}px`,
              }}
              className="relative w-full flex items-center justify-center select-none touch-pan-y cursor-grab active:cursor-grabbing overflow-hidden"
            >
              {/* 3D Perspective Scene Container */}
              <div
                style={{
                  perspective: vp.isMobile ? "1100px" : "1500px",
                  transformStyle: "preserve-3d",
                  width: `${vp.cardWidth}px`,
                  height: `${vp.cardHeight}px`,
                }}
                className="relative flex items-center justify-center -mt-[3%]"
              >
                {filteredItems.map((item, idx) => {
                  const offset = getSignedOffset(idx);
                  const absOffset = Math.abs(offset);
                  const isVisible = absOffset <= vp.maxVisibleOffset;
                  const isActive = offset === 0;
                  const isHovered = hoveredIndex === idx;

                  // Progressive horizontal spacing (tighter as panels recede into depth)
                  const direction = Math.sign(offset);
                  const spreadFactor =
                    absOffset === 0
                      ? 0
                      : absOffset === 1
                      ? 1
                      : 1 + (absOffset - 1) * 0.75;

                  const translateX = Math.round(
                    direction * spreadFactor * vp.baseSpacing
                  );

                  // Depth (Z) & Scale progression matching the reference exhibition
                  const baseZ = isActive
                    ? 60
                    : -absOffset * vp.depthStep - (absOffset > 1 ? 20 : 0);
                  const hoverLiftZ = isHovered && !isActive ? 22 : 0;
                  const hoverLiftY = isHovered ? -6 : 0;
                  const translateZ = baseZ + hoverLiftZ;

                  const scale = isActive
                    ? isHovered
                      ? 1.02
                      : 1
                    : Math.max(0.64, 0.88 - (absOffset - 1) * 0.085);

                  // Controlled vertical-axis rotation (rotateY)
                  const rotateY = isActive
                    ? vp.activeRotateY
                    : offset > 0
                    ? -vp.sideRotateY - Math.min(10, (absOffset - 1) * 3.5)
                    : vp.sideRotateY - 3 + Math.min(8, (absOffset - 1) * 3);

                  const targetOpacity = !hasEntered
                    ? 0
                    : !isVisible
                    ? 0
                    : isActive
                    ? 1
                    : Math.max(0.35, 0.86 - (absOffset - 1) * 0.17);

                  const zIndex = 50 - absOffset * 10 + (isHovered ? 2 : 0);

                  const transitionDuration = prefersReducedMotion
                    ? "0ms"
                    : "620ms";

                  return (
                    <div
                      key={item.id}
                      style={{
                        width: `${vp.cardWidth}px`,
                        height: `${vp.cardHeight}px`,
                        zIndex,
                        opacity: targetOpacity,
                        transform: `translate3d(${translateX}px, ${hoverLiftY}px, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                        transitionProperty: "transform, opacity",
                        transitionDuration,
                        transitionTimingFunction:
                          "cubic-bezier(0.22, 1, 0.36, 1)",
                      }}
                      className={`absolute top-0 left-0 will-change-transform ${
                        isVisible
                          ? "pointer-events-auto"
                          : "pointer-events-none"
                      }`}
                    >
                      {/* Interactive Panel Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (didDragRef.current) return;
                          setActiveIndex(idx);
                        }}
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        aria-label={`${item.title} (${item.category}) — Slide ${
                          idx + 1
                        } of ${totalItems}`}
                        aria-current={isActive ? "true" : undefined}
                        className={`group relative block w-full h-full rounded-[14px] bg-[#080808] overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2a2a] transition-shadow duration-500 ${
                          isActive
                            ? "shadow-[0_22px_55px_rgba(0,0,0,0.96),0_0_32px_rgba(255,30,30,0.26)]"
                            : isHovered
                            ? "shadow-[0_16px_40px_rgba(0,0,0,0.9),0_0_20px_rgba(255,30,30,0.18)]"
                            : "shadow-[0_14px_34px_rgba(0,0,0,0.88)]"
                        }`}
                      >
                        {/* Portfolio Artwork Image */}
                        <Image
                          src={item.imageSrc}
                          alt={item.imageAlt}
                          width={item.width}
                          height={item.height}
                          priority={absOffset <= 2}
                          loading={absOffset <= 2 ? "eager" : "lazy"}
                          draggable={false}
                          sizes="(max-width: 768px) 76vw, (max-width: 1200px) 34vw, 380px"
                          className={`w-full h-full object-cover select-none transition-transform duration-700 ease-out ${
                            isHovered ? "scale-[1.035]" : "scale-100"
                          } ${
                            isActive ? "brightness-100" : "brightness-[0.82]"
                          }`}
                        />

                        {/* Bottom Gradient for In-Card Category & Title Overlay */}
                        <div
                          aria-hidden="true"
                          className={`absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent transition-opacity duration-500 ${
                            isActive ? "opacity-95" : "opacity-75"
                          }`}
                        />

                        {/* In-Card Category & Title Caption (Visible on Active & Neighboring Cards like Reference) */}
                        <div
                          className={`absolute inset-x-0 bottom-0 p-4 sm:p-5 flex flex-col gap-0.5 transition-opacity duration-500 ${
                            isActive ? "opacity-100" : "opacity-85"
                          }`}
                        >
                          <span className="text-[8.5px] sm:text-[9px] font-mono tracking-[0.22em] uppercase text-[#ff3b3b]">
                            {item.category}
                          </span>
                          <span className="text-[clamp(12px,1.05vw,16px)] font-normal tracking-[0.03em] text-white truncate">
                            {item.title}
                          </span>
                        </div>

                        {/* Thin Crimson Edge Lighting (1px Specular Rim) */}
                        <div
                          aria-hidden="true"
                          className={`pointer-events-none absolute inset-0 rounded-[14px] border transition-colors duration-500 ${
                            isActive
                              ? "border-[#ff2e2e]/90 shadow-[inset_0_0_16px_rgba(255,35,35,0.32)]"
                              : isHovered
                              ? "border-[#ff2e2e]/65"
                              : "border-white/15"
                          }`}
                        />

                        {/* Concentrated Crimson Bottom Edge Glint */}
                        <div
                          aria-hidden="true"
                          className={`pointer-events-none absolute -bottom-[1px] left-[8%] right-[12%] h-[2px] bg-gradient-to-r from-transparent via-[#ff3b3b] to-transparent transition-opacity duration-500 ${
                            isActive
                              ? "opacity-100"
                              : isHovered
                              ? "opacity-75"
                              : "opacity-30"
                          }`}
                        />
                      </button>

                      {/* Local Restrained Reflection Directly Beneath Each Panel */}
                      <div
                        aria-hidden="true"
                        style={{
                          height: `${Math.round(vp.cardHeight * 0.22)}px`,
                        }}
                        className="pointer-events-none relative w-full mt-2 overflow-hidden rounded-t-[14px] select-none"
                      >
                        {/* Local Crimson Floor Glow Spot Directly Under the Panel Base */}
                        <div
                          className={`absolute -top-2 left-[10%] right-[10%] h-5 rounded-full bg-[#ff1e1e] blur-[12px] transition-opacity duration-500 ${
                            isActive ? "opacity-60" : "opacity-20"
                          }`}
                        />

                        {/* Mirrored Image Reflection Fading Rapidly Into #050505 */}
                        <div className="w-full h-full opacity-75 portfolio-reflection-mask">
                          <Image
                            src={item.imageSrc}
                            alt=""
                            width={item.width}
                            height={item.height}
                            loading="lazy"
                            draggable={false}
                            sizes="260px"
                            className="w-full h-auto object-cover -scale-y-100 blur-[1.5px] brightness-75"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3. Bottom Bar: Active Project Info (Left) + Prev / Counter / Next Controls (Right) */}
        <div className="w-full pt-4 border-t border-white/[0.09] flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          {/* Active Project Category & Title Readout */}
          <div className="flex flex-col gap-1 items-center sm:items-start text-center sm:text-left">
            {activeItem ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff2a2a] shadow-[0_0_8px_2px_rgba(255,35,35,0.95)]" />
                  <span className="text-[10px] font-mono tracking-[0.22em] uppercase text-white/60">
                    {activeItem.category}
                  </span>
                  <span className="text-white/25">/</span>
                  <span className="text-xs sm:text-sm font-normal tracking-[0.04em] text-white">
                    {activeItem.title}
                  </span>
                </div>
                <p className="text-[11px] font-light text-white/45 max-w-[60ch] line-clamp-1">
                  {activeItem.description}
                </p>
              </>
            ) : (
              <span className="text-xs font-light text-white/50">
                No active project selected
              </span>
            )}
          </div>

          {/* Prev / Counter / Next Controls */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={goPrev}
              disabled={totalItems <= 1}
              aria-label="Previous portfolio item"
              className="group inline-flex items-center gap-2.5 px-3.5 py-2 border border-white/15 bg-white/[0.02] hover:border-[#ff2a2a]/70 hover:bg-[#ff2a2a]/10 disabled:opacity-35 disabled:pointer-events-none text-[10px] font-medium tracking-[0.22em] uppercase text-white/85 hover:text-white transition-all cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#ff2a2a]"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-0.5">
                ←
              </span>
              <span>PREV</span>
            </button>

            <div
              aria-live="polite"
              aria-atomic="true"
              className="min-w-[68px] text-center font-mono text-xs tracking-[0.24em] text-white/80"
            >
              <span className="text-white font-medium">{formattedIndex}</span>
              <span className="mx-1.5 text-[#ff2a2a]">/</span>
              <span className="text-white/50">{formattedTotal}</span>
            </div>

            <button
              type="button"
              onClick={goNext}
              disabled={totalItems <= 1}
              aria-label="Next portfolio item"
              className="group inline-flex items-center gap-2.5 px-3.5 py-2 border border-white/15 bg-white/[0.02] hover:border-[#ff2a2a]/70 hover:bg-[#ff2a2a]/10 disabled:opacity-35 disabled:pointer-events-none text-[10px] font-medium tracking-[0.22em] uppercase text-white/85 hover:text-white transition-all cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#ff2a2a]"
            >
              <span>NEXT</span>
              <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                →
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
