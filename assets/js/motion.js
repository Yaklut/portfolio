/* ==========================================================================
   motion.js — click-driven visual transitions and small UX helpers

   Exposes window.Portfolio.initMotion(), called once from main.js.
   Additive only: it listens to the same elements as modal.js/nav.js but never
   changes their code. Everything motion-related is skipped when the visitor
   prefers reduced motion; the functional helpers (copy, back-to-top, mobile
   bar) still work.
   ========================================================================== */

window.Portfolio = window.Portfolio || {};

window.Portfolio.initMotion = function initMotion() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

  /* ---- 1. Lightbox: the dialog grows out of the thing you clicked, and shrinks back ---- */
  const modal = document.getElementById('lightbox');
  const dialog = modal && modal.querySelector('.modal__dialog');
  const image = document.getElementById('lightbox-image');
  let sourceEl = null;

  // Transform that places the dialog on top of `el` (center-to-center, uniform scale).
  function transformTo(el) {
    const r = el.getBoundingClientRect();
    const s = Math.min(Math.max(r.width / dialog.offsetWidth, 0.2), 1.1);
    const dx = r.left + r.width / 2 - window.innerWidth / 2;
    const dy = r.top + r.height / 2 - window.innerHeight / 2;
    return `translate(${dx}px, ${dy}px) scale(${s})`;
  }

  if (dialog && !reduce) {
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-modal]');
      if (!trigger || !modal.classList.contains('is-open')) return;
      sourceEl = trigger.closest('.card--certification, figure.project__media') || trigger;
      dialog.animate(
        [{ transform: transformTo(sourceEl), opacity: 0.4 }, { transform: 'none', opacity: 1 }],
        { duration: 520, easing: EASE }
      );
    });

    // Closing: modal.js removes `is-open`; we watch for it and play the reverse.
    new MutationObserver(() => {
      if (modal.classList.contains('is-open') || !sourceEl) return;
      dialog.animate(
        [{ transform: 'none', opacity: 1 }, { transform: transformTo(sourceEl), opacity: 0 }],
        { duration: 300, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' }
      );
      sourceEl = null;
    }).observe(modal, { attributes: true, attributeFilter: ['class'] });
  }

  // Zoom: click the image to zoom in on the spot you clicked; click again to zoom out.
  // While zoomed, drag to move around (mouse/pen), use the arrow keys, or scroll/swipe.
  // Resets on close.
  if (dialog && image) {
    let drag = null;
    let moved = false;

    const hint = document.createElement('p');
    hint.className = 'modal__hint';
    // Sit below the picture (and below the page pager, if there is one), not inside the zoomable stage.
    (dialog.querySelector('.modal__pager') || image.closest('.modal__stage') || image).after(hint);
    const updateHint = () => {
      hint.textContent = dialog.classList.contains('is-zoomed')
        ? 'Drag to move around · click to zoom out'
        : 'Click the image to zoom in';
    };
    updateHint();

    image.draggable = false;
    image.addEventListener('click', (e) => {
      if (moved) { moved = false; return; } // that was a drag, not a click
      // Where on the picture was clicked (0–1), measured before the zoom changes its size.
      const before = image.getBoundingClientRect();
      const fx = (e.clientX - before.left) / before.width;
      const fy = (e.clientY - before.top) / before.height;
      const zoomed = dialog.classList.toggle('is-zoomed');
      updateHint();
      if (!zoomed) return;
      // The zoomed size applies immediately (no width animation), so the scroll position
      // can be set right now. Aim the clicked point at the middle of the dialog.
      const img = image.getBoundingClientRect();
      const box = dialog.getBoundingClientRect();
      dialog.scrollTo({
        left: dialog.scrollLeft + (img.left - box.left) + fx * img.width - dialog.clientWidth / 2,
        top: dialog.scrollTop + (img.top - box.top) + fy * img.height - dialog.clientHeight / 2,
        behavior: 'instant',
      });
    });

    // Drag to pan (touch keeps its native swipe scrolling).
    image.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch' || e.button !== 0 || !dialog.classList.contains('is-zoomed')) return;
      drag = { x: e.clientX, y: e.clientY, left: dialog.scrollLeft, top: dialog.scrollTop };
      moved = false;
      image.setPointerCapture(e.pointerId);
    });
    image.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      if (!moved && Math.hypot(dx, dy) < 5) return;
      moved = true;
      dialog.classList.add('is-dragging');
      dialog.scrollLeft = drag.left - dx;
      dialog.scrollTop = drag.top - dy;
    });
    const endDrag = () => { drag = null; dialog.classList.remove('is-dragging'); };
    image.addEventListener('pointerup', endDrag);
    image.addEventListener('pointercancel', () => { moved = false; endDrag(); });

    // Arrow keys move the zoomed picture.
    document.addEventListener('keydown', (e) => {
      if (!dialog.classList.contains('is-zoomed') || !modal.classList.contains('is-open')) return;
      const step = { ArrowLeft: [-80, 0], ArrowRight: [80, 0], ArrowUp: [0, -80], ArrowDown: [0, 80] }[e.key];
      if (!step) return;
      e.preventDefault();
      dialog.scrollBy({ left: step[0], top: step[1], behavior: 'instant' });
    });

    new MutationObserver(() => {
      if (!modal.classList.contains('is-open')) { dialog.classList.remove('is-zoomed', 'is-dragging'); moved = false; updateHint(); }
    }).observe(modal, { attributes: true, attributeFilter: ['class'] });
  }

  /* ---- 2. Section landing: heading underline sweeps in after an anchor jump ---- */
  if (!reduce) {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link || link.getAttribute('href').length < 2) return;
      const target = document.querySelector(link.getAttribute('href'));
      const parts = target ? target.querySelectorAll('.section-title, .section-eyebrow') : [];
      if (!parts.length) return;
      setTimeout(() => {
        parts.forEach((p) => { p.classList.remove('is-landed'); void p.offsetWidth; p.classList.add('is-landed'); });
        setTimeout(() => parts.forEach((p) => p.classList.remove('is-landed')), 1300);
      }, 550); // roughly when smooth scrolling arrives
    });
  }

  /* ---- 3. Button ripple from the click point ---- */
  if (!reduce) {
    document.addEventListener('pointerdown', (e) => {
      const btn = e.target.closest('.btn');
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2;
      const dot = document.createElement('span');
      dot.className = 'ripple';
      dot.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
      btn.appendChild(dot);
      dot.addEventListener('animationend', () => dot.remove());
    });
  }

  /* ---- 4. Cursor spotlight on interactive cards (just sets two CSS variables) ---- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.addEventListener('pointermove', (e) => {
      const card = e.target.closest('.card--project, .card--certification');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, { passive: true });
  }

  /* ---- 5. Copy-email button + toast ---- */
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  document.body.appendChild(toast);
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2000);
  }

  const emailLink = document.querySelector('.contact__info a[href^="mailto:"]');
  if (emailLink) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.setAttribute('aria-label', 'Copy email address');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>Copy</span>';
    emailLink.after(btn);
    btn.addEventListener('click', async () => {
      const email = emailLink.getAttribute('href').replace('mailto:', '');
      try {
        await navigator.clipboard.writeText(email);
        btn.classList.add('is-copied');
        btn.querySelector('span').textContent = 'Copied';
        showToast('Email copied to clipboard');
        setTimeout(() => { btn.classList.remove('is-copied'); btn.querySelector('span').textContent = 'Copy'; }, 2000);
      } catch (err) {
        showToast('Copy failed — select the address and press Ctrl+C');
      }
    });
  }

  /* ---- 6. Back-to-top + mobile quick-action bar ---- */
  const toTop = document.createElement('button');
  toTop.type = 'button';
  toTop.className = 'to-top';
  toTop.setAttribute('aria-label', 'Back to top');
  toTop.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg>';
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
  document.body.appendChild(toTop);

  const bar = document.createElement('nav');
  bar.className = 'mobile-cta';
  bar.setAttribute('aria-label', 'Quick actions');
  bar.innerHTML = '<a class="btn btn--secondary" href="#resume">Resume</a><a class="btn btn--primary" href="#contact">Contact</a>';
  document.body.appendChild(bar);

  const hero = document.getElementById('hero');
  const contact = document.getElementById('contact');
  let ticking = false;
  function update() {
    ticking = false;
    const y = window.scrollY;
    toTop.classList.toggle('is-visible', y > 700);
    const pastHero = hero ? y > hero.offsetHeight - 80 : y > 600;
    const cr = contact ? contact.getBoundingClientRect() : null;
    const atContact = cr && cr.top < window.innerHeight * 0.6;
    bar.classList.toggle('is-visible', pastHero && !atContact);
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);
  update();
};
