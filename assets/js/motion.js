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

    /* Smooth zoom: the picture grows toward the spot that was clicked, and shrinks back on
       the next click. The width is driven frame by frame (instead of a CSS transition) so the
       scroll position can follow the clicked point the whole way. */
    let zooming = false;
    const ZOOM_MS = 480;
    const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2); // soft start, soft stop

    function animateZoom(zoomIn, e) {
      zooming = true;
      const box = dialog.getBoundingClientRect();
      const img = image.getBoundingClientRect();
      const W0 = img.width;
      const aspect = img.height / img.width;
      // Where the picture starts inside the scrollable area (it does not change while zooming).
      const offX = img.left - box.left - dialog.clientLeft + dialog.scrollLeft;
      const offY = img.top - box.top - dialog.clientTop + dialog.scrollTop;
      let W1, fx, fy, startX, startY, endX, endY;

      if (zoomIn) {
        fx = (e.clientX - img.left) / img.width;
        fy = (e.clientY - img.top) / img.height;
        startX = e.clientX - box.left - dialog.clientLeft;   // the clicked point, in the dialog...
        startY = e.clientY - box.top - dialog.clientTop;
        dialog.classList.add('is-zoomed', 'is-zooming');
        W1 = image.getBoundingClientRect().width;            // size the stylesheet gives the zoomed picture
        image.style.width = W0 + 'px';                       // ...but start from the current size
        hint.textContent = 'Drag to move around · click to zoom out';
      } else {
        const sl = dialog.scrollLeft, st = dialog.scrollTop;
        startX = dialog.clientWidth / 2;                     // keep the middle of the view in place
        startY = dialog.clientHeight / 2;
        fx = (sl + startX - offX) / W0;
        fy = (st + startY - offY) / (W0 * aspect);
        dialog.classList.remove('is-zoomed');
        W1 = image.getBoundingClientRect().width;            // the normal, fitted size
        dialog.classList.add('is-zoomed', 'is-zooming');
        dialog.scrollLeft = sl; dialog.scrollTop = st;
        hint.textContent = 'Click the image to zoom in';
      }
      endX = zoomIn ? dialog.clientWidth / 2 : offX + fx * W1;   // zoom in: aim at the middle
      endY = zoomIn ? dialog.clientHeight / 2 : offY + fy * W1 * aspect; // zoom out: end un-scrolled

      const t0 = performance.now();
      const finish = () => {
        image.style.width = '';
        dialog.classList.remove('is-zooming');
        if (!zoomIn) { dialog.classList.remove('is-zoomed'); dialog.scrollTo({ left: 0, top: 0, behavior: 'instant' }); }
        zooming = false;
        updateHint();
      };
      const step = (now) => {
        if (!modal.classList.contains('is-open') || !dialog.classList.contains('is-zoomed')) { finish(); return; }
        const t = Math.min(1, (now - t0) / ZOOM_MS);
        const k = easeInOut(t);
        const w = W0 + (W1 - W0) * k;
        image.style.width = w + 'px';
        const px = startX + (endX - startX) * k;
        const py = startY + (endY - startY) * k;
        dialog.scrollLeft = Math.max(0, offX + fx * w - px);
        dialog.scrollTop = Math.max(0, offY + fy * w * aspect - py);
        if (t < 1) requestAnimationFrame(step); else finish();
      };
      requestAnimationFrame(step);
    }

    image.addEventListener('click', (e) => {
      if (moved) { moved = false; return; } // that was a drag, not a click
      if (zooming) return;
      const zoomedNow = dialog.classList.contains('is-zoomed');
      if (!reduce) { animateZoom(!zoomedNow, e); return; }

      // Reduced motion: switch instantly (the original behaviour).
      const before = image.getBoundingClientRect();
      const fx = (e.clientX - before.left) / before.width;
      const fy = (e.clientY - before.top) / before.height;
      const zoomed = dialog.classList.toggle('is-zoomed');
      updateHint();
      if (!zoomed) return;
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
      if (e.pointerType === 'touch' || e.button !== 0 || zooming || !dialog.classList.contains('is-zoomed')) return;
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
      if (zooming || !dialog.classList.contains('is-zoomed') || !modal.classList.contains('is-open')) return;
      const step = { ArrowLeft: [-80, 0], ArrowRight: [80, 0], ArrowUp: [0, -80], ArrowDown: [0, 80] }[e.key];
      if (!step) return;
      e.preventDefault();
      dialog.scrollBy({ left: step[0], top: step[1], behavior: 'instant' });
    });

    new MutationObserver(() => {
      if (!modal.classList.contains('is-open')) { dialog.classList.remove('is-zoomed', 'is-zooming', 'is-dragging'); image.style.width = ''; zooming = false; moved = false; updateHint(); }
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
  toTop.innerHTML = '<svg class="to-top__ring" viewBox="0 0 46 46" fill="none" aria-hidden="true"><circle class="to-top__track" cx="23" cy="23" r="21"/><circle class="to-top__bar" cx="23" cy="23" r="21" pathLength="100"/></svg>' +
    '<svg class="to-top__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg>';
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
    const max = document.documentElement.scrollHeight - window.innerHeight;
    toTop.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(3) : 0); /* scroll progress ring */
    const pastHero = hero ? y > hero.offsetHeight - 80 : y > 600;
    const cr = contact ? contact.getBoundingClientRect() : null;
    const atContact = cr && cr.top < window.innerHeight * 0.6;
    bar.classList.toggle('is-visible', pastHero && !atContact);
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);
  update();
};
