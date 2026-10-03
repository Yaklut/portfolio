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

    const list = root.querySelector('.media-tabs__list');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const panelOf = (t) => document.getElementById(t.getAttribute('aria-controls'));
    let current = tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
    let finishPending = null; // completes an in-flight panel swap if the user clicks again

    // Sliding pill behind the selected tab (purely visual; aria-selected stays the source of truth)
    const thumb = document.createElement('span');
    thumb.className = 'media-tabs__thumb';
    thumb.setAttribute('aria-hidden', 'true');
    list.prepend(thumb);
    list.classList.add('has-thumb');
    function placeThumb() {
      thumb.style.width = current.offsetWidth + 'px';
      thumb.style.height = current.offsetHeight + 'px';
      thumb.style.transform = `translate(${current.offsetLeft}px, ${current.offsetTop}px)`;
    }
    placeThumb();
    requestAnimationFrame(() => thumb.classList.add('is-ready')); // enable the transition after first paint
    window.addEventListener('resize', placeThumb);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeThumb);

    function select(tab, moveFocus) {
      if (finishPending) finishPending();
      if (tab !== current) {
        const dir = tabs.indexOf(tab) > tabs.indexOf(current) ? 1 : -1;
        const oldPanel = panelOf(current);
        const newPanel = panelOf(tab);
        tabs.forEach((t) => {
          const on = t === tab;
          t.setAttribute('aria-selected', on ? 'true' : 'false');
          t.tabIndex = on ? 0 : -1;
        });
        current = tab;
        placeThumb();
        if (caption && newPanel) caption.textContent = newPanel.dataset.caption || '';

        const swap = () => {
          finishPending = null;
          if (oldPanel) oldPanel.hidden = true;
          if (newPanel) {
            newPanel.hidden = false;
            if (!reduce) {
              newPanel.animate(
                [{ opacity: 0, transform: `translateX(${dir * 40}px)` }, { opacity: 1, transform: 'none' }],
                { duration: 420, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
              );
            }
          }
        };
        if (reduce || !oldPanel) {
          swap();
        } else {
          // old panel slides out the opposite way, then the new one slides in
          const out = oldPanel.animate(
            [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-dir * 28}px)` }],
            { duration: 160, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' }
          );
          finishPending = () => { out.cancel(); swap(); };
          out.onfinish = () => { if (finishPending) swap(); };
        }
      }
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
