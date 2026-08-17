# Current State — Refa's Portfolio Website

**Last updated:** August 15, 2026 (Phase 4 — Main Styling & Sections, complete; all three open content items resolved same day)

## Completed
- **Phase 1: Planning & Architecture** — ✅ complete. All 13 checklist items answered.
  - Full detail: `PHASE_1_PLANNING_ARCHITECTURE.md`
- **Phase 2: Design System** — ✅ complete, approved.
  - Full detail: `DESIGN.md`
- **Phase 3: HTML Structure** — ✅ complete. Full semantic markup with real, verified content.
- **Phase 4: Main Styling & Sections** — ✅ complete. Full visual implementation of `DESIGN.md` on top of the Phase 3 HTML and the Phase 2 tokens.
  - Output: `assets/css/styles.css` grew from a ~90-line token/reset stub to a complete, organized stylesheet (tokens → reset → layout utilities → typography → buttons → cards → chips → links/images → section-by-section styles → responsive media queries, per `PHASE_1`'s Part F structure).
  - **HTML change:** one attribute added — `loading="lazy"` on the Resume section's CV preview `<iframe>` (performance best practice from the original brief; the iframe sits far down a long page). Nothing else in `index.html` changed — no rebuilt sections, no removed content, no new sections.
  - Styled every section: Navbar, Hero, About, Expertise, Skills & Tools, Featured Projects, Education, Research & Publications, Certifications, Resume, Contact, Footer — plus the shared component layer (buttons, cards, chips, links, images) they're all built from.
  - Responsive system implemented mobile-first with three breakpoints (768 / 1024 / 1440) plus a dedicated 1280px threshold for the navbar (see "Implementation decisions" below).
  - QA method: rendered the actual HTML+CSS in a headless browser and visually checked every section at 390px, 768px, 1024px, 1440px, and 1920px, using the real profile photo and dashboard screenshots (extracted locally for testing only — see note below). Also scripted checks for horizontal overflow at 375/390/430/768/1024/1100/1200/1279/1280/1300/1440/1920px — all clean.

## Bugs found and fixed during Phase 4 QA
Screenshots surfaced six real CSS bugs, all now fixed and re-verified:

1. **Hero photo squeezed narrow.** The photo frame was inheriting the generic "every section child gets container padding" rule, which ate into its own deliberately-set width. Fixed by zeroing padding/max-width on `.hero__photo-frame` specifically.
2. **Mobile nav overflowing horizontally.** The CSS-only hook for the hamburger menu's hidden state (`.nav-toggle[aria-expanded="true"] ~ .nav-panel`) was planned but its *base/closed* state was never actually written — so the full nav list rendered as an uncontained row on phone widths. Added the missing base rule.
3. **Wide stat figures clipping** (e.g. "Rp346.96M" cut off mid-character). Classic CSS Grid gotcha: `grid-template-columns: repeat(2, 1fr)` doesn't let a column shrink below its content's min-content width unless you use `minmax(0, 1fr)`. Applied that fix to every grid in the stylesheet (Expertise, Skills, Certifications, Project stats, Hero grid), not just the one where it was first noticed.
4. **Contact "currently open to" tags invisible.** They sit directly on the Contact section's background (no card wrapper), and Contact happens to land on the alternating alt-band — which is the exact same color as a chip's default fill. Gave these specific chips a white background + border so they contrast regardless of which band the section lands on.
5. **Mobile menu's close (✕) button painting underneath the open menu overlay.** A real stacking-context issue: non-positioned elements always paint below positioned ones in the same stacking context, regardless of z-index value or DOM order — so the (non-positioned) toggle button was invisible under the (positioned, z-index:40) full-screen nav panel once open. Fixed by giving the toggle its own `position:relative; z-index:41`.
6. **Long chip text overflowing its column** (e.g. "Quantitative Research Methods" in the 4-column Skills grid at desktop). `white-space: nowrap` was forcing chips to stay on one line even when too long for a narrow column. Removed it from the base `.chip` — long labels now wrap to two lines within the pill instead of overflowing.

One more thing investigated, not clearly resolved either way: my headless testing tool showed the page's scroll position jumping to the Resume section on load, but only under one specific wait condition (`networkidle0`) tied to the embedded CV PDF viewer — it did **not** reproduce under a more realistic load+wait condition. Current read is that this is a testing-tool artifact rather than a real-user bug, but I'm not fully certain, so flagging the uncertainty rather than asserting it's a non-issue. Added `loading="lazy"` to that iframe regardless, since it's good practice independent of this question. Worth a manual check in a real browser before/during Phase 5.

## Implementation decisions made during Phase 4 (not explicit in DESIGN.md — informed calls within the approved system)

- **Navbar breakpoint decoupled from the 1024px content tier.** With 8 nav links plus a Resume CTA button, the full horizontal nav genuinely doesn't fit at 1024px — measured need is ~1000px+ for the nav alone, before the wordmark. Hero/Projects/grids switch to their desktop layouts at 1024px as DESIGN.md specifies, but the navbar itself stays in its compact hamburger/overlay form until 1280px, where it fits with real breathing room. DESIGN.md never explicitly ties the nav specifically to 1024 (only that hamburger *starts* at 768 and below) — this fills that gap rather than contradicting it.
- **Chip typography split by content type.** DESIGN.md's type scale groups all "tags" under the mono/uppercase eyebrow style, and explicitly calls for mono on tool-chips and publication tier/author badges — those are implemented that way. But for longer descriptive chips (Skills tags, Contact's "open to" tags — some 25-30 characters), uppercase tracked mono became hard to read, so those use plain Body-Small sans instead. The pill shape still reads clearly as a tag either way.
- **Certifications grid uses explicit per-breakpoint column counts** (1/2/2/3), not literal CSS `auto-fit`, even though DESIGN.md's rationale mentions auto-fit for handling the uneven 2/8/1 group sizes. `repeat(N, 1fr)` achieves the same "left-aligned, not stretched" behavior for incomplete rows while keeping exact column-count control synced to the same breakpoints as Expertise/Skills — visually and technically consistent with those grids.
- **Alternating section background bands** (`--color-surface-alt`) apply to every even-numbered section (About, Skills, Education, Certifications, Contact); Hero and odd sections stay on the base `--color-bg`. DESIGN.md defines the token's purpose but not which sections use it.
- **Lucide icons (per DESIGN.md's Implementation Notes) were not added.** Adding them properly would mean inline SVG markup in Expertise cards, Skill category headers, and elsewhere — a real content addition across many places, not a "minor" HTML change, so it felt like something to flag rather than do silently. The site is styled to look complete via typography/spacing/color alone. Happy to add icons as a small, explicit follow-up if you'd like them — just say the word.
- **Mobile sticky Resume/Contact bar** (flagged in DESIGN.md §8 as a new, not-yet-approved idea) was **not** built — it needs new HTML markup, and DESIGN.md itself listed it as something to weigh in on rather than a locked decision.

## Known issues / needs your input

**All three previously-open content items were confirmed and fixed on Aug 15, 2026 — see "Resolved this round" below.**

**Resolved earlier (Phase 3, unaffected by this phase):**

1. Dibimbing certificate date — resolved, no date exists on the certificate, placeholder stays permanently.
2. Publication DOI links — on hold, not a bug. Single "View all on Google Scholar" link remains the only publication link, per the approved Phase 2 design.

**Resolved this round (Aug 15, 2026 — content fixes, confirmed by Refa):**

3. **BMI "Total Sales" — ✅ Fixed.** Confirmed **Rp1.75M** (million, not billion) — matches "jt" (juta) on the source dashboard, and Refa confirmed this is already corrected on GitHub. `index.html` now shows **Rp1.75M**.
4. **BMI transaction count — ✅ Fixed.** Confirmed **11,654** (matching the "Total Orders" stat tile) is correct. The stale "3,339 transaction records" mention is now removed from the contribution paragraph — it no longer restates a count inline, matching the same pattern already used in the Kimia Farma card (the paragraph describes the *method*; the number lives in the stat tile below it).
5. **Resume "Last updated" date — ✅ Fixed.** Now reads **August 13, 2026**, matching the CV PDF file's own actual replacement date (confirmed by the file's internal timestamp) — the date this file previously said had been set, but that edit had never actually landed in `index.html` until now.

