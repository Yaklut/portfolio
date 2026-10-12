/* ==========================================================================
   interactions.js — second polish round. Each feature is wrapped separately so
   one failing never stops the others. Loaded after extras.js.
   1 Marker sweep   2 Icon draw   3 Ripple on small controls
   4 Project + certificate filters   5 "#" copy-link on titles
   6 Homepage rail   7 Navbar icons   8 "Last updated" badge   9 Term tooltips
   ========================================================================== */
(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const toast = (msg) => { if (window.Portfolio && window.Portfolio.toast) window.Portfolio.toast(msg); };
  const SVG = (inner) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + inner + '</svg>';
  const ICONS = {"user": "<path d=\"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2\" /> <circle cx=\"12\" cy=\"7\" r=\"4\" />", "lightbulb": "<path d=\"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5\" /> <path d=\"M9 18h6\" /> <path d=\"M10 22h4\" />", "wrench": "<path d=\"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z\" />", "layout-dashboard": "<rect width=\"7\" height=\"9\" x=\"3\" y=\"3\" rx=\"1\" /> <rect width=\"7\" height=\"5\" x=\"14\" y=\"3\" rx=\"1\" /> <rect width=\"7\" height=\"9\" x=\"14\" y=\"12\" rx=\"1\" /> <rect width=\"7\" height=\"5\" x=\"3\" y=\"16\" rx=\"1\" />", "graduation-cap": "<path d=\"M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z\" /> <path d=\"M22 10v6\" /> <path d=\"M6 12.5V16a6 3 0 0 0 12 0v-3.5\" />", "book-open-text": "<path d=\"M12 5v16\" /> <path d=\"M16 13h2\" /> <path d=\"M16 9h2\" /> <path d=\"M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z\" /> <path d=\"M6 13h2\" /> <path d=\"M6 9h2\" />", "award": "<path d=\"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526\" /> <circle cx=\"12\" cy=\"8\" r=\"6\" />", "milestone": "<path d=\"M12 13v8\" /> <path d=\"M12 3v3\" /> <path d=\"M18.172 6a2 2 0 0 1 1.414.586l2.06 2.06a1.207 1.207 0 0 1 0 1.708l-2.06 2.06a2 2 0 0 1-1.414.586H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z\" />", "file-text": "<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /> <path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /> <path d=\"M10 9H8\" /> <path d=\"M16 13H8\" /> <path d=\"M16 17H8\" />", "mail": "<path d=\"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7\" /> <rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"2\" />", "link": "<path d=\"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71\" /> <path d=\"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\" />", "clock": "<circle cx=\"12\" cy=\"12\" r=\"10\" /> <path d=\"M12 6v6l4 2\" />", "check": "<path d=\"M20 6 9 17l-5-5\" />", "hash": "<line x1=\"4\" x2=\"20\" y1=\"9\" y2=\"9\"/><line x1=\"4\" x2=\"20\" y1=\"15\" y2=\"15\"/><line x1=\"10\" x2=\"8\" y1=\"3\" y2=\"21\"/><line x1=\"16\" x2=\"14\" y1=\"3\" y2=\"21\"/>"};
  const IS_CASE = !!$('.cs-page');

  /* ---- 1. Marker sweep ---- */
  function markerSweep() {
    if (reduce) return;
    const marks = $$('main mark');
    const hero = [];
    const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-swept');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px' }) : null;
    marks.forEach((m) => {
      // keep whatever colour the existing CSS gave it (light or dark bands)
      m.style.setProperty('--mk-c', getComputedStyle(m).backgroundColor);
      m.classList.add('mk');
      if (m.closest('.hero')) hero.push(m);
      else if (io) io.observe(m); else m.classList.add('is-swept');
    });
    hero.forEach((m, i) => setTimeout(() => m.classList.add('is-swept'), 1100 + i * 250));
  }

  /* ---- 2. Icons draw themselves ---- */
  function iconDraw() {
    if (reduce || !document.documentElement.classList.contains('xp') && !document.body.classList.contains('xp')) return;
    const SEL = '.icon-badge, .cert-group__icon, .cert-summary__ico, .snap__icon, .pub-snapshot__icon, .cs-lesson__ico, .cs-note__ico';
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-drawn');
        io.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    $$(SEL).forEach((el) => {
      const shapes = $$('svg path, svg circle, svg rect, svg line, svg polyline, svg polygon, svg ellipse', el);
      if (!shapes.length) return;
      shapes.forEach((s) => s.setAttribute('pathLength', '1'));
      const sib = Array.from(el.parentElement.children).indexOf(el);
      el.style.setProperty('--dd', Math.min(Math.max(sib, 0), 5) * 70 + 'ms');
      el.classList.add('ico-draw');
      io.observe(el);
    });
  }

  /* ---- 3. Ripple on the small controls (.btn is handled by motion.js) ---- */
  function ripples() {
    if (reduce) return;
    document.addEventListener('pointerdown', (e) => {
      const t = e.target.closest('.pub-filter__btn, .cs-seg button, .copy-btn, .certs-carousel__btn, .nav-search-btn, .social-btn');
      if (!t) return;
      const r = t.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2;
      const dot = document.createElement('span');
      dot.className = 'ripple';
      dot.setAttribute('aria-hidden', 'true');
      dot.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + (e.clientX - r.left - size / 2) + 'px;top:' + (e.clientY - r.top - size / 2) + 'px';
      t.appendChild(dot);
      dot.addEventListener('animationend', () => dot.remove());
    });
  }

  /* ---- 4. Filters (same look as the publications filter) ---- */
  function buildFilter(cfg) {
    // cfg: { id, label, noun, options:[{key,label}], items, match(item,key), before(el) -> insert, onApply(key) }
    const wrap = document.createElement('div');
    wrap.className = 'pub-filter-wrap filter-wrap ' + (cfg.wrapClass || '');
    const total = cfg.items.length;
    wrap.innerHTML =
      '<div class="pub-filter" id="' + cfg.id + '" role="group" aria-label="' + cfg.label + '"><span class="pub-filter__thumb" aria-hidden="true"></span></div>' +
      '<p class="pub-filter__status" role="status" aria-live="polite"></p>';
    const bar = $('.pub-filter', wrap), thumb = $('.pub-filter__thumb', wrap), status = $('.pub-filter__status', wrap);
    const all = [{ key: 'all', label: 'All' }].concat(cfg.options);
    const buttons = all.map((o, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pub-filter__btn'; b.dataset.filter = o.key; b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
      const n = o.key === 'all' ? total : cfg.items.filter((it) => cfg.match(it, o.key)).length;
      b.innerHTML = o.label + ' <span class="pub-filter__count" aria-hidden="true">' + n + '</span>';
      bar.appendChild(b);
      return b;
    });
    cfg.before(wrap);

    const place = () => {
      const a = buttons.find((b) => b.getAttribute('aria-pressed') === 'true');
      if (!a) return;
      thumb.style.width = a.offsetWidth + 'px';
      thumb.style.setProperty('--thumb-x', a.offsetLeft + 'px');
    };
    place();
    requestAnimationFrame(() => bar.classList.add('is-ready'));
    window.addEventListener('resize', place);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);

    let run = 0;
    async function apply(key) {
      const id = ++run;
      const shown = (it) => !it.hidden;
      const want = (it) => key === 'all' || cfg.match(it, key);
      const leaving = cfg.items.filter((it) => shown(it) && !want(it));
      const entering = cfg.items.filter((it) => !shown(it) && want(it));
      if (!reduce && leaving.length && leaving[0].animate) {
        const outs = leaving.map((it) => it.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(0.97)' }], { duration: 170, easing: 'ease-in', fill: 'forwards' }));
        await Promise.all(outs.map((a) => a.finished.catch(() => {})));
        if (id !== run) { outs.forEach((a) => a.cancel()); return; }
        outs.forEach((a) => a.cancel());
      }
      cfg.items.forEach((it) => { it.hidden = !want(it); });
      entering.forEach((it, i) => {
        it.classList.add('is-visible'); // it may never have been scrolled into view before
        if (!reduce && it.animate) it.animate([{ opacity: 0, transform: 'translateY(16px) scale(0.985)' }, { opacity: 1, transform: 'none' }], { duration: 440, delay: 60 + i * 60, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'backwards' });
      });
      const n = cfg.items.filter(shown).length;
      status.textContent = 'Showing ' + n + ' of ' + total + ' ' + cfg.noun;
      if (cfg.onApply) cfg.onApply(key);
    }
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('.pub-filter__btn');
      if (!b || b.getAttribute('aria-pressed') === 'true') return;
      buttons.forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
      place();
      apply(b.dataset.filter);
    });
  }

  function projectFilter() {
    const cards = $$('.card--project');
    if (cards.length < 2) return;
    const TOOLS = ['BigQuery', 'Looker Studio', 'SQL', 'Excel'];
    const chipsOf = (c) => $$('.tool-chips .chip', c).map((x) => x.textContent.toLowerCase());
    const match = (c, key) => chipsOf(c).some((t) => t.includes(key.toLowerCase()));
    const options = TOOLS.filter((t) => cards.some((c) => match(c, t))).map((t) => ({ key: t, label: t }));
    if (options.length < 2) return;
    buildFilter({
      id: 'project-filter', label: 'Filter projects by tool', noun: 'projects', options, items: cards, match,
      before: (wrap) => cards[0].parentElement.before(wrap),
    });
  }

  function certFilter() {
    const cards = $$('.card--certification');
    if (cards.length < 4) return;
    const PLATFORMS = [['DQLab', /dqlab/i], ['MySkill', /myskill/i], ['Rakamin', /rakamin/i], ['RevoU', /revou/i], ['Dibimbing', /dibimbing/i], ['DSAREA', /dsarea|jobarea/i]];
    const platformOf = (c) => {
      const t = ($('.cert-issuer', c) || {}).textContent || '';
      const hit = PLATFORMS.find((p) => p[1].test(t));
      return hit ? hit[0] : 'Other';
    };
    const counts = {};
    cards.forEach((c) => { const p = platformOf(c); counts[p] = (counts[p] || 0) + 1; });
    const options = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b)).map((k) => ({ key: k, label: k }));
    const groups = $$('.cert-group');
    const counters = groups.map((g) => $('.cert-group__count', g));
    const original = counters.map((c) => (c ? c.textContent : ''));
    const firstGroup = groups[0];
    if (!firstGroup) return;
    buildFilter({
      id: 'cert-filter', label: 'Filter certificates by platform', noun: 'certificates', options, items: cards,
      match: (c, key) => platformOf(c) === key, wrapClass: 'certs-filter-wrap',
      before: (wrap) => firstGroup.before(wrap),
      onApply: (key) => {
        groups.forEach((g, i) => {
          const n = $$('.card--certification', g).filter((c) => !c.hidden).length;
          g.hidden = n === 0;
          if (counters[i]) counters[i].textContent = key === 'all' ? original[i] : String(n).padStart(2, '0');
        });
        $$('.certs-grid').forEach((g) => g.dispatchEvent(new CustomEvent('carousel:refresh')));
      },
    });
  }

  /* ---- 5. "#" copy-link on section titles ---- */
  function anchorCopy() {
    $$('main > section[id]:not(#hero) .section-title').forEach((h) => {
      const section = h.closest('section[id]');
      const title = (h.getAttribute('aria-label') || h.textContent).trim().replace(/\s+/g, ' ');
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'anchor-copy';
      b.setAttribute('aria-label', 'Copy link to the ' + title + ' section');
      b.innerHTML = SVG(ICONS.hash);
      b.addEventListener('click', async () => {
        const url = location.origin + location.pathname + '#' + section.id;
        try { await navigator.clipboard.writeText(url); toast('Link to “' + title + '” copied'); }
        catch (err) { toast('Could not copy the link'); }
      });
      h.appendChild(b);
    });
  }

  /* ---- 6. Homepage rail ---- */
  function homeRail() {
    if (IS_CASE) return;
    const hero = $('#hero');
    const ids = ['about', 'expertise', 'skills', 'projects', 'education', 'research', 'certifications', 'timeline', 'resume', 'contact'];
    const ICON = { about: 'user', expertise: 'lightbulb', skills: 'wrench', projects: 'layout-dashboard', education: 'graduation-cap', research: 'book-open-text', certifications: 'award', timeline: 'milestone', resume: 'file-text', contact: 'mail' };
    const secs = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!hero || secs.length < 5) return;
    const nav = document.createElement('nav');
    nav.className = 'home-rail'; nav.setAttribute('aria-label', 'Sections on this page');
    const ol = document.createElement('ol');
    const links = new Map();
    secs.forEach((s) => {
      const label = ($('.section-title', s) ? ($('.section-title', s).getAttribute('aria-label') || $('.section-title', s).textContent) : s.id).trim().replace(/\s+/g, ' ');
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#' + s.id; a.dataset.label = label; a.setAttribute('aria-label', label);
      a.innerHTML = SVG(ICONS[ICON[s.id]] || '<circle cx="12" cy="12" r="10"/>');
      li.appendChild(a); ol.appendChild(li); links.set(s, a);
    });
    nav.appendChild(ol); document.body.appendChild(nav);
    new IntersectionObserver((e) => nav.classList.toggle('is-on', !e[0].isIntersecting), { threshold: 0.1 }).observe(hero);
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) links.forEach((a, s) => (s === e.target ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'))); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    secs.forEach((s) => spy.observe(s));
  }

  /* ---- 7. Navbar icons ---- */
  function navIcons() {
    const MAP = { about: 'user', expertise: 'lightbulb', skills: 'wrench', projects: 'layout-dashboard', education: 'graduation-cap', research: 'book-open-text', certifications: 'award', contact: 'mail', timeline: 'milestone', resume: 'file-text' };
    $$('.nav-link').forEach((a) => {
      const key = (a.getAttribute('href') || '').replace('#', '');
      if (!MAP[key]) return;
      a.insertAdjacentHTML('afterbegin', SVG(ICONS[MAP[key]]).replace('<svg ', '<svg class="nav-ico" '));
      $$('.nav-ico path, .nav-ico circle, .nav-ico rect, .nav-ico line, .nav-ico polyline', a).forEach((s) => s.setAttribute('pathLength', '1'));
    });
  }

  /* ---- 8. "Last updated" badge: date of the latest commit on GitHub, else the file's own date ---- */
  async function lastUpdated() {
    const copy = $('.footer__copyright');
    if (!copy) return;
    const KEY = 'portfolio-last-updated';
    let iso = null;
    try {
      const c = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (c && Date.now() - c.t < 6 * 3600 * 1000) iso = c.iso;
    } catch (err) { /* storage unavailable: fine */ }
    if (!iso) {
      try {
        const ctl = new AbortController();
        const timer = setTimeout(() => ctl.abort(), 3500);
        const res = await fetch('https://api.github.com/repos/Yaklut/portfolio/commits/main', { headers: { Accept: 'application/vnd.github+json' }, signal: ctl.signal });
        clearTimeout(timer);
        if (res.ok) {
          const data = await res.json();
          iso = data && data.commit && data.commit.committer && data.commit.committer.date;
          try { sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), iso })); } catch (err) { /* ignore */ }
        }
      } catch (err) { /* offline or rate-limited: use the fallback */ }
    }
    if (!iso) { const d = new Date(document.lastModified); if (!isNaN(d)) iso = d.toISOString(); }
    const d = iso ? new Date(iso) : null;
    if (!d || isNaN(d)) return;
    const p = document.createElement('span');
    p.className = 'footer__updated';
    p.innerHTML = SVG(ICONS.clock) + '<span>Last updated <time datetime="' + d.toISOString().slice(0, 10) + '">' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + '</time></span>';
    copy.appendChild(p);
  }

  /* ---- 9. Term tooltips: first mention of each term on a page gets a short explanation ---- */
  const GLOSSARY = {
    'kpi': ['KPI', 'Key Performance Indicator: a headline number used to track how a business or process is doing.'],
    'cte': ['CTE', 'Common Table Expression: a named, temporary result inside a SQL query, so a long query can be built in readable steps.'],
    'pivottable': ['PivotTable', 'An Excel tool that summarises a large table by grouping rows and totalling or averaging the values.'],
    'slicer': ['Slicer', 'A clickable filter button in Excel that filters PivotTables and charts together.'],
    'xlookup': ['XLOOKUP', 'An Excel function that finds a value in one column and returns the matching value from another.'],
    'left join': ['LEFT JOIN', 'A SQL join that keeps every row of the left table and adds matching data from the right table when it exists.'],
    'case when': ['CASE WHEN', 'SQL’s if-then logic: it returns different values depending on conditions.'],
    'sinta': ['SINTA', 'Indonesia’s national science and technology index. Journals are ranked in tiers from SINTA 1 (highest) to SINTA 6.'],
    'anova': ['ANOVA', 'Analysis of variance: a statistical test that compares the averages of three or more groups.'],
    'master table': ['Master table', 'One combined table made by joining several related tables, so later queries need no further joins.'],
  };
  function termTips() {
    const re = /\b(KPIs?|CTEs?|PivotTables?|slicers?|XLOOKUP|LEFT JOIN|CASE WHEN|SINTA|ANOVA|master table)\b/gi;
    const SKIP = 'a, button, h1, h2, h3, h4, h5, h6, .chip, .btn, pre, code, kbd, script, style, noscript, time, label, summary, .term, .sr-only, [aria-hidden="true"], .modal, .cmdk, .stat__label, .stat-label, .hero__stats, dt';
    const seen = new Set();
    const root = $('main');
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.nodeValue.trim() && !(n.parentElement && n.parentElement.closest(SKIP)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const text = node.nodeValue; re.lastIndex = 0;
      let m, last = 0, frag = null;
      while ((m = re.exec(text))) {
        let k = m[0].toLowerCase(); if (!GLOSSARY[k]) k = k.replace(/s$/, '');
        if (!GLOSSARY[k] || seen.has(k)) continue;
        seen.add(k);
        frag = frag || document.createDocumentFragment();
        frag.append(text.slice(last, m.index));
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'term'; b.dataset.term = k; b.textContent = m[0];
        frag.append(b); last = m.index + m[0].length;
      }
      if (frag) { frag.append(text.slice(last)); node.replaceWith(frag); }
    });
    if (!seen.size) return;

    const tip = document.createElement('div');
    tip.className = 'term-tip'; tip.id = 'term-tip'; tip.setAttribute('role', 'tooltip');
    document.body.appendChild(tip);
    let current = null;
    function show(btn) {
      const g = GLOSSARY[btn.dataset.term]; if (!g) return;
      if (current && current !== btn) current.removeAttribute('aria-expanded');
      current = btn;
      tip.innerHTML = '<b></b><span></span>'; tip.firstChild.textContent = g[0]; tip.lastChild.textContent = g[1];
      btn.setAttribute('aria-describedby', 'term-tip'); btn.setAttribute('aria-expanded', 'true');
      const r = btn.getBoundingClientRect(), w = Math.min(280, window.innerWidth - 24);
      tip.style.maxWidth = w + 'px';
      tip.classList.add('is-on');
      const h = tip.offsetHeight;
      let left = Math.min(Math.max(12, r.left + r.width / 2 - tip.offsetWidth / 2), window.innerWidth - tip.offsetWidth - 12);
      let top = r.top - h - 10; if (top < 8) top = r.bottom + 10;
      tip.style.left = left + 'px'; tip.style.top = top + 'px';
    }
    function hide() { if (!current) return; current.removeAttribute('aria-describedby'); current.removeAttribute('aria-expanded'); current = null; tip.classList.remove('is-on'); }
    const termOf = (e) => (e.target.closest ? e.target.closest('.term') : null);
    if (fine) {
      document.addEventListener('pointerover', (e) => { const t = termOf(e); if (t) show(t); });
      document.addEventListener('pointerout', (e) => { if (termOf(e)) hide(); });
    }
    document.addEventListener('focusin', (e) => { const t = termOf(e); if (t) show(t); });
    document.addEventListener('focusout', (e) => { if (termOf(e)) hide(); });
    document.addEventListener('click', (e) => { const t = termOf(e); if (t && current !== t) show(t); else if (!t) hide(); else if (!fine) hide(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
    window.addEventListener('scroll', hide, { passive: true });
    window.addEventListener('resize', hide);
  }

  function run(fn) { try { const r = fn(); if (r && r.catch) r.catch((e) => console.error('[interactions]', fn.name, e)); } catch (err) { console.error('[interactions]', fn.name, err); } }
  function init() { [markerSweep, iconDraw, ripples, projectFilter, certFilter, anchorCopy, homeRail, navIcons, termTips, lastUpdated].forEach(run); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
