/* ==========================================================================
   cs-motion.js — tiny scroll trigger for the Approach connector lines.
   Adds .is-drawn to each .cs-steps / .cs-timeline list the first time it scrolls into view.
   Without JavaScript the lines are simply visible (see cs-polish.css).
   ========================================================================== */
(function () {
  'use strict';
  const lists = Array.from(document.querySelectorAll('.cs-steps, .cs-timeline'));
  if (!lists.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    lists.forEach((l) => l.classList.add('is-drawn'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-drawn'); io.unobserve(e.target); }
    });
  }, { threshold: 0.2 });
  lists.forEach((l) => io.observe(l));
})();
