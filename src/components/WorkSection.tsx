"use client";

import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { PORTFOLIO_ITEMS } from "@/data/portfolioItems";
import { FEATURED_WORK_IDS } from "@/data/featuredWork";
import { WorksWheel, type WorksWheelHandle } from "./ui/works-wheel";
import { LuxuryCarouselCard } from "./ui/LuxuryCarouselCard";

interface WorkSectionProps {
  sectionRef: React.RefObject<HTMLElement | null>;
  wheelRef: React.RefObject<WorksWheelHandle | null>;
  onSeek: (progress: number) => void;
  onNavigateContact: () => void;
}
const projects = FEATURED_WORK_IDS.flatMap(id => {
  const project = PORTFOLIO_ITEMS.find(item => item.id === id);
  return project ? [project] : [];
}).slice(0, 8);
const wheelItems = projects.map(project => ({
  id: project.id,
  title: project.title,
  category: project.category,
  discipline: project.discipline,
  serviceProvided: project.serviceProvided,
  projectType: project.projectType,
  image: project.imageSrc,
  alt: project.imageAlt,
  video: project.videoSrc,
  cleanCard: project.cleanCard,
}));

export const WorkSection = React.memo(function WorkSection({ sectionRef, wheelRef, onSeek, onNavigateContact }: WorkSectionProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [focusPreview, setFocusPreview] = useState(false);
  const [activation, setActivation] = useState(0);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previewRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const preview = previewIndex === null ? null : projects[previewIndex];

  // Pre-decode all 8 featured portfolio card images into GPU-ready bitmap cache on idle
  // so transitioning from Skills -> Work never stalls on synchronous image decoding.
  React.useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      projects.forEach((proj, idx) => {
        window.setTimeout(() => {
          if (cancelled) return;
          const img = new window.Image();
          img.decoding = "async";
          img.src = proj.imageSrc;
          if (typeof img.decode === "function") {
            img.decode().catch(() => {});
          }
        }, idx * 45);
      });
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);
  const dismiss = useCallback(() => {
    if (previewRef.current?.contains(document.activeElement)) {
      (openerRef.current ?? sectionRef.current?.querySelector<HTMLButtonElement>('.works-wheel-index button[aria-pressed="true"]'))?.focus({ preventScroll: true });
    }
    setPreviewOpen(false);
  }, [sectionRef]);
  const showPreview = (index: number) => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setPreviewIndex(index);
    const proj = projects[index]; const initialIdx = proj?.galleryImages && proj.imageSrc ? Math.max(0, proj.galleryImages.indexOf(proj.imageSrc)) : 0; setActiveGalleryIdx(initialIdx);
    setFocusPreview(true);
    setPreviewOpen(true);
    setActivation(value => value + 1);
  };
  useLayoutEffect(() => {
    const dialog = previewRef.current;
    if (!previewOpen) {
      const timer = window.setTimeout(() => dialog?.close(), window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 250);
      return () => window.clearTimeout(timer);
    }
    if (dialog && !dialog.open) dialog.showModal();
    // Flush the visible state before focusing, including a rapid reopen while
    // the previous visibility transition is still settling.
    if (dialog) dialog.style.visibility = 'visible';
    if (focusPreview) closeRef.current?.focus({ preventScroll: true });
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); dismiss(); }
      if (event.key !== 'Tab') return;
      const controls = Array.from(previewRef.current?.querySelectorAll<HTMLElement>('button, a[href], input[type="range"]') ?? []);
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener('keydown', handleKey);
    const handleSectionChange = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== 'work') dismiss();
    };
    window.addEventListener('visynth:active-section', handleSectionChange);
    return () => { dialog?.style.removeProperty('visibility'); window.removeEventListener('visynth:active-section', handleSectionChange); window.removeEventListener('keydown', handleKey); };
  }, [previewOpen, previewIndex, focusPreview, activation, dismiss]);

  return <section ref={sectionRef} id="work" aria-label="Selected work" className="orbit-work absolute inset-0 z-20 opacity-0 pointer-events-none will-change-[opacity]" onKeyDown={event => { if (event.key === "Escape") dismiss(); }}>
    <div className="wheel-section-heading"><span>VISYNTH / SELECTED WORK</span><span>{String(projects.length).padStart(2,"0")} PROJECTS</span></div>
    <WorksWheel ref={wheelRef} items={wheelItems} onPreview={showPreview} onSelect={onSeek} label="Selected studio work." />
    <div className="orbit-footer"><span /><button type="button" onClick={onNavigateContact}>Have a project in mind? ↗</button></div>
    {preview && (
      <dialog
        ref={previewRef}
        className="project-editorial-backdrop"
        data-open={previewOpen}
        aria-hidden={!previewOpen}
        inert={!previewOpen}
        role="dialog"
        aria-modal="true"
        aria-label={`${preview.title} preview`}
        onCancel={event => { event.preventDefault(); dismiss(); }}
        onClick={(e) => {
          if (e.target === e.currentTarget) dismiss();
        }}
      >
        <div
          className={`project-editorial-modal ${
            preview.galleryImages && preview.galleryImages.length > 1
              ? "project-editorial-modal--gallery"
              : ""
          }`}
        >
          {/* Floating Close Button: Top-Right of the middle modal */}
          <button
            ref={closeRef}
            type="button"
            onClick={dismiss}
            aria-label="Close project preview"
            className="project-editorial-close"
          >
            <span aria-hidden="true">×</span>
          </button>

          {/* Large Project Number in the Back (e.g. "02") */}
          <span className="project-editorial-bg-num" aria-hidden="true">
            {String((previewIndex ?? 0) + 1).padStart(2, "0")}
          </span>

          {/* Left: Either Multi-Picture Campaign Gallery (e.g. AUMÉ Naturals) or Luxury Card */}
          {preview.galleryImages && preview.galleryImages.length > 1 ? (
            <div className="flex flex-col sm:flex-row items-center gap-3 z-10 shrink-0">
              {/* Primary Active Picture */}
              <div className="relative w-[min(255px,76vw)] h-[min(340px,46vh)] sm:w-[270px] sm:h-[360px] rounded-[24px] overflow-hidden bg-[#07080a] border border-white/20 shadow-[0_18px_40px_rgba(0,0,0,0.85)]">
                <Image
                  src={preview.galleryImages[activeGalleryIdx] || preview.imageSrc}
                  alt={`${preview.title} — Creative ${activeGalleryIdx + 1}`}
                  fill
                  sizes="(max-width: 768px) 80vw, 320px"
                  className="object-cover"
                />
                {/* Prev / Next Controls */}
                <div className="absolute inset-x-2.5 bottom-2.5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveGalleryIdx((prev) =>
                        (prev - 1 + preview.galleryImages!.length) %
                        preview.galleryImages!.length
                      )
                    }
                    aria-label="Previous image"
                    className="w-7 h-7 rounded-full bg-black/70 hover:bg-black/90 border border-white/25 text-white text-sm flex items-center justify-center cursor-pointer transition-colors"
                  >
                    ‹
                  </button>
                  <span className="px-2.5 py-0.5 rounded-full bg-black/70 border border-white/20 text-[10px] font-mono tabular-nums text-white/90">
                    {String(activeGalleryIdx + 1).padStart(2, "0")} /{" "}
                    {String(preview.galleryImages.length).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveGalleryIdx(
                        (prev) => (prev + 1) % preview.galleryImages!.length
                      )
                    }
                    aria-label="Next image"
                    className="w-7 h-7 rounded-full bg-black/70 hover:bg-black/90 border border-white/25 text-white text-sm flex items-center justify-center cursor-pointer transition-colors"
                  >
                    ›
                  </button>
                </div>
              </div>

              {/* Companion Pictures Column (shows the two other pictures & all 3 for instant switching) */}
              <div className={(preview.galleryImages?.length ?? 0) > 3 ? "flex sm:grid sm:grid-cols-2 gap-2 max-h-[360px] overflow-x-auto sm:overflow-y-auto pr-1 max-w-[min(265px,78vw)] sm:max-w-none" : "flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-visible max-w-[min(265px,78vw)] sm:max-w-none"}>
                {preview.galleryImages.map((imgUrl, idx) => {
                  const isCurrent = idx === activeGalleryIdx;
                  return (
                    <button
                      key={imgUrl}
                      type="button"
                      onClick={() => setActiveGalleryIdx(idx)}
                      aria-label={`View campaign image ${idx + 1}`}
                      aria-pressed={isCurrent}
                      className={`relative rounded-[14px] overflow-hidden bg-[#07080a] border transition-all cursor-pointer shrink-0 ${(preview.galleryImages?.length ?? 0) > 3 ? "w-[66px] h-[88px] sm:w-[74px] sm:h-[96px]" : "w-[78px] h-[102px] sm:w-[86px] sm:h-[112px]"} ${
                        isCurrent
                          ? "border-[#ff2a2a] ring-2 ring-[#ff2a2a]/50 scale-[1.03] opacity-100"
                          : "border-white/20 opacity-75 hover:opacity-100 hover:border-white/45"
                      }`}
                    >
                      <Image
                        src={imgUrl}
                        alt={`${preview.title} thumbnail ${idx + 1}`}
                        fill
                        sizes="110px"
                        className="object-cover"
                      />
                      <span className="absolute bottom-1 right-1.5 px-1.5 py-0.2 rounded bg-black/75 text-[9px] font-mono text-white/90">
                        0{idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="project-editorial-card-wrapper">
              <LuxuryCarouselCard
                item={{
                  id: preview.id,
                  title: preview.title,
                  verticalTitle:
                    preview.title === "Obsidian Sentinel Study"
                      ? "Obsidian"
                      : preview.title.split(" ")[0],
                  category: preview.category,
                  badge: preview.projectType,
                  imageSrc: preview.imageSrc,
                  imageAlt: preview.imageAlt,
                  videoSrc: preview.videoSrc,
                  cleanCard: preview.cleanCard,
                  discipline: preview.discipline,
                  scope: preview.serviceProvided,
                  projectType: preview.projectType,
                  ctaText: "Discuss a similar project",
                }}
                isActive={true}
                showVideoControls={true}
                replayKey={activation}
                isModalOpen={previewOpen}
                onExplore={() => {
                  dismiss();
                  onNavigateContact();
                }}
              />
            </div>
          )}

          {/* Right: Project Information */}
          <div className="project-editorial-info">
            <div className="flex items-center gap-2 mb-2">
              <span className="project-editorial-category">
                {preview.category}
              </span>
              <span className="text-white/20">·</span>
              <span className="text-[10px] font-mono tracking-wider uppercase text-white/50">
                {preview.projectType}
              </span>
            </div>

            <h3 className="project-editorial-title">{preview.title}</h3>

            <p className="project-editorial-description">
              {preview.description}
            </p>

            <dl className="project-editorial-meta">
              <div>
                <dt>Discipline</dt>
                <dd>{preview.discipline}</dd>
              </div>
              <div>
                <dt>Scope</dt>
                <dd>{preview.serviceProvided}</dd>
              </div>
            </dl>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              {preview.externalUrl && (
                <a
                  href={preview.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-editorial-link cursor-pointer"
                >
                  <span>{preview.externalLabel || "Visit Website"}</span>
                  <span aria-hidden="true">↗</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  dismiss();
                  onNavigateContact();
                }}
                className={
                  preview.externalUrl
                    ? "inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase px-5 py-2.5 rounded-full border border-white/25 hover:border-white/50 bg-white/[0.06] hover:bg-white/[0.12] text-white transition-colors cursor-pointer"
                    : "project-editorial-link cursor-pointer"
                }
              >
                <span>Inquire about project</span>
                <span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>
        </div>
      </dialog>
    )}
  </section>;
});
