/* ==========================================================================
   main.js — initialization

   Loaded last (after nav.js, reveal.js, modal.js), so every
   window.Portfolio.init* function it calls already exists by this point.
   ========================================================================== */

(function () {
  // Flips on the CSS that hides `.reveal` elements before animating them
  // in (see styles.css). Left off, the page still renders fully — see the
  // comment at the top of reveal.js for why that fallback matters.
  document.documentElement.classList.add('js');

  window.Portfolio = window.Portfolio || {};

  ['initNav', 'initReveal', 'initModal'].forEach((name) => {
    if (typeof window.Portfolio[name] === 'function') {
      window.Portfolio[name]();
    }
  });
})();
