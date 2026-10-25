'use strict';

const menu = window.MareaMenu;
const rubles = new Intl.NumberFormat('ru-RU');
const dialogs = [...document.querySelectorAll('dialog')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let lenis = null;
let openingButton = null;
const dialogTransitions = new WeakMap();
const scrollState = window.MareaNavigationMotion?.createScrollState(document.documentElement, document.body, window, () => lenis);
const syncDialogScroll = () => scrollState?.sync(dialogs);

function renderMenu(category = 'food', inline = false) {
  if (inline && scrollState) return scrollState.preserve(() => updateMenu(category, true), document.querySelector('.menu-paper'));
  return updateMenu(category, inline);
}

function updateMenu(category, inline) {
  const items = menu[category] || menu.food;
  const container = document.querySelector(inline ? '#inline-menu-items' : '#menu-items');
  if (!container) return;
  const visibleItems = inline ? items.slice(0, 5) : items;
  container.replaceChildren(...visibleItems.map(([title, ingredients, price]) => {
    const article = document.createElement('article');
    article.className = 'menu-item';
    const heading = document.createElement('div');
    heading.className = 'menu-item-heading';
    const name = document.createElement('h3'); name.textContent = title;
    const cost = document.createElement('span'); cost.textContent = `${rubles.format(price)} ₽`;
    const description = document.createElement('p'); description.textContent = ingredients;
    heading.append(name, cost);
    const dish = window.MareaDishes?.find(item=>item.name===title);
    if(dish) {
      article.classList.add('has-thumbnail');
      const thumbnail=document.createElement('img');
      thumbnail.src=`assets/${dish.photo}-small.jpg`;
      thumbnail.alt=title; thumbnail.width=66; thumbnail.height=82; thumbnail.loading='lazy';
      const copy=document.createElement('div'); copy.append(heading,description);
      article.append(thumbnail,copy);
    } else article.append(heading,description);
    return article;
  }));
  document.querySelectorAll(inline ? '[data-inline-filter]' : '[data-filter]').forEach(button => {
    const selected = (inline ? button.dataset.inlineFilter : button.dataset.filter) === category;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  if (inline && window.ScrollTrigger) ScrollTrigger.refresh();
  container.dispatchEvent(new CustomEvent('marea:menu', { bubbles: true, detail: { category, inline } }));
}

renderMenu('food', true);
document.querySelectorAll('[data-inline-filter]').forEach(button => button.addEventListener('click', () => renderMenu(button.dataset.inlineFilter, true)));

const navigationDialog = document.getElementById('nav-dialog');
const navigationMotion = navigationDialog && window.MareaNavigationMotion?.createNavigationMotion(navigationDialog, reducedMotion);

function openDialog(id, trigger) {
  const dialog = document.getElementById(id);
  if (!dialog) return;
  openingButton = trigger;
  if (id === 'menu-dialog') renderMenu(trigger.dataset.category || 'food');
  if (id === 'booking-dialog') {
    document.querySelector('#booking-form').hidden = false;
    document.querySelector('#booking-result').hidden = true;
    document.querySelector('#booking-error').textContent = '';
    updateMinimumDate();
  }
  const wasOpen = dialog.open;
  const currentStyle = wasOpen ? { opacity: getComputedStyle(dialog).opacity, transform: getComputedStyle(dialog).transform } : { opacity: 0, transform: 'translateY(18px)' };
  if (id !== 'nav-dialog' || !navigationMotion) dialog.getAnimations().forEach(animation => animation.cancel());
  dialogTransitions.delete(dialog);
  if (!wasOpen) {
    // Record the background position before native modal autofocus can move it.
    scrollState?.preserve(() => dialog.showModal());
    if (!scrollState) dialog.showModal();
  }
  if (id === 'nav-dialog' && navigationMotion) {
    if (!wasOpen) dialog.scrollTop = 0;
    navigationMotion.open();
    trigger?.setAttribute('aria-expanded', 'true');
  } else if (!reducedMotion.matches) dialog.animate([currentStyle, { opacity: 1, transform: 'translateY(0)' }], { duration: 320, easing: 'cubic-bezier(.22,.7,.24,1)' });
  syncDialogScroll();
}

document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => openDialog(button.dataset.open, button)));
function closeDialog(dialog) {
  if (!dialog?.open) return;
  if (dialog.id === 'nav-dialog' && navigationMotion) { navigationMotion.close(); return; }
  if (reducedMotion.matches) { dialog.close(); return; }
  const style = { opacity: getComputedStyle(dialog).opacity, transform: getComputedStyle(dialog).transform };
  dialog.getAnimations().forEach(animation => animation.cancel());
  const animation = dialog.animate([style, { opacity: 0, transform: 'translateY(18px)' }], { duration: 180, easing: 'cubic-bezier(.76,0,.78,.3)' });
  dialogTransitions.set(dialog, animation);
  animation.finished.then(() => {
    if (dialogTransitions.get(dialog) === animation) { dialogTransitions.delete(dialog); dialog.close(); }
  }).catch(() => {});
}
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => closeDialog(button.closest('dialog'))));
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => renderMenu(button.dataset.filter)));
dialogs.forEach(dialog => {
  dialog.setAttribute('data-lenis-prevent', '');
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(dialog); });
  dialog.addEventListener('close', () => {
    if (dialog.id === 'nav-dialog') document.querySelectorAll('[data-open="nav-dialog"]').forEach(button => button.setAttribute('aria-expanded', 'false'));
    syncDialogScroll();
    if (!dialogs.some(item => item.open)) openingButton?.focus({ preventScroll: true });
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog);
  });
});

