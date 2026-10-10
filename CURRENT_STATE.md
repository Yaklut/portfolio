# Current State — Refa's Portfolio Website

**Last updated:** September 28, 2026 (post-launch feature round: Quick Wins + tool marquee — see "Post-launch feature round (Sep 2026)")

## Completed
- **Phase 1: Planning & Architecture** — ✅ complete. Full detail: `PHASE_1_PLANNING_ARCHITECTURE.md`
- **Phase 2: Design System** — ✅ complete, approved. Full detail: `DESIGN.md`
- **Phase 3: HTML Structure** — ✅ complete. Full semantic markup with real, verified content.
- **Phase 4: Main Styling & Sections** — ✅ complete. Full visual implementation of `DESIGN.md`.
- **Phase 5: Animations & Interactions** — ✅ complete. Scroll reveal, hero entrance, navbar scroll state, active-nav tracking, mobile menu, hover polish, and the certificate/project lightbox are all implemented and QA'd. Details below.
  - **Same-day follow-up:** a targeted landscape-mobile check (not a full Phase 6 — see that section below) found and fixed one real bug in the mobile menu. Details in "Landscape mobile follow-up" below.
- **Phase 7: Accessibility & Performance** — ✅ complete. Real audit (not speculative), 7 issues found and fixed, all low-risk, zero visual/design changes. Full detail below. No visual redesign occurred — identity remains exactly as approved in `DESIGN.md`.
- **Phases 8–9: Testing & Deployment** — ✅ complete, confirmed by Refa. Site is live at `https://yaklut.github.io/portfolio/`.
- **Post-launch feature round (Sep 2026)** — ✅ built and confirmed working locally by Refa; not yet committed/pushed at time of writing. Detail in the section of the same name below.

## Files created/modified in Phase 5
- **`assets/js/nav.js`** *(new)* — navbar scrolled state, mobile menu (open/close, focus trap, Escape, outside/empty-space tap, close-on-link-click, auto-close on resize past desktop), active-section tracking.
- **`assets/js/reveal.js`** *(new)* — `IntersectionObserver`-based scroll reveal for the 40 elements marked `.reveal` in the HTML.
- **`assets/js/modal.js`** *(new)* — the certificate/project lightbox: open, close, focus trap, focus restoration.
- **`assets/js/main.js`** *(new)* — initialization entry point; calls the three `init*` functions above and sets the `.js` class the CSS fallback logic depends on (see "Implementation decisions" below).
- **`assets/css/styles.css`** *(modified)* — added block 11 (scroll reveal, hero entrance keyframes, project hover-zoom, background scroll-lock utility, modal/lightbox styling), all with explicit `prefers-reduced-motion` overrides. Updated the file's own header comment to reflect Phase 5 status. No Phase 1–4 rules were changed or removed.
- **`index.html`** *(modified, structure otherwise untouched)*:
  - Added `class="reveal"` to 40 elements (every section heading, every card, the resume block, the contact grid) — see "Animations implemented" below.
  - Wrapped both project screenshots in a new `<button class="project__media-trigger" data-modal="project">` so they're keyboard-reachable and clickable — previously they were plain `<img>` tags with no interaction at all.
  - Added the reusable lightbox markup (`#lightbox`) just before the closing `</body>`.
  - Added four `<script defer>` tags for the files above.
  - Certificate links (`.cert-link`) were **not** changed — they already carried `data-modal="certificate"` from Phase 3/4, which Phase 5's JS now actually uses.

