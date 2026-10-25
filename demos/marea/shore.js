(() => {
  function ready() {
    const section = document.querySelector('.shore-journey');
    if (!section) return;
    const stage = section.querySelector('.shore-stage');
    const track = section.querySelector('.shore-track');
    const frames = [...track.children];
    const controls = [...section.querySelectorAll('[data-shore-frame]')];
    const reduced = matchMedia('(prefers-reduced-motion:reduce)');
    let pending = 0;
    let travel = 0;
    let active = -1;
    const draw = () => {
      pending = 0;
      if (reduced.matches) return;
      const position = MareaShore.journeyPosition(section.getBoundingClientRect().top,0,stage.clientWidth,stage.clientHeight,track.scrollWidth);
      track.style.transform = `translate3d(${position.x}px,0,0)`;
      const index = Math.min(frames.length-1,Math.round(position.progress*(frames.length-1)));
      if (index === active) return;
      active = index;
      controls.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
    };
    const request = () => { if (!pending) pending = requestAnimationFrame(draw); };
    const measure = () => {
      section.classList.toggle('is-horizontal',!reduced.matches);
      if (reduced.matches) {
        section.style.removeProperty('height');
        track.style.removeProperty('transform');
        controls.forEach(button=>button.removeAttribute('aria-pressed'));
        active = -1; return;
      }
      travel = Math.max(0,track.scrollWidth-stage.clientWidth);
      section.style.height = `${stage.clientHeight+travel}px`;
      request();
    };
    function go(index, behavior) {
      if (reduced.matches) { frames[index].scrollIntoView({block:'start',behavior:'instant'}); return; }
      const start = window.scrollY + section.getBoundingClientRect().top;
      const top = MareaShore.frameScroll(start,index,stage.clientWidth,travel);
      // Use the same scroll owner as wheel inertia: native scroll would be
      // overwritten by Lenis's next frame while its previous target is active.
      if (typeof lenis !== 'undefined' && lenis) lenis.scrollTo(top,{immediate:behavior==='instant',duration:.95});
      else window.scrollTo({top,behavior});
    }
    controls.forEach((button,index)=>button.addEventListener('click',()=>go(index,'smooth')));
    frames.forEach((frame,index)=>frame.addEventListener('focusin',()=>{
      if (index !== active) go(index,'instant');
    }));
    addEventListener('scroll',request,{passive:true});
    addEventListener('resize',measure,{passive:true});
    addEventListener('pageshow',measure);
    reduced.addEventListener('change',measure);
    new ResizeObserver(measure).observe(stage);
    document.fonts?.ready.then(measure);
    measure();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',ready,{once:true});
  else ready();
})();
