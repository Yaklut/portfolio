/* ==========================================================================
   nav.js — navbar scroll state, mobile menu, active-section tracking

   Exposes window.Portfolio.initNav(), called once from main.js.
   Hooks into CSS states that already exist in styles.css:
     - body.is-scrolled              → navbar scrolled background/shadow
     - .nav-toggle[aria-expanded]    → hamburger ↔ close icon, panel open/close
     - .nav-link.is-active           → current-section highlight
   ========================================================================== */

window.Portfolio = window.Portfolio || {};

window.Portfolio.initNav = function initNav() {
  initScrollState();
  initMobileMenu();
  initActiveSection();
};

/* ---- 1. Navbar scrolled state -------------------------------------------
   A rAF-throttled scroll listener is cheap enough here (one class toggle,
   no layout reads) that a plain listener is simpler than wiring up an
   IntersectionObserver sentinel just for this. IO is used below where it
   actually earns its keep (active-section tracking). */
function initScrollState() {
  const THRESHOLD = 60; // px, matches DESIGN.md §5 "On scroll (>60px)"
  let ticking = false;

  function update() {
    document.body.classList.toggle('is-scrolled', window.scrollY > THRESHOLD);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update(); // correct state immediately, e.g. if the page loads on a mid-page anchor
}

/* ---- 2. Mobile menu -------------------------------------------------------
   Below the 1280px nav breakpoint, .nav-panel is a full-screen overlay
   (see styles.css). Above it, .nav-panel is always visible and this toggle
   is hidden by CSS — none of the logic below runs in that state because
   the button that triggers it isn't reachable. */
function initMobileMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const panel = document.getElementById('primary-navigation');
  if (!toggle || !panel) return;

  const DESKTOP_QUERY = '(min-width: 1280px)';
  let lastFocused = null;

  function setExpanded(isOpen) {
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  }

  function openMenu() {
    lastFocused = document.activeElement;
    setExpanded(true);
    document.body.classList.add('menu-open');
    document.addEventListener('keydown', onKeydown);
  }

  function closeMenu({ restoreFocus = true } = {}) {
    if (toggle.getAttribute('aria-expanded') !== 'true') return;
    setExpanded(false);
    document.body.classList.remove('menu-open');
    document.removeEventListener('keydown', onKeydown);
    if (restoreFocus && lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
    lastFocused = null;
  }

  function onKeydown(e) {
    if (e.key === 'Escape') {
      closeMenu();
      return;
    }
    if (e.key !== 'Tab') return;

    // Focus trap: keep Tab cycling inside the open panel so keyboard users
    // never land on content sitting visually underneath the overlay.
    const focusable = panel.querySelectorAll('a[href], button:not([disabled])');
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

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  panel.addEventListener('click', (e) => {
    if (e.target.closest('.nav-link, .nav-cta')) {
      // A real navigation is happening — let focus follow the link
      // instead of snapping back to the toggle button.
      closeMenu({ restoreFocus: false });
    } else if (e.target === panel) {
      // The panel is a full-screen overlay, so there's no backdrop
      // outside it to click — tapping its own empty space is the closest
      // equivalent to "click outside" for this layout.
      closeMenu();
    }
  });

  // Guard against a menu left open on mobile surviving a resize/rotation
  // past the desktop breakpoint, which would otherwise leave the page
  // permanently scroll-locked (body.menu-open) under the always-visible
  // desktop nav.
  const desktopQuery = window.matchMedia(DESKTOP_QUERY);
  desktopQuery.addEventListener('change', (e) => {
    if (e.matches) closeMenu({ restoreFocus: false });
  });
}

/* ---- 3. Active nav-link tracking ------------------------------------------
   IntersectionObserver watches each section that has a matching nav link
   (Hero and Resume don't) and marks that link active once the section
   crosses a band near the top of the viewport. */
function initActiveSection() {
  const links = Array.from(document.querySelectorAll('.nav-link'));
  if (links.length === 0 || !('IntersectionObserver' in window)) return;

  const linkFor = new Map();
  links.forEach((link) => {
    const id = link.getAttribute('href')?.replace('#', '');
    if (id) linkFor.set(id, link);
  });

  const sections = Array.from(document.querySelectorAll('main > section[id]'))
    .filter((section) => linkFor.has(section.id));
  if (sections.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const link = linkFor.get(entry.target.id);
      if (!link) return;
      links.forEach((l) => l.classList.remove('is-active'));
      link.classList.add('is-active');
    });
  }, {
    // A band roughly a fifth of the way down the viewport reads as "the
    // section currently being read" more naturally than the raw top edge.
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0,
  });

  sections.forEach((section) => observer.observe(section));
}