## Animations implemented
- **Hero entrance** — pure CSS (`@keyframes heroReveal`, no JS involved on purpose): eyebrow → name → photo → tagline → CTA row → stats, staggered ~100ms apart per `DESIGN.md` §7. Because it has no JS dependency, it still plays even if a script fails to load, and there's no scroll-detection needed since Hero is always the first thing painted.
- **Scroll reveal** — fade + 16px rise on 40 elements (every section heading, every card, resume block, contact grid), triggered once each via `IntersectionObserver` at 15% visibility, never repeating on scroll-up.
- **Grid/list stagger** — Expertise, Skills, the three Certification groups, Publications, and Projects each cascade their cards in with a 70ms step, capped at the 5th item (matches `DESIGN.md`'s "nobody waits 800ms+" rule) via CSS `nth-child` delays — no JS-side delay calculation needed.
- **Project screenshot hover-zoom** — subtle `scale(1.03)` on hover/focus, clipped to the image frame.
- **Navbar scrolled state** — smooth background/shadow transition past 60px scroll, via the pre-existing `body.is-scrolled` CSS hook.

## Interactions implemented
- **Active navigation** — `IntersectionObserver`-based; the current section's nav link gets `.is-active` as you scroll, tested end-to-end across all 8 linked sections.
- **Mobile menu** — opens/closes on tap, `aria-expanded` and `aria-label` ("Open menu" ↔ "Close menu") stay in sync, closes on a nav link *or* the Resume CTA button, closes on Escape, closes when tapping the open menu's own empty space (see decision below), keyboard focus is trapped inside while open and restored to the toggle button on close, background scroll is locked, and an open menu auto-closes if the window is resized past the desktop breakpoint.
- **Certificate/project lightbox** — one reusable dialog for both. Certificate links now open the image in-page instead of a new tab (their `target="_blank"` href still works as a no-JS fallback); project screenshots open the same way via the new trigger button. Escape, backdrop click, and the close button all close it; focus moves to the close button on open and back to whatever was clicked on close; Tab is trapped inside while open.
- **Reduced motion** — every animation/transition above respects `prefers-reduced-motion`. Reveal and hero entrance skip straight to their end state; hover-zoom and modal scale are disabled; verified with Chromium's `prefers-reduced-motion: reduce` emulation, not just read from the CSS.

## Implementation decisions made during Phase 5
- **`.reveal`'s default (no-JS) state is fully visible, not hidden.** Only once `main.js` adds a `.js` class to `<html>` does the CSS hide-then-reveal state apply. If a script fails to load, the page still shows everything — nothing is permanently stuck at `opacity: 0`.
- **Hero entrance choreography extends `DESIGN.md`'s 4 named elements (name → tagline → CTA → photo) to 6.** The spec didn't mention the eyebrow or stat strip explicitly; I placed the eyebrow first (it's visually above the name) and the stats last (they close out the content column), keeping the four named elements at the spec's ~100ms cadence.
- **"Close on outside click" for the mobile menu means tapping the open menu's own empty space.** The panel is a full-screen overlay (`inset: 0`), so there's no backdrop outside it to click — this mirrors the same `target === container` pattern used for the lightbox backdrop, for consistency.
- **The Resume CTA button (`.nav-cta`) also closes the mobile menu**, not just `.nav-link`s — this was a real gap I caught while testing (the CTA uses a different class and was initially missed), not just a defensive extra.
- **`.project__media-trigger:focus-visible` uses a `-2px` outline offset instead of the sitewide default `+2px`.** `.project__media` needs `overflow: hidden` to contain the hover-zoom, which would otherwise clip a positive-offset outline into invisibility for keyboard users.
- **No dedicated navbar entrance animation.** The brief allows one "where appropriate"; I judged that a second animated moment competing with the hero's own entrance was more likely to feel busy than polished, so the navbar is simply present and functional from first paint. Easy to add later if you'd rather it fade in too.
- **Certificate captions in the lightbox come from each card's `<h4>`; project captions come from the existing `<figcaption>`.** Both are read from the DOM at click time, so there's no duplicated text to keep in sync.

## QA performed
Puppeteer's Chromium download is blocked by this environment's network rules, but a full Chromium build was already cached locally (used by Playwright), so real-browser testing was still possible — this wasn't a code-only review.
- **86 automated checks, all passing:**
  - 54 via a jsdom harness exercising the actual JS files directly (menu state, focus trap, modal open/close, active-nav switching, reduced-motion branch).
  - 32 via Playwright driving real Chromium: console-error and horizontal-overflow checks at 390/768/1024/1440/1920px; active-nav tracking scrolled through all 8 sections one at a time; reduced-motion emulation end-to-end; keyboard-only activation (Enter/Space) of both modal trigger types; the outside-tap and Resume-CTA-closes-menu cases above; focus-visible outline verification on the project trigger.
- **13 screenshots reviewed** (hero at mobile/desktop, mobile menu open, scrolled navbar, both project layouts, certifications grid at mobile/desktop, both modal types, hover-zoom before/after) — no visual defects found.
- **No horizontal overflow** at any tested width, including with the mobile menu or lightbox open.
- **No console errors**, aside from one expected artifact: this sandbox can't reach `fonts.googleapis.com` (confirmed separately via `curl` — a 403 from the network layer, not the site), so the Google Fonts request fails here and only here. On a real deployment this resolves normally; the type scale already falls back to `Segoe UI`/`system-ui` regardless.
- Testing used locally-generated placeholder images/PDF (correct dimensions, never leaves this environment) since the real assets aren't part of this upload — same approach Phase 4 used.

## Landscape mobile follow-up (Aug 16, same day as Phase 5)
Not a formal Phase 6 — the responsive layout system itself (breakpoints, per-width layout decisions) was already built in Phase 4 and re-confirmed by Phase 5's own QA, so redoing that as a separate phase would have been relabeling finished work. This was a short, targeted check of the two gaps Phase 5's QA hadn't specifically covered: the 375px/430px portrait widths from your original breakpoint list, and landscape orientation (never tested by any earlier phase).

**What was found: a real bug, not a false alarm.** `.nav-panel` (the mobile menu) vertically centers its 8 links + Resume button with no `overflow-y` handling. In every landscape size tested (667×375, 844×390, 932×430 — matched to real device proportions), that content is taller than the viewport. The first link ("About") was clipped off the top and the Resume button was clipped at the bottom — both unreachable by scroll or keyboard, since `overflow-y` was `visible` by default. Confirmed by measuring `scrollHeight` vs. `clientHeight` (taller in all three cases) before assuming anything from a screenshot.

**Fix — `assets/css/styles.css`, `.nav-panel` only:**
- Added `overflow-y: auto`, so the panel scrolls internally when its content doesn't fit.
- Layered `justify-content: safe center` after the existing `justify-content: center`. This keeps the current centered look whenever everything fits (unchanged in the common/portrait case), but falls back to start-alignment — instead of clipping — the instant centering would push content out of reach. Browsers that don't recognize `safe center` as a value ignore that single line and keep the plain `center` above it, so there's no compatibility cliff.

**Verified, not just assumed fixed:**
- Fresh menu open in landscape now starts with "About" fully visible at the top — measured `scrollTop`, and confirmed visually.
- Both ends of the list (About and Resume) are reachable by scroll — measured each element's position after programmatically scrolling to the top and bottom, not just eyeballed.
- Keyboard Tab-cycling still works at the tightest case (667×375): tabbing through all 9 focusable items wraps correctly, and the browser's native scroll-into-view behavior brings off-screen focused links into view automatically.
- The normal portrait case (which already fit) is unchanged — same `scrollHeight === clientHeight`, same screenshot, no new scrollbar appears when one isn't needed.
- No horizontal overflow at either new portrait width or any of the three landscape sizes.
- Re-ran both existing test suites after the fix (54 jsdom + the 34-check Playwright suite) — no regressions. The only "failures" are the same known sandbox-only Google Fonts block from Phase 5 (see "QA performed" above), unrelated to this change.

**Files changed:** `assets/css/styles.css` only — one rule gained two lines. No HTML or JS changes were needed for this fix.

**Still not covered, and can't be from this environment:** physical device testing, your real (non-placeholder) assets, and browser zoom/OS text-scaling. These aren't blocked on more phases — they need either real hardware or your production files, neither of which exist in this sandbox. Worth a quick check on your end after deploying.

## Favicon (Aug 16, same day)
Resolves the last open item carried since Phase 1. You chose a generated monogram over supplying your own logo.

**Design:** "RD" in Signal Blue (`#2A46C0` — the same token already used for the Resume button, the active nav-link state, and the `theme-color` meta tag that was already in the HTML), set in the real Schibsted Grotesk font at weight 800. That's heavier than the navbar wordmark's Semibold — `DESIGN.md` rules out extra-bold weight for large display text (it reads as generic-SaaS at hero scale), but a favicon is a different context: at 16×16px even Semibold turns to mush, so the extra weight here is a legibility requirement, not a style inconsistency.

**Files generated**, all downsampled from a 512px master with high-quality (LANCZOS) resampling:
- `favicon.ico` (16/32/48px bundled into one file) — placed at the **site root**, not inside `assets/`, since some browsers and crawlers look for `/favicon.ico` directly regardless of what the `<link>` tags say.
- `favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon.png` (180px) — in `assets/images/icons/`, the folder Phase 1's own planning doc already allocated for exactly this ("favicon, any custom SVGs").

**Verified, not assumed fine:** rendered the 16px and 32px versions at true pixel scale (upscaled with nearest-neighbor afterward so nothing got re-smoothed) to check real legibility, not just a shrunk preview — the first attempt had the two letters crowding into each other at 16px, so I backed off the kerning and font size slightly on a second pass before finalizing. Confirmed all four files are served with HTTP 200 and the correct content-type, confirmed the four `<link>` tags in the actually-served HTML resolve to the right paths, and re-ran the existing 54-check test suite to confirm the `<head>` edit didn't disturb anything else.

**Files changed:** `index.html` gained 4 `<link>` tags in `<head>` — no other existing markup, CSS, or JS touched. Plus 4 new binary files (`favicon.ico`, 2 PNGs, and the apple-touch-icon).

## Lucide icons (Aug 16, same day)
Resolves the last open item carried since Phase 4 — you deferred the decision to my judgment, so this documents the reasoning as well as the result. This wasn't really a fresh design decision: `DESIGN.md` (Phase 2, approved) already specified Lucide for Expertise, Skills, and Certification cards; Phase 4 confirmed the site "is styled to look complete via typography/spacing/color alone" without them but explicitly left adding them as a flagged follow-up rather than skipping the idea. So the recommendation was to execute the already-approved plan, not invent a new one.

**Icons chosen** (real Lucide SVGs, fetched via the `lucide-static` npm package — not approximated from memory):

| Section | Item | Icon | Why |
|---|---|---|---|
| Expertise | Data Analysis & SQL | `database` | |
| Expertise | Dashboards & Reporting | `layout-dashboard` | |
| Expertise | Statistical Analysis | `sigma` | |
| Expertise | Research & Qualitative Methods | `search` | |
| Expertise | Business & Excel Analysis | `file-spreadsheet` | |
| Skills | Data & BI | `chart-column` | Deliberately distinct from Expertise's `database` — this category is about BI/visualization tools specifically |
| Skills | Statistics | `sigma` | Same icon as Expertise's Statistical Analysis on purpose — same underlying skill, referenced twice |
| Skills | Programming | `code` | |
| Skills | Research | `search` | Same icon as Expertise's Research & Qualitative Methods, same reasoning as Statistics above |
| Certifications | Applied & Virtual Internships (2 cards) | `briefcase-business` | |
| Certifications | Data Analytics & Programming (8 cards) | `graduation-cap` | |
| Certifications | Other Technical Skills (1 card) | `code` | |

**Two different treatments, matching DESIGN.md's own distinction between these sections:**
- **Expertise & Skills** (`.icon-badge`) — a 40px tinted square (`--color-primary-tint` background, `--color-primary` icon), since DESIGN.md treats these as showcase/credibility sections.
- **Certifications** (`.cert-icon`) — an 18px bare icon in `--color-ink-faint`, no badge. DESIGN.md's own spec calls this a "small line icon" specifically, and Certifications is a dense 11-card scanning list, not a showcase section — matching the site's "restraint is the premium signal" principle rather than giving every one of 11 repeated cards the same visual weight as the 5 Expertise cards.

Both reuse existing color tokens — no new colors were introduced for this.

**Verified, not assumed fine:**
- All 20 icon instances (5 + 4 + 11) inserted via a script with an assertion per insertion (each confirmed to match exactly once before replacing) — same safeguard used for the `.reveal` class additions in Phase 5 itself.
- Caught and fixed my own indentation bug from the first pass (inconsistent handling between the Expertise/Skills insertion and the Certifications insertion led to doubled indentation) before finalizing — re-verified clean output afterward.
- Re-ran the full test suite after the change: 54 jsdom checks + 13 fresh Playwright checks (console errors and horizontal overflow at all 5 breakpoints, certificate modal still opens correctly, scroll-reveal still resolves all 40 elements). All pass, no regressions.
- Screenshot-reviewed all three sections at desktop and mobile widths.
- Icons are `aria-hidden="true"` (decorative, redundant with the adjacent text label) — matches `DESIGN.md`'s own accessibility spec for icons.

**License note:** Lucide ships under the ISC license (permissive, doesn't require attribution), but noting the source here for future maintainability — if you ever want to swap or add an icon, `lucide-static` on npm has the full set (2000+ icons) as plain SVG files, consistent with the "no framework" approach already used everywhere else in this project.

**Files changed:** `index.html` (20 inline `<svg>` icons added, no existing content removed or altered) and `assets/css/styles.css` (`.icon-badge` and `.cert-icon` rules added near their respective existing component styles).

## Real-asset verification pass (Aug 16, same day)
Closes the real-asset gap flagged since Phase 5 — everything up to this point had only been tested against placeholder images/CV, since your actual files aren't part of what gets uploaded to me.

**Desktop — reviewed directly.** You sent 6 full-page screenshots from the actual deployed page running your real photo, both real dashboard screenshots, real certificates, and real CV. Confirmed clean:
- Hero photo at correct proportions, no stretching or odd cropping.
- Both real project dashboards (Kimia Farma dark-navy, BMI light) fit their frames cleanly at their actual aspect ratios — this was the specific risk flagged after Phase 5, since my own testing used placeholders sized to match the HTML's `width`/`height` attributes, not necessarily your real files' true proportions.
- Icon badges (Expertise/Skills) and the gold "1st Author" publication treatment render correctly against real content.
- The CV preview `<iframe>` is loading and displaying the actual PDF, not silently failing behind the "Open the CV directly" fallback text.
- The favicon is showing in the browser tab as a small distinct icon (not blank/default).
- All 11 real certificates — confirmed by you directly.

**Mobile — your confirmation, not independently reviewed.** You tested it yourself and confirmed it's fine; no screenshots came through (upload limit), so unlike the desktop pass above, this wasn't something I verified myself. Noting that distinction rather than claiming a check I didn't actually do.

No bugs found in either pass.

## Known issues / needs your input
1. **Only Chromium was tested.** Firefox/Safari weren't available in this environment. Everything used (`IntersectionObserver`, CSS custom properties, `visibility`/`opacity` transitions) is well-supported broadly, so risk is low, but it hasn't been directly confirmed.
2. **Background scroll-lock uses plain `overflow: hidden` on `<body>`**, which is the standard approach but has a known, common limitation on iOS Safari (rubber-band scroll can still bleed through at the edges). I didn't add the extra `position: fixed` + scroll-offset workaround some sites use for that, to keep this maintainable — flagging it as an accepted trade-off rather than silently deciding it doesn't matter.
3. **Phase 6 (Responsive Design) — resolved as "no dedicated phase needed."** See "Landscape mobile follow-up" above: the specific gap that check could close (375/430px portrait, landscape orientation) has been, and it surfaced a real bug that's now fixed. What's left — physical devices, browser zoom — can't be closed by more work in this environment regardless of what phase it's labeled, so there's nothing to gain by treating it as a separate phase.

## Known non-issues (expected, not bugs)
- Cross-browser testing beyond Chromium — noted above, not treated as a defect.
- The automated test scripts used for this phase's QA (jsdom + Playwright) live only in my working environment, not in your repo — they depend on Node packages this project deliberately doesn't otherwise use (per your "no unnecessary dependencies" brief). Happy to hand them over if you'd like a repeatable regression check for future phases; just say so.

## Phase 7: Accessibility & Performance (Aug 18, 2026) — ✅ complete

### Methodology
This environment has no GUI Chrome/Chromium available (confirmed by attempting an install — several required system packages 404'd from the mirror), so a live Lighthouse run wasn't possible this time, unlike the cached-Chromium Playwright testing Phase 5 had access to. To keep findings evidence-based rather than guessed, this audit used:
- **axe-core**, run against the real `index.html` via a jsdom harness — structural/ARIA/semantic checks (0 violations found; a few "incomplete" items needing human judgment, all resolved below).
- **html-validate** (standard + a11y rule presets) — HTML conformance, cross-checked against axe's findings.
- **A custom WCAG 2.1 contrast calculator**, run against every color pairing actually used in `styles.css` — not just the pairs `DESIGN.md`'s own table happened to enumerate. Four real pairings weren't in that original table (chip/badge combinations added during Phase 3–4); all four independently verified to pass.
- **ImageMagick / Pillow**, for real pixel dimensions, file sizes, and format inspection of every image asset — your real production files, not placeholders.
- **Node's built-in syntax checker**, for all 4 JS files.
- Manual line-by-line review of `index.html`, `styles.css`, and all 4 JS files, reasoned against Lighthouse's documented scoring heuristics and WCAG 2.1 AA success criteria directly, including tracing exact JS execution timing (e.g. focus-move-on-close) rather than assuming from a static read.

### Initial findings, by priority

**HIGH**
1. `favicon.ico` is referenced at the site root (`href="favicon.ico"`) but the actual file only existed at `assets/images/icons/favicon.ico` — confirmed by listing the real repo tree. Browsers request `/favicon.ico` directly regardless of `<link>` tags, so this 404'd on every page load. *(The PNG favicon `<link>` tags still worked, so the tab icon itself wasn't broken — but this was a real, silent broken request.)*
2. Two project dashboard screenshots were PNG — `kimia-farma-dashboard.png` (1.50MB) and `bmi-dashboard.png` (1.16MB), 2.65MB combined. Neither image uses transparency (confirmed: both are plain RGB, no alpha channel), so PNG bought nothing here — it's the wrong format for a full-color screenshot, and by far the single biggest weight on the page.

**MEDIUM**
3. `<div class="footer__social" aria-label="...">` — a plain `<div>` has no ARIA role that supports `aria-label`, so several browser/AT combinations silently drop it. Confirmed independently by both axe and html-validate.
4. `#lightbox`'s static markup combines `aria-hidden="true"` with a focusable close button inside it. In the live browser this was never actually reachable while closed — `visibility: hidden` already removes it from the tab order, and `closeModal()` moves focus away synchronously before the fade-out even starts (traced the exact call order in `modal.js` to confirm). Still, two independent tools flag the static pattern, and there's a more robust fix available.
5. `<img id="lightbox-image" src="">` — html-validate flags empty-string `src` as an invalid value (ambiguous URL-resolution edge case in some browsers). Removing it outright then trips a *different* rule (`src` is technically required on `<img>`).
6. Project screenshot `width`/`height` attributes didn't match the real files' pixel dimensions (e.g. declared 924×843 vs. actual 1326×1187, ~2% off). Desktop (≥1024px) isn't affected — `object-fit: cover` there ignores the mismatch — but below 1024px, `height: auto` derives from the *declared* ratio until the image loads, then snaps to the *real* ratio, causing a small layout shift. The hero photo has a similar declared/real mismatch, but was **not** flagged — see "Reviewed, not changed" below for why.
7. Dead CSS: `.container` was defined but never used anywhere in the real HTML (confirmed by cross-referencing every class in the CSS against every class in the HTML, and against every class the JS applies dynamically). The site actually uses the `main > section > *` descendant rule for the same job.
8. Redundant CSS: two back-to-back `ul, ol` rules where the first's `padding-left: 1.2em` was always immediately overridden by the second's `padding-left: 0` — same final computed style, just two rules doing the job of one.
9. Both the mobile-menu and lightbox keyboard focus-traps re-queried the DOM for focusable elements on **every single Tab keypress** rather than once when opened. Content inside both is static while open, so the repeated query was pure overhead — small in practice (1–9 elements), but it's exactly the "repeated DOM query" pattern this audit was asked to check for.
10. Hero photo had no `fetchpriority` hint. It's the likely LCP element and was already eager-loaded (no `loading` attribute) — `fetchpriority="high"` is a standard, zero-risk hint that can help the browser prioritize it sooner.

**Reviewed, verified fine, not flagged as issues:**
- Color contrast — every real pairing in the shipped CSS passes AA (see Methodology). One pairing (`--color-gold-deep` on `--color-gold-tint`, used for the gold "1st Author" chip and Honors note) passes at 4.55:1 against a 4.5:1 requirement — a genuine pass, but tight enough to flag if either of those two tokens is ever adjusted later.
- DOM size/complexity: 503 elements, max nesting depth 9 — comfortably within Lighthouse's healthy range.
- Image `loading`/eager strategy: hero eager, project screenshots + CV iframe lazy — already exactly matches best practice.
- All 4 scripts already `defer`, correctly ordered, no render-blocking JS.
- No duplicate IDs anywhere in the document.
- `justify-content: safe center` (landscape mobile-menu fix from Phase 5) has a correct, verified graceful-degradation path for browsers that don't support the `safe` keyword.
- `prefers-reduced-motion` handling is comprehensive (global catch-all plus specific `transform: none` overrides where the global rule alone wouldn't fully neutralize an effect).

### Fixes implemented (all 10 HIGH/MEDIUM findings above — all low-risk, zero visual change)
| # | Fix | Files touched |
|---|---|---|
| 1 | Placed `favicon.ico` at the actual site root | *(new root file)* |
| 2 | Converted both dashboard screenshots PNG → WebP at quality 88, same pixel dimensions | `assets/images/projects/*.webp` (new); old `.png` files removed |
| 3 | Added `role="group"` to `.footer__social` | `index.html` |
| 4 | Added `inert` to `#lightbox`, toggled in sync with `aria-hidden` in JS | `index.html`, `assets/js/modal.js` |
| 5 | Replaced `src=""` with a 1×1 transparent GIF data-URI placeholder (standard technique; zero network cost) | `index.html` |
| 6 | Corrected `width`/`height` on both project `<img>` tags to their real pixel dimensions | `index.html` |
| 7 | Removed the dead `.container` rule | `assets/css/styles.css` |
| 8 | Merged the redundant `ul, ol` rules into one | `assets/css/styles.css` |
| 9 | Cached the focus-trap element list once per open instead of re-querying per keypress | `assets/js/nav.js`, `assets/js/modal.js` |
| 10 | Added `fetchpriority="high"` to the hero photo | `index.html` |

### Reviewed, deliberately NOT changed (trade-offs documented, per your Phase 7 brief)
- **Hero photo's declared `900×1281` vs. the real file's `832×1248`.** Unlike the project screenshots, the hero photo's CSS sets an explicit fixed `aspect-ratio: 900/1281` (not derived from the HTML attributes at load time), so there's no layout-shift mechanism here regardless of the mismatch — and the resulting `object-fit: cover` crop is the one you already visually verified against your real photo in the "Real-asset verification pass" section above. Changing the declared dimensions would change *which* crop gets shown; since the current crop is already confirmed correct, I left it alone rather than risk it for zero measurable benefit.
- **Self-hosting the Google Fonts** (removing the third-party origin dependency entirely) — `DESIGN.md` itself flagged this as a reasonable Phase 7 candidate "if load time needs trimming." Preconnect + `display=swap` (both already in place) cover the two standard, low-risk mitigations; self-hosting is a bigger, multi-file change (fetching the right WOFF2 weights, new `@font-face` rules, new asset folder) that clears the "worthwhile" bar but not the "low-risk-enough to do unprompted" bar this audit set. Flagging it as available if you want it explicitly.
- **`:focus { outline: none }` paired with `:focus-visible`.** In browsers that don't understand `:focus-visible` (none realistically left in 2026 — Safari/Firefox/Chrome all shipped support 2020–2022), this would remove the focus ring entirely for keyboard users. Real risk today is negligible; a `@supports` fallback would add complexity for a gap that doesn't practically exist for this site's audience.
- **`.btn--ghost`'s `min-height: auto`** (used by "View Certificate →", "View on GitHub →", etc.). Worked out the actual box model by hand: 12px padding (top+bottom) + ~18px line-box + 2px border ≈ 44px already, even without the explicit `min-height`. No real shortfall to fix.
- **Certificate JPEGs** (100–200KB each, fetched only on click, not on page load) — already reasonably compressed; further gains would risk visible quality loss for an asset class you explicitly said not to degrade.
- **CSS/JS minification** — current total is 44KB CSS + 20KB JS unminified; gzip/Brotli (applied automatically by GitHub Pages) already captures most of the realistic win, and unminified source stays easier for you to read and learn from.

### Flagged for your review (not a code issue — a content note)
While visually inspecting the re-compressed BMI dashboard screenshot for quality, the image itself reads **"Rp1,75 jt"** (Indonesian "juta" = million). Your live site's copy — "Rp1.75M" — already matches this. `PHASE_1_PLANNING_ARCHITECTURE.md`'s notes said "Rp1.75B," which doesn't match the real dashboard; that's a planning-doc mismatch, not a site bug, so nothing was changed. Worth a quick double-check on your end since I can only go on what's visible in the screenshot.

Also noticed (not touched): two PDF files sit in `assets/images/` (`rakamin-bank-muamalat-bi-analyst.pdf`, `rakamin-kimia-farma-big-data-analytics.pdf`) that aren't referenced anywhere in `index.html`. They add no load-time cost since nothing links to them, but if they're leftovers you don't need in the repo, that's a cleanup call for you to make, not something I removed on my own.

### Performance results (measured, not estimated)
The only images that load automatically on a normal visit — hero photo + both project screenshots (certificates only load on click) — went from **2.82MB combined to 347KB combined, an 88% reduction**, purely from the WebP conversion (verified visually at full size afterward — no perceptible quality loss on either dashboard).

### Regression testing (after fixes)
- axe-core re-run: **0 violations** (unchanged), "incomplete" items dropped from 4 → 2, and both remaining ones are the expected, explained non-issues (jsdom can't compute real contrast/layout — verified separately by hand; and axe's standard "test iframe contents separately" boilerplate, not applicable to a native PDF viewer).
- html-validate re-run: **0 problems** (down from 3).
- All 4 JS files re-checked for syntax validity — pass.
- DOM element count unchanged (503 → 503) — confirms the fixes were attribute-level only, no structural changes.
- Every asset path referenced in the final `index.html` (images, PDF, JS, favicons) resolves to a real file — checked programmatically, not assumed.
- No duplicate IDs.
- CSS brace-balance verified (246 open / 246 close) after edits.
- Nothing above touches layout, spacing, color, or breakpoint behavior, so the Phase 5/"landscape mobile follow-up" overflow testing and the Phase 6 breakpoint sign-off both still stand as-is — there's no plausible mechanism by which these specific fixes (image format/dimensions, two ARIA attributes, one data-URI, two dead CSS rules, cached JS lookups, one fetch-priority hint) could reintroduce overflow or shift a breakpoint. Re-verifying all 5 widths (390/768/1024/1440/1920) from scratch with real rendering is still worth doing once on your end, since this sandbox has no browser to confirm it visually.

### Remaining limitations (need your environment, not more work here)
- **No live Lighthouse/real-Chrome run.** Everything above is real tooling (axe-core, html-validate, exact WCAG math, real file inspection) run against your actual production files, not guesses — but a from-the-browser Lighthouse score is still worth pulling once, either via Chrome DevTools locally or PageSpeed Insights against the deployed GitHub Pages URL, mainly to confirm real-world LCP/CLS numbers now that the image fix is live.
- **Firefox/Safari** — unchanged from Phase 5's note: still untested directly (no browser available in this environment either). Nothing in this pass used anything version-gated for those browsers beyond what Phase 5 already reasoned through, plus the newly-added `inert` attribute (supported in Safari 15.5+, Firefox 112+, Chrome 102+ — all safely old enough not to be a practical concern for this audience, but worth a glance if you happen to test on either).
- **Physical devices** — same standing note as Phase 5/6; nothing here changes that.

## Post-launch fixes (Aug 19, 2026)
Two visual bugs reported from the live site, both root-caused before fixing — not just patched at the symptom.

**1. Hero photo rendering ~1281px tall on desktop (forcing a scroll to see all of it).**
The real cause wasn't the aspect-ratio value — the `<img>`'s `height="1281"` HTML attribute was being read by the browser as a literal fixed CSS height. `.hero__photo` never set `height` explicitly, so that attribute-derived value won by default and blocked `aspect-ratio` entirely (it only fills in a dimension left `auto`). The photo was rendering at a hardcoded 1281px tall regardless of its actual responsive width.
- Added `height: auto;` to `.hero__photo` so `aspect-ratio` can actually take effect.
- Changed the ratio from `900 / 1281` (≈0.70, a very tall portrait) to `4 / 5` (0.8) — previewed several crop options against the real photo first to confirm nothing important (hairline, hands) gets cut off.
- Widened the desktop frame slightly: `max-width: 420px → 460px`.
- Updated the `<img>`'s `width`/`height` attributes to `900 / 1125` (same 4:5 ratio) so the pre-CSS layout reservation stays accurate.

**2. "View all on Google Scholar" link sitting flush at the page edge instead of aligned under the publication cards.**
`.btn` is `display: inline-flex`. Auto margins resolve to `0` on inline-level boxes, so the sitewide container rule's `margin-inline: auto` (which centers other section-level children) was silently doing nothing for this specific element — a genuine gap in the original Phase 4/5 implementation, not something that regressed later.
- `.research > .btn` now also sets `display: flex` (block-level) alongside its existing `width: fit-content`, so the inherited `margin-inline: auto` can actually center it.

**Verified, not assumed fine:** pulled the live repo fresh and checked both fixes with Playwright at 1920×1080, 1440×900, and 1366×768 (desktop) plus 375×812 (mobile). Hero photo fits without scrolling at all three desktop sizes. The Scholar link renders centered under all 5 publication cards — confirmed after walking the scroll position down the full page so every `.reveal` card had actually triggered first, not just the top two (an early check nearly missed this: an element screenshot taken without scrolling first only shows whatever has already faded in). Mobile hero re-checked too since the aspect-ratio change is shared across breakpoints — still renders cleanly there.

**Files changed:** `assets/css/styles.css` (3 rules: `.hero__photo`, the `.hero__photo-frame` desktop breakpoint, `.research > .btn`) and `index.html` (`width`/`height` attributes on the hero `<img>` only). No HTML structure, JS, or other CSS touched.

**3. Navbar scrolled state changed from solid white to frosted glass, at Refa's request.**
Discussed two other polish questions in the same pass first — whether scroll-reveal animations should also fade out and repeat on every scroll pass (recommended against: the site is a reference document people jump around in, not a linear narrative, and repeat fade-out punishes exactly the re-scan/compare behavior a recruiter does — no code changed, current one-time reveal is correct as-is) — then this navbar change, which was judged a good idea since it's a static treatment, not a repeating interaction, so the usability objection above doesn't apply here.
- Added `--color-surface-translucent` token and changed `body.is-scrolled .site-header` from solid `var(--color-surface)` to `background: var(--color-surface-translucent); backdrop-filter: blur(8px) saturate(140%);` (with `-webkit-` prefix for Safari). `backdrop-filter` needs no fallback — unsupported browsers just keep a translucent-white bar, which still looks intentional.
- Color stays neutral white, not tinted with Signal Blue — `DESIGN.md` §2 already reserves blue for interactive/actionable elements and states it should be used "sparingly"; the navbar is on-screen for effectively the entire scrolled session, so tinting it would work against that rule rather than with it.
- **Tuned twice — first pass, then a revision after live feedback.** Initial values (0.72 opacity / 14px blur) looked clean in isolation but ghosted the bold 44–72px hero name into a distracting smear against the real page. Overcorrected to 0.94 opacity / 8px blur to kill that — tested clean, shipped — but Refa reported it live and it read as barely different from the old solid white; too conservative. Also tried fixing the ghosting by pushing blur radius up instead of opacity (24px, then up to 90px at lower opacity) — this was the wrong lever: past ~15px, more blur radius doesn't dissolve bold letterforms, it smears adjacent strokes into a *more* legible solid blob. Opacity, not blur radius, is what actually controls how much a backdrop shows through.
  **Landed on 0.75 opacity / 16px blur.** At this level, headings up to H2 size (e.g. "About Me") dissolve into soft, non-legible shapes when they pass behind the bar — reads as intentional glass, not a glitch. The one honest exception is the hero name (Display XL, 44–72px, the largest text on the page) — it keeps a soft but legible trace for the ~150px of scroll it takes to pass fully behind the bar. Treated as acceptable rather than chased to zero a third time: real glass surfaces are supposed to show hints of what's behind them, and every backdrop-filter value strong enough to be visibly "glass" elsewhere will show something here too — there's no combination that's both clearly visible and perfectly clean against the single largest heading on the site.
- Verified at 1440×900 (hero-name worst case, Projects dashboard image, Certifications section) and 375×812 (mobile, hamburger nav) via Playwright.

## Post-launch fixes, round 3 (Aug 21, 2026)
Ran a full audit at Refa's request ("what could be improved") rather than just listing opinions: checked console errors, broken requests, other instances of the inline-flex/auto-margin bug, image/attribute consistency, heading hierarchy, alt text, and meta tags. Three real gaps found and fixed; everything else checked came back clean (documented below so it isn't re-audited from scratch next time).

**1. `favicon.ico` — actually fixed this time.** Confirmed still missing at root (file existed only at `assets/images/icons/favicon.ico`; the root `<link>` and the browser's automatic `/favicon.ico` request both 404'd). Copied the existing file to the repo root. Worth noting for context: this was **invisible in practice** — the PNG favicon links (`favicon-32x32.png`, `favicon-16x16.png`) already load fine and browsers silently prefer whichever icon link works, so the tab icon looked correct the whole time. Refa correctly called this out — the only trace was a 404 in dev-tools network tab, nothing a visitor would ever see. Fixed anyway since the cost was one file copy.

**2. Contact section — right column was nearly empty.** `DESIGN.md` §5 specs the "currently open to" tags as living in the right column with the platform buttons; the actual Phase 3/4 build put them in the left column under Location instead, leaving the right column as just 3 buttons with a lot of dead space below. Moved the `<ul class="contact__tags">` block from `.contact__info` to `.contact__platforms` in `index.html`. Needed one CSS addition, not just an HTML move: `.contact__platforms` switches to `flex-direction: row` at the 768px breakpoint (for the button row), so the tags list needed `flex-basis: 100%` at that same breakpoint to force it onto its own line instead of trying to squeeze in after the Email button. Verified at desktop (1440px) and mobile (375px) — both columns now carry visual weight, mobile stacks naturally.

**3. Added Open Graph + Twitter Card meta tags.** There was no `og:image`, `og:url`, or any `twitter:*` tag — sharing the link anywhere (LinkedIn message, email to a recruiter, WhatsApp) would've shown a bare title+description with no image. Refa deferred to my judgment on this one. Rather than point `og:image` directly at the raw portrait photo (which is portrait-oriented and would get awkwardly cropped by platforms expecting the standard 1200×630 landscape ratio), composed a proper OG card: real brand fonts (pulled `@fontsource/schibsted-grotesk` and `@fontsource/public-sans` via npm, converted WOFF→TTF for PIL since the sandbox doesn't have these fonts installed), Signal Blue accent, the same 4:5 photo crop treatment as the real hero, name + role line + the 5/2/11 stat row. One snag: the `→` character isn't in this font subset's glyph coverage (rendered as a missing-glyph box) — drawn as a small manual arrow shape instead of relying on the Unicode glyph. Saved as JPEG (65KB) rather than PNG (238KB) — quality-88 is visually identical for this kind of flat-color/photo composite and it's meaningfully lighter for external crawlers to fetch. New file: `assets/images/social/og-image.jpg`. Added `og:image:width/height/alt` and `twitter:card=summary_large_image` alongside it. Verified the image file itself resolves (200, not 404) — full crawler-rendering (actually pasting the URL into LinkedIn/Twitter's own preview debuggers) wasn't possible from the sandbox, so treat the *tags and file* as verified, the *actual rendered preview card on each platform* as not yet eyeballed firsthand.

**Confirmed clean while auditing (no action needed):** no console errors beyond the expected sandbox-only Google Fonts block; no other elements share the Scholar-link's inline-flex/auto-margin bug (checked `.resume__block > .btn` specifically — saved by `text-align: center` on the parent, so it's harmless dead code, not a second instance of the bug); no other `<img>` width/height-attribute mismatches beyond the already-fixed hero photo; heading hierarchy is a clean single H1 → H2 per section → H3 card titles, no skipped levels; alt text is descriptive on every meaningful image; lazy-loading is already correctly scoped (certificate images load on-demand via the modal, not upfront — hero photo correctly uses `fetchpriority="high"` instead of lazy).

