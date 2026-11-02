"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

export interface LuxuryCardData {
  id?: string;
  title: string;
  verticalTitle?: string;
  category: string;
  badge?: string;
  imageSrc: string;
  imageAlt?: string;
  videoSrc?: string;
  cleanCard?: boolean;
  discipline?: string;
  scope?: string;
  projectType?: string;
  ctaText?: string;
}

interface LuxuryCarouselCardProps {
  item: LuxuryCardData;
  isActive?: boolean;
  isHovered?: boolean;
  onExplore?: () => void;
  showVideoControls?: boolean;
  replayKey?: number;
  isModalOpen?: boolean;
  className?: string;
}

function formatVideoTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function LuxuryCarouselCard({
  item,
  isActive = false,
  isHovered = false,
  onExplore,
  showVideoControls = false,
  replayKey = 0,
  isModalOpen = true,
  className = "",
}: LuxuryCarouselCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(!showVideoControls);
  const [volume, setVolume] = useState(0.85);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [durationSec, setDurationSec] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !item.videoSrc) return;

    if (!showVideoControls) {
      video.muted = true;
      setIsMuted(true);
      video.play().catch(() => {});
      return;
    }

    if (!isModalOpen) {
      video.pause();
      setIsPlaying(false);
      return;
    }

    // Replay from 0:00 with audio enabled when clicked/opened
    video.currentTime = 0;
    video.volume = volume;
    video.muted = false;
    setIsMuted(false);
    video
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(() => {
        video.muted = true;
        setIsMuted(true);
        video.play().catch(() => {});
      });
  }, [item.videoSrc, showVideoControls, replayKey, isModalOpen]);

  // Video-only card mode:
  // - In the carousel (`!showVideoControls`): ONLY the video plays inside the card with nothing else on the card.
  // - When clicked (`showVideoControls`): replays from start and provides full playback controls (Play/Pause, Replay, Volume, Mute, Seekbar, Fullscreen).
  if (item.videoSrc) {
    const togglePlay = (e: React.MouseEvent) => {
      if (!showVideoControls) return;
      e.stopPropagation();
      const video = videoRef.current;
      if (!video) return;
      if (video.paused) {
        video.play().catch(() => {});
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    };

    const handleReplay = (e: React.MouseEvent) => {
      e.stopPropagation();
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = 0;
      video.play().catch(() => {});
      setIsPlaying(true);
    };

    const toggleMute = (e: React.MouseEvent) => {
      e.stopPropagation();
      const video = videoRef.current;
      if (!video) return;
      const nextMuted = !video.muted;
      video.muted = nextMuted;
      setIsMuted(nextMuted);
      if (!nextMuted && video.volume === 0) {
        video.volume = 0.85;
        setVolume(0.85);
      }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      const nextVol = parseFloat(e.target.value);
      setVolume(nextVol);
      const video = videoRef.current;
      if (!video) return;
      video.volume = nextVol;
      video.muted = nextVol === 0;
      setIsMuted(nextVol === 0);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      const nextPct = parseFloat(e.target.value);
      setProgress(nextPct);
      const video = videoRef.current;
      if (!video || !video.duration) return;
      video.currentTime = (nextPct / 100) * video.duration;
    };

    const handleFullscreen = (e: React.MouseEvent) => {
      e.stopPropagation();
      const video = videoRef.current;
      if (!video) return;
      if (video.requestFullscreen) {
        video.requestFullscreen().catch(() => {});
      }
    };

    return (
      <div
        className={`relative w-full h-full rounded-[28px] sm:rounded-[32px] overflow-hidden bg-[#07080a] border border-white/20 select-none transform-gpu ${
          isActive
            ? "shadow-[0_18px_40px_rgba(0,0,0,0.85)] ring-1 ring-white/25"
            : isHovered
            ? "shadow-[0_16px_36px_rgba(0,0,0,0.8)]"
            : "shadow-[0_12px_28px_rgba(0,0,0,0.75)]"
        } ${className}`}
      >
        <video
          ref={videoRef}
          src={item.videoSrc}
          autoPlay
          loop
          muted={!showVideoControls}
          playsInline
          preload="metadata"
          onClick={showVideoControls ? togglePlay : undefined}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadedMetadata={(e) => {
            setDurationSec(e.currentTarget.duration || 0);
          }}
          onTimeUpdate={(e) => {
            if (!showVideoControls) return;
            const v = e.currentTarget;
            setCurrentTime(v.currentTime);
            if (v.duration > 0) {
              setProgress((v.currentTime / v.duration) * 100);
            }
          }}
          className="w-full h-full object-cover block"
        />

        {showVideoControls && (
          <div
            className="absolute inset-x-0 bottom-0 z-20 p-3 sm:p-3.5 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Interactive Scrubber & Timecode */}
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={100}
                step={0.1}
                value={progress}
                onChange={handleSeek}
                aria-label="Seek video timeline"
                className="w-full h-1 accent-[#ff2a2a] bg-white/25 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-mono tabular-nums text-white/80 shrink-0">
                {formatVideoTime(currentTime)} / {formatVideoTime(durationSec)}
              </span>
            </div>

            {/* Playback & Volume Controls Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {/* Play / Pause */}
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause video" : "Play video"}
                  title={isPlaying ? "Pause" : "Play"}
                  className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white text-xs cursor-pointer transition-colors"
                >
                  {isPlaying ? "❚❚" : "▶"}
                </button>

                {/* Replay from start */}
                <button
                  type="button"
                  onClick={handleReplay}
                  aria-label="Replay video from start"
                  title="Replay"
                  className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white text-xs cursor-pointer transition-colors"
                >
                  ↺
                </button>

                {/* Mute / Unmute */}
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? "Unmute video" : "Mute video"}
                  title={isMuted ? "Unmute" : "Mute"}
                  className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white text-xs cursor-pointer transition-colors"
                >
                  {isMuted || volume === 0 ? "🔇" : "🔊"}
                </button>

                {/* Volume Slider */}
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  aria-label="Video volume"
                  className="w-16 sm:w-20 h-1 accent-[#ff2a2a] bg-white/25 rounded-lg cursor-pointer"
                />
              </div>

              {/* Fullscreen */}
              <button
                type="button"
                onClick={handleFullscreen}
                aria-label="Fullscreen video"
                title="Fullscreen"
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white text-xs cursor-pointer transition-colors"
              >
                ⛶
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Clean picture-only card mode (e.g. AUMÉ Naturals Picture 1 in the carousel):
  // Displays ONLY the artwork image inside the card with zero text or description overlays.
  if (item.cleanCard) {
    return (
      <div
        className={`relative w-full h-full rounded-[28px] sm:rounded-[32px] overflow-hidden bg-[#07080a] border border-white/20 select-none transform-gpu ${
          isActive
            ? "shadow-[0_18px_40px_rgba(0,0,0,0.85)] ring-1 ring-white/25"
            : isHovered
            ? "shadow-[0_16px_36px_rgba(0,0,0,0.8)]"
            : "shadow-[0_12px_28px_rgba(0,0,0,0.75)]"
        } ${className}`}
      >
        <Image
          src={item.imageSrc}
          alt={item.imageAlt || item.title}
          fill
          loading="eager"
          decoding="async"
          draggable={false}
          sizes="(max-width: 768px) 75vw, 360px"
          className={`object-cover ${isHovered ? "scale-[1.03]" : "scale-100"}`}
        />
      </div>
    );
  }

  const verticalTitle = item.verticalTitle || item.title.split(" ")[0];
  const badge = item.badge || "Studio project";
  const discipline = item.discipline || item.category;
  const scope = item.scope || "Design and production";
  const projectType = item.projectType || "Studio project";
  const ctaText = item.ctaText || "View project";

  return (
    <div
      className={`relative w-full h-full rounded-[28px] sm:rounded-[32px] overflow-hidden bg-[#07080a] border border-white/20 select-none transform-gpu ${
        isActive
          ? "shadow-[0_18px_40px_rgba(0,0,0,0.85)] ring-1 ring-white/25"
          : isHovered
          ? "shadow-[0_16px_36px_rgba(0,0,0,0.8)]"
          : "shadow-[0_12px_28px_rgba(0,0,0,0.75)]"
      } ${className}`}
    >
      {/* Background Project Artwork Image — eager async decode prevents transition stall */}
      <Image
        src={item.imageSrc}
        alt={item.imageAlt || item.title}
        fill
        loading="eager"
        decoding="async"
        draggable={false}
        sizes="(max-width: 768px) 75vw, 360px"
        className={`object-cover ${isHovered ? "scale-[1.03]" : "scale-100"}`}
      />

      {/* Ambient Gradient Overlays for contrast */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/15"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent"
      />

      <div
        className="absolute left-2.5 sm:left-4 top-2.5 sm:top-4 z-20 w-[94px] sm:w-[124px] rounded-[16px] sm:rounded-[22px] bg-[linear-gradient(155deg,rgba(46,50,60,0.84)_0%,rgba(18,20,26,0.88)_100%)] border border-white/25 p-2 sm:p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_24px_rgba(0,0,0,0.45)] flex flex-col gap-2 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-white/15 pb-2">
          <span className="block text-[6px] sm:text-[7px] uppercase tracking-[0.14em] text-white/50">Discipline</span>
          <span className="mt-0.5 block text-[7.5px] sm:text-[9px] font-medium leading-tight line-clamp-2">
            {discipline}
          </span>
        </div>
        <div className="border-b border-white/15 pb-2">
          <span className="block text-[6px] sm:text-[7px] uppercase tracking-[0.14em] text-white/50">Scope</span>
          <span className="mt-0.5 block text-[7.5px] sm:text-[9px] font-medium leading-tight line-clamp-2">
            {scope}
          </span>
        </div>
        <div>
          <span className="block text-[6px] sm:text-[7px] uppercase tracking-[0.14em] text-white/50">Type</span>
          <span className="mt-0.5 block text-[7.5px] sm:text-[9px] font-medium leading-tight line-clamp-2 text-white/90">
            {projectType}
          </span>
        </div>
      </div>

      {/* ===================================================================
          3. RIGHT VERTICAL BLACK SIDEBAR (Badge + Category + Giant Title)
          =================================================================== */}
      <div className="absolute top-0 right-0 bottom-0 z-20 w-[42px] sm:w-[58px] bg-[#08090c]/95 border-l border-white/15 flex flex-col justify-between items-center py-3 sm:py-5 px-1">
        {/* Project type */}
        <div className="flex items-center justify-center pt-0.5">
          <span className="[writing-mode:vertical-rl] rotate-180 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-white/20 bg-white/10 text-[6.5px] sm:text-[7.5px] font-mono tracking-wider uppercase text-white/85 whitespace-nowrap">
            {badge}
          </span>
        </div>

        {/* Middle Rotated Category / Subtitle */}
        <div className="flex-1 flex items-center justify-center my-1 sm:my-2">
          <span className="[writing-mode:vertical-rl] rotate-180 text-[7px] sm:text-[9px] font-mono tracking-[0.22em] uppercase text-white/50 whitespace-nowrap line-clamp-1">
            {item.category}
          </span>
        </div>

        {/* Bottom Giant Vertical Bold Title */}
        <div className="flex items-center justify-center pb-1.5 sm:pb-2">
          <span className="[writing-mode:vertical-rl] rotate-180 text-[clamp(16px,2vw,28px)] font-bold tracking-tight text-white whitespace-nowrap leading-none">
            {verticalTitle}
          </span>
        </div>
      </div>

      <div className="absolute left-2.5 sm:left-4 right-[48px] sm:right-[68px] bottom-2.5 sm:bottom-4 z-20 flex flex-col gap-1.5 sm:gap-2.5">
        <div className="text-white">
          <span className="block text-[7px] sm:text-[8px] font-mono tracking-[0.16em] uppercase text-white/60">
            {item.category}
          </span>
          <span className="mt-1 block text-[12px] sm:text-[15px] font-semibold leading-tight text-white line-clamp-2">
            {item.title}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onExplore) onExplore();
          }}
          className="w-full py-1.5 sm:py-2.5 px-2 sm:px-3 rounded-full bg-[linear-gradient(145deg,rgba(52,32,28,0.88)_0%,rgba(24,18,18,0.92)_100%)] hover:brightness-110 active:scale-[0.98] border border-white/30 flex items-center justify-center gap-1 sm:gap-1.5 text-[9.5px] sm:text-xs font-medium text-white transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_4px_16px_rgba(0,0,0,0.45)] cursor-pointer group/btn"
        >
          <span>{ctaText}</span>
          <span className="text-[10px] sm:text-sm transition-transform duration-300 group-hover/btn:translate-x-1">
            →
          </span>
        </button>
      </div>
    </div>
  );
}
