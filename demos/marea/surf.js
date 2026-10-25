(() => {
  'use strict';
  const scene = document.querySelector('.surf-scene');
  if (!scene || !window.ScrollTrigger || !CSS.supports('position', 'sticky')) return;
  const video = scene.querySelector('video');
  const copy = scene.querySelector('.surf-copy');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let cleanup = () => {};
  const clamp = value => Math.max(0, Math.min(1, value));
  function configure() {
    cleanup();
    if (reduced.matches) return;
    let target = 0, frame = 0, geometryFrame = 0, retryTimer = 0, attempts = 0, alive = true, observer, loading = false, objectUrl;
    const events = new AbortController();
    scene.classList.add('surf-active');
    copy.inert = true;
    video.muted = true;
    function paint() {
      if (!alive || video.readyState < 2) return;
      const progress = video.currentTime / video.duration;
      scene.dataset.surfFrame = video.currentTime.toFixed(4);
      // Reveal is tied to decoded footage, including when scrolling backwards.
      const opacity = clamp((progress - .73) / .16);
      scene.style.setProperty('--surf-copy', opacity.toFixed(3));
      scene.style.setProperty('--surf-tint', (.36 * clamp((progress - .5) / .3)).toFixed(3));
      scene.style.setProperty('--surf-seam', (1 - clamp(progress / .35)).toFixed(3));
      copy.classList.toggle('is-readable', opacity > .02);
      copy.inert = opacity < .9;
    }
    function seek() {
      frame = 0;
      if (!alive || !Number.isFinite(video.duration) || video.readyState < 2 || video.seeking) return;
      const time = target * Math.max(0, video.duration - 1 / 30);
      if (Math.abs(video.currentTime - time) < 1 / 60) { paint(); return; }
      try { video.currentTime = time; } catch { /* Retry on loadeddata/canplay. */ }
    }
    function request() { if (alive && !frame) frame = requestAnimationFrame(seek); }
    function decoded() { paint(); request(); }
    function syncGeometry() {
      geometryFrame = 0;
      if (!alive) return;
      const travel = scene.offsetHeight - scene.querySelector('.surf-stage').offsetHeight;
      target = clamp(travel > 0 ? -scene.getBoundingClientRect().top / travel : 0);
      scene.dataset.surfProgress = String(target);
      request();
    }
    function refreshGeometry() {
      // ScrollTrigger briefly resets scroll while refreshing. Measure after its
      // restoration, especially when mobile list heights or modal locks change.
      if (alive && !geometryFrame) geometryFrame = requestAnimationFrame(syncGeometry);
    }
    async function load() {
      if (loading || !alive) return;
      loading = true; attempts++;
      try {
        // Sites serves static MP4s without HTTP Range. A complete local Blob
        // makes seeking independent of the origin's partial-content support.
        const response = await fetch(video.dataset.src, { signal: events.signal, priority: 'low' });
        if (!response.ok) throw new Error(`Video request failed: ${response.status}`);
        const blob = await response.blob();
        if (!alive) return;
        objectUrl = URL.createObjectURL(blob);
        video.preload = 'auto';
        video.src = objectUrl;
        video.load();
      } catch {
        loading = false;
        if (!alive) return;
        if (attempts < 3) retryTimer = setTimeout(load, 600 * attempts);
        else { cleanup(); ScrollTrigger.refresh(); }
      }
    }
    const trigger = ScrollTrigger.create({
      trigger: scene, start: 'top top', end: () => `+=${scene.offsetHeight - scene.querySelector('.surf-stage').offsetHeight}`,
      onUpdate: state => { target = clamp(state.progress); scene.dataset.surfProgress = String(target); request(); },
      onRefresh: refreshGeometry
    });
    window.mareaSurf = trigger;
    ['loadeddata','canplay','seeked'].forEach(name => video.addEventListener(name, decoded, { signal: events.signal }));
    video.addEventListener('error', () => {
      cleanup(); // The static final image and booking remain usable on failure.
      ScrollTrigger.refresh();
    }, { signal: events.signal });
    // Keyboard navigation must never get trapped behind an invisible CTA.
    copy.addEventListener('focusin', () => { target = 1; request(); }, { signal: events.signal });
    window.addEventListener('scroll', syncGeometry, { passive: true, signal: events.signal });
    window.addEventListener('resize', refreshGeometry, { passive: true, signal: events.signal });
    window.addEventListener('pageshow', syncGeometry, { signal: events.signal });
    observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { load(); observer.disconnect(); }
    }, { rootMargin: '180% 0px' });
    observer.observe(scene);
    cleanup = () => {
      alive = false; cancelAnimationFrame(frame); cancelAnimationFrame(geometryFrame); clearTimeout(retryTimer); observer.disconnect(); events.abort(); trigger.kill();
      video.pause(); video.removeAttribute('src'); video.load();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      scene.classList.remove('surf-active');
      ['--surf-copy','--surf-tint','--surf-seam'].forEach(name => scene.style.removeProperty(name));
      copy.inert = false; copy.classList.remove('is-readable'); window.mareaSurf = null;
      delete scene.dataset.surfFrame;
    };
    // Fetch before the visitor reaches this final section. Waiting until nearby
    // made a first visit show only a poster while the complete MP4 downloaded.
    load();
  }
  configure();
  reduced.addEventListener('change', () => { configure(); ScrollTrigger.refresh(); });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
