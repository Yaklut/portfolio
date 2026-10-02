/* ==========================================================================
   scroll-progress.js — thin reading-progress line under the navbar

   Exposes window.Portfolio.initScrollProgress(), called once from main.js.
   Only scales an element (transform), so it never triggers layout. Updates
   are batched into one requestAnimationFrame per scroll burst.
   ========================================================================== */

window.Portfolio = window.Portfolio || {};

window.Portfolio.initScrollProgress = function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;

  let ticking = false;

  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    bar.style.transform = 'scaleX(' + ratio + ')';
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
};
