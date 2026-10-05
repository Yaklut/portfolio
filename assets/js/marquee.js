/* ==========================================================================
   marquee.js — tool marquee pause/resume toggle

   Exposes window.Portfolio.initMarquee(), called once from main.js.

   The scrolling itself is pure CSS (see styles.css, "Tool marquee"). This
   file does two jobs:
   1. Keeps the loop seamless. The CSS animation slides the track by exactly
      half its width, which only looks continuous if one half is at least as
      wide as the visible strip. On wide screens the five pills are narrower
      than the strip, leaving a blank gap before every restart. fillTrack()
      adds copies of the pills until each half is wide enough, and sets the
      duration so the scroll speed stays the same at every screen width.
   2. Wires up the explicit pause button. When prefers-reduced-motion is set,
      that button is already hidden by CSS.
   ========================================================================== */

window.Portfolio = window.Portfolio || {};

const MARQUEE_SPEED = 31; // px per second, same pace as the original 28s loop

function fillTrack(viewport, track) {
  // The first five pills in the HTML are the real ones; everything after
  // them (the hand-written duplicates and any clones added earlier) is rebuilt.
  const all = Array.from(track.children);
  const originals = all.filter((li) => li.getAttribute('aria-hidden') !== 'true');
  all.filter((li) => !originals.includes(li)).forEach((li) => li.remove());
  if (!originals.length) return;

  const last = originals[originals.length - 1];
  const gapAfter = parseFloat(getComputedStyle(last).marginRight) || 0;
  const setWidth = last.offsetLeft + last.offsetWidth + gapAfter - originals[0].offsetLeft;
  if (!setWidth) return;

  // Each half of the track must be at least as wide as the strip.
  const copiesPerHalf = Math.max(1, Math.ceil(viewport.clientWidth / setWidth));
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < copiesPerHalf * 2 - 1; i += 1) {
    originals.forEach((li) => {
      const clone = li.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('[role="img"]').forEach((el) => {
        el.removeAttribute('role');
        el.removeAttribute('aria-label');
      });
      fragment.appendChild(clone);
    });
  }
  track.appendChild(fragment);
  track.style.animationDuration = `${(copiesPerHalf * setWidth) / MARQUEE_SPEED}s`;
}

window.Portfolio.initMarquee = function initMarquee() {
  document.querySelectorAll('[data-marquee]').forEach((marquee) => {
    const viewport = marquee.querySelector('.tool-marquee__viewport');
    const track = marquee.querySelector('.tool-marquee__track');
    if (viewport && track) {
      let lastWidth = 0;
      const rebuild = () => {
        // Only redo the work when the strip's width actually changes.
        if (viewport.clientWidth === lastWidth) return;
        lastWidth = viewport.clientWidth;
        fillTrack(viewport, track);
      };
      rebuild();
      // Pill widths depend on the web font, which may arrive after first paint.
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => { lastWidth = 0; rebuild(); });
      }
      if ('ResizeObserver' in window) new ResizeObserver(rebuild).observe(viewport);
    }

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
