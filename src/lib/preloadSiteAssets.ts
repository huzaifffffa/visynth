"use client";

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
let revealReadyResolved = false;
const revealReadyCallbacks: (() => void)[] = [];
let hasCompletedSessionPreload = false;

export function getSharedFrames(): (HTMLImageElement | null)[] {
  return sharedImages;
}

export function getSharedFrameStates(): Uint8Array {
  return sharedFrameStates;
}

export function hasSessionPreloadCompleted(): boolean {
  if (hasCompletedSessionPreload) return true;
  if (typeof window !== "undefined") {
    try {
      if (
        window.sessionStorage.getItem("visynth_seen_v4") === "true" ||
        document.documentElement.classList.contains("visynth-preloaded")
      ) {
        hasCompletedSessionPreload = true;
        return true;
      }
    } catch {}
  }
  return false;
}

export function markSessionPreloadCompleted(): void {
  hasCompletedSessionPreload = true;
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem("visynth_seen_v4", "true");
      document.documentElement.classList.add("visynth-preloaded");
    } catch {}
  }
}

// Lock the frame variant (desktop vs mobile) once per session so shared cache keys match
let cachedFrameFolder: "/frames" | "/frames-mobile" | null = null;

export function getFrameUrl(indexZeroBased: number): string {
  const clamped = Math.min(
    TOTAL_SEQUENCE_FRAMES,
    Math.max(1, indexZeroBased + 1)
  );
  if (!cachedFrameFolder) {
    cachedFrameFolder =
      typeof window !== "undefined" && window.innerWidth <= 768
        ? "/frames-mobile"
        : "/frames";
  }
  return `${cachedFrameFolder}/frame_${String(clamped).padStart(3, "0")}.webp`;
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

export function waitForExperienceReady(timeoutMs = 5000): Promise<void> {
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

export function notifyRevealReady(): void {
  revealReadyResolved = true;
  const cbs = revealReadyCallbacks.splice(0);
  for (const cb of cbs) {
    cb();
  }
}

export function waitForRevealReady(timeoutMs = 500): Promise<void> {
  if (revealReadyResolved) {
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      resolve();
    }, timeoutMs);
    revealReadyCallbacks.push(() => {
      clearTimeout(timer);
      resolve();
    });
  });
}

