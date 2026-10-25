// Runs in the head, before the incoming page can paint.
(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const key = 'marea-chapter';
  const route = url => new URL(url, location.href).pathname.replace(/(?:index)?\.html$|\/$/g, '') || '/';
  let arriving = false;
  try {
    const entry = JSON.parse(sessionStorage.getItem(key) || 'null');
    sessionStorage.removeItem(key);
    arriving = !reduced.matches && entry && Date.now() - entry.time < 15000 && route(entry.url) === route(location.href);
  } catch {}
  const style = document.createElement('style');
  style.textContent = '@view-transition{navigation:none}html.chapter-arriving::after{content:"";position:fixed;inset:0;z-index:2147483647;background:#f5f3e9;pointer-events:none}.chapter-curtain{position:fixed;inset:0;width:100%;height:100%;max-width:none;max-height:none;margin:0;padding:0;border:0;background:#f5f3e9;z-index:2147483647;pointer-events:auto}.chapter-curtain::backdrop{background:transparent}';
  document.head.append(style);
  if (arriving) root.classList.add('chapter-arriving');
  const safety = setTimeout(() => root.classList.remove('chapter-arriving'), 3500);
  document.addEventListener('DOMContentLoaded', async () => {
    const curtain = document.createElement('div');
    curtain.className = 'chapter-curtain';
    curtain.setAttribute('aria-hidden', 'true');
    curtain.setAttribute('popover', 'manual');
    curtain.hidden = true;
    document.body.append(curtain);
    let busy = false;
    let watchdog;
    let revision = 0;
    const show = (interactive = true) => { curtain.style.pointerEvents = interactive ? 'auto' : 'none'; curtain.hidden = false; curtain.showPopover?.(); };
    const reset = () => {
      revision++;
      clearTimeout(watchdog);
      curtain.getAnimations().forEach(animation => animation.cancel());
      curtain.hidePopover?.(); curtain.hidden = true; busy = false;
      root.classList.remove('chapter-arriving');
    };
    addEventListener('pageshow', event => { if (event.persisted) reset(); });
    reduced.addEventListener('change', () => { if (reduced.matches) reset(); });
    const destination = event => {
      const link = event.target.closest?.('a[href]');
      if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return null;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || !/^https?:$/.test(url.protocol) || route(url) === route(location.href)) return null;
      if (!/^\/(?:.*\/)?(?:index|restaurant|menu|table|gallery|evenings|visit)(?:\.html)?\/?$/.test(url.pathname) && url.pathname !== '/') return null;
      return url;
    };
    const warmed = new Set();
    const warm = event => {
      const url = destination(event);
      if (!url || warmed.has(url.href)) return;
      warmed.add(url.href);
      const prefetch = document.createElement('link');
      prefetch.rel = 'prefetch'; prefetch.href = url.href; document.head.append(prefetch);
    };
    document.addEventListener('pointerover', warm, {passive:true});
    document.addEventListener('focusin', warm);
    document.addEventListener('click', async event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || reduced.matches) return;
      const url = destination(event);
      if (!url) return;
      if (busy) { event.preventDefault(); return; }
      try { sessionStorage.setItem(key, JSON.stringify({url:url.href,time:Date.now()})); } catch { return; }
      event.preventDefault(); busy = true; revision++;
      curtain.getAnimations().forEach(animation => animation.cancel());
      root.classList.remove('chapter-arriving'); show();
      watchdog = setTimeout(reset, 5000);
      try { await curtain.animate([{transform:'translateY(101%)'},{transform:'translateY(0)'}], {duration:440,easing:'cubic-bezier(.65,0,.18,1)',fill:'forwards'}).finished; } catch {}
      location.assign(url.href);
    });
    // Register navigation first so links already uncovered by an arrival stay responsive.
    if (arriving) {
      const current = revision;
      const hero = document.querySelector('main img[fetchpriority="high"], main img');
      await Promise.race([Promise.allSettled([hero?.decode?.(), document.fonts?.ready]), new Promise(resolve => setTimeout(resolve, 1100))]);
      clearTimeout(safety);
      if (current !== revision) return;
      if (!reduced.matches) {
        show(false); root.classList.remove('chapter-arriving');
        try { await curtain.animate([{transform:'translateY(0)'},{transform:'translateY(-101%)'}], {duration:760,easing:'cubic-bezier(.65,0,.18,1)',fill:'forwards'}).finished; } catch {}
      }
      if (current === revision) { reset(); window.ScrollTrigger?.refresh(); }
    } else clearTimeout(safety);
  }, {once:true});
})();
