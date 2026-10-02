/* ==========================================================================
   media-tabs.js — tabbed evidence panel on a project card

   Exposes window.Portfolio.initMediaTabs(), called once from main.js.
   Works on any <figure data-media-tabs>: switches between panels, keeps the
   caption in sync, and follows the WAI-ARIA tabs pattern (arrow keys, Home,
   End, roving tabindex). Without JS, the first panel simply stays visible.
   ========================================================================== */

window.Portfolio = window.Portfolio || {};

window.Portfolio.initMediaTabs = function initMediaTabs() {
  document.querySelectorAll('[data-media-tabs]').forEach((root) => {
    const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
    const caption = root.querySelector('.media-tabs__caption');

    function select(tab, moveFocus) {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
        if (on && caption && panel) caption.textContent = panel.dataset.caption || '';
      });
      if (moveFocus) tab.focus();
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab, false));
      tab.addEventListener('keydown', (e) => {
        let next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) {
          e.preventDefault();
          select(next, true);
        }
      });
    });
  });
};