## Assets on hand (unchanged this phase)
Same as logged after Phase 3 — real photo, real dashboard screenshots, real certificate images, real CV PDF, all already in place in the repo's `assets/` folders. Phase 4 didn't touch any of these; it only wrote CSS (and the one iframe attribute).

*Note on this phase's QA process:* to visually test the CSS, I extracted a working copy of the real profile photo, dashboard screenshots, and CV PDF into a local sandbox purely to render accurate screenshots for review — those never left my testing environment and aren't part of what's delivered here. Your actual repo's `assets/` folder is untouched and already has the production versions per Phase 3.

## Known non-issues (expected at this stage, not bugs)
- No favicon yet (Phase 1 flagged this as still "to create" — an asset/branding decision, not a Phase 4 styling task).
- No scroll-reveal, entrance, active-nav-state, or hover-triggered JS animations yet — Phase 5 scope. The CSS *states* those will hook into (mobile menu open/closed, navbar scrolled, nav-link active) are already written and waiting for JS to toggle the relevant class/attribute — see "Ready for Phase 5" below.
- Certificate/CV "View"/"Download" links still open the real file directly in a new tab rather than an in-page modal — expected until Phase 5 wires up the lightbox described in `DESIGN.md`.

## Ready for Phase 5 (CSS hooks already in place, just need JS)
- `body.is-scrolled` → toggles the navbar's scrolled background/shadow state.
- `.nav-toggle[aria-expanded="true"]` → shows the mobile menu and animates the hamburger into an ✕ (CSS-only, already works — verified by simulating the attribute toggle directly).
- `.nav-link.is-active` → active-section nav highlight.
- Reduced-motion is already respected globally for everything built so far (hover lifts, the future entrance/reveal animations will need their own `prefers-reduced-motion` handling when Phase 5 adds them, per `DESIGN.md` §7 — "not optional").

## Next recommended task
1. Decide on the Lucide icon question (add them now as a small follow-up, or skip for this site).
2. Start **Phase 5: Animations & Interactions** — scroll reveal, entrance animation, active-nav-state tracking, mobile menu JS (the CSS is ready and waiting for it), hover polish, and the certificate/project modal-lightbox behavior.
