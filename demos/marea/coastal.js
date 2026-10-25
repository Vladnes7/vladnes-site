(function () {
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  document.querySelectorAll('.marea-footer').forEach(footer=>{
    const ribbon=footer.querySelector('.coastal-ribbon');
    const updateRibbon=()=>ribbon.classList.toggle('is-paused',reduced.matches);
    reduced.addEventListener('change',updateRibbon);
    updateRibbon();
    const light=document.createElement('div');
    light.className='footer-light';light.setAttribute('aria-hidden','true');footer.prepend(light);
    const mark=footer.querySelector('.coastal-wordmark');
    const letters=Array.from(mark.querySelectorAll('span'),el=>({el,x:0,y:0,rotate:0,target:{x:0,y:0,rotate:0}}));
    let frame=0,lastTime=0,pointer=null,x=0,y=0,inside=false;
    const enabled=()=>!reduced.matches&&(pointer?.type==='touch'||fine.matches);
    const within=(point,box)=>point&&point.x>=box.left&&point.x<=box.right&&point.y>=box.top&&point.y<=box.bottom;
    const draw=time=>{
      frame=0;
      const blend=1-Math.exp(-Math.min(64,lastTime?time-lastTime:16)/95);
      lastTime=time;
      let moving=false;
      if(inside){
        x+=(pointer.x-x)*blend;y+=(pointer.y-y)*blend;
        if(Math.abs(x-pointer.x)+Math.abs(y-pointer.y)<.1){x=pointer.x;y=pointer.y;}
        else moving=true;
        // Keep the smoothed point in viewport coordinates: scrolling moves the
        // footer underneath it, rather than dragging the light away from it.
        const box=footer.getBoundingClientRect();
        light.style.transform=`translate3d(${(x-box.left).toFixed(2)}px,${(y-box.top).toFixed(2)}px,0) translate(-50%,-50%)`;
      }
      letters.forEach(letter=>{
        ['x','y','rotate'].forEach(key=>{
          letter[key]+=(letter.target[key]-letter[key])*blend;
          if(Math.abs(letter[key]-letter.target[key])<.02)letter[key]=letter.target[key];
          else moving=true;
        });
        // Do not leave Safari rasterising the script's ink overhang inside a
        // zero-transform layer after the gesture has settled.
        letter.el.style.transform=letter.x||letter.y||letter.rotate
          ? `translate3d(${letter.x.toFixed(2)}px,${letter.y.toFixed(2)}px,0) rotate(${letter.rotate.toFixed(2)}deg)`
          : '';
      });
      if(moving)frame=requestAnimationFrame(draw);
      else {lastTime=0;mark.classList.remove('letters-active');}
    };
    const request=()=>{if(!frame)frame=requestAnimationFrame(draw);};
    const update=()=>{
      if(!enabled()||!pointer)return;
      const nextInside=within(pointer,footer.getBoundingClientRect());
      if(!nextInside&&!inside&&letters.every(letter=>letter.x===0&&letter.y===0&&letter.rotate===0))return;
      if(nextInside&&!inside){x=pointer.x;y=pointer.y;}
      inside=nextInside;footer.classList.toggle('light-active',inside);
      const box=mark.getBoundingClientRect(),over=inside&&within(pointer,box);
      const scale=Math.min(1,box.height/340);
      letters.forEach(letter=>{
        const target=over?MareaCoastal.letterTarget((pointer.x-box.left)/box.width,(pointer.y-box.top)/box.height,(letter.el.offsetLeft+letter.el.offsetWidth/2)/box.width):{x:0,y:0,rotate:0};
        letter.target={x:target.x*scale,y:target.y*scale,rotate:target.rotate};
      });
      mark.classList.add('letters-active');request();
    };
    const reset=()=>{
      pointer=null;inside=false;lastTime=0;footer.classList.remove('light-active');
      cancelAnimationFrame(frame);frame=0;mark.classList.remove('letters-active');
      letters.forEach(letter=>{letter.x=letter.y=letter.rotate=0;letter.target={x:0,y:0,rotate:0};letter.el.style.transform='';});
    };
    const track=event=>{
      if(reduced.matches||(!fine.matches&&event.pointerType!=='touch'))return;
      pointer={x:event.clientX,y:event.clientY,type:event.pointerType||'mouse'};update();
    };
    const release=()=>{
      if(pointer?.type!=='touch')return;
      pointer=null;inside=false;footer.classList.remove('light-active');
      letters.forEach(letter=>{letter.target={x:0,y:0,rotate:0};});
      mark.classList.add('letters-active');request();
    };
    const touch=event=>{
      const point=event.touches[0];
      if(point)track({clientX:point.clientX,clientY:point.clientY,pointerType:'touch'});
    };
    window.addEventListener('pointerdown',track,{passive:true});
    window.addEventListener('pointermove',track,{passive:true});
    window.addEventListener('pointerup',release,{passive:true});
    // Native touch scrolling cancels pointer events. Passive touch tracking
    // keeps the effect alive while letting the browser own the scroll gesture.
    window.addEventListener('touchstart',touch,{passive:true});
    window.addEventListener('touchmove',touch,{passive:true});
    window.addEventListener('touchend',release,{passive:true});
    window.addEventListener('touchcancel',release,{passive:true});
    // Wheel coordinates are available even without a preceding mouse move.
    window.addEventListener('wheel',track,{passive:true});
    window.addEventListener('scroll',update,{passive:true});
    window.addEventListener('resize',update,{passive:true});
    window.addEventListener('blur',reset);
    window.addEventListener('pointerout',event=>{if(event.pointerType!=='touch'&&!event.relatedTarget)reset();});
    reduced.addEventListener('change',reset);fine.addEventListener('change',reset);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
  });
})();
