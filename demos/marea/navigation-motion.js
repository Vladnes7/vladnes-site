(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MareaNavigationMotion = api;
})(typeof window === 'object' ? window : globalThis, function () {
  function createScrollState(root, body, view, getSmoothScroll) {
    let locked = false, position, overflow;
    const capture = () => ({ left: view.scrollX, top: view.scrollY });
    function restore(saved) {
      const behavior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      view.scrollTo({ ...saved, behavior: 'instant' });
      const smooth = getSmoothScroll();
      smooth?.resize();
      if (!locked) smooth?.scrollTo(saved.top, { immediate: true, force: true });
      root.style.scrollBehavior = behavior;
    }
    return {
      preserve(update, anchor) {
        const saved = capture();
        const before = anchor ? anchor.getBoundingClientRect().top + saved.top : null;
        try { return update(); } finally {
          if (anchor) saved.top += anchor.getBoundingClientRect().top + view.scrollY - before;
          restore(saved);
        }
      },
      sync(dialogs) {
        const hasDialog = dialogs.some(dialog => dialog.open);
        if (hasDialog) {
          if (!locked) {
            position = capture(); overflow = root.style.overflow; locked = true;
            root.style.overflow = 'hidden'; body.classList.add('has-dialog');
          }
          getSmoothScroll()?.stop();
        } else if (locked) {
          locked = false; root.style.overflow = overflow; body.classList.remove('has-dialog');
          getSmoothScroll()?.start(); restore(position);
        } else {
          // A BFCache return or a pointer-preference change can recreate Lenis.
          body.classList.remove('has-dialog'); getSmoothScroll()?.start();
        }
      }
    };
  }
  function createNavigationMotion(dialog, preference, readStyle = element => getComputedStyle(element)) {
    let revision = 0;
    let animations = [];
    let closing = false;
    const panel = dialog.querySelector?.('.nav-panel');
    const cancel = () => { animations.forEach(animation => animation.cancel()); animations = []; };
    return {
      open() {
        const continuing = closing;
        const current = continuing ? readStyle(dialog) : null;
        const from = current ? { opacity: current.opacity, transform: current.transform } : { opacity: 0, transform: 'none' };
        const mask = continuing && panel ? readStyle(panel).clipPath : 'inset(0 100% 0 0)';
        revision++;
        cancel();
        closing = false;
        if (preference.matches) return;
        animations.push(dialog.animate([from, { opacity: 1, transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.32,.72,0,1)' }));
        if (panel) animations.push(panel.animate([{clipPath:mask},{clipPath:'inset(0 0% 0 0)'}], {duration:620,easing:'cubic-bezier(.32,.72,0,1)'}));
        if (!continuing) dialog.querySelectorAll('.nav-link, .nav-aside, .nav-baseline').forEach((element, index) => {
          animations.push(element.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }], {
            duration: 400, delay: Math.min(index, 7) * 38 + 100, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'backwards'
          }));
        });
      },
      async close() {
        const currentRevision = ++revision;
        const style = readStyle(dialog);
        const from = { opacity: style.opacity, transform: style.transform };
        const mask = panel ? readStyle(panel).clipPath : null;
        cancel();
        closing = true;
        if (!dialog.open) return;
        if (preference.matches) { dialog.close(); closing = false; return; }
        if (panel) animations.push(panel.animate([{clipPath:mask},{clipPath:'inset(0 100% 0 0)'}], {duration:420,easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'}));
        const exit = dialog.animate([from, { opacity: 0, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
        animations.push(exit);
        try { await exit.finished; } catch { return; }
        if (revision !== currentRevision) return;
        dialog.close();
        cancel();
        closing = false;
      }
    };
  }
  return { createNavigationMotion, createScrollState };
});
