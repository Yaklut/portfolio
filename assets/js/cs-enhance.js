/* ==========================================================================
   cs-enhance.js — progressive enhancements for the case-study pages
   1. Copy buttons on code windows
   2. Section progress rail (wide screens), built from the page's sections
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

  /* ---- 2. Progress rail ---- */
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
