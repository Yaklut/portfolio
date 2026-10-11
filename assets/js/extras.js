/* ==========================================================================
   extras.js — small extras, each wrapped so one failing never stops the rest.
   1. Hero role rotator   2. Hero background   3. Card glow
   4. Certificate carousel   5. Toast notifications for downloads / code copy
   Needs no other script (it reuses the `.toast` element that motion.js adds).
   ========================================================================== */
(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ---- 1. Hero role rotator ---- */
  function roleRotator() {
    const box = document.querySelector('.role-rotator');
    if (!box || reduce) return; // reduced motion keeps the static list
    const items = $$('.role-rotator__item', box);
    if (items.length < 2) return;
    box.classList.add('is-rotating');
    let i = 0;
    items[0].classList.add('is-active');
    setInterval(() => {
      if (document.hidden) return;
      const prev = items[i];
      i = (i + 1) % items.length;
      prev.classList.remove('is-active');
      prev.classList.add('is-leaving');
      items[i].classList.add('is-active');
      // after it has slid out, park it below again so it can re-enter from the bottom
      setTimeout(() => prev.classList.remove('is-leaving'), 560);
    }, 2600);
  }

  /* ---- 2. Hero background (decorative, hidden from assistive tech) ---- */
  function heroBackground() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const bg = document.createElement('div');
    bg.className = 'hero__bg';
    bg.setAttribute('aria-hidden', 'true');
    bg.innerHTML =
      '<div class="hero__bg-dots"></div>' +
      '<svg class="hero__bg-lines" viewBox="0 0 1200 300" preserveAspectRatio="none" focusable="false">' +
      '<path pathLength="1" d="M0 250 L90 232 L180 244 L290 196 L380 214 L500 150 L610 176 L720 112 L830 138 L950 78 L1060 96 L1200 42"/>' +
      '<path pathLength="1" d="M0 276 L120 262 L240 270 L360 236 L470 248 L590 206 L700 222 L820 178 L940 190 L1070 148 L1200 128"/>' +
      '<path pathLength="1" d="M0 292 L150 284 L300 288 L450 266 L600 274 L750 246 L900 256 L1050 226 L1200 214"/>' +
      '</svg>';
    hero.prepend(bg);
  }

  /* ---- 3. Soft glow inside cards: one overlay span + two CSS variables ---- */
  function cardGlow() {
    if (!fine) return;
    const SEL = '.card--expertise, .skill-group, .snap, .edu-tile, .card--publication, .cs-lesson, .cs-glance__item, .cs-evidence';
    $$(SEL).forEach((el) => {
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      const glow = document.createElement('span');
      glow.className = 'card-glow';
      glow.setAttribute('aria-hidden', 'true');
      el.classList.add('has-glow');
      el.appendChild(glow);
    });
    document.addEventListener('pointermove', (e) => {
      const card = e.target.closest ? e.target.closest('.has-glow') : null;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* ---- 4. Certificate carousel (only groups with more than 3 cards) ---- */
  const ARROW = (d) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>';
  function certCarousel() {
    $$('.certs-grid').forEach((grid) => {
      const cards = Array.from(grid.children);
      if (cards.length <= 3) return;

      const wrap = document.createElement('div');
      wrap.className = 'certs-carousel';
      wrap.setAttribute('role', 'group');
      wrap.setAttribute('aria-roledescription', 'carousel');
      wrap.setAttribute('aria-label', 'Certificates');
      grid.before(wrap);
      wrap.appendChild(grid);

      const bar = document.createElement('div');
      bar.className = 'certs-carousel__bar';
      bar.innerHTML =
        '<span class="certs-carousel__count" aria-live="polite"></span>' +
        '<div class="certs-carousel__track" aria-hidden="true"><i></i></div>' +
        '<div class="certs-carousel__btns">' +
        '<button type="button" class="certs-carousel__btn" data-dir="-1" aria-label="Previous certificates">' + ARROW('m15 18-6-6 6-6') + '</button>' +
        '<button type="button" class="certs-carousel__btn" data-dir="1" aria-label="Next certificates">' + ARROW('m9 18 6-6-6-6') + '</button>' +
        '</div>';
      wrap.appendChild(bar);

      const count = bar.querySelector('.certs-carousel__count');
      const fill = bar.querySelector('.certs-carousel__track i');
      const [prev, next] = $$('.certs-carousel__btn', bar);
      const accent = Array.from((grid.closest('.cert-group') || grid).classList).find((c) => c.startsWith('accent-'));
      if (accent) wrap.classList.add(accent);
      const total = cards.length;

      const step = () => {
        const a = cards[0], b = cards[1];
        return b ? b.offsetLeft - a.offsetLeft : a.offsetWidth;
      };
      let queued = false;
      function update() {
        queued = false;
        const s = step(), max = grid.scrollWidth - grid.clientWidth;
        const first = Math.min(total - 1, Math.round(grid.scrollLeft / s));
        const last = Math.min(total, first + Math.max(1, Math.round(grid.clientWidth / s)));
        count.textContent = (last > first + 1 ? (first + 1) + '–' + last : String(first + 1)) + ' of ' + total;
        fill.style.setProperty('--w', ((grid.scrollLeft + grid.clientWidth) / grid.scrollWidth).toFixed(3));
        prev.disabled = grid.scrollLeft <= 2;
        next.disabled = grid.scrollLeft >= max - 2;
      }
      const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
      grid.addEventListener('scroll', queue, { passive: true });
      window.addEventListener('resize', queue);
      bar.addEventListener('click', (e) => {
        const btn = e.target.closest('.certs-carousel__btn');
        if (!btn || btn.disabled) return;
        grid.scrollBy({ left: Number(btn.dataset.dir) * step(), behavior: reduce ? 'auto' : 'smooth' });
      });
      update();
    });
  }

  /* ---- 5. Toast notifications ---- */
  function toast(msg) {
    const el = document.querySelector('.toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => el.classList.remove('is-visible'), 2200);
  }
  function toasts() {
    // Any download link (resume buttons, Excel workbook)
    document.addEventListener('click', (e) => {
      const a = e.target.closest ? e.target.closest('a[download]') : null;
      if (a) toast(/\.pdf$/i.test(a.getAttribute('href') || '') ? 'Resume download started' : 'Download started');
    });
    // Case-study code windows: cs-enhance.js adds `is-copied` to the button after a successful copy
    $$('[data-copy]').forEach((btn) => {
      new MutationObserver(() => { if (btn.classList.contains('is-copied')) toast('Code copied to clipboard'); })
        .observe(btn, { attributes: true, attributeFilter: ['class'] });
    });
  }

  function run(fn) { try { fn(); } catch (err) { console.error('[extras]', fn.name, err); } }
  function init() { [roleRotator, heroBackground, cardGlow, certCarousel, toasts].forEach(run); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
