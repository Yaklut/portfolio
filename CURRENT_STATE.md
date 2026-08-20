# Current State — Refa's Portfolio Website

**Last updated:** August 18, 2026 (Phase 7 — Accessibility & Performance audit — complete)

## Completed
- **Phase 1: Planning & Architecture** — ✅ complete. Full detail: `PHASE_1_PLANNING_ARCHITECTURE.md`
- **Phase 2: Design System** — ✅ complete, approved. Full detail: `DESIGN.md`
- **Phase 3: HTML Structure** — ✅ complete. Full semantic markup with real, verified content.
- **Phase 4: Main Styling & Sections** — ✅ complete. Full visual implementation of `DESIGN.md`.
- **Phase 5: Animations & Interactions** — ✅ complete. Scroll reveal, hero entrance, navbar scroll state, active-nav tracking, mobile menu, hover polish, and the certificate/project lightbox are all implemented and QA'd. Details below.
  - **Same-day follow-up:** a targeted landscape-mobile check (not a full Phase 6 — see that section below) found and fixed one real bug in the mobile menu. Details in "Landscape mobile follow-up" below.
- **Phase 7: Accessibility & Performance** — ✅ complete. Real audit (not speculative), 7 issues found and fixed, all low-risk, zero visual/design changes. Full detail below. No visual redesign occurred — identity remains exactly as approved in `DESIGN.md`.

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

## Next recommended task
No blocking work remains. **Phase 8 (Testing & Debugging) is effectively covered** by this phase's own regression pass (see above) the same way Phase 6 folded into the landscape-mobile follow-up — there's no separate concrete task left that isn't either "final deployment prep" or "needs your physical hardware." Recommended next step: **Phase 9 — GitHub Pages Deployment**, plus the two optional items above (self-hosting fonts; a real Lighthouse pull post-deploy) whenever you want them.
