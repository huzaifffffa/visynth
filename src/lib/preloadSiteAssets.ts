"use client";

import { PORTFOLIO_ITEMS } from "@/data/portfolioItems";

export const TOTAL_SEQUENCE_FRAMES = 300;

export const FRAME_UNLOADED = 0;
export const FRAME_LOADING = 1;
export const FRAME_LOADED = 2;
export const FRAME_FAILED = 3;

export const REDUCED_MOTION_KEYFRAMES = [0, 93, 171, 240, 295];

// Shared module-level cache so SitePreloader and CinematicExperience reuse decoded HTMLImageElement instances
const sharedImages: (HTMLImageElement | null)[] = new Array(
  TOTAL_SEQUENCE_FRAMES
).fill(null);
const sharedFrameStates = new Uint8Array(TOTAL_SEQUENCE_FRAMES);

let experienceReadyResolved = false;
const experienceReadyCallbacks: (() => void)[] = [];
let hasCompletedSessionPreload = false;

export function getSharedFrames(): (HTMLImageElement | null)[] {
  return sharedImages;
}

export function getSharedFrameStates(): Uint8Array {
  return sharedFrameStates;
}

export function hasSessionPreloadCompleted(): boolean {
  return hasCompletedSessionPreload;
}

export function markSessionPreloadCompleted(): void {
  hasCompletedSessionPreload = true;
}

export function getFrameUrl(indexZeroBased: number): string {
  const clamped = Math.min(
    TOTAL_SEQUENCE_FRAMES,
    Math.max(1, indexZeroBased + 1)
  );
  return `/frames/frame_${String(clamped).padStart(3, "0")}.webp`;
}

/**
 * Signal from CinematicExperience (or subpages) that GSAP, ScrollTrigger,
 * canvas sizing, initial layout measurement, and initial hero frame render are complete.
 */
export function notifyExperienceReady(): void {
  experienceReadyResolved = true;
  const cbs = experienceReadyCallbacks.splice(0);
  for (const cb of cbs) {
    cb();
  }
}

export function waitForExperienceReady(timeoutMs = 6000): Promise<void> {
  if (experienceReadyResolved) {
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      resolve();
    }, timeoutMs);
    experienceReadyCallbacks.push(() => {
      clearTimeout(timer);
      resolve();
    });
  });
}

function getOptimalConcurrency(): number {
  if (typeof window === "undefined") return 6;
  const nav = window.navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  const cores = nav.hardwareConcurrency || 4;
  const memory = nav.deviceMemory || 4;
  const effectiveType = nav.connection?.effectiveType;
  const isSlowNetwork =
    Boolean(nav.connection?.saveData) ||
    effectiveType === "slow-2g" ||
    effectiveType === "2g" ||
    effectiveType === "3g";

  if (isSlowNetwork || cores <= 2 || memory <= 2) {
    return 4;
  }
  if (cores >= 8 && memory >= 8) {
    return 8;
  }
  return 6;
}

/**
 * Load and decode a single image URL with optional retry.
 */
export function loadAndDecodeImage(
  src: string,
  highPriority = false,
  retries = 1
): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(null);
      return;
    }

    const attempt = (remainingRetries: number) => {
      const img = new window.Image();
      img.decoding = "async";
      if (highPriority && "fetchPriority" in img) {
        (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority =
          "high";
      }
      img.src = src;

      img.onload = () => {
        if (typeof img.decode === "function") {
          img.decode().then(
            () => resolve(img),
            () => resolve(img)
          );
        } else {
          resolve(img);
        }
      };

      img.onerror = () => {
        if (remainingRetries > 0) {
          setTimeout(() => attempt(remainingRetries - 1), 180);
        } else {
          resolve(null);
        }
      };
    };

    attempt(retries);
  });
}

/**
 * Load a specific sequence frame into the shared cache, with retry.
 */