**Files changed:** `index.html` (favicon copied to root as a new file; Contact section HTML reordered; OG/Twitter meta tags added), `assets/css/styles.css` (`.contact__tags` flex-basis fix), new file `assets/images/social/og-image.jpg`.

## New features added (Aug 22, 2026)
Refa asked for feature ideas beyond bug fixes; after presenting options, asked to build all of them (minus dark mode, which was explicitly recommended against and not revisited). Five additions, all vanilla HTML/CSS/JS, no new build tooling.

**1. Print stylesheet.** New `@media print` block at the end of `styles.css`. Forces every `.reveal` element to `opacity: 1` (critical — without this, anything the IntersectionObserver hasn't triggered yet would print invisible), hides the nav/hamburger/hero CTAs/Resume-preview-iframe/cert "View Certificate" links/footer nav+social (all meaningless on paper), strips box-shadow/backdrop-filter, and flips the dark footer band to plain black-on-white so it doesn't waste ink or print as a near-solid block. External evidence links (GitHub, LinkedIn, Scholar) print their actual URL after the link text via `content: " (" attr(href) ")"`, since a printed page can't be clicked.

**2. Custom `404.html`.** New file at repo root. Reuses the site's own `styles.css` and `.btn--primary` class rather than inventing new styling, so it stays on-brand for free. **Important implementation detail:** every asset reference in this file uses absolute paths (`/portfolio/assets/...`, `/portfolio/favicon.ico`) rather than relative ones. GitHub Pages can route a broken link at *any* depth under `/portfolio/` to this page while the browser keeps that original mistyped URL — relative paths would resolve inconsistently depending on how deep the bad link was; confirmed this is a known class of bug via search before building it this way. Verified by serving the file from a locally-mirrored `/portfolio/` subpath (a plain `python -m http.server` can't replicate GitHub's automatic 404-routing behavior, so direct-file rendering at the correct path was the right verification level — the routing itself is a GitHub Pages platform guarantee, not something this repo's code controls).

