"use client";

import { useEffect, useRef } from "react";

// Лента экранов сайта: медленно едет сама, стрелки листают на один экран.
// Сама останавливается при наведении, при фокусе на стрелках и если человек листает её пальцем.
export default function Carousel({ shots, title }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let paused = false;
    let visible = false;
    let pos = el.scrollLeft;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (paused || !visible) return;
      const half = el.scrollWidth / 2;
      // Список продублирован: дойдя до середины, незаметно возвращаемся в начало.
      pos = el.scrollLeft + 0.5;
      if (pos >= half) pos -= half;
      el.scrollLeft = pos;
    };
    const stop = () => (paused = true);
    const go = () => (paused = false);
    const wrap = el.parentElement;
    wrap.addEventListener("pointerenter", stop);
    wrap.addEventListener("pointerleave", go);
    wrap.addEventListener("focusin", stop);
    wrap.addEventListener("focusout", go);
    el.addEventListener("touchstart", stop, { passive: true });
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      wrap.removeEventListener("pointerenter", stop);
      wrap.removeEventListener("pointerleave", go);
      wrap.removeEventListener("focusin", stop);
      wrap.removeEventListener("focusout", go);
      el.removeEventListener("touchstart", stop);
    };
  }, []);

  const step = (dir) => {
    const el = ref.current;
    const card = el.querySelector("img");
    el.scrollBy({ left: dir * (card.offsetWidth + 16), behavior: "smooth" });
  };

  return (
    <div className="shots">
      <div className="shots__track" ref={ref}>
        {[...shots, ...shots].map((src, i) => (
          <img
            key={i}
            src={src}
            alt={i < shots.length ? `${title}: экран ${i + 1}` : ""}
            aria-hidden={i >= shots.length ? "true" : undefined}
            width="1600"
            height="1000"
            loading={i < 3 ? "eager" : "lazy"}
          />
        ))}
      </div>
      <button className="shots__nav shots__nav--prev" type="button" aria-label="Предыдущий экран" onClick={() => step(-1)}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m14 6-6 6 6 6" />
        </svg>
      </button>
      <button className="shots__nav shots__nav--next" type="button" aria-label="Следующий экран" onClick={() => step(1)}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m10 6 6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}
