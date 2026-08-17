/* ==========================================================================
   reveal.js — scroll-triggered fade/rise reveal

   Exposes window.Portfolio.initReveal(), called once from main.js.

   Elements marked `.reveal` in index.html start visible by default (see
   styles.css) — only once this script confirms it's running does the
   hidden "ready to animate in" state apply. That way a page with JS
   disabled, or where this file fails to load, never hides content it
   can't reveal. See main.js for the `.js` class this depends on.

   Grids/lists that should reveal their cards in a staggered cascade
   (Expertise, Skills, Certifications, Publications, Projects) don't need
   any special handling here — each card is observed individually, and
   the stagger itself is pure CSS (`nth-child` transition-delay in
   styles.css), so cards that happen to enter the viewport together still
   animate with a cascading offset.
   ========================================================================== */

window.Portfolio = window.Portfolio || {};

window.Portfolio.initReveal = function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (items.length === 0) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target); // reveal once, never repeat on scroll-up
    });
  }, {
    threshold: 0.15, // DESIGN.md §7: "triggers once at ~15–20% visibility"
  });

  items.forEach((el) => observer.observe(el));
};
