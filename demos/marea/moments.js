/* Progressive enhancement: real photos and readable stories exist without JS. */
(function () {
  'use strict';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-dish-carousel]').forEach(carousel => {
    const rail = carousel.querySelector('.dish-rail');
    const slides = [...rail.querySelectorAll('.dish-slide')];
    const prev = carousel.querySelector('[data-dish-prev]');
    const next = carousel.querySelector('[data-dish-next]');
    const count = carousel.querySelector('.dish-count');
    const progress = carousel.querySelector('.dish-progress span');
    let index = 0, target = 0, frame = 0, settling;
    const offsets = () => slides.map(slide => slide.offsetLeft - slides[0].offsetLeft);
    const update = () => {
      frame = 0;
      index = MareaMoments.nearestSlide(rail.scrollLeft, offsets(), rail.scrollWidth - rail.clientWidth);
      const value = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      if (count.textContent !== value) count.textContent = value;
      prev.disabled = index === 0; next.disabled = index === slides.length - 1;
      progress.style.transform = `scaleX(${(index + 1) / slides.length})`;
    };
    const go = direction => {
      target = MareaMoments.moveIndex(settling ? target : index, direction, slides.length);
      clearTimeout(settling);
      rail.scrollTo({ left: offsets()[target], behavior: motion.matches ? 'instant' : 'smooth' });
      settling = setTimeout(() => { settling = null; }, 450);
    };
    prev.addEventListener('click', () => go(-1)); next.addEventListener('click', () => go(1));
    rail.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Home' || event.key === 'End') {
        rail.scrollTo({ left: event.key === 'Home' ? 0 : rail.scrollWidth, behavior: 'instant' });
        clearTimeout(settling); settling = null;
      } else go(event.key === 'ArrowRight' ? 1 : -1);
    });
    // Touch uses the browser's native momentum and snap; mouse supports dragging too.
    let drag;
    rail.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse' || event.button !== 0 || drag) return;
      clearTimeout(settling); settling = null;
      drag = { id: event.pointerId, x: event.clientX, scroll: rail.scrollLeft };
      rail.setPointerCapture(event.pointerId); rail.classList.add('is-dragging');
    });
    rail.addEventListener('pointermove', event => {
      if (drag?.id === event.pointerId) rail.scrollLeft = drag.scroll + drag.x - event.clientX;
    });
    const finish = event => {
      if (drag?.id !== event.pointerId) return;
      rail.classList.remove('is-dragging'); drag = null;
      update(); rail.scrollTo({ left: offsets()[index], behavior: motion.matches ? 'instant' : 'smooth' });
    };
    rail.addEventListener('pointerup', finish); rail.addEventListener('pointercancel', finish);
    rail.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(update); }, { passive: true });
    rail.addEventListener('wheel', () => { clearTimeout(settling); settling = null; }, { passive: true });
    new ResizeObserver(update).observe(rail);
    carousel.querySelector('.dish-arrows').hidden = false; update();
  });

  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const aperitif = document.querySelector('.aperitif-art');
    if (aperitif) {
      const reveal = gsap.timeline({ scrollTrigger: { trigger: aperitif, start: 'top 75%', once: true } });
      reveal.from('.aperitif-word', { y: 44, opacity: 0, duration: .85, ease: 'power3.out' }, 0)
        .from('.aperitif-glass img', { y: 130, rotation: -9, opacity: 0, duration: 1.15, ease: 'power3.out' }, .12)
        .from('.aperitif-leaf', { y: 55, opacity: 0, duration: 1.1, stagger: .1, ease: 'power3.out' }, .22)
        .from('.aperitif-note', { y: 18, opacity: 0, duration: .7, ease: 'power3.out' }, .4);
      // Layout owns centering; never inherit a cached horizontal translation
      // from a preceding stylesheet or a restored mobile scroll position.
      gsap.set('.aperitif-glass', { x: 0, xPercent: 0 });
      gsap.to('.aperitif-glass', { y: -32, rotation: 3, ease: 'none', scrollTrigger: { trigger: aperitif, start: 'top top', end: 'bottom top', scrub: .6, invalidateOnRefresh: true } });
    }
  });
  media.add('(prefers-reduced-motion: no-preference)', () => {
    if (!CSS.supports('position', 'sticky')) return;
    const cleanups = [];
    document.querySelectorAll('.rhythm').forEach(scene => {
      scene.classList.add('is-animated');
      const stage = scene.querySelector('.rhythm-stage');
      const sceneFrame = scene.querySelector('.rhythm-frame');
      const dayPanel = scene.querySelector('.rhythm-day');
      const nightPanel = scene.querySelector('.rhythm-night');
      const nightPhoto = scene.querySelector('.rhythm-night .rhythm-photo');
      const nightImage = nightPhoto.querySelector('img');
      const dayCopy = scene.querySelector('.rhythm-day .rhythm-copy');
      const nightCopy = scene.querySelector('.rhythm-night .rhythm-copy');
      const phase = { progress: 0 };
      let active = true, animationFrame = 0, previousTime = 0;
      const draw = () => {
        if (!active) return;
        // Keep the day visible on a slow connection until the night is decoded.
        const ready = nightImage.complete && nightImage.naturalWidth > 0;
        const state = MareaMoments.cinematicState(phase.progress, ready, nightCopy.contains(document.activeElement));
        // Mask the complete panels, not separate photos and text. The same
        // pixel belongs either to the day or to the night, never to both.
        dayPanel.style.clipPath = `inset(0 0 0 ${state.dayCut*100}%)`;
        nightPanel.style.clipPath = `inset(0 ${state.nightCut*100}% 0 0)`;
        sceneFrame.style.transform = `scale(${state.scale})`;
        sceneFrame.style.clipPath = `inset(0 0 ${state.bottom}% 0)`;
        dayCopy.style.opacity = nightCopy.style.opacity = '1';
      };
      draw();
      // Cross-document arrivals can temporarily transform main. Cached trigger
      // coordinates then belong to a different layout. Measure the native sticky
      // scene itself on scroll so the wipe always follows its visible geometry.
      const tick = time => {
        const target = MareaMoments.scrollProgress(scene.getBoundingClientRect().top, scene.offsetHeight, stage.offsetHeight);
        const dt = previousTime ? Math.min(.05, (time-previousTime)/1000) : 1/60;
        previousTime = time;
        phase.progress += (target-phase.progress)*(1-Math.exp(-12*dt));
        if (Math.abs(target-phase.progress)<.0002) phase.progress=target;
        draw();
        animationFrame = phase.progress === target ? 0 : requestAnimationFrame(tick);
        if (!animationFrame) previousTime=0;
      };
      const schedule = () => { if (active && !animationFrame) animationFrame=requestAnimationFrame(tick); };
      window.addEventListener('scroll', schedule, {passive:true});
      window.addEventListener('resize', schedule, {passive:true});
      document.fonts.ready.then(schedule);
      schedule();
      const focusStory = event => {
        const copy = event.target.closest('.rhythm-copy');
        if (!copy) return;
        const ready = nightImage.complete && nightImage.naturalWidth > 0;
        const state = MareaMoments.cinematicState(phase.progress, ready, copy === nightCopy);
        if ((copy === nightCopy && ready && state.reveal >= .99) || (copy === dayCopy && state.reveal <= .01)) return;
        const progress = copy === nightCopy ? .95 : .02;
        const position = window.scrollY + scene.getBoundingClientRect().top + (scene.offsetHeight-stage.offsetHeight)*progress;
        if (typeof lenis !== 'undefined' && lenis) lenis.scrollTo(position, { immediate: true });
        else window.scrollTo({ top: position, behavior: 'instant' });
        phase.progress = progress; draw();schedule();
      };
      scene.addEventListener('focusin', focusStory);
      // Prepare both photographs shortly before the scene enters the viewport.
      const prepare = () => {
        scene.querySelectorAll('.rhythm-photo img').forEach(img => { img.loading = 'eager'; });
        nightImage.decode().then(draw).catch(() => {});
      };
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) { prepare(); observer.disconnect(); }
      }, { rootMargin: '100% 0px' });
      observer.observe(scene);
      nightImage.addEventListener('load', draw);
      cleanups.push(() => {
        active = false; observer.disconnect(); nightImage.removeEventListener('load', draw);
        cancelAnimationFrame(animationFrame);
        window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);
        scene.removeEventListener('focusin', focusStory);
        scene.classList.remove('is-animated');
        nightPhoto.style.removeProperty('clip-path');
        [dayPanel,nightPanel,sceneFrame].forEach(el => { el.style.removeProperty('clip-path'); el.style.removeProperty('transform'); });
        [dayCopy,nightCopy].forEach(copy => { copy.style.removeProperty('opacity'); copy.style.removeProperty('pointer-events'); });
      });
    });
    return () => cleanups.forEach(cleanup => cleanup());
  });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
})();
