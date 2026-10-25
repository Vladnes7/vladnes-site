const reduce=matchMedia('(prefers-reduced-motion:reduce)');
const landscape=document.querySelector('[data-landscape]');
const drift=[...document.querySelectorAll('[data-drift],.closing-frame')];
const progress=document.querySelector('.scroll-progress');
const progressFill=progress?.querySelector('.scroll-progress-fill');
const progressBall=progress?.querySelector('.scroll-progress-ball');
const photoFrames=[...document.querySelectorAll('.photo')];
const visiblePhotos=new Set();
const photoObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting)visiblePhotos.add(entry.target);else visiblePhotos.delete(entry.target)}schedule()},{rootMargin:'80px'});
photoFrames.forEach(el=>photoObserver.observe(el));
const menuButton=document.querySelector('.menu-toggle');
menuButton?.addEventListener('click',()=>document.body.classList.toggle('menu-is-open',menuButton.getAttribute('aria-expanded')==='true'));
new MutationObserver(()=>document.body.classList.toggle('menu-is-open',menuButton?.getAttribute('aria-expanded')==='true')).observe(menuButton,{attributes:true,attributeFilter:['aria-expanded']});
let queued=false;
function frame(){queued=false;
 if(progress){const page=document.documentElement,range=Math.max(1,page.scrollHeight-page.clientHeight),p=Math.max(0,Math.min(1,scrollY/range));progressFill.style.transform=`scaleX(${p})`;progressBall.style.transform=`translateX(${p*Math.max(0,page.clientWidth-progressBall.offsetWidth)}px)`;progress.dataset.position=p.toFixed(4)}
 if(reduce.matches){landscape?.style.removeProperty('clip-path');return}
 if(landscape){const b=landscape.getBoundingClientRect();if(b.bottom>0&&b.top<innerHeight){const entry=Math.max(0,Math.min(1,(innerHeight-b.top)/(innerHeight*.85)));landscape.style.clipPath=`inset(${(1-entry)*5}% ${(1-entry)*3}% round ${(1-entry)*14}px)`;landscape.querySelector('img').style.transform=`translateY(${(b.top/innerHeight)*-35}px)`;}}
 for(const el of drift){const b=el.getBoundingClientRect();if(b.bottom>0&&b.top<innerHeight){const image=el.matches('.closing-frame')?el.querySelector('img'):el.querySelector('.photo');if(image)image.style.transform=`translateY(${Math.max(-1,Math.min(1,b.top/innerHeight))*-30}px)`;}}
 for(const el of visiblePhotos){const b=el.getBoundingClientRect(),img=el.querySelector('img');if(!img)continue;const p=Math.max(-1,Math.min(1,(b.top+b.height/2-innerHeight/2)/(innerHeight/2+b.height/2))),shift=Math.min(16,b.height*.035)*p;img.style.transform=`translate3d(0,${shift.toFixed(2)}px,0) scale(1.08)`;}
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(frame)}}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);new ResizeObserver(schedule).observe(document.body);document.fonts.ready.then(schedule);reduce.addEventListener('change',()=>{if(reduce.matches){for(const e of document.querySelectorAll('[data-landscape] img,[data-drift] .photo,.closing-frame>img,.photo img'))e.style.removeProperty('transform');}schedule()});schedule();
