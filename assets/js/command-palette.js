/* ==========================================================================
   command-palette.js — Ctrl/Cmd+K jump-to menu

   Exposes window.Portfolio.initCommandPalette(), called once from main.js.

   Deliberately does NOT hardcode a list of sections: it reads the page's
   own <section id="..."> headings and the two project-card titles at
   startup, so the palette can never drift out of sync with the real page
   the way a hand-maintained array could. Works unmodified on index.html
   and both case-study pages.

   Reuses the same .modal / .modal__dialog shell and open/close/focus-trap
   pattern as modal.js (the certificate & project lightbox), but is a
   second, independent dialog instance (#command-palette).
   ========================================================================== */

window.Portfolio = window.Portfolio || {};

window.Portfolio.initCommandPalette = function initCommandPalette() {
  const modal = document.getElementById('command-palette');
  if (!modal) return;

  const dialog = modal.querySelector('.modal__dialog');
  const input = document.getElementById('cmdk-input');
  const list = document.getElementById('cmdk-list');
  const emptyEl = document.getElementById('cmdk-empty');
  const trigger = document.getElementById('cmdk-trigger');

  // Static, hand-written Lucide-style SVG strings (never built from user input).
  const svg = (inner) =>
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
  const ICONS = {
    hash: svg('<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>'),
    folder: svg('<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>'),
    download: svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>'),
    mail: svg('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>'),
    enter: svg('<polyline points="9 10 4 15 9 20"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/>'),
  };

  // Show the shortcut that actually works on this machine.
  const isApple = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || '');
  const hint = trigger && trigger.querySelector('.nav-search-btn__hint');
  if (hint) hint.textContent = isApple ? '⌘K' : 'Ctrl K';

  // ---- Build the item list from the DOM -----------------------------------
  const items = [];

  document.querySelectorAll('main > section[id]').forEach((section) => {
    const heading = section.querySelector('.section-heading h2, .cs-title, h1');
    let label = heading ? heading.textContent.trim() : '';
    if (section.id === 'hero') label = 'Home';
    if (label) items.push({ label, group: 'Jump to', icon: 'hash', hash: '#' + section.id });

    section.querySelectorAll('[id^="project-"]').forEach((card) => {
      const h3 = card.querySelector('h3');
      if (h3) items.push({ label: h3.textContent.trim(), group: 'Project', icon: 'folder', hash: '#' + card.id });
    });
  });

  const resumeLink = document.querySelector('a[href$=".pdf"][download]');
  if (resumeLink) items.push({ label: 'Download Resume (PDF)', group: 'Action', icon: 'download', el: resumeLink });
  const emailLink = document.querySelector('a[href^="mailto:"]');
  if (emailLink) items.push({ label: 'Email Refa', group: 'Action', icon: 'mail', el: emailLink });

  // ---- State ----------------------------------------------------------------
  let filtered = items;
  let activeIndex = 0;
  let lastFocused = null;
  let enteringTimer = null;

  function getFocusable() {
    return dialog.querySelectorAll('input, button:not([disabled])');
  }

  function render() {
    list.innerHTML = '';
    emptyEl.hidden = filtered.length !== 0;

    let lastGroup = null;
    filtered.forEach((item, i) => {
      if (item.group !== lastGroup) {
        const groupEl = document.createElement('li');
        groupEl.className = 'cmdk__group';
        groupEl.setAttribute('role', 'presentation');
        groupEl.textContent = item.group;
        list.appendChild(groupEl);
        lastGroup = item.group;
      }
      const li = document.createElement('li');
      li.id = 'cmdk-option-' + i;
      li.className = 'cmdk__item' + (i === activeIndex ? ' is-active' : '');
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(i === activeIndex));
      li.style.setProperty('--i', String(Math.min(i, 8)));
      li.innerHTML =
        '<span class="cmdk__icon">' + ICONS[item.icon] + '</span>' +
        '<span class="cmdk__label"></span>' +
        '<span class="cmdk__enter">' + ICONS.enter + '</span>';
      li.querySelector('.cmdk__label').textContent = item.label;
      // mousemove (not mouseenter) so a list that scrolls under a resting
      // pointer during arrow-key navigation doesn't steal the selection.
      li.addEventListener('mousemove', () => { if (activeIndex !== i) setActive(i, false); });
      li.addEventListener('click', () => activate(item));
      list.appendChild(li);
    });

    input.setAttribute('aria-activedescendant', filtered.length ? 'cmdk-option-' + activeIndex : '');
  }

  // Moves the highlight WITHOUT rebuilding the list. Rebuilding on hover
  // replaced the very element under the pointer between mousedown and
  // mouseup, so clicks on items were silently lost.
  function setActive(i, scroll = true) {
    activeIndex = i;
    list.querySelectorAll('[role="option"]').forEach((el, idx) => {
      const on = idx === activeIndex;
      el.classList.toggle('is-active', on);
      el.setAttribute('aria-selected', String(on));
    });
    input.setAttribute('aria-activedescendant', 'cmdk-option-' + activeIndex);
    const el = document.getElementById('cmdk-option-' + activeIndex);
    if (scroll && el) el.scrollIntoView({ block: 'nearest' });
  }

  function stopEntering() {
    window.clearTimeout(enteringTimer);
    list.classList.remove('is-entering');
  }

  function filterItems(query) {
    const q = query.trim().toLowerCase();
    filtered = q ? items.filter((item) => item.label.toLowerCase().includes(q)) : items;
    activeIndex = 0;
    emptyEl.textContent = q ? 'No results for “' + query.trim() + '”' : 'No results.';
    render();
  }

  function activate(item) {
    if (!item) return;
    closePalette();
    // On phones the palette can be opened from inside the full-screen menu;
    // close that menu too, or it would keep covering the page we jump to.
    const navToggle = document.querySelector('.nav-toggle');
    if (navToggle && navToggle.getAttribute('aria-expanded') === 'true') navToggle.click();
    if (item.el) {
      item.el.click();
    } else if (item.hash) {
      window.location.hash = item.hash;
    }
  }

  // ---- Open / close (mirrors modal.js) ---------------------------------------
  function openPalette() {
    lastFocused = document.activeElement;
    input.value = '';
    stopEntering();
    list.classList.add('is-entering');   // one-time rise-in; see styles.css
    filterItems('');
    enteringTimer = window.setTimeout(stopEntering, 600);

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    modal.removeAttribute('inert');
    document.body.classList.add('modal-open');
    document.addEventListener('keydown', onKeydown);
    input.focus();
  }

  function closePalette() {
    if (!modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('inert', '');
    document.body.classList.remove('modal-open');
    document.removeEventListener('keydown', onKeydown);
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    lastFocused = null;
  }

  function onKeydown(e) {
    if (e.key === 'Escape') { closePalette(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); if (filtered.length) setActive((activeIndex + 1) % filtered.length); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); if (filtered.length) setActive((activeIndex - 1 + filtered.length) % filtered.length); return; }
    if (e.key === 'Enter') { e.preventDefault(); activate(filtered[activeIndex]); return; }
    if (e.key !== 'Tab') return;

    const focusable = Array.from(getFocusable());
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  // Global shortcut: Ctrl+K / Cmd+K opens it from anywhere on the page.
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (!modal.classList.contains('is-open')) openPalette();
    }
  });

  if (trigger) trigger.addEventListener('click', openPalette);
  input.addEventListener('input', () => { stopEntering(); filterItems(input.value); });
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.closest('.modal__close')) closePalette();
  });

  render();
};
