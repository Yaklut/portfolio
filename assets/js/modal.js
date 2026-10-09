/* ==========================================================================
   modal.js — certificate & project-screenshot lightbox

   Exposes window.Portfolio.initModal(), called once from main.js.

   One reusable dialog (#lightbox in index.html), populated per click.
   A single delegated click listener handles every trigger on the page:
     - certificate links   (<a data-modal="certificate"> — 13 of them; a link may carry
                            data-pages='[{"src":…,"label":…},…]' for a multi-page
                            certificate, which adds the slide-left/right pager below)
     - project screenshots (<button data-modal="project"> — 2 of them)
     - the academic transcript (<a data-modal="transcript"> — 1 of them)
   so opening the lightbox never costs more than one listener regardless
   of how many certificates get added later.
   ========================================================================== */

window.Portfolio = window.Portfolio || {};

window.Portfolio.initModal = function initModal() {
  const modal = document.getElementById('lightbox');
  if (!modal) return;

  const dialog = modal.querySelector('.modal__dialog');
  const imageEl = document.getElementById('lightbox-image');
  const captionEl = document.getElementById('lightbox-caption');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let lastFocused = null;
  let trappedFocusable = []; // cached per-open; dialog content is static while open, so one query is enough

  function getFocusable() {
    // Only what is actually visible (the pager is hidden for single-page images).
    return Array.from(dialog.querySelectorAll('a[href], button:not([disabled])'))
      .filter((el) => el.getClientRects().length > 0);
  }

  /* ---- Multi-page pager: slide left / right between the pages of one certificate ---- */
  // The image sits in a "stage" so the slide can be clipped sideways without clipping the zoom.
  const stage = document.createElement('div');
  stage.className = 'modal__stage';
  imageEl.parentNode.insertBefore(stage, imageEl);
  stage.appendChild(imageEl);

  const chevron = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
  const pager = document.createElement('div');
  pager.className = 'modal__pager';
  pager.hidden = true;
  pager.innerHTML =
    `<button type="button" class="modal__nav" data-dir="-1" aria-label="Previous page">${chevron('m15 18-6-6 6-6')}</button>` +
    '<div class="modal__dots" role="group" aria-label="Pages"></div>' +
    `<button type="button" class="modal__nav" data-dir="1" aria-label="Next page">${chevron('m9 18 6-6-6-6')}</button>`;
  stage.after(pager);
  const dotsEl = pager.querySelector('.modal__dots');

  let pages = [];
  let pageIndex = 0;
  let pageTitle = '';
  let animating = false;

  function pageCaption() {
    const p = pages[pageIndex];
    return `${pageTitle} — Page ${pageIndex + 1} of ${pages.length}: ${p.label}`;
  }

  function updatePager() {
    Array.from(dotsEl.children).forEach((d, i) => {
      d.classList.toggle('is-active', i === pageIndex);
      if (i === pageIndex) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
    });
    captionEl.textContent = pageCaption();
    imageEl.alt = `${pageTitle} certificate, page ${pageIndex + 1} of ${pages.length}: ${pages[pageIndex].label}`;
  }

  function setPages(list, title) {
    pages = list || [];
    pageIndex = 0;
    pageTitle = title || '';
    stage.querySelectorAll('.modal__image--ghost').forEach((g) => g.remove());
    dotsEl.textContent = '';
    pager.hidden = pages.length < 2;
    if (pages.length < 2) return;
    pages.forEach((p, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'modal__dot';
      dot.setAttribute('aria-label', `Page ${i + 1}: ${p.label}`);
      dot.addEventListener('click', () => goTo(i, i > pageIndex ? 1 : -1));
      dotsEl.appendChild(dot);
      p.img = new Image(); // warm the cache so a slide never shows a blank page
      p.img.src = p.src;
    });
    updatePager();
  }

  function goTo(next, dir) {
    if (pages.length < 2 || animating || next === pageIndex) return;
    next = (next + pages.length) % pages.length;
    const target = pages[next];
    animating = true;
    // A zoomed page would slide out of place, so start the new page un-zoomed.
    dialog.classList.remove('is-zoomed');
    dialog.scrollTo({ left: 0, behavior: 'instant' });

    const swap = () => {
      pageIndex = next;
      let ghost = null;
      if (!reduceMotion) {
        ghost = imageEl.cloneNode();
        ghost.removeAttribute('id');
        ghost.className = 'modal__image modal__image--ghost';
        ghost.alt = '';
        ghost.setAttribute('aria-hidden', 'true');
        stage.appendChild(ghost);
      }
      imageEl.src = target.src;
      updatePager();
      if (!ghost) { animating = false; return; }
      const SLIDE = Math.min(80, stage.clientWidth * 0.12);
      ghost.animate(
        [{ transform: 'translateX(0)', opacity: 1 }, { transform: `translateX(${-dir * SLIDE}px)`, opacity: 0 }],
        { duration: 300, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'forwards' }
      ).onfinish = () => ghost.remove();
      imageEl.animate(
        [{ transform: `translateX(${dir * SLIDE}px)`, opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }],
        { duration: 480, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
      ).onfinish = () => { animating = false; };
    };
    // Wait for the next page to be ready (normally already cached) so the slide is never blank.
    if (target.img && !target.img.complete) {
      target.img.addEventListener('load', swap, { once: true });
      target.img.addEventListener('error', swap, { once: true });
    } else {
      swap();
    }
  }

  pager.addEventListener('click', (e) => {
    const btn = e.target.closest('.modal__nav');
    if (btn) goTo(pageIndex + Number(btn.dataset.dir), Number(btn.dataset.dir));
  });

  // Swipe left / right on touch screens (a zoomed picture keeps its native two-way scroll).
  let swipe = null;
  stage.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch' || pages.length < 2 || dialog.classList.contains('is-zoomed')) return;
    swipe = { x: e.clientX, y: e.clientY };
  });
  stage.addEventListener('pointerup', (e) => {
    if (!swipe) return;
    const dx = e.clientX - swipe.x;
    const dy = e.clientY - swipe.y;
    swipe = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) goTo(pageIndex + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });
  stage.addEventListener('pointercancel', () => { swipe = null; });

  function openModal({ src, alt, caption, trigger, pageList }) {
    if (!src) return;

    lastFocused = trigger || document.activeElement;

    imageEl.src = src;
    imageEl.alt = alt || '';
    captionEl.textContent = caption || '';
    captionEl.hidden = !caption;
    setPages(pageList, caption);

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    modal.removeAttribute('inert');
    document.body.classList.add('modal-open');
    trappedFocusable = Array.from(getFocusable());
    document.addEventListener('keydown', onKeydown);

    const closeBtn = modal.querySelector('.modal__close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modal.classList.contains('is-open')) return;

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('inert', '');
    document.body.classList.remove('modal-open');
    document.removeEventListener('keydown', onKeydown);
    animating = false;
    setPages([], '');

    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
    lastFocused = null;
  }

  function onKeydown(e) {
    if (e.key === 'Escape') {
      closeModal();
      return;
    }
    // Left / right arrows turn the page (when zoomed, the arrows move the picture instead).
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && pages.length > 1 && !dialog.classList.contains('is-zoomed')) {
      e.preventDefault();
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      goTo(pageIndex + dir, dir);
      return;
    }
    if (e.key !== 'Tab') return;

    if (trappedFocusable.length === 0) return;
    const first = trappedFocusable[0];
    const last = trappedFocusable[trappedFocusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // Open: certificate links and project screenshot buttons, via one
  // delegated listener.
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-modal]');
    if (!trigger) return;

    const type = trigger.dataset.modal;

    if (type === 'certificate') {
      e.preventDefault(); // don't also navigate the <a> to a new tab
      const card = trigger.closest('.card--certification');
      const title = card ? card.querySelector('h4')?.textContent.trim() : '';
      let pageList = [];
      if (trigger.dataset.pages) {
        try { pageList = JSON.parse(trigger.dataset.pages); } catch (err) { pageList = []; }
      }
      openModal({
        src: trigger.getAttribute('href'),
        alt: title ? `${title} certificate` : 'Certificate image',
        caption: title,
        trigger,
        pageList,
      });
    } else if (type === 'transcript') {
      e.preventDefault();
      openModal({
        src: trigger.getAttribute('href'),
        alt: 'Academic transcript of Refa Defanda Witanto, Universitas Brawijaya, issued 24 August 2026. The student ID and the signatory\'s employee number are hidden.',
        caption: 'Official academic record (in Indonesian), issued Aug 24, 2026. The student ID and the signatory\'s employee number are hidden.',
        trigger,
      });
    } else if (type === 'project') {
      const figure = trigger.closest('figure.project__media');
      // Prefer the clicked button's own image, so a figure with several
      // tabbed screenshots opens the one that is actually showing.
      const img = trigger.querySelector('img') || (figure ? figure.querySelector('img') : null);
      const panel = trigger.closest('[data-caption]');
      const captionText = panel
        ? panel.dataset.caption
        : (figure ? figure.querySelector('figcaption')?.textContent.trim() : '');
      if (!img) return;
      openModal({
        src: img.currentSrc || img.src,
        alt: img.alt,
        caption: captionText,
        trigger,
      });
    }
  });

  // Close: the close button, or a click that lands on the dark backdrop
  // itself rather than the dialog card.
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.closest('.modal__close')) {
      closeModal();
    }
  });
};
