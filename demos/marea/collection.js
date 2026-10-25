'use strict';

// Cross-document navigation stays native: links, browser history, and new tabs work.
const routeName = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('#nav-dialog a').forEach(link => {
  if (link.getAttribute('href') === routeName) link.setAttribute('aria-current', 'page');
});
const collectionHeader = document.querySelector('.site-header');
const updateHeader = () => collectionHeader?.classList.toggle('is-scrolled', window.scrollY > 48);
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();
document.getElementById('gallery-count').textContent = `01 / ${String(galleryPhotos.length).padStart(2, '0')}`;

// Search and category selection intersect; the complete menu remains in the HTML.
const catalogSearch = document.getElementById('menu-search');
let catalogCategory = 'all';
window.MareaSaved = [];
function filterCatalog() {
  const term = catalogSearch?.value.trim().toLocaleLowerCase('ru') || '';
  let count = 0;
  document.querySelectorAll('[data-menu-group]').forEach(group => {
    let groupCount = 0;
    const selected = catalogCategory === 'all' || catalogCategory === 'saved' || group.dataset.menuGroup === catalogCategory;
    group.querySelectorAll('[data-menu-search]').forEach(item => {
      const dish = window.MareaDishes?.find(d=>d.id===item.dataset.dishId);
      const visible = dish && window.MareaCarte ? window.MareaCarte.matches(dish,{category:catalogCategory,term},window.MareaSaved) : selected && item.dataset.menuSearch.toLocaleLowerCase('ru').includes(term);
      item.hidden = !visible;
      if (visible) groupCount++;
    });
    group.hidden = groupCount === 0;
    count += groupCount;
  });
  document.querySelectorAll('[data-catalog-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.catalogFilter === catalogCategory)));
  const status = document.getElementById('catalog-status');
  if (status) status.textContent = `${count} ${count === 1 ? 'позиция' : count % 10 >= 2 && count % 10 <= 4 && (count < 12 || count > 14) ? 'позиции' : 'позиций'}`;
  const empty = document.getElementById('catalog-empty');
  if (empty) empty.hidden = count !== 0;
  document.dispatchEvent(new CustomEvent('marea:catalog'));
}
document.querySelectorAll('[data-catalog-filter]').forEach(button => button.addEventListener('click', () => {
  catalogCategory = button.dataset.catalogFilter;
  filterCatalog();
  if (!reducedMotion.matches) document.querySelectorAll('.catalog-group:not([hidden])').forEach(group => {
    group.getAnimations().forEach(animation => animation.cancel());
    group.animate([{ opacity: .35 }, { opacity: 1 }], { duration: 220, easing: 'cubic-bezier(.23,1,.32,1)' });
  });
  window.ScrollTrigger?.refresh();
}));
catalogSearch?.addEventListener('input', filterCatalog);
document.getElementById('reset-menu')?.addEventListener('click', () => {
  catalogCategory = 'all'; catalogSearch.value = ''; filterCatalog(); catalogSearch.focus();
});
if (catalogSearch) {
  const requested = new URLSearchParams(location.search).get('section');
  if (window.MareaMenuGroups.some(group => group.id === requested)) catalogCategory = requested;
  filterCatalog();
}

document.querySelectorAll('[data-photo-filter]').forEach(button => button.addEventListener('click', () => {
  const category = button.dataset.photoFilter;
  let count = 0;
  document.querySelectorAll('[data-photo-category]').forEach(shot => {
    const visible = category === 'all' || shot.dataset.photoCategory === category;
    shot.hidden = !visible;
    if (visible) count++;
  });
  document.querySelector('.portfolio-grid').classList.toggle('is-filtered', category !== 'all');
  document.querySelectorAll('.gallery-chapter').forEach(chapter => {
    chapter.hidden = !chapter.querySelector('[data-photo-category]:not([hidden])');
    chapter.querySelector('.gallery-triptych')?.classList.remove('gallery-waiting');
  });
  document.querySelectorAll('[data-photo-filter]').forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
  document.getElementById('portfolio-status').textContent = `${count} ${count === 1 ? 'фотография' : count < 5 ? 'фотографии' : 'фотографий'}`;
}));

// A critically damped spring preserves position and velocity when a swipe is reversed.
const gallerySurface = document.getElementById('gallery-image');
let drag = null;
let springPosition = 0;
let springVelocity = 0;
let springFrame = 0;
function settleGallery(velocity = 0) {
  cancelAnimationFrame(springFrame);
  springVelocity = velocity;
  let previous = performance.now();
  const step = now => {
    const dt = Math.min((now - previous) / 1000, .025); previous = now;
    springVelocity += (-210 * springPosition - 29 * springVelocity) * dt;
    springPosition += springVelocity * dt;
    gallerySurface.style.transform = `translateX(${springPosition}px)`;
    if (Math.abs(springPosition) > .3 || Math.abs(springVelocity) > 2) springFrame = requestAnimationFrame(step);
    else { springPosition = 0; springVelocity = 0; gallerySurface.style.removeProperty('transform'); }
  };
  springFrame = requestAnimationFrame(step);
}
gallerySurface.addEventListener('pointerdown', event => {
  if (event.button !== 0 || reducedMotion.matches) return;
  cancelAnimationFrame(springFrame);
  gallerySurface.getAnimations().forEach(animation => animation.cancel());
  drag = { id: event.pointerId, origin: event.clientX - springPosition, x: event.clientX, y: event.clientY, time: performance.now(), velocity: 0, direction: null };
});
gallerySurface.addEventListener('pointermove', event => {
  if (!drag || drag.id !== event.pointerId) return;
  const dx = event.clientX - drag.x;
  const total = event.clientX - drag.origin;
  if (!drag.direction && Math.abs(total) > 10) {
    drag.direction = Math.abs(total) > Math.abs(event.clientY - drag.y) ? 'horizontal' : 'vertical';
    if (drag.direction === 'horizontal') gallerySurface.setPointerCapture(event.pointerId);
  }
  if (drag.direction !== 'horizontal') return;
  const now = performance.now();
  drag.velocity = dx / Math.max(now - drag.time, 1) * 1000;
  drag.x = event.clientX; drag.time = now;
  springPosition = total;
  gallerySurface.style.transform = `translateX(${springPosition}px)`;
});
function releaseGallery(event) {
  if (!drag || drag.id !== event.pointerId) return;
  const velocity = performance.now() - drag.time < 100 ? drag.velocity : 0;
  if (drag.direction === 'horizontal' && event.type !== 'pointercancel') {
    const projected = springPosition + velocity / 1000 * .99 / (1 - .99);
    if (Math.abs(projected) > 70) showGallery(galleryIndex + (projected < 0 ? 1 : -1));
  }
  if (gallerySurface.hasPointerCapture(event.pointerId)) gallerySurface.releasePointerCapture(event.pointerId);
  drag = null;
  settleGallery(velocity);
}
gallerySurface.addEventListener('pointerup', releaseGallery);
gallerySurface.addEventListener('pointercancel', releaseGallery);
gallerySurface.addEventListener('dragstart', event => event.preventDefault());
document.getElementById('gallery-dialog').addEventListener('close', () => {
  cancelAnimationFrame(springFrame); drag = null; springPosition = 0; gallerySurface.style.removeProperty('transform');
});

if (window.gsap && window.ScrollTrigger && !reducedMotion.matches && document.body.classList.contains('collection-page')) {
  gsap.registerPlugin(ScrollTrigger);
  const revealTargets = document.querySelectorAll('.venue-row, .manifesto h2, .wide-editorial > div, .ritual-grid article, .private-evening > div');
  revealTargets.forEach(target => gsap.from(target, { y: 22, opacity: 0, duration: .7, ease: 'power2.out', scrollTrigger: { trigger: target, start: 'top 93%', once: true } }));
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}