function isConstrainedConnectionOrMobile(): {
  isSlowNetwork: boolean;
  isMobileViewport: boolean;
  concurrency: number;
} {
  if (typeof window === "undefined") {
    return { isSlowNetwork: false, isMobileViewport: false, concurrency: 3 };
  }
  const nav = window.navigator as Navigator & {
    deviceMemory?: number;
    connection?: {
      saveData?: boolean;
      effectiveType?: string;
      downlink?: number;
    };
  };
  const cores = nav.hardwareConcurrency || 4;
  const memory = nav.deviceMemory || 4;
  const conn = nav.connection;
  const effectiveType = conn?.effectiveType;
  const downlink = conn?.downlink ?? 10;

  const isSlowNetwork =
    Boolean(conn?.saveData) ||
    effectiveType === "slow-2g" ||
    effectiveType === "2g" ||
    effectiveType === "3g" ||
    downlink < 2.5;

  const isMobileViewport =
    window.innerWidth < 768 ||
    window.matchMedia("(pointer: coarse)").matches;

  const concurrency =
    isSlowNetwork || cores <= 2 || memory <= 2
      ? 2
      : isMobileViewport
      ? 2
      : 3;

  return { isSlowNetwork, isMobileViewport, concurrency };
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
 * Fill any failed frame slots with the nearest loaded fallback frame
 * so the canvas never encounters a broken image, while leaving FRAME_UNLOADED
 * slots untouched so CinematicExperience's progressive loader can load them.
 */
export function assignFallbackFrames(): void {
  for (let i = 0; i < TOTAL_SEQUENCE_FRAMES; i++) {
    if (sharedFrameStates[i] !== FRAME_FAILED || sharedImages[i]) continue;
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
 * Build a selective initial priority list for the preloader on `/` so initial page weight
 * stays lean on desktop, mobile, Slow 4G, and 3G while guaranteeing immediate hero & keyframe readiness.
 * Remaining frames are loaded progressively by CinematicExperience around the user's scroll position.
 */
function buildInitialPreloadFrames(
  prefersReducedMotion: boolean,
  isSlowNetwork: boolean,
  isMobileViewport: boolean
): number[] {
  if (prefersReducedMotion || isSlowNetwork || isMobileViewport) {
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

  // Frame 0 + Section anchor keyframes
  push(0);
  for (const kf of REDUCED_MOTION_KEYFRAMES) push(kf);

  // Opening hero scrub frames (lightweight set for mobile vs desktop)
  const openingCount = isMobileViewport ? 6 : 14;
  for (let i = 1; i <= openingCount; i++) {
    push(i);
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
 * 2. On `/` only: Hero frame (/frames/frame_001.webp) + selective opening/anchor frames + Canvas/GSAP readiness
 * 3. Window load state as additional readiness signal
 * With a hard safety timeout (default 15,000ms) so the site never hangs.
 */
export function preloadSiteAssets(
  options: PreloadControllerOptions
): { promise: Promise<PreloadResult>; cancel: () => void } {
  let isCancelled = false;
  const safetyTimeoutMs = options.safetyTimeoutMs ?? 15000;

  const cancel = () => {
    isCancelled = true;
    // Reset any in-flight loading state back to unloaded so CinematicExperience can pick them up cleanly
    for (let i = 0; i < TOTAL_SEQUENCE_FRAMES; i++) {
      if (sharedFrameStates[i] === FRAME_LOADING && !sharedImages[i]) {
        sharedFrameStates[i] = FRAME_UNLOADED;
      }
    }
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

    const safetyTimer = setTimeout(() => {
      finalize(true);
    }, safetyTimeoutMs);

    const runAllChecks = async () => {
      const isHomeRoute =
        options.pathname === "/" || options.pathname === "";

      // 1. Critical Font Readiness
      const fontsPromise =
        typeof document !== "undefined" &&
        document.fonts &&
        document.fonts.ready
          ? Promise.race([
              document.fonts.ready.catch(() => undefined),
              new Promise((r) => setTimeout(r, 2500)),
            ])
          : Promise.resolve();

      // 2. Window load signal (non-blocking fallback if already complete)
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
              }, 2500);
            });

      // On subpages (/portfolio, /privacy-policy, /copyright), do NOT download the 300-frame home canvas sequence
      if (!isHomeRoute) {
        await Promise.allSettled([fontsPromise, windowLoadPromise]);
        clearTimeout(safetyTimer);
        if (!isCancelled) {
          finalize(false);
        }
        return;
      }

      const { isSlowNetwork, isMobileViewport, concurrency } =
        isConstrainedConnectionOrMobile();

      // 3. First Hero Frame on Home Route
      const firstFramePromise = loadSequenceFrame(0, !isSlowNetwork).then(
        (img) => {
          if (img) {
            loadedFramesCount++;
            if (!isCancelled && options.onFirstFrameLoaded) {
              options.onFirstFrameLoaded(img);
            }
          } else {
            failedFramesCount++;
          }
          return img;
        }
      );

      await Promise.allSettled([fontsPromise, firstFramePromise]);

      if (isCancelled || resolved) {
        clearTimeout(safetyTimer);
        return;
      }

      // 4. Controlled Concurrency Queue for Selective Initial Frames (yields between decodes to avoid main-thread long tasks)
      const frameOrder = buildInitialPreloadFrames(
        options.prefersReducedMotion,
        isSlowNetwork,
        isMobileViewport
      );
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
          // Yield briefly between decodes so main-thread tasks stay well under 50ms
          await new Promise((r) => setTimeout(r, 12));
          if (isCancelled || resolved) break;
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
      const experiencePromise = waitForExperienceReady(4000);

      await Promise.allSettled([
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
