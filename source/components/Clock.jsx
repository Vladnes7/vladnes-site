"use client";

import { useEffect, useRef } from "react";

// Часы идут по настоящему времени. Стрелки двигаются плавно, без рывка раз в секунду.
// При наведении на карточку (.ap__card:hover) секундная стрелка делает быстрый круг: это задано в CSS.
export default function Clock() {
  const ref = useRef(null);

  useEffect(() => {
    const svg = ref.current;
    const [h, m, s] = ["h", "m", "s"].map((k) => svg.querySelector(`[data-hand="${k}"]`));
    const set = () => {
      const now = new Date();
      const sec = now.getSeconds() + now.getMilliseconds() / 1000;
      const min = now.getMinutes() + sec / 60;
      const hour = now.getHours() + min / 60;
      h.style.transform = `rotate(${hour * 15}deg)`;
      m.style.transform = `rotate(${min * 6}deg)`;
      s.style.transform = `rotate(${sec * 6}deg)`;
    };
    set();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let visible = false;
    const tick = () => {
      set();
      raf = requestAnimationFrame(tick);
    };
    const run = () => {
      cancelAnimationFrame(raf);
      if (visible && !document.hidden) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      run();
    });
    io.observe(svg);
    document.addEventListener("visibilitychange", run);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", run);
    };
  }, []);

  // Циферблат на 24 часа, как у механических часов с суточной шкалой: часовая стрелка делает круг за сутки.
  return (
    <svg className="clock" ref={ref} viewBox="0 0 200 200" role="img" aria-label="Часы показывают текущее время">
      <defs>
        <linearGradient id="clock-steel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f4f5" />
          <stop offset="0.45" stopColor="#8c8c91" />
          <stop offset="0.55" stopColor="#e9e9ea" />
          <stop offset="1" stopColor="#6d6d72" />
        </linearGradient>
      </defs>
      {/* Циферблат — картинка без стрелок, стрелки рисуются поверх и идут по времени. */}
      <image href="/art/clock-face.webp" x="0" y="0" width="200" height="200" />
      <g className="clock__hands">
        <polygon data-hand="h" className="clock__hand" points="97.400,108 97.400,62 100,54 102.600,62 102.600,108" />
        <polygon data-hand="m" className="clock__hand" points="98,110 98,40 100,32 102,40 102,110" />
        <g className="clock__spin">
          <line data-hand="s" className="clock__hand clock__hand--s" x1="100" y1="120" x2="100" y2="26" />
        </g>
        <circle cx="100" cy="100" r="4.200" fill="url(#clock-steel)" />
        <circle cx="100" cy="100" r="1.400" fill="#0c0c0e" />
      </g>
    </svg>
  );
}