**3. JSON-LD structured data.** `Person` schema in `index.html`'s `<head>`, separate from the Open Graph tags added earlier (those control social-share preview cards; this is about how the page can appear in Google search results if someone searches the name directly). Every field traces to content already elsewhere on the page or in verified source material — name, alumniOf, affiliation, knowsAbout, sameAs (LinkedIn/Scholar/GitHub) — nothing new was invented. Validated as parseable JSON before shipping.

**4. Analytics — GoatCounter.** Confirmed via web search this is a genuinely free (non-commercial tier), cookieless, ~3.5KB option with no GDPR-banner requirement, and doesn't need any DNS/hosting changes (unlike Cloudflare Web Analytics, whose free tier is more clearly tied to sites already proxied through Cloudflare). Wired into `index.html` with a placeholder domain (`YOUR-CODE.goatcounter.com`) and an inline comment — **Refa needed to sign up free at goatcounter.com and swap in their real site code**, since that account can't be created on their behalf. *(Resolved Sep 28, 2026 — Refa created the account and the real code `refadfnda` is now in `index.html`; see the Sep 2026 round below.)*

**5. Timeline section — new, not in the original locked IA.** Sits between Certifications and Resume/CV (numbered `07`; Resume and Contact shifted to `08`/`09` accordingly). A single chronological list — Education, both projects, all 5 publications, and the 10 dated certifications (the Dibimbing cert has no printed date on the certificate itself, so it's excluded here rather than guessed) — grouped by year, pulled by re-parsing the actual `datetime` attributes already in the page rather than retyping dates by hand, specifically to avoid transcription drift from the source of truth. The one lead-authored publication reuses the *same* gold "distinction" treatment it already has in the Research section (not a new color decision — carrying the existing rule into a new context). Deliberately built as compact rows, not the site's usual card shell: at 19 entries, the card system's shadow/padding/radius would have made the section far longer than the information density justifies. Not added to the top nav — it already carries 8 links plus the Resume button, and a 9th risked crowding at in-between desktop widths; reachable by scrolling instead, same as the unnumbered About section.

**Files changed:** `assets/css/styles.css` (print block, `.timeline*` rules), `index.html` (JSON-LD block, GoatCounter script, full Timeline section HTML, eyebrow renumbering), new file `404.html`.

## Timeline redesign (Aug 22, 2026)
Refa's reaction to the first version: "good, but too simple." Fair — it was plain rows with tiny gray dots and a text-only category tag, which undersold content that's genuinely substantial (5 peer-reviewed papers, 2 full BI dashboard projects). Reworked the visual structure without touching any of the underlying data.

**What changed:**
- Each year is now its own card (reused the site's one existing card shell — surface/border/radius/shadow — rather than inventing a second visual system), instead of floating text directly on the page background.
- Every entry gets a real category icon (Lucide, sourced via `npm pack lucide-static` for guaranteed-correct SVG paths rather than reconstructing them from memory) sitting directly on the connecting spine line, replacing the old plain dot: graduation-cap (education), award (honors), folder-kanban (projects), book-open (publications). Certifications reuse the exact same briefcase-business icon already used in the Certifications section itself, for a deliberate visual echo between the two.
- Added an actual visual hierarchy that the flat version didn't have: Projects and Publications — the two categories that matter most for a Data/BA recruiter, as opposed to routine online-course certificates — get the primary-tint icon treatment (same tint Expertise icons already use elsewhere), so they visually outweigh the certification entries around them instead of everything reading as equally important. The lead-authored publication keeps its own gold treatment on top of that, carrying forward the same "distinction" rule already established for it in the Research section.
- Added a hover state per row and a per-item staggered entrance (capped at the first 6 rows per year, same reasoning already used for the certification grid — nobody should wait 900ms+ for a 12-item year's last row to animate in).
- Implementation note: rebuilt the entire HTML block via a Python script rather than 19 manual edits, specifically to avoid transcription drift across that many near-identical-but-distinct entries.

Re-verified after the rewrite: all 11 `<section>` tags still balance, all 19 items present, eyebrow numbering (01–09) and section order unaffected, reveal-on-scroll confirmed actually firing on the new `.timeline__year-card` structure (not just visually similar), no new console errors, checked on both 1440px and 375px.

## Post-launch feature round (Sep 2026)
Inspired by structure/interaction ideas from a second reference site (farihmuwaffaq.my.id) — patterns only, none of its visual identity, wording, or code was copied. Refa picked which ideas to build from a shortlist.

**Built**
1. **Hero availability badge.** A `.chip` pill ("Open to Data & Business Analyst Internships") between the CTA row and the stats. No new component — `.chip` was already documented as the "open to" tag style. Added to the hero entrance stagger (340ms) and to its `prefers-reduced-motion` override list.
2. **Sector tags on both project cards.** New `.project__sector` mono kicker above each project title ("Pharmaceutical retail" / "Islamic banking"), reusing the hero-eyebrow typography.
3. **Hero stat count-up.** New `assets/js/stat-count.js`, called from `main.js`. Counts the three hero numbers (5 / 2 / 11) from 0 over 700ms, starting at 380ms to match the CSS stat fade-in delay. Scoped to `.hero__stats .stat-value` only — other `.stat-value` elements hold currency/suffix formats and must not be touched. If JS fails, the real numbers are already in the HTML. Skipped entirely under `prefers-reduced-motion`.
   - The hero entrance itself is still pure CSS; only the numbers are animated by JS.
   - The 380ms/700ms constants in `stat-count.js` mirror the CSS delay — if the hero stagger is retimed, update both.
4. **Tool/tech marquee.** New unnumbered sub-block at the bottom of the Skills & Tools section (kept out of the numbered sequence so eyebrows 01–09 are unchanged). Five brand logos: Google BigQuery, Looker Studio, Microsoft Excel, Google Sheets, Python.
   - Auto-scroll is pure CSS (track duplicated once, translated -50% for a seamless loop). New `assets/js/marquee.js` only wires the pause/resume toggle button.
   - Accessibility: explicit pause button (`aria-pressed`, label switches Pause/Resume), the duplicate half is `aria-hidden`, visible logos carry `aria-label`s, and under `prefers-reduced-motion` the animation and the button are both removed. New shared `.sr-only` utility added to the layout-utilities block.
   - Logo sources: BigQuery, Looker, Sheets and Python come from the Simple Icons package (brand hex colors). Excel is the official multi-color SVG supplied by Refa, cleaned of Illustrator metadata, with a unique gradient ID per copy so the two inline instances don't collide.

**Bug found and fixed during Refa's local check**
- Symptom: after pausing, clicking resume did nothing until Refa clicked elsewhere.
- Cause: the pause rules used `:hover` on the whole `.tool-marquee` and `:focus-within`. The toggle button is the only focusable element inside, so a click left it focused (`:focus-within` still true) and the mouse still hovering it — both kept the animation paused regardless of the `is-paused` class.
- Fix: hover-pause now applies to `.tool-marquee__viewport` only (the logo strip, not the button), and `:focus-within` was removed. If logos ever become links, revisit whether pause-on-focus is wanted.

**Files changed:** `index.html` (also the GoatCounter code swap), `assets/css/styles.css`, `assets/js/main.js` (init list), new `assets/js/stat-count.js`, new `assets/js/marquee.js`.

**Verification — kept separate on purpose**
- Independently verified: JS syntax (`node -c`), HTML tag balance (sections/divs/lists/svg), CSS brace balance, unique gradient IDs, correct insertion points.
- Confirmed by Refa (local browser): badge, sector tags, count-up, marquee with all five logos, and the pause/resume fix.
- Not run: Playwright screenshot/breakpoint pass — the browser binary can't be downloaded in the working sandbox. The marquee and badge have therefore not been checked at 375/430/768px by automated screenshots.

**Known caveats**
- The Looker Studio slot uses the generic Looker mark — Simple Icons has no separate Looker Studio icon.
- Four logos are single-color brand marks and Excel is full multi-tone artwork, so the strip is not perfectly uniform in style. Refa reviewed it and accepted it.
- GoatCounter: Refa created the account and the real site code (`refadfnda`) replaced the `YOUR-CODE` placeholder on Sep 28, 2026. The site should be checked once after deploy to confirm the first pageview is counted in the GoatCounter dashboard.

**Decided but not built: per-project case-study pages.** Refa chose real multi-page sub-pages (relaxing the Phase 1 single-`index.html` lock for these pages only) over expanding the existing cards. Source material exists — `Dashboard_Projects.pdf` contains the full Kimia Farma and BMI dashboard views, far more detail than the card screenshots. Implications to plan for: shared nav/footer markup duplicated across pages (no templating in vanilla HTML), relative asset paths from a subfolder, and the 404 page's absolute-path convention. Narrative content must be reviewed by Refa; nothing may be presented as Refa's finding or decision unless Refa confirms it.

## Two new interactive features (Sep 29, 2026)
Both leftover ideas Refa picked from the original farihmuwaffaq.my.id-inspired shortlist (the third, numbered nav prefixes, was not picked).

**Command palette (Ctrl/Cmd+K).** New `assets/js/command-palette.js` + a `.nav-search-btn` trigger in the navbar (before the Resume CTA) + a second `.modal` instance (`#command-palette`, using `.modal--top` so it sits near the top like a conventional command palette rather than dead-centre). Deliberately does **not** hardcode a list of sections: at init it reads every `main > section[id]` heading and the two `[id^="project-"]` card titles on *whatever page it's running on*, plus a "Download Resume" / "Email Refa" action if that page has a matching real link. This means the same unmodified script works on `index.html` (15 items: 9 sections + 2 projects + 2 case-study-adjacent + 2 actions) and on each case-study page (its own 7 sections + the footer's Email action — verified no phantom "Download Resume" appears there, since no such link exists on those pages). Keyboard: type to filter (substring match), ↑/↓ to move, Enter to jump (sets `location.hash`) or trigger the action element's own `.click()`, Esc/backdrop-click to close. Focus-trap and open/close mirror `modal.js`'s existing pattern.

**Publications filter.** New `.pub-filter` button group (All / SINTA 2 / SINTA 4 / 1st Author) above the Research & Publications list, plus `assets/js/publications-filter.js`. Also derives everything from the existing DOM rather than new data attributes: tier comes from each card's own `.chip--tier` text, "1st Author" from the existing `.card--publication-lead` class (the actual first-author paper) — so the five real publications stay the one source of truth.

**Verification — a step up from previous rounds.** No browser is available in this sandbox, but both features are plain DOM logic with no layout/CSS dependency, so they could be genuinely execution-tested with `jsdom` (installable from npm, unlike a Playwright browser binary): loaded the real `index.html` and both scripts, then asserted the actual behavior rather than just reading the code —
- Command palette on `index.html` built exactly the 15 expected items in the right 4 groups; typing "kimia" filtered to exactly one match; a nonsense query correctly showed the empty state.
- Publications filter on `index.html`: SINTA 2 → 2 cards, SINTA 4 → 3 cards, 1st Author → 1 card (the right one), All → 5.
- Command palette on `case-studies/kimia-farma.html` built its own 7 on-page sections + Email (no Resume action, correctly, since that page has no PDF download link).
- (Superseded: rendering, keyboard and click behavior were later verified in real headless Chromium — see the section above; that run found a click bug jsdom had missed.)

**Files changed:** `index.html` (search button + both markup blocks), `assets/css/styles.css` (blocks 13–14), `assets/js/main.js` (init list), new `assets/js/command-palette.js`, new `assets/js/publications-filter.js`; `case-studies/kimia-farma.html` and `bmi.html` regenerated from the same template to add the palette there too.

## Sixth publication added (Sep 30, 2026)
Refa supplied the PDF and the journal link for a new paper: **"Indonesia's Transition as an Emerging Donor: The Case of Indonesian Aid in SDG-Related Sector"**, *Sosiohumaniora — Jurnal Ilmu-ilmu Sosial dan Humaniora*, Vol. 28 No. 1 (March 2026), pp. 74–87, DOI `10.24198/sosiohumaniora.v28i1.70328`. Refa is the **4th of 7 authors** (author list taken from the PDF). Per the PDF: submitted 14 Apr 2026, accepted 31 Aug 2026, published 8 Sep 2026.

**Tier verified, not assumed.** The journal's own pages state SINTA 2 (SK 79/E/KPT/2023, valid from Vol. 24 No. 2/2022 to Vol. 29 No. 1/2027), and Vol. 28 No. 1 falls inside that range. The article page itself blocked automated access, so title, authors, volume and dates come from Refa's PDF; the tier comes from the journal's site.

**What changed in `index.html`**
- Hero stat 5 → **6** SINTA-indexed publications (the count-up reads the number from the HTML, so nothing else needed changing).
- About paragraph: "five" → "six" SINTA-indexed publications ("including one as first author" is still true).
- New publication card in the SINTA 2 group, after the Journal of Public Power card (existing cards were not reordered). Card text follows the existing pattern; the issue date shown is the printed issue ("March 2026"), not the online publication date.
- New Timeline entry in the 2026 card, between the two undated-month entries and "Apr": `Mar · PUB · Sosiohumaniora (4th of 7 authors)`. Timeline items 19 → **20**.
- Nothing to change in the publications filter code: counts are derived from the cards, now **6 / 3 / 3 / 1** (All / SINTA 2 / SINTA 4 / 1st Author), status line reads "Showing 6 of 6 publications". Command palette unaffected (15 items). JSON-LD and meta descriptions contain no publication counts.

**Verified in real headless Chromium:** hero reads "6 SINTA-Indexed Publications", filter counts and status as above, SINTA 2 shows exactly the three right cards, 1st Author shows only the Air Power paper, timeline order correct, no page errors, tag balance and unique IDs intact. (A first attempt at the timeline insertion used a greedy regex and duplicated a block — 28 items; it was caught by comparing the item count with the committed version, reverted, and redone with a precise slice.)

**Not done / needs Refa**
- `assets/documents/Refa_Defanda_Witanto_CV.pdf` has a PUBLICATIONS section listing the original five papers. Claude has no editable source for the CV, so Refa must add the sixth there and re-export (same pending CV job as the old project figures).
- Date question: the PDF says the paper was published 8 Sep 2026 although it belongs to the March 2026 issue. The site follows the issue date like the other cards. If Refa prefers actual publication dates, the timeline entry would move to "Sep" and sit last in the 2026 card.
- Per-paper DOI links stay off (Phase 1 decision C9); this paper does have a DOI if Refa ever wants to reverse that.

## Command palette & publications filter redesign (Sep 30, 2026)
Refa (with screenshots taken against the up-to-date CSS) found the first versions plain, disliked the "Esc" badge, and asked for a more modernist look plus some motion on the SINTA filter. All verified in real headless Chromium (see the tooling note in the next section).

**Navbar trigger.** Now a slim pill (white, hairline border, soft shadow, lifts on hover). At ≥1440px it carries a shortcut chip that shows `⌘K` on Apple devices and `Ctrl K` elsewhere (chosen in `command-palette.js`; verified both); below 1440px it is icon-only because the 1280px desktop navbar is already full. `aria-keyshortcuts="Control+K Meta+K"`.

**Palette panel.** Blurred scrim + frosted panel that drops in (fade, small slide and scale). Search row with a coloured icon, a caret in the primary colour, and a primary-coloured underline while focused. **No "Esc" anywhere**: the close control is an icon-only round ×, and the footer hint (desktop / non-touch only, via `pointer: coarse`) reads "↑ ↓ Navigate · ↵ Open". Each result has a tinted icon tile (`#` for sections, folder for projects, download/mail for actions); the active row turns primary-tinted with a `↵` chip. Items rise in once when the palette opens (never replays while typing). Empty state names the query. Placeholder is "Search or jump to…" (longer text truncated on phones).

**Publications filter.** Segmented control with a primary-coloured thumb that slides between options, live counts per option (derived from the cards; 5/2/3/1 at the time, 6/3/3/1 after the sixth publication; hidden ≤480px), and a "Showing N of 5 publications" status line (`role="status"`, announced politely). Only rendered when JS runs (`.js .pub-filter-wrap`). On change (skipped under `prefers-reduced-motion`): cards that stop matching fade and shrink out (170ms) → the list animates to its new height → staying cards glide to their new position (FLIP) → newly matching cards rise in with a 70ms stagger. A newer click settles any in-flight animation first; verified that six rapid clicks end in a consistent state with no leftover inline styles or running animations. Cards get `.is-visible` explicitly when shown, because a card hidden before it was ever scrolled into view would otherwise stay at opacity 0.

**Files changed:** `assets/css/styles.css` (blocks 13–14 rewritten), `assets/js/command-palette.js` and `publications-filter.js` (rewritten), `index.html` (trigger, panel and filter markup), both case-study pages regenerated from the shared template.

## Real-browser verification now possible + fixes to the two new features (Sep 29, 2026)
**Tooling correction.** Earlier notes say no browser can run in the sandbox. That was true for Playwright (its browser download is blocked) but not for everything: `@sparticuz/chromium` + `puppeteer-core` install from the npm registry (allowed) and launch a real headless Chromium (`--no-sandbox`, `file://` URLs work). Playwright-style screenshots, real clicks/keyboard and layout measurement are therefore available. Fonts fall back (Google Fonts is blocked), so widths of text in renders are slightly wider than on the live site.

**What Refa reported.** Screenshots showed the navbar "Ctrl K" button as a huge unstyled square (giant icon, text stacked underneath) and the Publications filter as plain default browser buttons. Cause, verified: nothing wrong in the shipped CSS — the file parses cleanly (postcss), the rules are top-level, and rendered from the delivered `styles.css` both look styled. The screenshots match a **stale `assets/css/styles.css`** on Refa's machine (blocks 13–14 missing), i.e. the new `index.html`/JS were copied but the new stylesheet was not (or is cached). Fix on Refa's side: replace `assets/css/styles.css` with the delivered copy and hard-refresh (Ctrl+Shift+R).

**Real bugs found by rendering and fixed anyway**
1. Navbar crowding: with the extra button, "Ctrl K" and the wordmark could wrap onto two lines at 1280px. Now `white-space: nowrap` on both, and the "Ctrl K" hint only shows at ≥1440px (icon-only below; the desktop navbar starts at 1280px and is already full). Verified at 1280/1366/1440/1920: wordmark 1 line, no overflow.
2. **Palette items could not be clicked** (jsdom did not catch this; a real browser did). `mouseenter` called `render()`, which rebuilt the list and replaced the element under the pointer between mousedown and mouseup, so the click was lost. Highlight changes now update classes in place (`setActive`), and hover uses `mousemove` so a list scrolling under a resting pointer does not steal the selection.
3. On phones the palette can be opened from inside the full-screen menu; jumping left that menu open over the page. `activate()` now closes the menu if it is open.
Re-tested in real Chromium: Ctrl+K opens with focus in the input; typing filters; arrows + Enter jump; Esc closes and focus returns to the trigger; hover then click jumps; mobile menu → palette → pick closes both and scrolls; the Email action is offered. Publications filter buttons render as pills and SINTA 2 shows exactly two cards.

**Also rendered for the first time:** `case-studies/kimia-farma.html` (desktop, full page viewed) and `bmi.html` (mobile 390px, checked for horizontal overflow only — none). Kimia Farma layout looked correct (hero, steps, KPI tiles, bar chart, dashboard figure, cards, footer). The BMI page was not visually inspected; Refa's own review is still pending.

## Case-study pages — draft layout (Sep 28, 2026)
Refa approved real multi-page case studies and, with the dashboard rebuild postponed ("harus dari awal banget"), asked for the layout first.

**What exists**
- `case-studies/kimia-farma.html` and `case-studies/bmi.html`, generated from one shared template so the two pages cannot drift. They are **not linked from the homepage yet**, carry `<meta name="robots" content="noindex, nofollow">`, and show a visible "Draft layout" banner. Both are marked with `REMOVE BEFORE PUBLISHING` comments.
- One new CSS block at the end of `assets/css/styles.css`: **"12. CASE-STUDY PAGES"** (`.cs-*` classes). It reuses existing tokens and shells (`.card`, `.chip`, `.stat`, `.section-heading`, `.project__media` + the lightbox), so the pages match the homepage without a new visual language. Sections are still direct children of `<main>`, so the shared section rhythm and even/odd banding apply.
- Paths are relative (`../assets/...`), which works locally and under `/portfolio/`. The navbar/footer markup is duplicated in each page (vanilla HTML, no templating): if the homepage nav changes, both case-study pages need the same edit. The Projects nav link is pre-marked `is-active`; `nav.js` needs no changes (it finds no matching sections and exits).
- Page structure: hero (sector kicker, title, summary, program/period/data/tools) → 01 Context & question → 02 Approach (numbered steps) → 03 Results snapshot (four KPI tiles + an HTML/CSS bar chart, values always printed as text) → 04 What the data shows → 05 The dashboard (original screenshot in the lightbox, plus a correction note and a dashed v2 placeholder) → 06 Recommendations → 07 Data check & corrections → GitHub links and previous/next project cards.
- Every figure comes from Refa's raw files as recomputed on Sep 28, 2026 (see "Open data questions"), not from the old dashboard screenshots.

**Left out on purpose — Refa to decide**
- BMI deck: "underperforming cities (Albany, Springfield)" — those are the 5th and 6th of 361 cities by sales. And the Ramadan/Eid seasonality recommendation — the dataset is US-based and its peak (Jun 2021) does not line up with either.
- Kimia Farma deck: the "investigate branch service quality" recommendation (the rating gap is a selection effect) and the "raise margins through cost efficiency" line (the data has no costs).
- Consequence: Kimia Farma has one recommendation plus a placeholder card; BMI has three.
- Two BMI links from the final-task deck (SQL file on GitHub, YouTube presentation) are included and flagged with a `REVIEW` comment.

**Before these pages go live**
1. ~~Homepage cards showed the old figures and the Kimia Farma "rating gap" sentence.~~ **Fixed Sep 28, 2026** — `index.html` now shows the corrected figures and wording (see "Homepage cards corrected" below), so it no longer contradicts the case studies.
2. Decide whether the original screenshots stay (with the correction notes now in the pages) or are replaced by a rebuilt v2 dashboard.
3. Add "Read the case study →" links from each homepage project card once Refa has visually reviewed the draft pages, then remove the banner and the noindex tag.

**Homepage cards corrected (Sep 28, 2026).** `index.html` project cards now match the case-study figures exactly:
- Kimia Farma: Total Transactions 672,458; Nett Sales Rp321.17B; Nett Profit Rp91.21B; Customer Names 264,601 (relabelled from "Customers" — the field is `customer_name`, not a true ID). Key-insight sentence now cites Jawa Barat's corrected Rp94.87B / 29.5% and the flat year-over-year trend, and no longer claims a branch-rating "gap" (selection effect, see "Open data questions").
- BMI: Total Sales is `$1.75M` (currency confirmed USD Sep 29, 2026 — see "Open data questions"); "Total Orders" split into two correct stats, **Orders 3,339** and **Units Sold 11,654** (the card had one mislabeled number; now both real numbers are shown).
- **Not fixed — needs Refa:** `CV_Refa_Defanda_Witanto.pdf` (bullet points) and the LinkedIn/portfolio-deck equivalents state the same old wrong figures (`Rp346.96M`, `Rp98.54M`, `Rp102.5M`, and "integrating 11,654" as if that were a row/record count for BMI). Claude has no source file for the CV (only the exported PDF) and cannot edit it — Refa needs to fix this wherever the CV is authored (Canva/Word/Docs) and re-export.

**Verification:** structural only — tag balance, unique IDs, every relative link and image exists. No browser is available in the working sandbox, so nothing has been rendered. Needs Refa's visual check at roughly 375, 768 and 1440px, including the lightbox on the dashboard screenshot and the bar rows on mobile.

## Open data questions (raised Sep 28, 2026)
Found while reading the two final-task decks against what the cards say. Status after Claude re-checked BMI from the raw workbook and Refa's own AI agent recomputed both projects.

**BMI — verified by Claude from `dataset_task_5.xlsx`** (orders, product, product category, customers sheets):
- Total sales = **1,754,750.57** (Σ quantity × price) → the dashboard's "1,75 jt" is correct as a number. A competing figure of ≈349.5k from Refa's agent was wrong and should be ignored.
- **3,339 distinct orders**, **11,654 units** (Σ quantity), **1,671 customers**; all joins match with no row fan-out (3,339 rows after every join).
- Dashboard city table (Washington 55,382 / 308 units, Houston, Sacramento, San Diego, Albany, Springfield), category bars, 361 cities, and the monthly trend (peak Jun 2021 ≈ 95.4k, low Oct 2021 ≈ 52.3k) all reproduce exactly.
- Consequences: the scorecard labelled "Total Order 11654" is really **units sold**; the true order count is **3,339** (≈ 2.0 orders per customer). The deck's "11,600 orders from 1,671 customers" is wrong on the same point.
- **Currency confirmed as USD (Sep 29, 2026).** No currency field exists in the dataset, but every customer's city/state/ZIP/area-code is a real matching U.S. location and 25 of 70 product prices end in .99/.95/.50 (U.S. retail convention). Refa confirmed; cards and case-study page now show `$1.75M`.

**Kimia Farma — verified by Claude from the four raw CSVs** (672,458 transactions, 150 products, 1,725 branches, 31 provinces, 2020-01-01 → 2023-12-30; no duplicate IDs, every transaction joins to a product and a branch, transaction price equals product price on every row):
- `discount_percentage` takes 0.00–0.15 in 0.01 steps (mean 0.075), so it is a **fraction**. Correct formula: `price * (1 - discount_percentage)`; the deck's `/ 100.0` shrinks every discount 100×.
- The deck's formula reproduces the current cards exactly (nett sales 346,961,801,575; nett profit 98,539,911,168), so the cards are what the flawed query outputs. "M" on the dashboard means *miliar* (billion).
- **Corrected figures:** nett sales **Rp321,171,190,319 (≈ Rp321.17 billion)**, nett profit **Rp91,214,988,060 (≈ Rp91.21 billion)**. The deck overstated both by 8.03%; profit margin is 28.40% either way. Refa's agent's nett-sales figure was right.
- Province top-10 charts, transaction counts and the branch-rating table reproduce exactly, and the province ranking does **not** change after the fix. Jawa Barat corrected: Rp94.87 billion nett sales (29.5% of the total), 198,723 transactions.
- Year-over-year (corrected): nett sales 80.44 / 80.04 / 80.58 / 80.12 billion for 2020–2023 (−0.5%, +0.7%, −0.6%) — flat, with ≈168k transactions every year. Every February is the lowest month of its year (the recurring dips on the dashboard line).
- "Customers 264,601" is the count of **distinct `customer_name`** — the data has no customer ID, so it should be labelled that way.
- **Rating insight overreaches.** Average transaction rating is 4.000. The 96 branches rated 5.0 average 3.997 versus 4.000 for the rest (correlation ≈ 0.02). The "lowest" 5-star branches (3.905–3.957) are what chance alone produces: simulating 96 random branches gives a minimum around 3.93. The deck/card wording about a service-quality "gap" is a selection effect and should be reworded (the deck also says "transaction volume" where the table is about transaction *rating*).

**Site status:** no card figures were changed. `index.html` still shows `Rp346.96M` / `Rp98.54M` / `Rp102.5M` (Kimia Farma) and `Rp1.75M` / `11,654 Total Orders` (BMI). They are on hold until the sources are fixed (Looker scorecards for BMI; SQL formula, dashboard and screenshot for Kimia Farma), so text and screenshots don't contradict each other.

## Next recommended task
1. **Refa reviews the two draft pages locally, and now also the command palette (Ctrl/Cmd+K) and publications filter** (open `case-studies/kimia-farma.html` and `bmi.html` from the repo folder) at desktop, tablet and phone widths; report anything off.
2. **Fix the CV PDF** (and anywhere else the old figures appear, e.g. LinkedIn) — Claude cannot do this one, no source file available.
3. Once both of the above are done: add "Read the case study →" links on the homepage cards, remove the draft banner and noindex tag from the two case-study pages.
4. **Decide on the dashboards:** keep the original screenshots with the correction notes, or rebuild v2 (BigQuery + Looker Studio, with Extract Data so it survives BigQuery's 60-day sandbox expiry). Rebuilding is postponed for now.
5. **Commit and push** everything from the Sep 2026 rounds (feature round, GoatCounter code, corrected homepage cards, case-study pages), then check the live site and the first GoatCounter pageview.
6. Optional, unchanged: self-host fonts; a real Lighthouse pull on the live site.

## Motion & UX round (Oct 2, 2026)
- New files: `assets/css/motion.css`, `assets/js/motion.js` (init via `initMotion` in main.js; linked in index.html). Existing files otherwise untouched.
- Added: lightbox grows from the clicked card/screenshot and shrinks back on close; click-to-zoom in lightbox; button ripple + press state; cursor spotlight on project/cert cards; heading underline sweep after anchor jumps; copy-email button + toast; back-to-top; mobile Resume/Contact bar (<768px).
- Verified in headless Chromium (desktop 1440, mobile 390). Not yet committed/pushed.

## Skills & Projects redesign (Oct 2, 2026)
- New file `assets/css/redesign.css` (linked after motion.css). `index.html`: Skills and both project articles restructured; tabs, SQL panel, lightbox triggers and all text/figures preserved.
- Skills: 2x2 grid (1 col on mobile), one accent per category (blue/teal/violet/coral), all chips left-aligned and nowrap, per-card "proof" block that links to the real evidence (2 projects, 1 certificate, 5 certificates, 6 publications).
- Projects: header band + media/KPI/visual split + three story blocks (Context, My contribution, Key insight) + footer with tools and GitHub link. Kimia Farma = teal (29.5% Jawa Barat ring, 4-dataset -> table -> dashboard flow); BMI = violet (top categories/city picks, same flow).
- Data-viz palette tokens added: `--viz-teal/violet/coral` (+ -deep, -tint). Gold unchanged.
- Verified in headless Chromium at 1440 / 820 / 390. Not yet committed/pushed.

## About / Expertise / Education redesign (Oct 2, 2026)
- `index.html` (About, Expertise, Education markup) + `assets/css/redesign.css` (appended). All original text kept; the old About credentials line is now the snapshot cards + location.
- About: text + 4 colored snapshot cards (all facts from existing copy). Expertise: 5 colored cards (6-col grid, row 2 fills fully) with tag chips taken from the Skills lists. Education: degree card with semester track (7 of 8 — the 8 is derived from Aug 2023–Aug 2027), GPA ring (3.53/4.00), standing tile, gold honors note.
- New token: `--viz-green` (+deep/tint) for the 5th expertise card.
- OPEN: Universitas Brawijaya logo — Refa must supply an SVG/PNG. Placeholder is a graduation-cap icon; swap instructions are in an HTML comment inside `.edu-main__head`.
- Verified in headless Chromium at 1440 / 820 / 390. Not yet committed/pushed.

## Timeline / Resume / Contact redesign (Oct 2, 2026)
- `index.html` (3 sections), `assets/css/redesign.css` (appended), `assets/css/motion.css` (copy button shrunk: it was stretching full-width inside the old column-flex contact row; now 28px tall on mouse, 44px on touch).
- Timeline: sticky year rail + colour-coded cards (EDU blue, HONOR gold, CERT teal, PROJECT violet, PUB coral, lead-author PUB gold) via `data-cat` on each `<li>`; 2-column grid on >=700px. All 20 entries unchanged.
- Resume: info card (file name, PDF·A4, 2 pages, updated date, Download + Open in new tab) next to a framed preview; preview URL now has `#toolbar=0&navpanes=0&view=FitH` to hide the browser PDF toolbar/sidebar (Chrome/Edge; other browsers may ignore it). Not verifiable in headless Chromium (no PDF viewer) — Refa to check in a real browser.
- Contact: info rows as cards with Gmail/WhatsApp/location icon tiles, buttons with LinkedIn/WhatsApp/Gmail icons (paths from simple-icons 13.21.0, CC0), colour dots on the "open to" chips. New tokens `--viz-red`.
- Resume "last updated Aug 13, 2026" and the CV PDF itself are still outdated (5 papers, old figures) — Refa must re-export.

## Timeline fix + Certifications + Publications (Oct 2, 2026)
- Timeline bug: 2023 card was 16px out of line with later years. Cause: the reset rule `.timeline__year-card + .timeline__year-card` used `gap`, which beat the desktop `column-gap` for every year except the first. Now `row-gap` in the base rule; verified all four years start at the same x.
- Certifications: summary tiles (11 certificates, 6 platforms, 2 virtual internships), colour-coded groups with count badges (internships violet, courses teal, other coral), and a real thumbnail of each certificate (new `assets/images/certificates/thumbs/`, 560px, ~326 KB total, lazy-loaded). Clicking the thumbnail or the link opens the existing lightbox.
- Publications: snapshot tiles (6 papers / 1st author / 3+3 SINTA split / 2–7 authors per paper), tier-coloured left borders, and an author-position dot strip on each card (text kept for screen readers). Filter still works (verified).
- Snapshot numbers all derive from the existing cards; "all published in 2026" and "2–7 authors" are read from the card text.
- Layout gotcha: elements that are direct children of a `<section>` must not reset `margin-inline`/`padding-inline` (the container rule lives there) — use `margin-block`.

## Font change: mono removed from UI labels (Oct 3, 2026)
- `--font-mono` in styles.css now points to the display sans (Schibsted Grotesk), so KPI numbers, uppercase labels, dates, filter pills and chips no longer look like code. New `--font-code` (IBM Plex Mono) is used only by real code: `.sql-code`, `.cs-code`, `.workflow__calls code`.
- index.html loads IBM Plex Mono at weight 400 only (was 400/500/600). 404.html and case-studies/*.html still load the old 3 weights — harmless; note the global token change also affects the case-study drafts' labels/numbers.
- Fixed: KPI `<dd>` default margin made values sit right of their labels (`.stat-value { margin: 0 }` in redesign.css).

## Skills section redesign, round 2 (Oct 3, 2026)
- Replaced the big-number "proof" blocks (awkward: tiny text, detached number, footnote-like links) with an "evidence" footer per card: label (Applied in / Learned through / Shown in) + link pills with icons and an arrow, pointing to #project-kimia-farma, #project-bmi, #certifications, #research, #about. Old `.skill-proof*` CSS removed from redesign.css.
- Tools marquee: now a card (label left, pause button right on one row), each tool in a pill with a full-colour logo. Items use `margin-right` instead of flex `gap`, so the -50% loop lands exactly on the duplicate (the old gap-based track was off by half a gap at the loop point).
- Note: direct children of a `<section>` must keep the container's inline padding; the marquee card uses an explicit width/max-width instead.
- Verified at 1440 and 390 in headless Chromium; all 7 evidence links resolve to real ids.

## Project tab animation (Oct 3, 2026)
- `assets/js/media-tabs.js`: switching Overview/Detail/SQL now slides — the old panel slides out (160 ms), the new one slides in from the side of the tab you clicked (420 ms), and a blue pill glides behind the selected tab (`.media-tabs__thumb`, styled in motion.css). A second click mid-animation finishes the first swap instantly (verified with rapid clicks). aria-selected, roving tabindex, arrow keys and the caption are unchanged; reduced-motion users get an instant swap.
- OPEN: company logos (Kimia Farma, Bank Muamalat, optionally Rakamin) for the project headers — Refa must supply SVG/PNG files; nothing added yet.

## Project logos (Oct 3, 2026)
- Refa supplied Kimia Farma (SVG), Bank Muamalat (SVG) and Rakamin (PNG). Prepared into `assets/images/logos/`: SVG viewBoxes cropped to the artwork (the originals sat on a 950x950 / letter-size canvas) with fixed width/height removed; Rakamin PNG cropped of its transparent margin and resized to 520px wide. Used as `<img>` with alt text, so SVG styles cannot leak into the page.
- Header: client logo in a larger white tile, "via", Rakamin in a smaller tile. Top-right on >=900px; above the sector pill on smaller screens. Hierarchy is deliberate: the client is where the project was done, Rakamin is the programme.

## Education, round 2 (Oct 3, 2026)
- Degree card now has a semester map: 8 numbered bars (1–6 done, 7 = "Now", 8 upcoming), academic-year brackets (2023/24 … 2026/27) and milestone icons above the semester they fall in, plus a legend list: Sem 3 ALSA 2nd Winner, Sem 4 Kimia Farma internship, Sem 5 Bank Muamalat internship, Sem 6 Publications in 2026.
- ASSUMPTION (derived, Refa to confirm): semesters start in Aug and Feb, so Aug 2023 = Sem 1 and Oct 2026 = Sem 7. Milestone placement follows from their dates (Nov 2024, Apr–May 2025, Oct–Nov 2025, 2026).
- Right column: GPA ring, Current Standing, new Expected Graduation (Aug 2027) tile. Honors card rebuilt as a gold feature card (big "2nd", title, essay in italics, meta chips) — same facts, re-arranged.
- Old `.edu-track*` CSS removed. UB logo slot still holds the graduation-cap placeholder (Refa to send logo).

## Education round 3 + GitHub icons (Oct 4, 2026) — worked on the freshly downloaded repo
- Removed (Refa's request): the "Sem 3–6" milestone legend and the large "Expected Graduation" tile. The semester map keeps its icon marks above semesters 3–6; they now carry hover tooltips (title attribute) since the legend is gone.
- GPA tile: ring + 0–4.00 scale bar with a pin at 3.53 (animated on reveal). Current Standing tile: 8-arc donut (7 filled, "7/8" in the centre) + chips "Final year" and "Year 4 of 4" (derived from semester 7 of 8).
- UB logo wired in: Refa had added `assets/images/profile/ub-logo.svg` (2.7 MB, ~9,300 traced paths — too heavy for a 64px badge), so a 160px transparent PNG (`ub-logo.png`, 48 KB) is used instead. The original SVG is untouched and can be deleted from the repo to save space.
- Project buttons: GitHub mark (simple-icons, CC0) added before "View on GitHub →" on both project cards.
- Dead CSS removed: `.edu-milestones*`, `.edu-tile__big`, `.edu-tile__icon`. Verified at 1440 / 760 / 390 in headless Chromium, no overflow, no JS errors.

## Expressive animation round (Oct 4, 2026) — built on a freshly downloaded repo
Refa's choices: all sections, all four animation types, intensity "expressive but tidy".
- New files: `assets/css/expressive.css`, `assets/js/expressive.js` (linked in index.html after redesign.css / motion.js; self-initialising, does not touch main.js). Content is only hidden once the script adds `html.xp`, so a failed script never hides anything; the whole layer is skipped for `prefers-reduced-motion`, and cursor effects are skipped on touch devices.
- Headings: hero name and every section title rise word-by-word out of a mask (aria-label keeps the full text for screen readers).
- Cursor: cards (Expertise, Skills, snapshot tiles, certificates, Education tiles) and the hero photo tilt toward the pointer (CSS `rotate`, perspective on the parent); the accent shape behind the hero photo drifts against the cursor.
- Scroll-linked: timeline spine fills as you scroll and the year dots light up (>=1000px only).
- Data: KPI numbers, certificate/publication summaries and the "07 skills" counters count up on reveal and always end on the exact original text; publication bar segments grow; flow lines draw; chips, story blocks, logos and author dots enter in a stagger (CSS animations, so existing hover transitions are untouched).
- Verified in headless Chromium: desktop 1440 (every effect), reduced-motion context (no `xp`, nothing hidden, spine static), mobile touch 390 (no overflow, no tilt, everything revealed). No console errors.

## Timeline spine fix (Oct 4, 2026)
- Bug: the spine was positioned from the track's border edge, but the track carries the section container's inline padding (50–64 px), so the line sat 50–64 px left of the dots and cut through the year numbers. `expressive.css` now uses `left: calc(var(--container-pad) + 165px)`; spine x equals dot x at 1000/1100/1440/1920 px and clears the year text.
- Also: the spine now reaches exactly 100% when the bottom of the timeline reaches the bottom of the screen (before, it stopped around 78%).
- NOTE: `expressive.css` / `expressive.js` were not yet on GitHub main when this was checked (they exist only in Refa's local copy), so they must be committed together with the index.html link tags.

## Hero buttons: magnetic effect removed (Oct 5, 2026)
- Refa reported that hovering between two hero buttons made them overlap. Cause: `magnet()` in `expressive.js` pulled every button within 70px of the cursor up to 12px toward it, so two neighbours separated by a 16px gap each moved 12px inward and collided (measured: gap 16px → -8px, same at 1440 and 768px).
- Decision: the magnetic effect was removed entirely (function and its call), not patched. It moved click targets while the visitor was aiming at them, and the benefit was purely decorative.
- Unchanged: hover colour and lift, press scale, ripple, card tilt, hero photo drift. The removed effect also covered the contact, resume and project-link buttons.

## Oct 5, 2026 — Experience, self-hosted fonts, README, accessibility
- **Experience entry:** new "Experience" block at the bottom of About (h3, with the card title as h4): Research Fellow, Veritas Institute of Politics, Social Sciences & Humanities Department, Dec 2024 – Present, four bullets taken from the CV. Placed inside About on purpose so section numbering, the navbar and the command palette are unchanged. Styles: end of `redesign.css` (`.card--experience`). Needs a refresh if the CV's Veritas wording ever changes.
- **Google Fonts removed:** Schibsted Grotesk and Public Sans (variable, latin subset) and IBM Plex Mono 400 are now served from `assets/fonts/` via `@font-face` at the top of `styles.css`, with `font-display: swap` and `<link rel="preload">` for the two UI fonts on all four pages. No request goes to fonts.googleapis.com or fonts.gstatic.com any more (checked in a browser). Licences: `assets/fonts/LICENSES.txt` (SIL OFL 1.1). If a new weight or italic is ever needed, add a new `@font-face`; Plex Mono is regular (400) only and is used for code blocks.
- **Empty `alt=""` audit (12 images):** 11 certificate thumbnails and the lightbox placeholder are intentionally decorative (the thumbnails sit in links that are `aria-hidden` and `tabindex="-1"`, the real control is the "View Certificate" button; the placeholder is overwritten by `modal.js`). No change needed.
- **Accessible names:** the 11 "View Certificate" links all read the same to a screen reader. Each now keeps its visible text in an `aria-hidden` span and has a visually hidden "View certificate for <title>" label. Visible layout is unchanged.
- **README.md** added at the repo root (live URL, sections, features, structure, local run, deployment, credits).
- **Sosiohumaniora date:** the journal's confirmation letter (no. 21/SK/VIII/2026, 31 Aug 2026) states the paper was accepted in Aug 2026 but is officially part of the March 2026 issue (Vol. 28 No. 1). The publication card keeps "March 2026" (the issue). Open question: the Timeline entry is labelled "Mar", which reads as when it happened; Refa to decide whether it should say Sep.
- **Next recommended task:** Refa pushes these files, then Phase 8 testing on real devices; optional: Veritas entry in the Timeline, decide the Sosiohumaniora timeline label.

## Oct 5, 2026 (later) — Timeline updates and BMI "How I work"
- **Sosiohumaniora timeline label:** changed from "Mar" to "Sep" and moved to the end of the 2026 card (Refa accepted Claude's suggestion). Reason: the journal's letter (no. 21/SK/VIII/2026) says the paper was accepted in Aug 2026 and released in Sep 2026, while the issue itself is March 2026. The publication card in Research keeps "March 2026" (the issue citation). Note: the other 2026 entries still carry their issue months, so this one is the only entry dated by actual publication.
- **Veritas in the Timeline:** new entry in the 2024 card after the ALSA honor: `Dec · ROLE · Joined Veritas Institute of Politics as Research Fellow (ongoing)`. New category `ROLE` (green accent, briefcase icon, rule at the end of the timeline colour block in `redesign.css`). Timeline items 20 → **21**; intro line now reads "Education, experience, research, projects, and certifications".
- **BMI "How I work":** a second `.workflow` block under the projects, built only from Refa's BMI repo README (load, model, validate, report, plus four documented judgment calls). The existing block's heading became "How I work: Kimia Farma"; the new one is "How I work: Bank Muamalat". No CSS needed; it reuses `.workflow`.
- **Open item (BMI currency):** the BMI repo README says the dataset has no currency and reports plain numbers, while the homepage tile reads "Total Sales $1.75M" (Refa had confirmed USD earlier). Needs one consistent answer.
- **Open item (BMI README):** the uploaded README still has the placeholder `[Looker Studio](ISI_LINK_LOOKER_STUDIO)` under "Live dashboard".
- **Open item (wording):** Expertise card 03 "Statistical Analysis" says "Applying … hypothesis testing", but Refa confirmed on Oct 5 that the statistics and Python experience is online coursework only (the Skills section already says "Learned through …"). Wording to be aligned.
- **CV corrections still pending (Refa re-exports):** Kimia Farma numbers (672,458 transactions; Rp321.17B nett sales; Rp91.21B nett profit; 264,601 distinct customer names; Jawa Barat Rp94.87B, 198,723 transactions; remove the "service quality mismatch" claim), BMI "11,654 transaction records" (11,654 is units; the master table has 3,339 rows), add the sixth publication (Sosiohumaniora, SINTA 2), and relabel the Dsarea entry as an online course. After re-export, the Resume section's "Updated Aug 13, 2026" must change.

## Oct 5, 2026 (evening) — "Explore the data": interactive charts
- **What it is:** a new block inside Featured Projects (`#explore`, h3 + two h4 chart cards), placed between the two project cards and the two "How I work" blocks. Refa chose interactive charts, a "Current focus" line, a transcript preview and a language row from Claude's suggestions, and said larger interactive features are fine if they stay light.
- **Bank Muamalat chart (violet):** product categories with a toggle Sales | Units sold. The rows re-sort and slide (FLIP) and the bars resize; the ranking flips (Robots top by sales, eBooks top by units). Insight lines come from the repo README: "about 70% of sales with about 20% of units" and "59% of units but only 8.9% of sales".
- **Kimia Farma chart (teal):** top 10 provinces by nett sales (Rp billion) with a toggle Top 1 | Top 3 | Top 10 that dims the rest; insight lines 29.5% / 43.6% / 70.8% are the figures already on the case-study page.
- **Data rule:** every figure is a value already stated in Refa's README or in the case-study page (nothing derived beyond units ÷ total units for the "% of all units" tooltip, and 198,723 transactions for Jawa Barat). Values are in US dollars for BMI (Refa confirmed) and in Rp billion for Kimia Farma (corrected formula).
- **Code:** markup holds the data in `data-*` attributes (`index.html`), behaviour is `assets/js/data-explorer.js` (new, registered in `main.js` as `initDataExplorer`, script tag added before `main.js`), styles are at the end of `redesign.css`. No libraries. Without JavaScript the default view (sales, top 10) still shows and the toggles stay hidden.
- **Accessibility:** rows are native buttons with one Tab stop per chart (arrow keys, Home/End move between rows); details sit in an `aria-live="polite"` line; tap targets ≥ 44px (57px on phones, where the bar sits under the label); dimmed rows keep ≥ 4.5:1 contrast; no colour-only meaning (values are printed and YoY carries a sign); motion is skipped under `prefers-reduced-motion`.
- **Tests (browser, desktop and 430/390/375px):** toggles, re-sort, hover/click/keyboard details, Top 3 dimming, no-JS fallback, reduced motion, and a regression pass on palette, media tabs, lightbox and marquee. No JS errors.
- **Also in this round:** the Expertise "Statistical Analysis" coursework wording was re-applied on top of the latest GitHub copy (the earlier bundle had been pushed without it).
- **Still waiting on Refa:** text for the "Now / Current focus" strip, languages and levels, the transcript PDF (and whether to show it), and topics for the "Notes" section.

## Oct 6, 2026 — Current focus and transcript preview
- **Current focus (About, between the story and Experience):** three cards under h3 "Current focus", with "Updated October 2026". (1) Interning now: Digital Product Specialist at Study First (Refa works at its sister brand Fluenesia but uses "Study First" to match LinkedIn). (2) Completed, certificate pending: MySkill "Microsoft Excel Basic to Advanced: Fullstack Intensive Bootcamp" Batch 36 with Final Project Mentoring Excel 36. (3) In progress: MySkill "Data Analysis: Fullstack Intensive Bootcamp" Batch 30 with Final Project Mentoring Data Analyst 30 (started about a week before Oct 6). No dates or curriculum are stated because Refa gave none and the web search found nothing about these batches. Styles at the end of `redesign.css` (`.about__now`, `.now-item`).
- **Transcript preview (Education):** a row at the bottom of the degree card: "144 credits (SKS) · 49 courses · 22 graded A (as of Aug 2026)" plus a "View transcript" button. It opens the existing lightbox (new trigger type `data-modal="transcript"` in `modal.js`; the dialog already scrolls and has click-to-zoom). Source: the transcript dated Aug 24, 2026 that Refa uploaded (GPA 3.53, 144 SKS, 49 courses, 22 A / 14 B+ / 9 B / 4 C+, matching the 7th-semester and GPA tiles).
- **Privacy decisions (made by Claude, Refa can veto):** the image `assets/images/transcript/transcript-2026-08-redacted.jpg` is a flattened raster of both pages, so the hidden text cannot be recovered. Two items are covered with grey bars: the student ID (NIM) and the Vice Dean's employee number (NIP). The student name, grades, GPA, stamp and signature stay visible. There is no PDF download on purpose (view only). The original PDF stays with Refa; it is not in the repo.
- **To update when things change:** the "(as of Aug 2026)" facts and the transcript image after the next semester's grades; the Current focus cards as the bootcamps finish; add a 12th certificate card (and change "Eleven certificates" wording in the README and the CV note) once MySkill issues the Excel and Data Analysis certificates.
- **Still waiting on Refa:** languages and levels for the language row; Notes topics; start date and responsibilities of the Study First internship if it should also get an Experience and Timeline entry.

## Oct 7, 2026 — Final CV installed
- **CV replaced:** `assets/documents/Refa_Defanda_Witanto_CV.pdf` is now Refa's re-exported final CV (A4, 2 pages, 97 KB). This resolves the earlier "CV still outdated" notes in this file. Content verified against the site: Kimia Farma figures (672,458 transactions; Rp321.17B nett sales; Rp91.21B nett profit; 264,601 distinct customer names; Jawa Barat Rp94.87B and 198,723 transactions; score 91.56), BMI figures (3,339 orders, 11,654 units, $1.75M, Washington $55,382, Robots -15.4%), all six publications, five curated certifications, a Portfolio link in the header, and links to LinkedIn, Google Scholar and both GitHub repos. The old figures and the "service quality" claim are gone.
- **CV choices made by Refa:** "statistical analysis" removed from the Summary and Skills; no "first author" marker; no in-progress or pending certificates listed; Experience is one section with Study First (Sep 2026 - Present, Digital Product Specialist Internship) above Veritas; the Dsarea course moved to Certifications only.
- **Resume section:** description now "Covers education, experience, projects, skills, publications, and certifications."; "Updated" is Oct 7, 2026.
- **ALSA wording corrected on the site:** the certificate reads "2nd Winner of Legal Essay Competition English Competition 2024 ... at ALSA English Competition 2024" (ALSA LC UJ = ALSA Local Chapter, Universitas Jember). The site said "ALSA Legal Essay Competition — English Competition". Now: Education honors title "2nd Winner, Legal Essay Competition" with the event "ALSA English Competition 2024" in its meta line; Timeline "2nd Winner, Legal Essay Competition — ALSA English Competition"; the semester-mark tooltip matches. The CV wording already matched the certificate.
- **Open (hero tagline):** the hero still says "...Looker Studio dashboards, and statistical analysis that support real decisions...", while the CV no longer claims statistical analysis. Suggested edit: drop "and statistical analysis". Waiting for Refa.
- **Deployment note:** the bundle-5 features (interactive charts, Current focus, transcript preview) were still not on GitHub when this CV was installed; bundle-6 contains everything.

## Oct 7, 2026 (later) — Analysis notes and alignment with the final CV
- **Analysis notes:** new block at the end of Featured Projects (`#notes`, h3 "Analysis notes", three h4 cards, all text visible, no expand/collapse; no navbar change). Texts approved by Refa: (1) Kimia Farma, a low rating at a 5-star branch is selection, not a service problem (96 branches rated 5.0 average 3.997 vs 4.000, correlation about 0.02); (2) Bank Muamalat, a decimal comma that inflated sales 100x (auto-detect read 9,99 as 999; fixed with CAST(REPLACE(...)); master table 3,339 orders, 11,654 units, $1,754,750.57); (3) Bank Muamalat, sales fell 7.8% ($913,210 to $841,540) and Robots account for about 87% of it. Each ends with a highlighted "Lesson". Accents match the charts (teal for Kimia Farma, violet for BMI). Styles at the end of `redesign.css` (`.notes`, `.note-card`). All figures come from the BMI README and the Kimia Farma case study.
- **Aligned with the new CV (no statistical-analysis claims):** hero tagline now "...BigQuery pipelines and Looker Studio dashboards that support real decisions, evidenced across pharmaceutical and banking case studies."; About lead says "using research methods and dashboards" instead of "statistical methods"; Expertise card 03 is now "Statistics Coursework" (text unchanged); JSON-LD `knowsAbout` swapped "Statistical Analysis" for "Data Visualization". Left on purpose: the Skills "Statistics" group (it states "MySkill Statistics course"), the Statistics certificate card, and the Timeline certificate entry.
- **Current focus:** the Study First card now reads "Study First · Since September 2026".
- **Deployment:** bundle-7 supersedes bundles 4, 5 and 6 (cumulative against the GitHub copy of Oct 7).
- **Still open:** nothing waiting on Refa for content. Possible next steps: Timeline entry for Study First after a month, a 12th certificate card once MySkill issues the Excel and Data Analysis certificates, Phase 8 testing on real devices.

## Oct 8, 2026 — Two new certificates, third project, three case-study pages
- **Certificates 12 and 13 (MySkill, Excel batch 36), in "Data Analytics & Programming" (now 10 cards):** "Microsoft Excel Basic to Advanced: Fullstack Intensive Bootcamp" (course 29 Aug–1 Oct 2026, issued 7 Oct 2026, ID MS-7/10/2026-Vwk6GtgR3nA0nrYmxoSq) and "Final Project Report: Excel Basic to Advance" (12–26 Sep 2026, ID 347197/EXL/LM/10/2026, predicate Distinction, total score 89; the certificate prints no issue date, so the card shows the project period). Images are page 1 of each PDF (`myskill-excel-bootcamp.jpg`, `myskill-excel-final-project.jpg` plus `thumbs/`). Counts updated: hero 13 certifications, cert summary 13, README "Thirteen". Learning platforms stay 6 (MySkill already counted). The Current focus Excel card now says "Completed" (no longer "certificate pending").
- **Third project, "Sales Performance Dashboard in Excel":** new card `#project-excel` in Featured Projects (screenshot from `Final_Project_Finance_B3.pdf` → `assets/images/projects/excel-sales-dashboard.webp`, 4 KPI tiles, two highlight boxes, data-flow, Context / My contribution / Key insight, buttons "Read case study" and "Download workbook"). The workbook is `assets/documents/Sales_Performance_Dashboard_Excel.xlsx` (copy of Refa's file, includes slicers). Hero stat "Data Analytics Projects" is now 3; the Excel skill's "Applied in" list links to the new card.
- **Every figure was recomputed from the workbook's order data:** 700 orders (Sep 2013–Dec 2014; 2013 has only Sep–Dec), revenue $135,188,198, gross profit $37,846,424, net profit (est.) $16,653,606 (2013 $3,678,328 + 2014 $12,975,278), gross margin 28.0%; Amarilla $49.98M + VTT $46.93M = 71.7% of revenue; VTT gross margin 10.1% vs Amarilla 37.9%; margin by discount tier 34.3% / 30.7% / 27.5% / 25.3%; Government 42.1% of revenue. The dashboard has 5 charts, 3 slicers (Order Year, Buyer segment, Country origin) and the workbook holds 12 PivotTables.
- **Case-study pages (all three now published):** `case-studies/kimia-farma.html`, `bmi.html`, new `excel-sales-dashboard.html`; linked from each project card ("Read case study →") and chained with previous/next links (KF → BMI → Excel). Draft banner and noindex removed from KF and BMI. Also removed: the KF "Placeholder / Refa to add" recommendation card, and the BMI "Watch the presentation" YouTube link (Refa had said no YouTube link). Sitemap now lists all three pages.
- **CSS:** `styles.css` only, a small phone rule so KPI values like "$37.85M" fit inside `.cs-kpis` cards.
- **Open:** (1) the BMI page's "SQL query" button points to `sql/SQLQuery.sql` in the BMI repo; confirm that file is the current script. (2) The KF page now has one recommendation instead of two; add a second one (tied to a number on the page) if wanted. (3) Excel-project timeline entries and certificate timeline entries were not added. (4) Statistics wording: the Excel page makes no statistics claims.

## Oct 8, 2026 (later) — Timeline: internship and Excel bootcamp
- Three entries added to the end of the 2026 card (after Sosiohumaniora): `Sep · ROLE · Started Digital Product Specialist internship at Study First (ongoing)`, `12 – 26 Sep · PROJECT · Sales Performance Dashboard in Excel (Distinction, score 89)`, `7 Oct · CERT · Microsoft Excel Basic to Advanced: Fullstack Intensive Bootcamp — MySkill`. Timeline items 21 → 24. Only `index.html` changed.
- Refa's delivery preference: send changed files directly (same paths), not a zip.

## Oct 8, 2026 (evening) — Case pages enriched: interactive charts, takeaways, gallery, motion
- **New files:** `assets/css/case-study.css`, `assets/css/transitions.css`, `assets/js/case-study.js`, four crop images `assets/images/projects/excel-dashboard-{kpis-slicers,trend,product-country,profit-discount}.webp`. `expressive.js` got three selector additions (KPI count-up on `.cs-kpis .stat-value`, tilt and stagger for `.cs-gallery__item`). All three case pages now also load `motion.css`, `expressive.css`, `scroll-progress.js`, `motion.js`, `expressive.js`, and show the scroll-progress bar. `index.html` links `transitions.css`.
- **Interactive charts (real data only, all rows also exist as plain HTML, so no-JS still shows them):**
  - Excel: a monthly revenue/gross-profit line chart (hover or arrow keys, legend toggles, partial-2013 band, "view data as a table") and a bar explorer (breakdown: Product / Buyer segment / Country / Discount tier; measure: Revenue / Gross profit / Gross margin; bars re-sort with a slide; auto caption with highest and lowest). Every value is computed from the workbook's order data.
  - Kimia Farma: top-10 provinces with a Top 1 / 3 / 10 highlight. Bank Muamalat: sales share versus units share toggle. Both reuse the numbers already on the home-page explorer (checked identical).
- **New section "Challenges & takeaways"** on all three pages (Excel 3, Kimia Farma 4, BMI 3 cards: Challenge, What I did, Takeaway). The Challenge and What I did lines come from decisions already documented in the workbook and pages; the Takeaway sentences are Claude's wording and Refa should read and edit them. Section numbers shifted (dashboard is now 06 on Excel, 06 on KF/BMI).
- **Gallery:** Excel dashboard section is now the full dashboard plus four zoom crops, all opening in the existing lightbox; KF and BMI show their two dashboard pages as gallery tiles with hover zoom and an "Enlarge" hint.
- **Motion:** staggered hero entrance, KPI count-up, bars grow and the line draws when scrolled into view, hover lift on KPI, step and decision cards, chart-row nudge, lesson accent bar, pager arrow shift, and cross-document page transitions (header stays fixed while content fades). Everything is off under `prefers-reduced-motion`; browsers without View Transitions navigate normally.
- **Fix:** Excel page slicer note now says slicers filter the PivotTables behind the charts (the workbook's slicers are linked to 7–10 of its 12 PivotTables, not all).
- **Verified:** Playwright at 1440/390/375: no page errors; hover, metric/dimension toggles, keyboard, lightbox and home→case-study navigation all work. A rounding bug (Medium tier showing 27.6% instead of 27.5%) was found and fixed during testing.
- **Open:** Takeaway wording (above). Real-device check of the page transition on Safari.

## Oct 9, 2026 — Lightbox zoom fix
- **Bug:** zooming a picture in the lightbox (home project cards, certificates and the case-study gallery) always landed in the top-left corner and could not be moved. Cause: `motion.js` set the scroll position while the image width was still animating (`motion.css` had `transition: width`), so the browser clamped it to 0,0; there was also no drag handling.
- **Fix (`assets/js/motion.js`, `assets/css/motion.css`):** the width transition is removed so the zoom lands immediately on the spot clicked; mouse/pen users can drag to move around (grab cursor), arrow keys move the zoomed picture, touch keeps native swipe; a click without dragging still zooms out; a small hint under the caption reads "Click the image to zoom in" / "Drag to move around · click to zoom out"; zoom state resets on close.
- **Tested (Playwright, desktop):** clicking at 85%/85% lands at the bottom-right, 20%/25% near the top-left; drag, arrow keys, zoom-out, close and the certificate lightbox all work. Not yet tried on a real phone.
- **Open:** the hero chip "Open to Data & Business Analyst Internships" (`.hero__availability`) is static text, separate from the Contact section's "Currently open to" tags; waiting for Refa to say what he wants changed.

## Oct 9, 2026 (later) — Multi-page certificates + pill removed
- **Removed** the hero pill "Open to Data & Business Analyst Internships" (`.hero__availability`). The Contact section's "Currently open to" tags and text are unchanged. Its leftover animation CSS in `styles.css` is harmless and can be tidied later.
- **Multi-page certificate pager (`modal.js`, `motion.css`):** certificates with more than one page now open in the lightbox with previous/next buttons, dots, a "Page 2 of 3: …" caption, a slide left/right animation (old page slides out, new page slides in), left/right arrow keys, and swipe on touch screens. It wraps around at the ends, resets on close, and respects `prefers-reduced-motion` (plain swap). Zoom still works per page; while zoomed, arrow keys pan the picture instead of turning the page. Focus trap now ignores hidden buttons.
- **Which certificates:** MySkill Excel bootcamp (2 pages: certificate, bootcamp topics), MySkill Excel final project (3: certificate, final project topics, scores), DSAREA × JOBAREA Data Analyst (6: certificate and five skill reports: Excel for Beginners, Intermediate, Advance, Python, SPSS). Page images are `assets/images/certificates/<name>-p2.jpg` … rendered from Refa's PDFs; page 1 is the existing image. The cards' "View Certificate" link now says "(N pages)". Pages are declared in `index.html` with `data-pages='[{"src":…,"label":…}]'` on both the thumbnail link and the button, so adding pages to another certificate only needs that attribute plus the images.
- **Zoom hint** (`motion.js`) now sits under the picture and the pager, outside the zoomable area.
- **Tested (Playwright):** buttons, dots, arrow keys, wrap-around, zoom/arrow interplay, close/reset, single-page certificates (no pager), touch swipe. Not yet tried on a real phone.

## Oct 9, 2026 (evening) — Home page project section is now a snapshot
- **Why:** on a phone the Featured Projects section was about 17.6 screens (roughly a third of the whole page). Detail already lives on each case-study page, so the home page now gives only a quick overview. On a 390px phone the section is about 6 screens and the whole page went from about 49 to about 37 screens; on desktop the section went from about 8.7 to about 4.2 screens.
- **Each project card is now a snapshot** (`project--snapshot`, styles in new `assets/css/snapshot.css`): title and one-line summary (taken from each case page's summary), meta chips, dashboard thumbnail, four key figures (count-up kept), one short Key insight, tool chips, and three buttons: Read case study, Explore the data (jumps to the page's `#results` charts), and GitHub or Download workbook. The whole card is clickable through a stretched title link; the thumbnail shows a "Read case study →" pill on hover. The thumbnail now links to the case study instead of opening the lightbox. Card ids (`#project-kimia-farma`, `#project-bmi`, `#project-excel`) are unchanged. A one-line lead sits under the section heading.
- **Removed from the home page:** the "Explore the data" explorer, both "How I work" blocks and "Analysis notes". What they said already exists on the case pages (approach steps, design decisions, limits, interactive charts). The key insights on the KF and BMI cards were cut to their first sentences (full text unchanged on the case pages).
- **Moved to the case pages:** Refa's own Analysis notes are now cards in "Challenges & takeaways", in his words: Kimia Farma "A low rating at a 5-star branch is not a service problem" (first card); Bank Muamalat "A decimal comma that inflated sales 100×" (replaces Claude's shorter "Prices that were 100 times too large" card) and "A 7.8% drop, and 87% of it in one category". Kimia Farma now has 5 cards, BMI 4, Excel 3. Text was checked against the original notes. The remaining cards (KF: joins, dates, map codes, reconciliation; BMI: emails, keys; Excel: all three) still use Claude's wording for the Takeaway lines.
- **No longer loaded:** `assets/js/media-tabs.js` and `assets/js/data-explorer.js` script tags were removed from `index.html`; the files and their leftover CSS (explorer, notes, workflow, tabs, viz-ring) can be deleted in a later cleanup.
- **Tested (Playwright, 1440 and 390):** no page errors, whole-card click, Explore-the-data jumps, lesson numbering. Not yet looked at on a real phone.

## Oct 9, 2026 (night) — MySkill logo on the Excel project card
- Added the MySkill logo (`assets/images/logos/myskill.webp`, 512×512 with transparency, cropped from the logo printed on Refa's own MySkill certificate) as a single tile in the Excel card header, same tile style as the Kimia Farma and Bank Muamalat logos. No "via" tile, because MySkill is both program and provider here.
- Note: the GitHub repo still had the pre-snapshot `index.html` when this was made, so this delivery includes the full snapshot set again (index.html, snapshot.css, both case pages, README, CURRENT_STATE).

## Oct 10, 2026 — Color bands + highlighted text (strong version)
- **New `assets/css/bands.css`** (loaded last on all four pages). Sections now sit on named surfaces via classes on the `<section>` tags: `band-light`, `band-white`, `band-tint` (soft blue wash) and three strong bands: `band-navy` (deep navy, white text), `band-signal` (Signal Blue, white text), `band-bright` (bright blue, navy text). Cards stay white on every band so their own text colours keep working.
- **Home page order:** Hero (light, soft blue glow) → About white → Expertise tint → Skills light → **Projects navy** → Education white → **Research Signal Blue** → Certifications tint → Timeline light → Resume white → **Contact bright blue** → dark footer. Strong bands are never adjacent (a light band always sits between them).
- **Case pages** (`<body class="cs-page">`): hero navy, **Results Signal Blue**, the other sections alternate white / tint.
- **Contrast checked (WCAG AA):** white on navy 17.5 and 14.3, light-blue eyebrow on navy 8.6 and 7.1, white on Signal 7.7 and 10.5, soft text on Signal 6.3, navy ink on bright blue 6.5, secondary navy on bright 5.0, ink on highlight 14.1. Gold stays reserved for credentials; teal/violet/coral stay card accents and are not used as backgrounds.
- **Highlights:** `<mark>` styled as a marker (light blue, bold; flips to a translucent white on dark hero/intro text). Used once or twice per card or paragraph, only on words already in the text: hero tagline, About (publications sentence, closing sentence), the three project Key insights, Excel/Kimia Farma/BMI "What the data shows" cards, and the Excel hero summary.
- **Reading hierarchy on case pages:** first paragraph of each prose block is larger; KPI figures are larger.
- **To calm it down later:** replace the three strong `band-*` classes on the sections in `index.html` (and the `#results` / `.cs-hero` rules in `bands.css`) with `band-tint`. There is no single intensity switch.
- **Tested (Playwright, 1440 and 390):** no page errors; screenshots of every home section and the three case pages checked. Not yet looked at on a real phone.

## Oct 10, 2026 (later) — Sea palette applied, "Explore the data" button removed
- **New palette (Color Hunt "sea"):** `#F6F6F6` (page), `#D6E4F0` (soft blue), `#1E56A0` (primary), `#163172` (navy). This replaces the old Signal Blue `#2A46C0` family from DESIGN.md. Changed tokens in `styles.css :root`: `--color-bg #F6F6F6`, `--color-primary #1E56A0`, `--color-primary-hover #163172`, `--color-primary-tint #E3EDF6`, `--color-primary-on-dark #9CC0F0`, `--color-dark-bg #0A1630`, `--color-dark-surface #12234A` (footer and code blocks are now navy-black instead of grey-black). `theme-color` meta tags are `#1E56A0`.
- **Bands (`bands.css`, rewritten):** navy `#163172` (Projects, case-page hero), sea blue `#1E56A0` (Research, Contact, case-page Results), tint `#E8F0F8`→`#D6E4F0`, white, light. The old "bright" band is gone: Contact is now a blue band like Research (white text; "Email me" is navy with a white border, LinkedIn and WhatsApp are white). Classes on sections are `band-light / band-white / band-tint / band-navy / band-blue`.
- **Contrast (AA):** white on `#1E56A0` 7.3, white on `#163172` 12.2, links `#1E56A0` on `#F6F6F6` 6.7, on white 7.3, on `#D6E4F0` 5.6, `#9CC0F0` on `#163172` 6.5, `#D6E4F0` on `#1E56A0` 5.6. Gold, teal, violet and coral stay as card accents and are unchanged.
- **Removed:** the "Explore the data →" button on the three home project cards (it went to the same page as "Read case study"). The charts remain in the Results section of each case page.
- **Other small edits:** hard-coded old blues in `motion.css` (hero glow), `case-study.css` (tooltip swatch) and a box-shadow in `styles.css` now use the new blue. The project doc DESIGN.md (outside the site) still lists Signal Blue and should be updated by hand.
- **Tested (Playwright, 1440 and 390):** no page errors; every home section and the Excel case page checked. Not yet looked at on a real phone.
