/* ==========================================================================
   expressive.js — text reveals, cursor reactions, scroll-linked timeline,
   data count-ups and staggered entrances.

   Self-contained (does not need main.js). Everything motion-related is skipped
   when the visitor prefers reduced motion; cursor effects are also skipped on
   touch devices. Elements are only hidden once this script has added the
   `xp` class to <html>, so if the script fails the page still shows fully.
   ========================================================================== */
(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  /* ---- 1. Headings: each word rises out of a mask ---- */
  function splitWords(el) {
    if (el.children.length) return false; // only plain-text headings
    const text = el.textContent.trim().replace(/\s+/g, ' ');
    if (!text) return false;
    el.setAttribute('aria-label', text); // spans below are hidden from screen readers
    el.textContent = '';
    const words = text.split(' ');
    words.forEach((w, i) => {
      const outer = document.createElement('span');
      outer.className = 'split-word';
      outer.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span');
      inner.className = 'split-inner';
      inner.style.setProperty('--i', i);
      inner.textContent = w;
      outer.appendChild(inner);
      el.appendChild(outer);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    return true;
  }

  function textReveals() {
    const hero = document.querySelector('.hero__name');
    if (hero && splitWords(hero)) {
      hero.classList.add('is-split');
      requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-split-in')));
    }
    $$('.section-title').forEach(splitWords); // revealed by CSS once .section-heading is visible
  }

  /* ---- 2. Staggered entrance for small groups (CSS animation, so hover transitions stay intact) ---- */
  const STAGGER = [
    ['.story-block', 140], ['.viz-node', 170], ['.project__logos > *', 120], ['.viz-picks li', 150],
    ['.skill-group .chip', 45], ['.expertise__tags li', 60], ['.edu-tile__chips li', 120],
    ['.contact__tags .chip', 80], ['.contact__row', 120], ['.resume__meta > div', 100],
    ['.pub-snapshot__bar i', 220], ['.author-dots i', 45],
    ['.cs-gallery__item', 110],
  ];
  function staggerIn() {
    const targets = [];
    STAGGER.forEach(([sel, step]) => {
      $$(sel).forEach((el) => {
        const siblings = Array.from(el.parentElement.children);
        const idx = Math.min(siblings.indexOf(el), 9);
        el.setAttribute('data-in', '');
        el.style.setProperty('--d', idx * step + 'ms');
        targets.push(el);
      });
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      });
    }, { threshold: 0.25 });
    targets.forEach((el) => io.observe(el));
  }

  /* ---- 3. Number count-ups for formatted figures (KPIs, summaries) ---- */
  function parseNumber(text) {
    const m = /^(\D*)(\d[\d,.]*)(.*)$/s.exec(text.trim());
    if (!m || /\d/.test(m[3])) return null; // skip things like "3 + 3" or "2–7"
    const [, prefix, num, suffix] = m;
    const thousands = /^\d{1,3}(,\d{3})+$/.test(num);
    const decimals = !thousands && num.includes('.') ? num.split('.')[1].length : 0;
    const value = parseFloat(num.replace(/,/g, ''));
    if (!isFinite(value) || value < 3) return null;
    return { prefix, suffix, thousands, decimals, value, pad: /^0\d/.test(num) ? num.length : 0 };
  }
  function format(p, v) {
    let s = p.decimals ? v.toFixed(p.decimals) : String(Math.round(v));
    if (p.thousands) s = Math.round(v).toLocaleString('en-US');
    if (p.pad) s = s.padStart(p.pad, '0');
    return p.prefix + s + p.suffix;
  }
  function countUps() {
    const els = $$('.project__stats .stat-value, .cert-summary__num, .pub-snapshot__num, .skill-group__count, .cs-kpis .stat-value')
      .filter((el) => el.childElementCount === 0);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const el = e.target, original = el.textContent, p = parseNumber(original);
        if (!p) return;
        const t0 = performance.now(), dur = 1200;
        (function tick(now) {
          const k = clamp((now - t0) / dur, 0, 1), eased = 1 - Math.pow(1 - k, 3);
          el.textContent = k < 1 ? format(p, p.value * eased) : original; // always ends on the exact original text
          if (k < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.6 });
    els.forEach((el) => { if (parseNumber(el.textContent)) io.observe(el); });
  }

  /* ---- 4. Tilt cards toward the cursor (uses the `rotate` property; perspective sits on the parent) ---- */
  function tilt() {
    const SEL = '.card--expertise, .skill-group, .snap, .cert-summary li, .pub-snapshot li, .card--certification, .edu-tile, .hero__photo-frame, .cs-gallery__item';
    const states = new Map();
    let raf = 0;
    function loop() {
      raf = 0;
      states.forEach((s, el) => {
        s.cx += (s.tx - s.cx) * 0.14;
        s.cy += (s.ty - s.cy) * 0.14;
        const settled = !s.tx && !s.ty && Math.abs(s.cx) + Math.abs(s.cy) < 0.02;
        if (settled) { el.style.rotate = ''; states.delete(el); return; }
        el.style.rotate = `${s.cx.toFixed(3)} ${s.cy.toFixed(3)} 0 ${Math.hypot(s.cx, s.cy).toFixed(3)}deg`;
      });
      if (states.size) raf = requestAnimationFrame(loop);
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
    document.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const el = e.target.closest ? e.target.closest(SEL) : null;
      states.forEach((s, k) => { if (k !== el) { s.tx = 0; s.ty = 0; } });
      if (el) {
        const parent = el.parentElement;
        if (parent && !parent.dataset.xpPersp) { parent.style.perspective = '1100px'; parent.dataset.xpPersp = '1'; }
        const r = el.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
        const max = el.matches('.hero__photo-frame') ? 9 : 6;
        const s = states.get(el) || { cx: 0, cy: 0, tx: 0, ty: 0 };
        s.tx = -ny * max; s.ty = nx * max;
        states.set(el, s);
      }
      kick();
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => { states.forEach((s) => { s.tx = 0; s.ty = 0; }); kick(); });
  }

  /* ---- 6. Hero: the accent shape behind the photo drifts against the cursor ---- */
  function heroParallax() {
    const hero = document.querySelector('.hero'), frame = document.querySelector('.hero__photo-frame');
    if (!hero || !frame) return;
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      frame.style.setProperty('--px', (((e.clientX - r.left) / r.width) - 0.5).toFixed(3));
      frame.style.setProperty('--py', (((e.clientY - r.top) / r.height) - 0.5).toFixed(3));
    }, { passive: true });
  }

  /* ---- 7. Timeline: a spine fills as you scroll and year markers light up ---- */
  function timelineSpine() {
    const track = document.querySelector('.timeline__track');
    if (!track) return;
    const spine = document.createElement('span');
    spine.className = 'timeline__spine';
    spine.setAttribute('aria-hidden', 'true');
    spine.innerHTML = '<i></i>';
    track.prepend(spine);
    const dots = $$('.timeline__year-card', track).map((card) => {
      const d = document.createElement('span');
      d.className = 'timeline__dot';
      d.setAttribute('aria-hidden', 'true');
      card.prepend(d);
      return d;
    });
    if (reduce) { track.style.setProperty('--p', 1); dots.forEach((d) => d.classList.add('is-passed')); return; }
    let queued = false;
    function update() {
      queued = false;
      const ref = window.innerHeight * 0.55, r = track.getBoundingClientRect();
      // reach 1 exactly when the bottom of the timeline reaches the bottom of the screen
      const range = Math.max(r.height - (window.innerHeight - ref), 1);
      track.style.setProperty('--p', clamp((ref - r.top) / range, 0, 1).toFixed(4));
      dots.forEach((d) => d.classList.toggle('is-passed', d.getBoundingClientRect().top < ref));
    }
    window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  ready(() => {
    timelineSpine();
    if (reduce) return;
    document.documentElement.classList.add('xp');
    textReveals();
    staggerIn();
    countUps();
    if (fine) { tilt(); heroParallax(); }
  });
})();
