'use strict';

// Named dishes, not arbitrary images attached to unrelated menu entries.
const menuPhotos = {
  food: { src: 'assets/cuisine.jpg', dish: menu.food[2] },
  dessert: { src: 'assets/lemon-tart.jpg', dish: menu.dessert[0] },
  drinks: { src: 'assets/aperitivo.jpg', dish: menu.drinks[0] }
};
const photoRequests = new WeakMap();
async function swapPhoto(img, src, alt, anchor) {
  const request = {};
  photoRequests.set(img, request);
  const next = new Image(); next.src = src;
  try { await next.decode(); } catch { return; }
  if (photoRequests.get(img) !== request) return;
  img.getAnimations().forEach(animation => animation.cancel());
  const update = () => {
    img.src = src; img.alt = alt;
    if (anchor && window.ScrollTrigger) ScrollTrigger.refresh();
  };
  if (anchor && scrollState) scrollState.preserve(update, anchor);
  else update();
  if (!reducedMotion.matches) img.animate([{ opacity: .15, transform: 'scale(1.025)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 480, easing: 'cubic-bezier(.2,.7,.3,1)' });
}
document.addEventListener('marea:menu', event => {
  const { category, inline } = event.detail;
  const photo = menuPhotos[category] || menuPhotos.food;
  const img = document.getElementById(inline ? 'menu-feature-image' : 'dialog-dish-image');
  swapPhoto(img, photo.src, photo.dish[0], inline ? document.querySelector('.menu-paper') : null);
  document.getElementById(inline ? 'menu-feature-title' : 'dialog-dish-caption').textContent = photo.dish[0];
  if (inline) document.getElementById('menu-feature-price').textContent = `${rubles.format(photo.dish[2])} ₽`;
  const items = document.getElementById(inline ? 'inline-menu-items' : 'menu-items');
  items.getAnimations().forEach(animation => animation.cancel());
  if (!reducedMotion.matches) items.animate([{ opacity: .25, transform: 'translateY(7px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 280, easing: 'ease-out' });
});

const galleryPhotos = [
  { src: 'assets/interior.jpg', title: 'Вечерний зал', alt: 'Тёплый свет в зале с арками и видом на море' },
  { src: 'assets/terrace.jpg', title: 'Ближе к морю', alt: 'Терраса с льняными скатертями над морем' },
  { src: 'assets/bar.jpg', title: 'Ещё по одному', alt: 'Коктейли и свечи на травертиновом баре' },
  { src: 'assets/arrival.jpg', title: 'Под тенью оливы', alt: 'Оливковое дерево у арочного входа в MAREA' },
  { src: 'assets/terrace-noon.jpg', title: 'Полдень на террасе', alt: 'Льняной навес, каменная терраса и синее море' },
  { src: 'assets/arched-room.jpg', title: 'Свет сквозь арки', alt: 'Зал с тремя арками, оливковыми диванами и видом на море' },
  { src: 'assets/evening-table-v2.jpg', title: 'Ужин в свете свечей', alt: 'Льняной стол, свечи и разговор друзей у вечернего моря' },
  { src: 'assets/bar-night.jpg', title: 'После заката', alt: 'Травертиновый бар со свечами и аперитивами после заката' },
  { src: 'assets/breakfast-sea.jpg', title: 'Утро принадлежит вам', alt: 'Завтрак на террасе MAREA с видом на синее море' },
  { src: 'assets/sound-of-sea.jpg', title: 'У моря свой саундтрек', alt: 'Друзья, DJ и тёплый свет на вечерней террасе' }
];
let galleryIndex = 0;
function showGallery(index) {
  galleryIndex = MareaState.wrapIndex(index, galleryPhotos.length);
  const photo = galleryPhotos[galleryIndex];
  swapPhoto(document.getElementById('gallery-image'), photo.src, photo.alt);
  document.getElementById('gallery-caption').textContent = photo.title;
  document.getElementById('gallery-count').textContent = `${String(galleryIndex + 1).padStart(2, '0')} / ${String(galleryPhotos.length).padStart(2, '0')}`;
}
document.querySelectorAll('[data-gallery-index]').forEach(button => button.addEventListener('click', () => showGallery(Number(button.dataset.galleryIndex)), { capture: true }));
document.getElementById('gallery-prev').addEventListener('click', () => showGallery(galleryIndex - 1));
document.getElementById('gallery-next').addEventListener('click', () => showGallery(galleryIndex + 1));
document.getElementById('gallery-dialog').addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault(); showGallery(galleryIndex + (event.key === 'ArrowRight' ? 1 : -1));
  }
});

// The photographic cover recedes with a curved lower edge; contacts stay in the DOM.
if (document.querySelector('.tide-scene') && window.gsap && window.ScrollTrigger) {
  const tideMedia = gsap.matchMedia();
  tideMedia.add('(prefers-reduced-motion: no-preference)', () => {
    if (!CSS.supports('position', 'sticky')) return;
    const scene = document.querySelector('.tide-scene');
    const stage = scene.querySelector('.tide-stage');
    const edge = document.getElementById('tide-edge');
    const cover = document.querySelector('.tide-cover');
    const caption = document.querySelector('.tide-caption');
    scene.classList.add('tide-animated');
    // Contacts retain their natural height, even when taller than a phone.
    // Only the surrounding scroll runway grows; content is never squeezed.
    const measure = () => {
      const layout = MareaState.tideLayout(stage.offsetHeight, innerHeight);
      scene.style.height = `${layout.height}px`;
    };
    measure();
    const progress = { value: 0 };
    const draw = () => {
      const state = MareaState.tideState(progress.value);
      const y = state.edge;
      edge.setAttribute('d', `M0 0H1V${y}Q.75 ${y + .12} .5 ${y}T0 ${y}Z`);
      caption.style.opacity = state.textOpacity;
      cover.style.visibility = progress.value > .995 ? 'hidden' : 'visible';
    };
    draw();
    const timeline = gsap.to(progress, { value: 1, ease: 'none', onUpdate: draw, scrollTrigger: {
      trigger: scene, start: 'top top',
      end: () => `+=${scene.offsetHeight - stage.offsetHeight}`,
      scrub: .65, invalidateOnRefresh: true, onRefreshInit: measure
    } });
    window.mareaTide = timeline.scrollTrigger;
    return () => {
      // matchMedia has already reverted its animations and ScrollTriggers here.
      scene.classList.remove('tide-animated');
      scene.style.removeProperty('height');
      edge.setAttribute('d', 'M0 0H1V1.12Q.75 1.2 .5 1.12T0 1.12Z');
      caption.style.removeProperty('opacity'); cover.style.removeProperty('visibility');
      window.mareaTide = null;
    };
  });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}
