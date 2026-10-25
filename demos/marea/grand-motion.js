(function () {
  'use strict';
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  let observer=null;
  function reveals() {
    observer?.disconnect();
    document.querySelectorAll('.photo-pending').forEach(el=>el.classList.remove('photo-pending'));
    document.documentElement.classList.remove('grand-enhanced');
    if(preference.matches||!('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('grand-enhanced');
    // Give the large editorial photographs the same staged opening as the carta.
    document.querySelectorAll('.wide-editorial>figure, .private-evening>figure, .after-dark>figure, .atmosphere-photo, .cuisine-image').forEach(el=>el.setAttribute('data-photo-reveal',''));
    // IntersectionObserver also clips target bounds. Observe the unmasked
    // article/section so a fully concealed photograph can still enter view.
    const targets=new Map();
    observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      (targets.get(entry.target)||[]).forEach(el=>el.classList.remove('photo-pending'));
      observer.unobserve(entry.target);
    }),{threshold:.04,rootMargin:'0px 0px 60px 0px'});
    document.querySelectorAll('[data-photo-reveal]').forEach(el=>{
      if(el.getBoundingClientRect().top>innerHeight&&!el.closest('[hidden]')) el.classList.add('photo-pending');
      const host=el.parentElement;
      if(!targets.has(host)) targets.set(host,[]);
      targets.get(host).push(el);
      observer.observe(host);
    });
  }
  reveals();
  preference.addEventListener('change',reveals);
  // Filtering must never strand a newly visible photograph behind a stale mask.
  document.addEventListener('marea:catalog',()=>document.querySelectorAll('.plate-picture.photo-pending').forEach(el=>{
    if(el.getBoundingClientRect().top<innerHeight&&el.getBoundingClientRect().bottom>0) el.classList.remove('photo-pending');
  }));
  const scene=document.querySelector('.table-expand');
  if(!scene||!window.gsap||!window.ScrollTrigger||!window.MareaCarte) return;
  gsap.registerPlugin(ScrollTrigger);
  const media=gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)',()=>{
    if(!CSS.supports('position','sticky')) return;
    const stage=scene.querySelector('.table-expand-stage');
    const frame=scene.querySelector('.table-expand-frame');
    const image=frame.querySelector('img');
    const phase={value:0};
    scene.classList.add('is-motion');
    const measure=()=>{scene.style.height=`${stage.offsetHeight+Math.max(260,innerHeight*.9)}px`;};
    measure();
    const draw=()=>{
      const state=window.MareaCarte.tableState(phase.value);
      frame.style.clipPath=`inset(0 ${state.inset}% 0 ${state.inset}%)`;
      image.style.transform=`scale(${state.scale})`;
    };
    draw();
    gsap.to(phase,{value:1,ease:'none',onUpdate:draw,scrollTrigger:{trigger:scene,start:'top top',end:()=>`+=${scene.offsetHeight-stage.offsetHeight}`,scrub:.45,invalidateOnRefresh:true,onRefreshInit:measure}});
    const refresh=()=>ScrollTrigger.refresh();
    image.addEventListener('load',refresh,{once:true});
    document.fonts.ready.then(refresh);
    return ()=>{
      scene.classList.remove('is-motion');scene.style.removeProperty('height');
      frame.style.removeProperty('clip-path');image.style.removeProperty('transform');
      image.removeEventListener('load',refresh);
    };
  });
})();
