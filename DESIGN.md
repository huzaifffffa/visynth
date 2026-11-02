# VISYNTH local refinement

## Direction
Modern independent studio: black canvas, white typography, red for purposeful emphasis. Preserve the supplied logo and actual portfolio. Put graphic design and web development first in the copy while retaining the wider service offering.

## Type
Instrument Sans, bundled by next/font at build time. Variable weights support readable body text and medium-weight editorial headings. Sentence case, compact heading tracking, natural paragraph widths. Navigation and captions use proportional type. Browser zoom remains enabled.

## Composition
Selected Work integrates the user-supplied WorksWheel in src/components/ui/works-wheel.tsx, using the existing first eight featured projects. It opens as a ring and develops into the supplied vertical drum geometry (40-degree spacing, bowed trajectory, perspective culling). Cards contain images only. Existing project names appear outside the cards in the caption and index. No demo/CDN images or new dependencies are used.

The enlarged project view pairs an ivory editorial text panel with a dark artwork stage. Oversized real project titles, category, description and scope use existing portfolio data. Artwork remains uncropped in the enlarged view; wheel covers use object-cover as in the supplied component. Close, Escape, leaving the panel and page scrolling dismiss the preview with a CSS fade. Keyboard Enter opens it and moves focus to Close; dismissal returns focus to the project index. Touch opens on tap.

## Motion
The original component's wheel cancellation, drag interception, settling and perpetual requestAnimationFrame loop were removed. The page's existing GSAP master timeline directly sets one wheel turn value from t=47 to t=66. Index controls scroll the same master timeline to the corresponding project. Transforms are written directly to refs, with geometry measured by ResizeObserver only. No React state updates occur on scroll except dismissing an open preview.

The background hold/remapping has been removed. Canvas frames again follow full page progress 1:1. The 75% black veil reaches full strength before Work begins appearing at t=44.5 and stays at full strength through its complete exit at t=70.5. Section entrance and exit use sine easing. Reverse scrolling reverses the same timeline. Reduced motion selects a stationary front image with the same project index; no wheel/touch interception is used. Mobile keeps native vertical panning and pinch zoom.

## References
- https://gsap.com/docs/v3/Plugins/ScrollTrigger/ — direct scrub ties one coordinated timeline to native scroll progress.
- https://tympanus.net/codrops/2026/03/16/jonas-reymondins-portfolio-reclaiming-the-ui-eye-through-systems-code-and-pixel-motion/ — a single type family, strict grid and project-led color.
- https://tympanus.net/codrops/2026/06/29/inside-bisous-designing-an-editorial-experience-for-cinematic-cgi/ — editorial composition around cinematic work.
- https://github.com/Instrument/instrument-sans — Instrument Sans, SIL Open Font License. next/font self-hosts the generated font assets.

## Scope and validation
Local preview only. Legal routes, form delivery, navbar, preloader, and unrelated sections are preserved.

Verification (2026-10-29): Webpack production build including TypeScript, targeted ESLint for WorkSection/WorksWheel, and git diff whitespace checks passed. In-browser native scroll changed canvas frame 170 to 177 while wheel turn advanced from 4.209501 to 5.192393; reversing the same gesture restored frame 170 and exactly the same card transforms. The veil stayed at full strength through those samples. All eight card textContent values were empty. Ring-to-drum entrance, index navigation, Enter-to-preview, focus moving to Close, Escape returning focus to the active index, and the responsive phone layout were checked. Mobile had no horizontal page overflow and retained pan-y/pinch-zoom.

The supplied component's independent event cancellation, snap/easing loop and external demo assets are not included. No new package was required: the app already uses TypeScript, Tailwind, Next.js and GSAP. The reusable component lives under the existing src/components/ui convention.

Physical touchpad/touchscreen responsiveness and reduced-motion device settings have not been exercised; no FPS, INP, or production deployment claim is made.
