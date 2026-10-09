/* ==========================================================================
   case-study.js — interactive charts for the case-study pages

   Two components, both progressive enhancement: every number is already in the
   HTML (a list of rows, and a data table under the line chart), so with
   JavaScript off the page still shows the default view in full.

   1. [data-cs-chart]  Bar chart made of a list of rows (each row is a button).
      - Optional toggles: [data-dim-btn] switches the dimension (a different
        list), [data-metric-btn] switches the metric (bars resize and re-sort,
        sliding to their new place), [data-top] dims everything outside a top-N.
      - Hover, focus or tap a row to read its details; click to pin it.
      - Arrow keys move between rows (one Tab stop per list); Home / End jump.

   2. [data-cs-line]  Line chart drawn as SVG from the JSON inside the card.
      - Hover, or focus the chart and use the arrow keys, to read each month.
      - Legend buttons show or hide a series.

   Bars grow and lines draw once when the chart scrolls into view. All motion
   is skipped when the visitor prefers reduced motion.
   ========================================================================== */

(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* Runs `fn` once, when `el` first scrolls into view (immediately if motion is off). */
  function whenVisible(el, fn, threshold) {
    if (reduce || !('IntersectionObserver' in window)) { fn(); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { io.disconnect(); fn(); }
    }, { threshold: threshold || 0.25 });
    io.observe(el);
  }

  /* f = { p: prefix, s: suffix, d: decimals, c: thousands separators } */
  function fmt(f, value) {
    f = f || {};
    const n = Number(value);
    const d = f.d == null ? 0 : f.d;
    const body = f.c ? n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) : n.toFixed(d);
    return (f.p || '') + body + (f.s || '');
  }

  /* ---------------------------------------------------------------------- */
  /* 1. Bar chart                                                           */
  /* ---------------------------------------------------------------------- */
  function initBarChart(card) {
    const formats = JSON.parse(card.dataset.formats || '{}');
    const panels = $$('.cs-ichart', card);
    const dimBtns = $$('[data-dim-btn]', card);
    const metBtns = $$('[data-metric-btn]', card);
    const topBtns = $$('[data-top]', card);
    const detail = $('.cs-chart__detail', card);
    const caption = $('.cs-chart__caption', card);
    const prompt = detail ? detail.textContent : '';

    const pressed = (btns) => btns.find((b) => b.getAttribute('aria-pressed') === 'true') || btns[0];
    let dim = (panels.find((p) => !p.hidden) || panels[0]).dataset.dim;
    let metric = metBtns.length ? pressed(metBtns).dataset.metricBtn : (card.dataset.metric || 'value');
    let topN = topBtns.length ? Number(pressed(topBtns).dataset.top) : 0;
    let pinned = null;

    const panel = () => panels.find((p) => p.dataset.dim === dim);
    const rowsOf = (p) => $$('.cs-irow', p || panel());
    const val = (row) => Number(row.dataset[metric]);
    const btnOf = (row) => row.querySelector('.cs-irow__btn');
    const detailText = (row) => {
      const key = 'detail' + metric.charAt(0).toUpperCase() + metric.slice(1);
      return row.dataset[key] || row.dataset.detail || '';
    };

    function showDetail(row) {
      if (!detail) return;
      const r = row || pinned;
      detail.textContent = r ? detailText(r) : prompt;
    }

    function setCaption(ordered) {
      if (!caption) return;
      if (topBtns.length) { caption.textContent = pressed(topBtns).dataset.insight || ''; return; }
      const mb = metBtns.length ? pressed(metBtns) : null;
      if (mb && mb.dataset.insight && !card.hasAttribute('data-autocaption')) { caption.textContent = mb.dataset.insight; return; }
      if (!card.hasAttribute('data-autocaption') || ordered.length < 2) return;
      const f = formats[metric];
      const hi = ordered.reduce((a, b) => (val(b) > val(a) ? b : a));
      const lo = ordered.reduce((a, b) => (val(b) < val(a) ? b : a));
      const dimName = dimBtns.length ? pressed(dimBtns).textContent.trim().toLowerCase() : '';
      const metName = mb ? mb.textContent.trim().toLowerCase() : '';
      caption.textContent = `Highest ${metName} by ${dimName}: ${hi.dataset.label} (${fmt(f, val(hi))}). `
        + `Lowest: ${lo.dataset.label} (${fmt(f, val(lo))}).`;
    }

    function render(opts) {
      const animate = !reduce && !(opts && opts.instant);
      panels.forEach((p) => { p.hidden = p.dataset.dim !== dim; });
      const p = panel();
      const before = rowsOf(p);
      const firstTops = new Map(before.map((r) => [r, r.getBoundingClientRect().top]));

      // Order: by the current metric, unless the list has a natural order (data-sort="off").
      const sorted = p.dataset.sort === 'off'
        ? before.slice().sort((a, b) => Number(a.dataset.idx) - Number(b.dataset.idx))
        : before.slice().sort((a, b) => val(b) - val(a));
      sorted.forEach((r) => p.appendChild(r));

      const f = formats[metric];
      const max = Math.max.apply(null, sorted.map(val).concat(0.0001));
      sorted.forEach((r, i) => {
        r.style.setProperty('--w', ((val(r) / max) * 100).toFixed(1) + '%');
        r.style.setProperty('--i', i);
        r.querySelector('.cs-irow__value').textContent = fmt(f, val(r));
        r.classList.toggle('is-dim', topN > 0 && i >= topN);
        const b = btnOf(r);
        b.tabIndex = i === 0 ? 0 : -1;
        b.setAttribute('aria-pressed', r === pinned ? 'true' : 'false');
      });

      if (animate && p.dataset.sort !== 'off') {
        sorted.forEach((r) => {
          const dy = firstTops.get(r) - r.getBoundingClientRect().top;
          if (dy) r.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 600, easing: EASE });
        });
      }
      setCaption(sorted);
      showDetail(null);
    }

    /* toggles */
    function wireGroup(btns, apply) {
      btns.forEach((b) => b.addEventListener('click', () => {
        btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        apply(b);
      }));
    }
    wireGroup(dimBtns, (b) => { dim = b.dataset.dimBtn; pinned = null; render(); });
    wireGroup(metBtns, (b) => { metric = b.dataset.metricBtn; render(); });
    wireGroup(topBtns, (b) => { topN = Number(b.dataset.top); render({ instant: true }); });

    /* hover / focus / click on rows */
    card.addEventListener('pointerover', (e) => {
      const b = e.target.closest('.cs-irow__btn');
      if (b && e.pointerType === 'mouse') showDetail(b.parentElement);
    });
    card.addEventListener('pointerout', (e) => {
      if (e.pointerType === 'mouse' && e.target.closest('.cs-irow__btn')) showDetail(null);
    });
    card.addEventListener('focusin', (e) => {
      const b = e.target.closest('.cs-irow__btn');
      if (b) showDetail(b.parentElement);
    });
    card.addEventListener('focusout', (e) => {
      if (e.target.closest('.cs-irow__btn')) showDetail(null);
    });
    card.addEventListener('click', (e) => {
      const b = e.target.closest('.cs-irow__btn');
      if (!b) return;
      const row = b.parentElement;
      pinned = pinned === row ? null : row;
      rowsOf().forEach((r) => btnOf(r).setAttribute('aria-pressed', String(r === pinned)));
      showDetail(row);
    });
    card.addEventListener('keydown', (e) => {
      const b = e.target.closest('.cs-irow__btn');
      if (!b) return;
      const btns = rowsOf().map(btnOf);
      const i = btns.indexOf(b);
      let next = -1;
      if (e.key === 'ArrowDown') next = Math.min(i + 1, btns.length - 1);
      else if (e.key === 'ArrowUp') next = Math.max(i - 1, 0);
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = btns.length - 1;
      if (next < 0) return;
      e.preventDefault();
      btns.forEach((x, k) => { x.tabIndex = k === next ? 0 : -1; });
      btns[next].focus();
    });

    /* first draw: bars grow in once the chart is on screen */
    render({ instant: true });
    if (!reduce) {
      card.classList.add('is-armed');
      whenVisible(card, () => {
        card.classList.add('is-drawing');
        requestAnimationFrame(() => card.classList.remove('is-armed'));
        setTimeout(() => card.classList.remove('is-drawing'), 1600);
      }, 0.3);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* 2. Line chart                                                          */
  /* ---------------------------------------------------------------------- */
  const NS = 'http://www.w3.org/2000/svg';

  function initLineChart(card) {
    const dataEl = $('script[type="application/json"]', card);
    const stage = $('.cs-line__stage', card);
    const readout = $('.cs-line__readout', card);
    if (!dataEl || !stage) return;
    const data = JSON.parse(dataEl.textContent);
    const f = data.format;
    const n = data.labels.length;
    const visible = new Set(data.series.map((s) => s.id));
    let idx = -1;
    let drawnFor = 0;

    const el = (name, attrs) => {
      const node = document.createElementNS(NS, name);
      Object.keys(attrs || {}).forEach((k) => node.setAttribute(k, attrs[k]));
      return node;
    };

    /* (Re)draws the chart. The drawing is sized to the card, so axis labels keep
       a readable size on a phone instead of shrinking with the whole picture. */
    function draw() {
      const W = Math.max(300, Math.min(720, Math.round(stage.clientWidth || 720)));
      const H = W < 480 ? 250 : 300;
      const m = { t: 20, r: 14, b: 32, l: W < 480 ? 46 : 58 };
      const x = (i) => m.l + ((W - m.l - m.r) * i) / (n - 1);
      const y = (v) => m.t + (H - m.t - m.b) * (1 - v / data.yMax);
      drawnFor = W;
      idx = -1;
      stage.textContent = '';

      const svg = el('svg', {
        viewBox: `0 0 ${W} ${H}`, class: 'cs-line__svg', role: 'img', tabindex: '0',
        'aria-label': data.ariaLabel + ' Use the left and right arrow keys to read each month.',
      });

      if (data.partialTo != null) {
        const right = (x(data.partialTo) + x(data.partialTo + 1)) / 2;
        svg.appendChild(el('rect', { x: m.l, y: m.t, width: right - m.l, height: H - m.t - m.b, class: 'cs-line__band' }));
        const t = el('text', { x: m.l + 8, y: m.t + 16, class: 'cs-line__bandlabel' });
        t.textContent = W < 480 ? data.partialLabelShort || data.partialLabel : data.partialLabel;
        svg.appendChild(t);
      }

      const grid = el('g', { class: 'cs-line__grid' });
      for (let k = 0; k <= 4; k++) {
        const v = (data.yMax / 4) * k;
        grid.appendChild(el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }));
        const t = el('text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end' });
        t.textContent = fmt({ p: f.p, s: f.s, d: 1 }, v);
        grid.appendChild(t);
      }
      svg.appendChild(grid);

      const step = W < 480 ? 5 : 3;
      data.labels.forEach((label, i) => {
        if (i % step !== 0 && i !== n - 1) return;
        if (W < 480 && i === 15 && (15 % step) !== 0) return;
        const t = el('text', { x: x(i), y: H - 10, 'text-anchor': 'middle', class: 'cs-line__xlabel' });
        t.textContent = label.replace(' 20', ' ’');
        svg.appendChild(t);
      });

      const groups = {};
      data.series.forEach((s, si) => {
        const g = el('g', { class: `cs-line__series cs-line__series--${si}${visible.has(s.id) ? '' : ' is-off'}`, 'data-series': s.id });
        const d = s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
        if (si === 0) g.appendChild(el('path', { d: `${d} L${x(n - 1).toFixed(1)} ${y(0)} L${x(0).toFixed(1)} ${y(0)} Z`, class: 'cs-line__area' }));
        g.appendChild(el('path', { d, class: 'cs-line__path', pathLength: '1' }));
        s.values.forEach((v, i) => g.appendChild(el('circle', { cx: x(i).toFixed(1), cy: y(v).toFixed(1), r: 3, class: 'cs-line__pt' })));
        svg.appendChild(g);
        groups[s.id] = g;
      });

      const cross = el('line', { y1: m.t, y2: H - m.b, class: 'cs-line__cross', opacity: 0 });
      svg.appendChild(cross);
      const dots = {};
      data.series.forEach((s, si) => {
        dots[s.id] = el('circle', { r: 6, class: `cs-line__dot cs-line__dot--${si}`, opacity: 0 });
        svg.appendChild(dots[s.id]);
      });
      stage.appendChild(svg);

      const tip = document.createElement('div');
      tip.className = 'cs-line__tip';
      tip.setAttribute('aria-hidden', 'true');
      stage.appendChild(tip);

      const shown = () => data.series.filter((s) => visible.has(s.id));
      function show(i) {
        idx = i;
        cross.setAttribute('x1', x(i)); cross.setAttribute('x2', x(i)); cross.setAttribute('opacity', 1);
        data.series.forEach((s) => {
          dots[s.id].setAttribute('cx', x(i)); dots[s.id].setAttribute('cy', y(s.values[i]));
          dots[s.id].setAttribute('opacity', visible.has(s.id) ? 1 : 0);
        });
        tip.innerHTML = `<strong>${data.labels[i]}</strong>`
          + shown().map((s) => `<span><i class="sw sw--${data.series.indexOf(s)}"></i>${s.name} ${fmt(f, s.values[i])}</span>`).join('');
        const pct = (x(i) / W) * 100;
        tip.style.left = `${pct}%`;
        tip.classList.toggle('is-left', pct > 55);
        tip.classList.add('is-on');
        readout.textContent = `${data.labels[i]} — ${shown().map((s) => `${s.name} ${fmt(f, s.values[i])}`).join(' · ')}`;
      }
      function hide() {
        idx = -1;
        cross.setAttribute('opacity', 0);
        Object.keys(dots).forEach((k) => dots[k].setAttribute('opacity', 0));
        tip.classList.remove('is-on');
        readout.textContent = data.prompt;
      }
      stage._api = { show, hide, current: () => idx, groups };

      svg.addEventListener('pointermove', (e) => {
        const r = svg.getBoundingClientRect();
        const px = ((e.clientX - r.left) / r.width) * W;
        const i = Math.round(((px - m.l) / (W - m.l - m.r)) * (n - 1));
        if (i >= 0 && i < n && i !== idx) show(i);
      });
      svg.addEventListener('pointerleave', () => { if (document.activeElement !== svg) hide(); });
      svg.addEventListener('focus', () => { if (idx < 0) show(n - 1); });
      svg.addEventListener('blur', hide);
      svg.addEventListener('keydown', (e) => {
        let next = idx;
        if (e.key === 'ArrowRight') next = Math.min((idx < 0 ? -1 : idx) + 1, n - 1);
        else if (e.key === 'ArrowLeft') next = Math.max((idx < 0 ? n : idx) - 1, 0);
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = n - 1;
        else return;
        e.preventDefault();
        show(next);
      });
      hide();
    }

    /* legend buttons: show or hide a series (one always stays on) */
    $$('[data-series-btn]', card).forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.seriesBtn;
      if (visible.has(id) && visible.size === 1) return;
      if (visible.has(id)) visible.delete(id); else visible.add(id);
      b.setAttribute('aria-pressed', String(visible.has(id)));
      const api = stage._api;
      api.groups[id].classList.toggle('is-off', !visible.has(id));
      if (api.current() >= 0) api.show(api.current());
    }));

    draw();
    let timer;
    window.addEventListener('resize', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const W = Math.max(300, Math.min(720, Math.round(stage.clientWidth || 720)));
        if (Math.abs(W - drawnFor) > 24) draw();
      }, 200);
    });
    if (!reduce) {
      card.classList.add('is-armed');
      whenVisible(card, () => requestAnimationFrame(() => card.classList.remove('is-armed')), 0.35);
    }
  }

  function init() {
    $$('[data-cs-chart]').forEach(initBarChart);
    $$('[data-cs-line]').forEach(initLineChart);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
