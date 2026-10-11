/* ==========================================================================
   cs-enhance.js — progressive enhancements for the case-study pages
   1. Copy buttons on code windows
   2. Sliding highlight on the pills, and chart animations when a pill is pressed
   3. Section progress rail (wide screens), built from the page's sections
   Everything is optional: without JavaScript the page reads the same.
   ========================================================================== */
(function () {
  'use strict';

  /* ---- 1. Copy buttons ---- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise((resolve, reject) => {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;top:0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy') ? resolve() : reject(); } catch (e) { reject(e); } finally { ta.remove(); }
    });
  }

  document.querySelectorAll('.cs-codewin').forEach((win) => {
    const btn = win.querySelector('[data-copy]');
    const pre = win.querySelector('pre');
    const status = win.querySelector('[role="status"]');
    if (!btn || !pre) return;
    const label = btn.querySelector('.cs-copy__label');
    let timer;
    btn.setAttribute('aria-label', 'Copy code: ' + (pre.getAttribute('aria-label') || 'snippet'));
    btn.addEventListener('click', () => {
      copyText(pre.innerText.replace(/\n$/, '')).then(() => {
        btn.classList.add('is-copied'); label.textContent = 'Copied'; status.textContent = 'Copied to clipboard';
      }).catch(() => {
        label.textContent = 'Press Ctrl+C'; status.textContent = 'Copy failed. Select the code and press Ctrl+C.';
        const r = document.createRange(); r.selectNodeContents(pre);
        const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
      }).finally(() => {
        clearTimeout(timer);
        timer = setTimeout(() => { btn.classList.remove('is-copied'); label.textContent = 'Copy'; status.textContent = ''; }, 1800);
      });
    });
  });

  /* ---- 2. Pills (.cs-seg): a highlight that glides to the selected pill ---- */
  document.querySelectorAll('.cs-seg').forEach((seg) => {
    const thumb = document.createElement('span');
    thumb.className = 'cs-seg__thumb';
    thumb.setAttribute('aria-hidden', 'true');
    seg.prepend(thumb);
    seg.classList.add('cs-seg--thumb');

    function place(instant) {
      const on = seg.querySelector('button[aria-pressed="true"]');
      if (!on || !on.offsetWidth) { thumb.style.opacity = '0'; return; }
      thumb.style.opacity = '';
      if (instant) thumb.classList.add('is-instant');
      thumb.style.setProperty('--x', on.offsetLeft + 'px');
      thumb.style.setProperty('--y', on.offsetTop + 'px');
      thumb.style.setProperty('--w', on.offsetWidth + 'px');
      thumb.style.setProperty('--h', on.offsetHeight + 'px');
      if (instant) { thumb.getBoundingClientRect(); thumb.classList.remove('is-instant'); }
    }

    place(true);
    // The chart script updates aria-pressed on the clicked pill first; this runs afterwards (bubbling).
    seg.addEventListener('click', () => place(false));
    if ('ResizeObserver' in window) new ResizeObserver(() => place(true)).observe(seg); // wraps, fonts, shown/hidden
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => place(true));
  });

  /* ---- 3. Charts: what changes when a pill is pressed ---- */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
    const fade = (el, dy, delay) => el.animate(
      [{ opacity: 0, transform: `translateY(${dy}px)` }, { opacity: 1, transform: 'none' }],
      { duration: 420, delay: delay || 0, easing: EASE, fill: 'backwards' }
    );

    document.querySelectorAll('.cs-chart').forEach((card) => {
      let swappedAt = 0;

      // A different breakdown: the rows rise in one after another and their bars grow from zero.
      function panelIn(panel) {
        Array.from(panel.querySelectorAll('.cs-irow')).forEach((row, i) => {
          fade(row, 10, i * 40);
          const bar = row.querySelector('.cs-irow__bar');
          if (!bar) return;
          bar.style.transformOrigin = 'left center';
          bar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
            { duration: 700, delay: 120 + i * 40, easing: EASE, fill: 'backwards' });
        });
      }

      new MutationObserver((mutations) => {
        mutations.forEach((m) => {
          const t = m.target;
          if (m.type === 'attributes') {
            if (t.classList.contains('cs-ichart') && !t.hidden) { swappedAt = performance.now(); panelIn(t); }
            return;
          }
          if (!t.classList) return;
          const before = m.removedNodes[0] ? m.removedNodes[0].textContent : null;
          if (before === t.textContent) return; // same text written again: nothing changed
          // A different measure: the new figure slides in (skipped when a whole panel just appeared).
          if (t.classList.contains('cs-irow__value') && performance.now() - swappedAt > 150) {
            const rows = Array.from(t.closest('.cs-ichart').children);
            fade(t, 6, rows.indexOf(t.closest('.cs-irow')) * 25);
          } else if (t.classList.contains('cs-chart__caption')) {
            fade(t, 4, 80);
          }
        });
      }).observe(card, { attributes: true, attributeFilter: ['hidden'], childList: true, subtree: true });
    });
  }

  /* ---- 4. Progress rail ---- */
  const sections = Array.from(document.querySelectorAll('main > section[id]'))
    .filter((s) => s.querySelector('.section-title'));
  const hero = document.querySelector('.cs-hero');
  if (sections.length < 3 || !('IntersectionObserver' in window)) return;

  const nav = document.createElement('nav');
  nav.className = 'cs-rail';
  nav.setAttribute('aria-label', 'Sections on this page');
  const ol = document.createElement('ol');
  const links = new Map();
  sections.forEach((s) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    const text = s.querySelector('.section-title').textContent.trim();
    a.href = '#' + s.id; a.setAttribute('data-label', text); a.setAttribute('aria-label', text);
    li.appendChild(a); ol.appendChild(li); links.set(s, a);
  });
  nav.appendChild(ol);
  document.body.appendChild(nav);

  const setCurrent = (section) => links.forEach((a, s) => {
    if (s === section) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
  });

  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) setCurrent(e.target); });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach((s) => spy.observe(s));

  if (hero) {
    new IntersectionObserver((entries) => {
      nav.classList.toggle('is-on', !entries[0].isIntersecting);
    }, { threshold: 0.15 }).observe(hero);
  } else {
    nav.classList.add('is-on');
  }
})();