export async function loadSequenceFrame(
  frameIndex: number,
  highPriority = false
): Promise<HTMLImageElement | null> {
  if (frameIndex < 0 || frameIndex >= TOTAL_SEQUENCE_FRAMES) return null;
  if (
    sharedFrameStates[frameIndex] === FRAME_LOADED &&
    sharedImages[frameIndex]
  ) {
    return sharedImages[frameIndex];
  }

  sharedFrameStates[frameIndex] = FRAME_LOADING;
  const img = await loadAndDecodeImage(
    getFrameUrl(frameIndex),
    highPriority,
    1
  );

  if (img) {
    sharedImages[frameIndex] = img;
    sharedFrameStates[frameIndex] = FRAME_LOADED;
    return img;
  } else {
    sharedFrameStates[frameIndex] = FRAME_FAILED;
    return null;
  }
}

/**
 * Fill any failed or unloaded frame slots with the nearest loaded fallback frame
 * so the canvas never encounters a missing image.
 */
export function assignFallbackFrames(): void {
  for (let i = 0; i < TOTAL_SEQUENCE_FRAMES; i++) {
    if (sharedImages[i]) continue;
    for (let offset = 1; offset < TOTAL_SEQUENCE_FRAMES; offset++) {
      const prev = i - offset;
      if (prev >= 0 && sharedImages[prev]) {
        sharedImages[i] = sharedImages[prev];
        sharedFrameStates[i] = FRAME_LOADED;
        break;
      }
      const next = i + offset;
      if (next < TOTAL_SEQUENCE_FRAMES && sharedImages[next]) {
        sharedImages[i] = sharedImages[next];
        sharedFrameStates[i] = FRAME_LOADED;
        break;
      }
    }
  }
}

/**
 * Build a progressive priority order for all 300 frames:
 * 1. Frame 0 (hero frame)
 * 2. Section anchor keyframes
 * 3. Stride 8 -> Stride 4 -> Stride 2 -> Stride 1
 */
function buildFrameLoadOrder(prefersReducedMotion: boolean): number[] {
  if (prefersReducedMotion) {
    return [...REDUCED_MOTION_KEYFRAMES];
  }

  const seen = new Set<number>();
  const order: number[] = [];

  const push = (idx: number) => {
    if (idx >= 0 && idx < TOTAL_SEQUENCE_FRAMES && !seen.has(idx)) {
      seen.add(idx);
      order.push(idx);
    }
  };

  // Immediate opening frames & key anchors
  push(0);
  for (const kf of REDUCED_MOTION_KEYFRAMES) push(kf);
  for (let i = 0; i < 16; i++) push(i);

  // Progressive multi-resolution passes
  for (const stride of [8, 4, 2, 1]) {
    for (let i = 0; i < TOTAL_SEQUENCE_FRAMES; i += stride) {
      push(i);
    }
  }

  return order;
}

export interface PreloadControllerOptions {
  pathname: string;
  prefersReducedMotion: boolean;
  onFirstFrameLoaded?: (img: HTMLImageElement) => void;
  safetyTimeoutMs?: number;
}

export interface PreloadResult {
  timedOut: boolean;
  loadedFramesCount: number;
  failedFramesCount: number;
}

/**
 * Controlled readiness orchestrator that waits for:
 * 1. Critical fonts (document.fonts.ready)
 * 2. Brand logo & wordmark (/visynth-logo.png, /visynth-wordmark.png)
 * 3. Hero frame (/frames/frame_001.webp)
 * 4. Controlled queue of required sequence frames (or portfolio assets)
 * 5. GSAP / ScrollTrigger / Canvas initial layout & render readiness
 * 6. Window load state as additional readiness signal
 * With a hard safety timeout (default 15,000ms) so the site never hangs.
 */
