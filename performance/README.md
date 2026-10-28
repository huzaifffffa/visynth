# VISYNTH scroll responsiveness traces

## Method

- Build: Next.js 16.4.2 production output (`next build --webpack`)
- Browser: installed Google Chrome, headless mode, 1440 × 900 viewport
- Page: local production server at `http://127.0.0.1:3100`
- Preloader: marked as already seen before measurement so its intentional body lock does not contaminate the scroll trace
- Visuals under test: the complete `CinematicExperience`, GSAP timeline, ScrollTrigger pin/scrub behavior, canvas frame sequence, navigation, and section effects remain active
- Wheel workload: 18 wheel events, 90 px each, 18 ms apart
- Touch workload: five upward touch swipes, eight move events per swipe
- Keyboard workload: 18 `ArrowDown` key presses
- Profile isolation: each trace uses a fresh Chrome profile

Load either `.json.gz` file directly in Chrome DevTools → Performance.

## Results

| Measure | Before | After | Result |
| --- | ---: | ---: | --- |
| Wheel scroll at final input | 1,638 px | 1,620 px | — |
| Wheel settled position | 1,701 px after 600 ms | 1,620 px immediately | Removed delayed wheel catch-up |
| Wheel presentation latency, p50 | 46.93 ms | 35.08 ms | 25.2% lower |
| Wheel presentation latency, p95 | 66.87 ms | 76.19 ms | 13.9% higher; lab variance remains |
| Touch scroll at release | 2,803 px | 2,125 px | — |
| Touch settled position | 3,278 px after 600 ms | 2,125 px immediately | Removed post-release synthetic catch-up in this run |
| Touch gesture-update latency, p50 | 18.83 ms | 22.95 ms | 21.9% higher; not a latency win |
| Touch gesture-update latency, p95 | 39.21 ms | 44.42 ms | 13.3% higher; not a latency win |
| Animation frames longer than 20 ms | 288 | 168 | 41.7% fewer raw occurrences |

Absolute scroll distances are not directly comparable because removing Lenis changes scroll physics from a transformed virtual target to the browser's native delta. The relevant responsiveness signal is whether `scrollY` continues to chase a target after the input ends. In the after trace, wheel and touch positions are stable at the first post-input sample.

The after trace also contains cold image-decode and Chrome/CDP stalls, including long tasks unrelated to the removed scroll transport. For that reason, the trace does **not** support a blanket claim that every latency percentile improved. It does support the narrower fix: native input no longer waits for Lenis interpolation or Lenis's GSAP ticker to catch up.

## Source changes under test

- `src/components/CinematicExperience.tsx`
  - Removed Lenis construction, wheel/touch interception, GSAP ticker integration, and lifecycle calls.
  - Kept ScrollTrigger with native viewport scrolling and `scrub: true`.
  - Kept section navigation through native `window.scrollTo`.
  - Schedules a single coalesced canvas RAF only when ScrollTrigger progress selects a new frame.
- `src/app/globals.css`
  - Removed Lenis CSS.
  - Declared `touch-action: pan-y pinch-zoom` on the root scroll surface.
  - Removed the global vertical overscroll suppression after the preloader.
- `package.json` and `package-lock.json`
  - Removed the Lenis dependency.
- `src/components/SitePreloader.tsx`
  - Preserved its temporary scroll lock while avoiding the existing synchronous effect-state lint failure.

## Verification boundary

Chrome DevTools Protocol can reproduce wheel, emulated touch, and keyboard paths, but it cannot generate a physical precision-touchpad gesture or a real touchscreen swipe. Final acceptance still requires a short device pass on the target laptop and touchscreen hardware. These traces must not be presented as physical-device verification.
