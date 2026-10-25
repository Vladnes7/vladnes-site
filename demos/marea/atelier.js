(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const stackedGallery = matchMedia('(max-width: 800px)');
  let observer;
  function revealGallery() {
    observer?.disconnect();
    const rows = [...document.querySelectorAll('.gallery-triptych')];
    const panels = [...document.querySelectorAll('.gallery-panel')];
    rows.forEach(row => row.classList.remove('gallery-waiting'));
    panels.forEach(panel => panel.classList.remove('gallery-panel-waiting'));
    if (preference.matches || !('IntersectionObserver' in window)) return;
    // A stacked chapter is several screens tall. Each photograph needs its
    // own entrance; revealing the chapter at its top spends all three at once.
    const targets = stackedGallery.matches ? panels : rows;
    const waiting = stackedGallery.matches ? 'gallery-panel-waiting' : 'gallery-waiting';
    observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove(waiting); observer.unobserve(entry.target);
    }), {threshold:0,rootMargin:'0px 0px -35px 0px'});
    targets.forEach(target => {
      if (target.closest?.('[hidden]')) return;
      if (target.getBoundingClientRect().top > innerHeight) target.classList.add(waiting);
      observer.observe(target);
    });
  }
  revealGallery(); preference.addEventListener('change', revealGallery);
  stackedGallery.addEventListener('change', revealGallery);
  document.addEventListener('click', event => {
    if (event.target.closest?.('[data-photo-filter]')) queueMicrotask(revealGallery);
  });
  addEventListener('pageshow', event => { if (event.persisted) revealGallery(); });

  document.querySelectorAll('.visit-faq details').forEach(detail => {
    const summary = detail.querySelector('summary');
    if (!summary || typeof detail.animate !== 'function') return;
    let animation = null;
    let expanded = detail.open;
    const originalOverflow = detail.style.overflow;
    const refresh = () => window.ScrollTrigger?.refresh();
    const settle = () => {
      animation?.cancel(); animation = null;
      detail.open = expanded;
      detail.style.overflow = originalOverflow;
      refresh();
    };
    summary.addEventListener('click', event => {
      if (preference.matches) return;
      event.preventDefault();
      const start = detail.getBoundingClientRect().height;
      animation?.cancel();
      expanded = !expanded;
      // The answer stays in native details while its closing height animates.
      // Cancel and retarget from the displayed height when a tap reverses it.
      detail.open = true;
      const end = expanded ? detail.scrollHeight : summary.getBoundingClientRect().height;
      detail.style.overflow = 'hidden';
      const current = detail.animate([{height:`${start}px`},{height:`${end}px`}], {
        duration:expanded ? 280 : 210,
        easing:'cubic-bezier(.22,1,.36,1)'
      });
      animation = current;
      current.onfinish = () => { if (animation === current) settle(); };
    });
    detail.addEventListener('toggle', () => {
      if (!animation) { expanded = detail.open; refresh(); }
    });
    preference.addEventListener('change', () => { if (preference.matches && animation) settle(); });
  });
})();
