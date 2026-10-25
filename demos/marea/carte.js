(function () {
  'use strict';
  const dishes = window.MareaDishes || [];
  const dialog = document.getElementById('dish-detail');
  if (!dialog || !window.MareaCarte) return;
  const image = document.getElementById('dish-detail-image');
  const save = document.getElementById('dish-detail-save');
  let current = null;
  let photographRequest = 0;
  window.MareaSaved = window.MareaSaved || [];
  const text = (id,value) => { document.getElementById(id).textContent=value; };
  const visibleIds = () => [...document.querySelectorAll('.plate-card:not([hidden])')].filter(card=>!card.closest('[data-menu-group]').hidden).map(card=>card.dataset.dishId);
  const currentIds = () => {
    const ids=visibleIds();
    return ids.includes(current) ? ids : [current];
  };
  function updateSaved() {
    document.querySelectorAll('[data-save-dish]').forEach(button=>{
      const dish=dishes.find(d=>d.id===button.dataset.saveDish);
      const selected=window.MareaSaved.includes(dish.id);
      button.setAttribute('aria-pressed',String(selected));
      button.setAttribute('aria-label',`${selected?'Убрать из выбора':'Сохранить'}: ${dish.name}`);
    });
    const count=document.getElementById('saved-count');
    if(count) count.textContent=String(window.MareaSaved.length);
    if(current) {
      const selected=window.MareaSaved.includes(current);
      save.setAttribute('aria-pressed',String(selected));
      save.firstChild.textContent=selected?'Убрать из моего выбора ':'Сохранить в мой выбор ';
    }
  }
  function toggleSaved(id) {
    const index=window.MareaSaved.indexOf(id);
    if(index<0) window.MareaSaved.push(id); else window.MareaSaved.splice(index,1);
    updateSaved();
    if(typeof filterCatalog==='function') filterCatalog();
    const status=document.getElementById('save-status');
    const d=dishes.find(item=>item.id===id);
    if(status) status.textContent=`${d.name} ${index<0?'сохранено':'убрано из выбора'}. Это не заказ.`;
    if(dialog.open) {
      const selected=window.MareaCarte.selectionCurrent(visibleIds(),current);
      if(selected===current) updatePosition();
      else if(selected) showDish(selected);
      else dialog.close();
    }
  }
  function updatePosition() {
    const ids=currentIds();
    text('dish-detail-position',`${Math.max(0,ids.indexOf(current))+1} / ${ids.length}`);
    document.getElementById('dish-detail-prev').disabled=ids.length<2;
    document.getElementById('dish-detail-next').disabled=ids.length<2;
  }
  function showDish(id) {
    const dish=dishes.find(item=>item.id===id);
    if(!dish) return;
    current=id;
    // Conceal the previous bitmap immediately, before replacing its caption.
    image.style.visibility='hidden';
    image.style.opacity='0';
    text('dish-detail-category',dish.categoryLabel);
    text('dish-detail-title',dish.name);
    text('dish-detail-story',dish.story);
    text('dish-detail-ingredients',dish.ingredients);
    text('dish-detail-pairing',dish.pairing);
    text('dish-detail-price',new Intl.NumberFormat('ru-RU').format(dish.price)+' ₽');
    const request=++photographRequest;
    image.alt=dish.name+': '+dish.ingredients;
    image.srcset='';
    image.src=`assets/${dish.photo}.jpg`;
    image.closest('figure').classList.remove('photo-unavailable');
    image.decode().then(()=>{
      if(request===photographRequest) { image.style.visibility='visible'; image.style.opacity='1'; }
    }).catch(()=>{
      if(request===photographRequest) image.closest('figure').classList.add('photo-unavailable');
    });
    updateSaved(); updatePosition();
  }
  document.querySelectorAll('[data-dish-open]').forEach(button=>button.addEventListener('click',()=>{
    showDish(button.dataset.dishOpen);
    openDialog('dish-detail',button);
  }));
  document.querySelectorAll('[data-save-dish]').forEach(button=>button.addEventListener('click',()=>{
    toggleSaved(button.dataset.saveDish);
    if(!button.checkVisibility()) document.querySelector('[data-catalog-filter="saved"]')?.focus({preventScroll:true});
  }));
  save.addEventListener('click',()=>toggleSaved(current));
  const move=direction=>showDish(window.MareaCarte.neighbour(currentIds(),current,direction));
  document.getElementById('dish-detail-prev').addEventListener('click',()=>move(-1));
  document.getElementById('dish-detail-next').addEventListener('click',()=>move(1));
  dialog.addEventListener('keydown',event=>{
    if(event.altKey||event.ctrlKey||event.metaKey||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    if(event.key==='Tab') {
      const controls=[...dialog.querySelectorAll('button:not([disabled])')];
      const target=event.shiftKey&&document.activeElement===controls[0] ? controls.at(-1) : !event.shiftKey&&document.activeElement===controls.at(-1) ? controls[0] : null;
      if(target) { event.preventDefault();target.focus(); }
    }
    if(event.key==='ArrowLeft'||event.key==='ArrowRight') {event.preventDefault();move(event.key==='ArrowLeft'?-1:1);}
  });
  dialog.addEventListener('close',()=>{
    ++photographRequest;
    if(openingButton&&!openingButton.checkVisibility()) document.querySelector('[data-catalog-filter][aria-pressed="true"]')?.focus({preventScroll:true});
  });
  updateSaved();
})();
