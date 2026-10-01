/* ==========================================================================
   publications-filter.js — filter the Research & Publications list

   Exposes window.Portfolio.initPublicationsFilter(), called once from
   main.js. Reads each publication's tier straight from its existing
   .chip--tier text and its first-author status from the existing
   .card--publication-lead class, so the five real publications stay the
   single source of truth.

   Motion (Web Animations API, skipped entirely for prefers-reduced-motion):
     1. cards that no longer match fade and shrink out,
     2. the list collapses/expands to its new height,
     3. cards that stay glide to their new position (FLIP technique),
     4. cards that newly match rise in with a small stagger.
   A pill "thumb" slides behind the active filter button.
   ========================================================================== */

window.Portfolio = window.Portfolio || {};

window.Portfolio.initPublicationsFilter = function initPublicationsFilter() {
  const list = document.querySelector('.publications-list');
  const filterBar = document.getElementById('pub-filter');
  if (!list || !filterBar) return;

  const cards = Array.from(list.querySelectorAll('.card--publication'));
  const emptyEl = document.getElementById('pub-filter-empty');
  const statusEl = document.getElementById('pub-filter-status');
  const thumb = filterBar.querySelector('.pub-filter__thumb');
  const buttons = Array.from(filterBar.querySelectorAll('.pub-filter__btn'));

  const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';   // = --ease-out in styles.css
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function matches(card, filter) {
    if (filter === 'all') return true;
    if (filter === 'first-author') return card.classList.contains('card--publication-lead');
    const tierText = (card.querySelector('.chip--tier')?.textContent || '').trim().toLowerCase();
    return tierText.replace(/\s+/g, '-') === filter;
  }

  function setClasses(filter) {
    cards.forEach((card) => card.classList.toggle('is-filtered-out', !matches(card, filter)));
  }

  function setStatus(filter) {
    const n = cards.filter((card) => matches(card, filter)).length;
    if (statusEl) statusEl.textContent = 'Showing ' + n + ' of ' + cards.length + ' publications';
    if (emptyEl) emptyEl.hidden = n !== 0;
  }

  // Live counts on each button, derived from the same matches() rule.
  buttons.forEach((btn) => {
    const el = btn.querySelector('.pub-filter__count');
    if (el) el.textContent = String(cards.filter((card) => matches(card, btn.dataset.filter)).length);
  });

  // ---- Sliding thumb ---------------------------------------------------------
  function placeThumb() {
    const active = buttons.find((b) => b.getAttribute('aria-pressed') === 'true');
    if (!active || !thumb) return;
    thumb.style.width = active.offsetWidth + 'px';
    thumb.style.setProperty('--thumb-x', active.offsetLeft + 'px');
  }
  placeThumb();
  window.requestAnimationFrame(() => filterBar.classList.add('is-ready'));
  window.addEventListener('resize', placeThumb);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeThumb);

  // ---- Animated filtering ------------------------------------------------------
  let target = 'all';   // filter most recently requested
  let runId = 0;        // lets a newer click supersede an in-flight animation

  // Finish/abort whatever is in flight so the DOM is settled before measuring.
  function settle() {
    list.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    list.style.height = '';
    list.style.overflow = '';
    cards.forEach((card) => { card.style.transition = ''; });
  }

  const done = (anims) => Promise.all(anims.map((a) => a.finished.catch(() => {})));

  async function apply(filter) {
    const id = ++runId;
    settle();
    setClasses(target);        // finalize the previous request instantly
    target = filter;
    setStatus(filter);

    if (prefersReducedMotion() || !list.animate) { setClasses(filter); return; }

    const shown = (c) => !c.classList.contains('is-filtered-out');
    const leaving = cards.filter((c) => shown(c) && !matches(c, filter));
    const entering = cards.filter((c) => !shown(c) && matches(c, filter));
    const staying = cards.filter((c) => shown(c) && matches(c, filter));
    if (!leaving.length && !entering.length) return;

    // The reveal-on-scroll CSS transitions would fight the animations below.
    cards.forEach((c) => { c.style.transition = 'none'; });
    const startHeight = list.getBoundingClientRect().height;
    list.style.height = startHeight + 'px';
    list.style.overflow = 'hidden';

    // 1. leaving cards fade & shrink out
    const outs = leaving.map((c) => c.animate(
      [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(0.97)' }],
      { duration: 170, easing: 'ease-in', fill: 'forwards' }
    ));
    await done(outs);
    if (id !== runId) return;   // superseded: the newer run already settled the DOM

    // 2. swap the layout, remembering where the staying cards were (FLIP "first")
    const firstTops = new Map(staying.map((c) => [c, c.getBoundingClientRect().top]));
    outs.forEach((a) => a.cancel());
    setClasses(filter);
    entering.forEach((c) => c.classList.add('is-visible'));   // may never have been scrolled into view
    list.style.height = '';
    const endHeight = list.getBoundingClientRect().height;

    // 3. animate: height, staying cards glide, entering cards rise in (staggered)
    const anims = [list.animate(
      [{ height: startHeight + 'px' }, { height: endHeight + 'px' }],
      { duration: 420, easing: EASE }
    )];
    staying.forEach((c) => {
      const delta = firstTops.get(c) - c.getBoundingClientRect().top;
      if (Math.abs(delta) > 1) {
        anims.push(c.animate(
          [{ transform: 'translateY(' + delta + 'px)' }, { transform: 'none' }],
          { duration: 420, easing: EASE }
        ));
      }
    });
    entering.forEach((c, i) => {
      anims.push(c.animate(
        [{ opacity: 0, transform: 'translateY(18px) scale(0.985)' }, { opacity: 1, transform: 'none' }],
        { duration: 460, delay: 110 + i * 70, easing: EASE, fill: 'backwards' }
      ));
    });

    await done(anims);
    if (id !== runId) return;
    settle();
  }

  filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.pub-filter__btn');
    if (!btn || btn.getAttribute('aria-pressed') === 'true') return;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    placeThumb();
    apply(btn.dataset.filter);
  });

  setStatus('all');
};