export function preloadSiteAssets(
  options: PreloadControllerOptions
): { promise: Promise<PreloadResult>; cancel: () => void } {
  let isCancelled = false;
  const safetyTimeoutMs = options.safetyTimeoutMs ?? 15000;

  const cancel = () => {
    isCancelled = true;
  };

  const promise = new Promise<PreloadResult>((resolve) => {
    let resolved = false;
    let loadedFramesCount = 0;
    let failedFramesCount = 0;

    const finalize = (timedOut: boolean) => {
      if (resolved) return;
      resolved = true;
      assignFallbackFrames();
      resolve({
        timedOut,
        loadedFramesCount,
        failedFramesCount,
      });
    };

    // Hard safety timeout (15s default) ensures the website can never remain permanently locked
    const safetyTimer = setTimeout(() => {
      finalize(true);
    }, safetyTimeoutMs);

    const runAllChecks = async () => {
      // 1. Critical Font Readiness
      const fontsPromise =
        typeof document !== "undefined" &&
        document.fonts &&
        document.fonts.ready
          ? Promise.race([
              document.fonts.ready.catch(() => undefined),
              new Promise((r) => setTimeout(r, 3000)),
            ])
          : Promise.resolve();

      // 2. Critical Brand Assets (Logo & Wordmark)
      const brandAssetsPromise = Promise.allSettled([
        loadAndDecodeImage("/visynth-logo.png", true, 1),
        loadAndDecodeImage("/visynth-wordmark.png", true, 1),
      ]);

      // 3. First Hero Frame (Immediate High Priority)
      const firstFramePromise = loadSequenceFrame(0, true).then((img) => {
        if (img) {
          loadedFramesCount++;
          if (!isCancelled && options.onFirstFrameLoaded) {
            options.onFirstFrameLoaded(img);
          }
        } else {
          failedFramesCount++;
        }
        return img;
      });

      // Wait for initial critical assets first so network bandwidth isn't contended
      await Promise.allSettled([
        fontsPromise,
        brandAssetsPromise,
        firstFramePromise,
      ]);

      if (isCancelled || resolved) {
        clearTimeout(safetyTimer);
        return;
      }

      // 4. Portfolio Critical Assets (if on /portfolio, preload all portfolio cards; otherwise preload primary featured cards)
      const isPortfolioRoute = options.pathname.startsWith("/portfolio");
      const portfolioTargets = isPortfolioRoute
        ? PORTFOLIO_ITEMS.map((item) => item.imageSrc)
        : PORTFOLIO_ITEMS.slice(0, 3).map((item) => item.imageSrc);

      const portfolioPromise = Promise.allSettled(
        portfolioTargets.map((src) => loadAndDecodeImage(src, isPortfolioRoute, 1))
      );

      // 5. Controlled Concurrency Queue for Background Frame Sequence
      const frameOrder = buildFrameLoadOrder(options.prefersReducedMotion);
      const concurrency = getOptimalConcurrency();
      let cursor = 0;

      const runFrameWorker = async (): Promise<void> => {
        while (!isCancelled && !resolved && cursor < frameOrder.length) {
          const frameIdx = frameOrder[cursor++];
          if (
            sharedFrameStates[frameIdx] === FRAME_LOADED &&
            sharedImages[frameIdx]
          ) {
            continue;
          }
          const img = await loadSequenceFrame(frameIdx, false);
          if (img) {
            loadedFramesCount++;
          } else {
            failedFramesCount++;
          }
        }
      };

      const workers: Promise<void>[] = [];
      const workerCount = Math.min(concurrency, frameOrder.length);
      for (let w = 0; w < workerCount; w++) {
        workers.push(runFrameWorker());
      }

      const framesQueuePromise = Promise.allSettled(workers);

      // 6. Window load signal (non-blocking fallback if already complete)
      const windowLoadPromise =
        typeof document !== "undefined" && document.readyState === "complete"
          ? Promise.resolve()
          : new Promise<void>((res) => {
              if (typeof window === "undefined") {
                res();
                return;
              }
              const onLoad = () => {
                window.removeEventListener("load", onLoad);
                res();
              };
              window.addEventListener("load", onLoad, { once: true });
              setTimeout(() => {
                window.removeEventListener("load", onLoad);
                res();
              }, 3500);
            });

      // 7. Experience / Layout Readiness (GSAP, ScrollTrigger, Canvas initial frame on /)
      const isHomeRoute =
        options.pathname === "/" || options.pathname === "";
      const experiencePromise = isHomeRoute
        ? waitForExperienceReady(5000)
        : Promise.resolve();

      await Promise.allSettled([
        portfolioPromise,
        framesQueuePromise,
        windowLoadPromise,
        experiencePromise,
      ]);

      clearTimeout(safetyTimer);
      if (!isCancelled) {
        finalize(false);
      }
    };

    runAllChecks().catch(() => {
      clearTimeout(safetyTimer);
      finalize(false);
    });
  });

  return { promise, cancel };
}

