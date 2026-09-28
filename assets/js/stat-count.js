/* ==========================================================================
   stat-count.js — hero stat count-up

   Exposes window.Portfolio.initStatCount(), called once from main.js.

   The hero entrance itself stays pure CSS (see styles.css, "Hero entrance")
   — this only animates the *numbers* inside .hero__stats from 0 up to their
   real value, timed to start as the stats fade in (380ms delay, matching
   the CSS keyframe). If this script fails to load, the numbers already sit
   correctly in the HTML (5 / 2 / 11), so nothing is ever blank — same
   no-JS-fallback principle reveal.js uses for scroll reveal.
   ========================================================================== */

window.Portfolio = window.Portfolio || {};

window.Portfolio.initStatCount = function initStatCount() {
  const values = document.querySelectorAll('.hero__stats .stat-value');
  if (values.length === 0) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return; // numbers already show their final value in the HTML

  // Matches the CSS keyframe timing in styles.css: .hero__stats fades in at
  // animation-delay: 380ms. Starting the count here means the numbers
  // animate as they become visible, rather than counting while still hidden.
  const START_DELAY = 380;
  const COUNT_DURATION = 700;

  values.forEach((el) => {
    const target = parseInt(el.textContent, 10);
    if (Number.isNaN(target)) return; // safety: only touches plain integers

    el.textContent = '0';

    window.setTimeout(() => {
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / COUNT_DURATION, 1);
        // ease-out-cubic — mirrors --ease-out's general feel without
        // needing to read the CSS custom property from JS
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = String(Math.round(eased * target));

        if (progress < 1) {
          window.requestAnimationFrame(tick);
        } else {
          el.textContent = String(target); // guarantees the exact final number
        }
      }

      window.requestAnimationFrame(tick);
    }, START_DELAY);
  });
};
