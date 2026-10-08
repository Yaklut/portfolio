/* ==========================================================================
   data-explorer.js — the two interactive charts in "Explore the data"

   Exposes window.Portfolio.initDataExplorer(), called once from main.js.

   The charts are plain HTML (a list of rows, each row a button with a bar),
   and every number lives in the row's data-* attributes in index.html. This
   file only adds behaviour on top of that, so with JavaScript off the page
   still shows the default view (sales / top 10) in full.

   - Bank Muamalat chart: a toggle switches the metric (sales or units sold).
     The rows re-sort and slide to their new place (FLIP technique), and the
     bars resize with a CSS transition.
   - Kimia Farma chart: a toggle (Top 1 / 3 / 10) dims the provinces outside
     the selection.
   - Both: hover, focus or tap a row to read its details. Arrow keys move
     between rows (one Tab stop per chart); Home and End jump to the ends.

   Motion is skipped when the visitor prefers reduced motion.
   ========================================================================== */

window.Portfolio = window.Portfolio || {};

window.Portfolio.initDataExplorer = function initDataExplorer() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PROMPT = 'Hover, tap, or arrow through the bars for details.';
  const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

  const int = (n) => Math.round(n).toLocaleString('en-US');
  const signed = (n) => `${n < 0 ? '\u2212' : '+'}${Math.abs(n).toFixed(1)}%`;

  document.querySelectorAll('[data-chart]').forEach((card) => {
    const list = card.querySelector('.chart-rows');
    const rows = Array.from(list.children);
    const detail = card.querySelector('.chart-card__detail');
    const insight = card.querySelector('.chart-card__insight');
    const toggles = Array.from(card.querySelectorAll('.chart-toggle__btn'));
    const isBmi = card.dataset.chart === 'bmi';
    const num = (row, key) => Number(row.dataset[key]);
    const label = (row) => row.querySelector('.chart-row__label').textContent;

    const totalUnits = isBmi ? rows.reduce((sum, r) => sum + num(r, 'units'), 0) : 0;
    let metric = 'sales';
    let active = null; // the row a visitor clicked, kept highlighted

    /* ---- details text -------------------------------------------------- */
    function describe(row) {
      if (!isBmi) {
        return `${label(row)}: Rp${num(row, 'value').toFixed(2)} billion nett sales, `
          + `${num(row, 'share').toFixed(1)}% of the total, rank ${num(row, 'rank')} of 31 provinces.`;
      }
      if (metric === 'units') {
        const share = (num(row, 'units') / totalUnits) * 100;
        return `${label(row)}: ${int(num(row, 'units'))} units (${share.toFixed(1)}% of all units), `
          + `$${int(num(row, 'sales'))} in sales (${num(row, 'share').toFixed(1)}% of sales).`;
      }
      return `${label(row)}: $${int(num(row, 'sales'))} in sales (${num(row, 'share').toFixed(1)}% of total), `
        + `${int(num(row, 'units'))} units, sales ${signed(num(row, 'yoy'))} year over year.`;
    }
    const show = (row) => { detail.textContent = row ? describe(row) : (active ? describe(active) : PROMPT); };

    /* ---- Bank Muamalat: change metric, re-sort, resize ---------------- */
    function applyMetric(next) {
      metric = next;
      const sorted = rows.slice().sort((a, b) => num(b, metric) - num(a, metric));
      const max = num(sorted[0], metric);

      const before = new Map(rows.map((r) => [r, r.getBoundingClientRect().top]));
      sorted.forEach((r) => list.appendChild(r));

      rows.forEach((r) => {
        const value = num(r, metric);
        r.querySelector('.chart-row__bar').style.setProperty('--w', `${(value / max) * 100}%`);
        r.querySelector('.chart-row__value').textContent = metric === 'units' ? int(value) : `$${int(value)}`;
        if (!reduce) {
          const dy = before.get(r) - r.getBoundingClientRect().top;
          if (dy) r.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 480, easing: EASE });
        }
      });
      list.setAttribute('aria-label', metric === 'units' ? 'Units sold by product category' : 'Sales by product category');
      show(null);
    }

    /* ---- Kimia Farma: dim everything outside the top N ---------------- */
    function applyTop(n) {
      rows.forEach((r) => r.classList.toggle('is-dim', num(r, 'rank') > n));
    }

    /* ---- toggle buttons ------------------------------------------------ */
    toggles.forEach((btn) => {
      btn.addEventListener('click', () => {
        toggles.forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
        insight.textContent = btn.dataset.insight;
        if (isBmi) applyMetric(btn.dataset.metric);
        else applyTop(Number(btn.dataset.top));
      });
    });

    /* ---- row interaction + roving focus -------------------------------- */
    const buttons = () => Array.from(list.querySelectorAll('.chart-row__btn'));
    buttons().forEach((b, i) => { b.tabIndex = i === 0 ? 0 : -1; });

    function focusRow(btn) {
      buttons().forEach((b) => { b.tabIndex = b === btn ? 0 : -1; });
      btn.focus();
    }

    rows.forEach((row) => {
      const btn = row.querySelector('.chart-row__btn');
      btn.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') show(row); });
      btn.addEventListener('focus', () => {
        buttons().forEach((b) => { b.tabIndex = b === btn ? 0 : -1; });
        show(row);
      });
      btn.addEventListener('click', () => {
        if (active) active.classList.remove('is-active');
        active = active === row ? null : row;
        if (active) active.classList.add('is-active');
        show(row);
      });
      btn.addEventListener('keydown', (e) => {
        const all = buttons();
        const at = all.indexOf(btn);
        const target = { ArrowDown: all[at + 1], ArrowRight: all[at + 1], ArrowUp: all[at - 1], ArrowLeft: all[at - 1],
          Home: all[0], End: all[all.length - 1] }[e.key];
        if (target) { e.preventDefault(); focusRow(target); }
      });
    });
    list.addEventListener('pointerleave', () => show(null));

    /* ---- one-time grow-in when the chart first scrolls into view ------- */
    if (!reduce && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          obs.unobserve(entry.target);
          rows.forEach((r, i) => {
            r.querySelector('.chart-row__bar').animate(
              [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
              { duration: 700, delay: i * 60, easing: EASE, fill: 'backwards' }
            );
          });
        });
      }, { threshold: 0.35 });
      io.observe(list);
    }
  });
};
