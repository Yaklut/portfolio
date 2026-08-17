# Current State — Refa's Portfolio Website

**Last updated:** August 16, 2026 (Phase 5 complete; four same-day follow-ups: a landscape-mobile bug found and fixed, the favicon resolved, Lucide icons implemented, and a real-asset verification pass completed clean — see below)

## Completed
- **Phase 1: Planning & Architecture** — ✅ complete. Full detail: `PHASE_1_PLANNING_ARCHITECTURE.md`
- **Phase 2: Design System** — ✅ complete, approved. Full detail: `DESIGN.md`
- **Phase 3: HTML Structure** — ✅ complete. Full semantic markup with real, verified content.
- **Phase 4: Main Styling & Sections** — ✅ complete. Full visual implementation of `DESIGN.md`.
- **Phase 5: Animations & Interactions** — ✅ complete. Scroll reveal, hero entrance, navbar scroll state, active-nav tracking, mobile menu, hover polish, and the certificate/project lightbox are all implemented and QA'd. Details below.
  - **Same-day follow-up:** a targeted landscape-mobile check (not a full Phase 6 — see that section below) found and fixed one real bug in the mobile menu. Details in "Landscape mobile follow-up" below.

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

## Ready for Phase 7 (Accessibility & Performance)
Most of the groundwork is already in place from how Phases 3–5 were built:
- Semantic structure, heading hierarchy, and alt text were handled in Phase 3.
- Focus states, `prefers-reduced-motion`, and keyboard accessibility were treated as Phase 5 requirements rather than deferred — see "Interactions implemented" above.
- Likely remaining Phase 7 work: a real Lighthouse/axe pass and image optimization/compression once your production assets are in.

## Next recommended task
Start **Phase 7: Accessibility & Performance** — Lighthouse/axe audit, image optimization, and a final pass on anything the audit surfaces. Nothing else is blocking it.
