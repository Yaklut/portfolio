/* ==========================================================================
   modal.js — certificate & project-screenshot lightbox

   Exposes window.Portfolio.initModal(), called once from main.js.

   One reusable dialog (#lightbox in index.html), populated per click.
   A single delegated click listener handles every trigger on the page:
     - certificate links   (<a data-modal="certificate"> — 11 of them)
     - project screenshots (<button data-modal="project"> — 2 of them)
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

  let lastFocused = null;

  function getFocusable() {
    return dialog.querySelectorAll('a[href], button:not([disabled])');
  }

  function openModal({ src, alt, caption, trigger }) {
    if (!src) return;

    lastFocused = trigger || document.activeElement;

    imageEl.src = src;
    imageEl.alt = alt || '';
    captionEl.textContent = caption || '';
    captionEl.hidden = !caption;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    document.addEventListener('keydown', onKeydown);

    const closeBtn = modal.querySelector('.modal__close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modal.classList.contains('is-open')) return;

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    document.removeEventListener('keydown', onKeydown);

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
    if (e.key !== 'Tab') return;

    const focusable = Array.from(getFocusable());
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

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
      openModal({
        src: trigger.getAttribute('href'),
        alt: title ? `${title} certificate` : 'Certificate image',
        caption: title,
        trigger,
      });
    } else if (type === 'project') {
      const figure = trigger.closest('figure.project__media');
      const img = figure ? figure.querySelector('img') : null;
      const captionText = figure ? figure.querySelector('figcaption')?.textContent.trim() : '';
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