document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
  const hash = link.getAttribute('href');
  const target = hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
  if (!target) return;
  event.preventDefault();
  link.closest('dialog')?.close();
  // Native close events are queued. Release Lenis before scheduling the jump;
  // otherwise it silently ignores scrollTo while still stopped.
  syncDialogScroll();
  requestAnimationFrame(() => {
    const destination = target.id === 'contact-details' && window.mareaTide ? window.mareaTide.end + 1 : target;
    if (lenis) lenis.scrollTo(destination, { offset: -20, duration: 1.25 });
    else if (typeof destination === 'number') window.scrollTo({ top: destination, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    else target.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    history.replaceState(null, '', link.getAttribute('href'));
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
}));

const dateInput = document.querySelector('#booking-date');
function localDateString(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function updateMinimumDate() {
  const today = localDateString(new Date());
  dateInput.min = today;
  if (!dateInput.value || dateInput.value < today) dateInput.value = today;
}
updateMinimumDate();
document.querySelector('#booking-form').addEventListener('submit', event => {
  event.preventDefault();
  const dateValue = dateInput.value;
  const time = document.querySelector('#booking-time').value;
  const guests = document.querySelector('#booking-guests').value;
  const date = new Date(`${dateValue}T${time}:00`);
  const error = document.querySelector('#booking-error');
  if (!dateValue || Number.isNaN(date.getTime()) || date <= new Date()) {
    error.textContent = 'Выберите будущую дату и время.';
    dateInput.focus(); return;
  }
  error.textContent = '';
  const formatted = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  const guestLabel = guests === '1' ? 'гость' : ['2','3','4'].includes(guests) ? 'гостя' : 'гостей';
  document.querySelector('#booking-summary').textContent = `${formatted} · ${time} · ${guests} ${guestLabel}`;
  event.target.hidden = true;
  const result = document.querySelector('#booking-result'); result.hidden = false; result.focus();
});
document.querySelector('#edit-booking').addEventListener('click', () => {
  document.querySelector('#booking-result').hidden = true;
  document.querySelector('#booking-form').hidden = false;
  dateInput.focus();
});

// Animation libraries enhance a fully readable, usable static page.
if (document.querySelector('.hero-wordmark') && window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.from('.hero-wordmark span', { yPercent: 110, opacity: 0, duration: 1.45, stagger: 0.08, ease: 'power3.out', delay: 0.1 });
    gsap.from('.hero-kicker, .hero-bottom, .hero-caption', { y: 15, opacity: 0, duration: 1, stagger: .15, ease: 'power2.out', delay: .7 });
    document.querySelectorAll('.reveal').forEach(element => {
      gsap.from(element, { y: 32, autoAlpha: 0, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 94%', once: true } });
    });
    gsap.to('.hero-picture', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-wordmark', { y: -65, opacity: .25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  });
  media.add('(pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    if (!window.Lenis) return;
    lenis = new Lenis({ lerp: .085, smoothWheel: true, syncTouch: false });
    syncDialogScroll();
    lenis.on('scroll', ScrollTrigger.update);
    const tick = time => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis?.destroy(); lenis = null; };
  });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}
window.addEventListener('pageshow', () => {
  syncDialogScroll();
  scrollState?.preserve(() => window.ScrollTrigger?.refresh());
  window.ScrollTrigger?.update();
});
