/* ==========================================================================
   main.js — initialization

   Loaded last (after nav.js, reveal.js, modal.js, stat-count.js,
   marquee.js, command-palette.js, publications-filter.js, scroll-progress.js, media-tabs.js, data-explorer.js), so every
   window.Portfolio.init* function it calls already exists by this point.
   ========================================================================== */

(function () {
  // Flips on the CSS that hides `.reveal` elements before animating them
  // in (see styles.css). Left off, the page still renders fully — see the
  // comment at the top of reveal.js for why that fallback matters.
  document.documentElement.classList.add('js');

  window.Portfolio = window.Portfolio || {};

  ['initNav', 'initReveal', 'initModal', 'initStatCount', 'initMarquee', 'initCommandPalette', 'initPublicationsFilter', 'initScrollProgress', 'initMediaTabs', 'initDataExplorer', 'initMotion'].forEach((name) => {
    if (typeof window.Portfolio[name] === 'function') {
      window.Portfolio[name]();
    }
  });
})();
