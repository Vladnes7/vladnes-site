"use client";

import { useEffect, useRef } from "react";

// Фон блока заявки: звуковая волна из тонких линий (идея Sonic Waveform). Линии сходятся к краям и гаснут, в середине расходятся,
// курсор над блоком раскачивает их рядом с собой. Цвета — бирюзовый и синий акцент сайта, на светлой теме темнее.
// Рисуем прозрачными линиями без заливки кадра, поэтому фон блока (свечение) остаётся виден.
// Экономия: пауза вне экрана и на скрытой вкладке, при prefers-reduced-motion рисуется один кадр.

const LINES = 52;
const SEGMENTS = 120;
const SPEED = 1.1; // фаза в секунду

const PALETTES = {
  dark: { stops: ["45,212,191", "0,153,255", "122,202,255"], alpha: 0.55, glow: true },
  light: { stops: ["11,127,116", "0,119,204", "0,104,173"], alpha: 0.38, glow: false },
};

export default function SonicWave() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const host = wrap.parentElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let time = 3;
    let raf = 0;
    let running = false;
    let last = 0;
    let palette = PALETTES.dark;
    // Курсор: цель и сглаженное положение, strength плавно включает и выключает влияние.
    const mouse = { x: 0, y: 0, tx: 0, ty: 0, strength: 0, target: 0 };

    const readTheme = () => {
      palette = document.documentElement.getAttribute("data-theme") === "light" ? PALETTES.light : PALETTES.dark;
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = wrap.clientWidth;
      height = wrap.clientHeight;
      canvas.width = Math.max(2, Math.round(width * dpr));
      canvas.height = Math.max(2, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = palette.glow ? "lighter" : "source-over";

      // Волна идёт в нижней части блока: выше лежат заголовок, контакты и форма.
      const cy = height * (width < 900 ? 0.88 : 0.8);
      const base = Math.min(height, 900);
      const noiseAmp = base * 0.024;
      const spikeAmp = base * 0.058;
      const reach = Math.min(width, 760) * 0.32;

      const grad = ctx.createLinearGradient(0, 0, width, 0);
      const [a, b, c] = palette.stops;
      grad.addColorStop(0, `rgb(${a})`);
      grad.addColorStop(0.5, `rgb(${b})`);
      grad.addColorStop(1, `rgb(${c})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.3;

      mouse.x += (mouse.tx - mouse.x) * 0.12;
      mouse.y += (mouse.ty - mouse.y) * 0.12;
      mouse.strength += (mouse.target - mouse.strength) * 0.06;

      for (let i = 0; i < LINES; i++) {
        const progress = i / (LINES - 1);
        ctx.globalAlpha = Math.sin(progress * Math.PI) * palette.alpha;
        ctx.beginPath();
        for (let j = 0; j <= SEGMENTS; j++) {
          const u = j / SEGMENTS;
          const x = u * width;
          const k = u * 80;
          // Огибающая: у краёв линии сходятся в одну, в середине расходятся в полную силу.
          const envelope = 0.15 + 0.85 * Math.pow(Math.sin(u * Math.PI), 0.7);
          const near = Math.max(0, 1 - Math.hypot(x - mouse.x, cy - mouse.y) / reach) * mouse.strength;
          const noise = Math.sin(k * 0.1 + time + i * 0.2) * noiseAmp;
          const spike = Math.cos(k * 0.2 + time + i * 0.1) * Math.sin(k * 0.05 + time) * spikeAmp;
          const y = cy + envelope * (noise + spike * (1 + near * 2.2));
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      time += (Math.min(now - last, 100) / 1000) * SPEED;
      last = now;
      draw();
    };

    const start = () => {
      if (running || reduced) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    let inView = false;
    const sync = () => (inView && !document.hidden ? start() : stop());

    const onMove = (event) => {
      const r = wrap.getBoundingClientRect();
      mouse.tx = event.clientX - r.left;
      mouse.ty = event.clientY - r.top;
      if (mouse.target === 0) {
        mouse.x = mouse.tx;
        mouse.y = mouse.ty;
      }
      mouse.target = 1;
    };
    const onLeave = () => {
      mouse.target = 0;
    };

    readTheme();
    const themeObserver = new MutationObserver(() => {
      readTheme();
      if (!running) draw();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const view = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    view.observe(wrap);
    const resizer = new ResizeObserver(resize);
    resizer.observe(wrap);
    document.addEventListener("visibilitychange", sync);
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);

    resize();

    return () => {
      stop();
      view.disconnect();
      resizer.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="wave" ref={wrapRef} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
