/* ==========================================================================
   home-enhance.js — small homepage enhancements (runs after motion.js)
   1. Certification "mix" bar, built from the certificate groups on the page
   2. Copy button for the phone number (clones the existing email copy button)
   ========================================================================== */
(function () {
  'use strict';

  /* ---- 1. Certification mix bar ---- */
  const summary = document.querySelector('.cert-summary');
  const groups = Array.from(document.querySelectorAll('.cert-group'));
  if (summary && groups.length) {
    const data = groups.map((g) => ({
      accent: Array.from(g.classList).find((c) => c.startsWith('accent-')) || '',
      title: (g.querySelector('.cert-group__title') || {}).textContent || '',
      count: g.querySelectorAll('.card--certification').length,
    })).filter((d) => d.count > 0);
    const total = data.reduce((n, d) => n + d.count, 0);

    const box = document.createElement('div');
    box.className = 'cert-mix reveal';
    const label = data.map((d) => `${d.count} ${d.title.trim()}`).join(', ');
    box.setAttribute('role', 'img');
    box.setAttribute('aria-label', `Certificates by group: ${label}`);

    const title = document.createElement('p');
    title.className = 'cert-mix__title';
    title.textContent = `${total} certificates by group`;
    const bar = document.createElement('div');
    bar.className = 'cert-mix__bar';
    bar.setAttribute('aria-hidden', 'true');
    const legend = document.createElement('ul');
    legend.className = 'cert-mix__legend';
    legend.setAttribute('aria-hidden', 'true');

    data.forEach((d, i) => {
      const seg = document.createElement('span');
      seg.className = 'cert-mix__seg ' + d.accent;
      seg.style.flexGrow = d.count; seg.style.setProperty('--i', i);
      bar.appendChild(seg);
      const li = document.createElement('li');
      li.innerHTML = `<i class="${d.accent}"></i><span></span> <b>${String(d.count).padStart(2, '0')}</b>`;
      li.querySelector('span').textContent = d.title.trim();
      legend.appendChild(li);
    });
    const card = document.createElement('div');
    card.className = 'cert-mix__card';
    card.append(title, bar, legend);
    box.append(card);
    summary.after(box);
    /* Join the site's reveal system if it is already running; otherwise show it */
    if (!('IntersectionObserver' in window)) box.classList.add('is-visible');
    else {
      new IntersectionObserver((es, io) => es.forEach((e) => {
        if (e.isIntersecting) { box.classList.add('is-visible'); io.disconnect(); }
      }), { threshold: 0.4 }).observe(box);
    }
  }

  /* ---- 2. Copy phone number ---- */
  const emailBtn = document.querySelector('.contact__info .copy-btn');
  const phone = document.querySelector('.contact__info a[href^="https://wa.me/"]');
  if (emailBtn && phone) {
    const btn = emailBtn.cloneNode(true);
    btn.setAttribute('aria-label', 'Copy phone number');
    btn.classList.remove('is-copied');
    btn.querySelector('span').textContent = 'Copy';
    phone.after(btn);
    let timer;
    btn.addEventListener('click', async () => {
      const toast = document.querySelector('.toast');
      const say = (m) => { if (!toast) return; toast.textContent = m; toast.classList.add('is-visible'); setTimeout(() => toast.classList.remove('is-visible'), 2000); };
      try {
        await navigator.clipboard.writeText(phone.textContent.trim());
        btn.classList.add('is-copied'); btn.querySelector('span').textContent = 'Copied'; say('Phone number copied to clipboard');
        clearTimeout(timer); timer = setTimeout(() => { btn.classList.remove('is-copied'); btn.querySelector('span').textContent = 'Copy'; }, 2000);
      } catch (e) { say('Copy failed — select the number and press Ctrl+C'); }
    });
  }
})();
