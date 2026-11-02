# VISYNTH implementation review — 1 November 2026

## Implemented

- Kept existing assets, content and black/crimson direction. Existing user changes were retained.
- Home-only intro now gates on first-frame/font readiness, allows a 1.2-second image fallback, has a 3-second safety timeout, skips repeat session loads and exits without waiting for story completion. Portfolio/legal routes no longer run the intro. Remaining sequence frames are owned by the existing progressive loader.
- Added form autocomplete, inline field errors, invalid-state associations and first-invalid focus. Existing POST delivery and success/failure states retained. Removed a duplicate status announcer.
- Added mobile drawer focus entry, Escape, focus restoration, background inertness and collapsed-link tab exclusion. Moved homepage navigation outside the main landmark so inertness does not disable the drawer.
- Portfolio discipline state uses native History API, restores on refresh/back/forward, and falls back to All Work for unknown values. Added roving tab focus, arrow/Home/End behavior, filter-scroll buttons and scoped gallery keyboard behavior.
- Portfolio image slots retain dimensions; only nearby artworks mount, reflection imagery stays decorative, and failed main artwork reveals a stable fallback. Only initial artwork gets priority.
- Project readout now groups supplied content as context, VISYNTH role, deliverables and focus. No undocumented outcomes or process claims added. Previous/next wrapping is named for assistive technology.
- Reduced mobile hero dead space, strengthened existing CTA, added a skip link and legal-page targets, replaced transition-all declarations, and added reduced-motion CSS and a basic no-JavaScript content fallback.

## Executed checks

Tests used real headless Chrome against this checkout at localhost:3111. The pre-existing localhost:3110 instance could not be reliably matched to this checkout.

- Homepage widths 320, 375, 414, 768, 1024 and 1440: no horizontal overflow; one h1; CTA within first viewport; no captured console errors.
- Latest complete run: first-visit intro hidden 1.44–2.42 seconds after DOMContentLoaded. These are development observations, not production Web Vitals or a controlled before/after benchmark.
- Repeat session reload: intro absent.
- Mobile drawer: focus entered HOME; main inert while open; Escape returned focus to trigger and removed inertness.
- Form metadata and inline errors confirmed. First-invalid focus passed earlier runs; the final script's immediate focus snapshot raced the scheduled animation frame. Success/failure tested with intercepted responses only; no inquiry transmitted.
- Portfolio at 375px: branding URL, refresh, back, forward, invalid-filter fallback, stable intrinsic image dimensions, no horizontal overflow and one h1 passed.
- Reduced motion released intro; failed first-frame request released content; JavaScript-disabled intro hidden and homepage heading available.
- TypeScript and targeted lint passed. Full-source lint and final TypeScript were also executed; see shell results for latest status.
- Production Webpack build passed compilation, TypeScript and static generation for all routes. Default Turbopack failed with an environment worker-process crash; an earlier restricted build failed fetching Google Fonts.

## Limits and follow-up

- No production form receipt verified. Mock responses validate UI state only.
- No controlled throttled-network waterfall, CLS/LCP/INP capture, full portfolio viewport matrix, physical touchpad/touchscreen or screen-reader testing completed. Do not infer those from source checks or Chrome viewport tests.
- Basic no-JavaScript fallback exposes core content/contact; cinematic work wheel and portfolio filters still require JavaScript.
- Actual project process documentation, outcomes and additional case-study media were not supplied. Current conceptual framing remains.
- Review final changes in the existing dirty worktree before committing. Do not describe the whole pre-existing diff as changes from this task.

## References

- Installed Next.js 16.4.2 guides: Image Optimization, Linking and Navigating (native History API), useSearchParams and Accessibility.
- [W3C tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/): keyboard and selected-state behavior.
- [Studio K95 benchmark](https://www.cssdesignawards.com/sites/studio-k95/49604): dark editorial studio direction; no third-party art or code incorporated.

Run locally: `npm run dev -- -p 3111`.
Build fallback: `npx next build --webpack`.
QA harness: `node scripts/qa-site.mjs` (uses the bundled local Playwright runtime and installed Chrome; adjust paths for another machine).
