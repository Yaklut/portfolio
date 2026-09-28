/* ==========================================================================
   marquee.js — tool marquee pause/resume toggle

   Exposes window.Portfolio.initMarquee(), called once from main.js.

   The scrolling itself is pure CSS (see styles.css, "Tool marquee"); this
   only wires up the explicit pause button. When prefers-reduced-motion is
   set, that button is already hidden by CSS, so this never needs to check
   for reduced motion itself.
   ========================================================================== */

window.Portfolio = window.Portfolio || {};

window.Portfolio.initMarquee = function initMarquee() {
  document.querySelectorAll('[data-marquee]').forEach((marquee) => {
    const toggle = marquee.querySelector('.tool-marquee__toggle');
    if (!toggle) return;
    const label = toggle.querySelector('.sr-only');

    toggle.addEventListener('click', () => {
      const isPaused = marquee.classList.toggle('is-paused');
      toggle.setAttribute('aria-pressed', String(isPaused));
      if (label) label.textContent = isPaused ? 'Resume scrolling' : 'Pause scrolling';
    });
  });
};
