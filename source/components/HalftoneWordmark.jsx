"use client";

import { useEffect, useRef } from "react";

// Огромное слово из полутоновых точек у нижнего края страницы (по образцу Halftone Wordmark Footer).
// Размер каждой точки зависит от того, какую часть клетки закрывает буква, поэтому края остаются чёткими.
// Курсор раздвигает точки на пружинах, смещённые точки теплеют, клик пускает по слову кольцо.
// Цвета берутся из токенов сайта (--bg, --text, --accent), поэтому светлая и тёмная тема работают сами.
// Один 2D-canvas, ничего не загружается из сети; пока цикл не нужен, requestAnimationFrame спит.

const FONT = '"Manrope Variable", "Manrope", system-ui, sans-serif';
const WEIGHT = 800;

function hexRgb(hex) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((hex || "").trim());
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].split("").map((c) => c + c).join("") : m[1];
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

// Радиус точки по покрытию клетки: корень, чтобы тон оставался ровным.
function dotRadius(coverage, gap) {
  const c = coverage < 0 ? 0 : coverage > 1 ? 1 : coverage;
  return Math.sqrt(c) * gap * 0.56;
}

// Один шаг пружины точки к своему месту плюс толчок от курсора в радиусе r.
function step(x, y, vx, vy, hx, hy, px, py, r) {
  const dx = x - px;
  const dy = y - py;
  const d2 = dx * dx + dy * dy;
  if (r > 0 && d2 < r * r) {
    const d = Math.sqrt(d2) + 0.001;
    const f = (1 - d / r) * 2.6;
    vx += (dx / d) * f;
    vy += (dy / d) * f;
  }
  vx = (vx + (hx - x) * 0.05) * 0.84;
  vy = (vy + (hy - y) * 0.05) * 0.84;
  return [x + vx, y + vy, vx, vy];
}

export default function HalftoneWordmark({ word = "vladnes", dotGap, radius = 80, crop = 0.2, grain = 0.5 }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let px = -1e5;
    let py = -1e5;
    let raf = 0;
    let visible = true;
    let awake = true;
    let alive = true;
    let ring = { x: 0, y: 0, t: -1 };
    let dots = new Float32Array(0); // на точку: x, y, vx, vy, hx, hy, r
    let count = 0;
    let grainTile = null;
    let bg = "#000";
    let inkCss = "#fff";
    let ink = [255, 255, 255];
    let warm = [0, 153, 255];

    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      bg = cs.getPropertyValue("--bg").trim() || "#000";
      inkCss = cs.getPropertyValue("--text").trim() || "#fff";
      ink = hexRgb(inkCss) || [255, 255, 255];
      warm = hexRgb(cs.getPropertyValue("--accent")) || [0, 153, 255];
    };

    const layout = () => {
      readColors();
      const rect = root.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);

      // Слово ставим один раз, размером на всю ширину, на маске 1x.
      const mask = document.createElement("canvas");
      mask.width = w;
      mask.height = h;
      const m = mask.getContext("2d", { willReadFrequently: true });
      if (!m) return;
      m.font = `${WEIGHT} 100px ${FONT}`;
      const measured = m.measureText(word).width;
      const fit = measured > 0 ? ((w * 1.02) / measured) * 100 : 0;
      m.font = `${WEIGHT} ${fit}px ${FONT}`;
      const box = m.measureText(word);
      const cap = box.actualBoundingBoxAscent || fit * 0.72;
      const c = Math.max(0, Math.min(0.6, crop));
      m.fillStyle = "#000";
      m.textBaseline = "alphabetic";
      m.fillText(word, (w - box.width) / 2, h + cap * c);
      const img = m.getImageData(0, 0, w, h).data;

      const gap = Math.max(3, dotGap || (w < 640 ? 4 : 6));
      const cols = Math.ceil(w / gap);
      const rows = Math.ceil(h / gap);
      const tmp = [];
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          // Покрытие: средняя прозрачность по сетке 3×3 внутри клетки.
          let sum = 0;
          for (let sy = 0; sy < 3; sy++) {
            for (let sx = 0; sx < 3; sx++) {
              const x = Math.min(w - 1, Math.floor(gx * gap + ((sx + 0.5) * gap) / 3));
              const y = Math.min(h - 1, Math.floor(gy * gap + ((sy + 0.5) * gap) / 3));
              sum += img[(y * w + x) * 4 + 3];
            }
          }
          const cov = sum / (9 * 255);
          if (cov < 0.06) continue;
          const hx = gx * gap + gap / 2;
          const hy = gy * gap + gap / 2;
          tmp.push(hx, hy, 0, 0, hx, hy, dotRadius(cov, gap));
        }
      }
      dots = new Float32Array(tmp);
      count = tmp.length / 7;

      // Тайл печатного зерна рисуется один раз и ложится поверх каждого кадра.
      grainTile = document.createElement("canvas");
      grainTile.width = 256;
      grainTile.height = 256;
      const g = grainTile.getContext("2d");
      if (g) {
        const id = g.createImageData(256, 256);
        for (let i = 0; i < id.data.length; i += 4) {
          const v = Math.random() * 255;
          id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
          id.data[i + 3] = Math.random() < 0.5 ? 0 : 255;
        }
        g.putImageData(id, 0, 0);
      }
      awake = true;
    };

    const draw = (now) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const r = !reduced ? Math.max(0, radius) : 0;
      const ringAge = ring.t < 0 ? 1e9 : now - ring.t;
      const ringR = ringAge * 0.9;
      let moving = false;
      for (let i = 0; i < count; i++) {
        const j = i * 7;
        let x = dots[j];
        let y = dots[j + 1];
        let vx = dots[j + 2];
        let vy = dots[j + 3];
        const hx = dots[j + 4];
        const hy = dots[j + 5];
        if (!reduced) {
          if (ringAge < 900) {
            const dx = hx - ring.x;
            const dy = hy - ring.y;
            const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
            const band = 1 - Math.min(1, Math.abs(d - ringR) / 26);
            if (band > 0) {
              const f = band * 3.2 * (1 - ringAge / 900);
              vx += (dx / d) * f;
              vy += (dy / d) * f;
            }
          }
          const s = step(x, y, vx, vy, hx, hy, px, py, r);
          x = s[0];
          y = s[1];
          vx = s[2];
          vy = s[3];
          if (Math.abs(vx) + Math.abs(vy) > 0.02 || Math.abs(x - hx) + Math.abs(y - hy) > 0.05) moving = true;
          else {
            x = hx;
            y = hy;
            vx = 0;
            vy = 0;
          }
          dots[j] = x;
          dots[j + 1] = y;
          dots[j + 2] = vx;
          dots[j + 3] = vy;
        }
        // Чем дальше точка от места, тем ближе её цвет к акценту сайта.
        const k = Math.min(1, Math.hypot(x - hx, y - hy) / 28);
        ctx.fillStyle =
          k > 0.02
            ? `rgb(${Math.round(ink[0] + (warm[0] - ink[0]) * k)},${Math.round(ink[1] + (warm[1] - ink[1]) * k)},${Math.round(ink[2] + (warm[2] - ink[2]) * k)})`
            : inkCss;
        ctx.beginPath();
        ctx.arc(x, y, dots[j + 6], 0, 6.2832);
        ctx.fill();
      }

      if (grainTile && grain > 0) {
        ctx.globalAlpha = Math.min(1, grain) * 0.09;
        ctx.globalCompositeOperation = "overlay";
        const pattern = ctx.createPattern(grainTile, "repeat");
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, w, h);
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      }
      // Когда все точки дома и курсора нет, цикл засыпает.
      awake = moving || ringAge < 900 || px > -1e4;
    };

    const loop = (now) => {
      raf = 0;
      if (!visible) return;
      draw(now);
      if (awake) raf = requestAnimationFrame(loop);
    };
    const wake = () => {
      awake = true;
      if (!raf && visible) raf = requestAnimationFrame(loop);
    };

    const local = (e) => {
      const b = canvas.getBoundingClientRect();
      return [e.clientX - b.left, e.clientY - b.top];
    };
    const onMove = (e) => {
      const p = local(e);
      px = p[0];
      py = p[1];
      wake();
    };
    const onLeave = () => {
      px = -1e5;
      py = -1e5;
      wake();
    };
    const onDown = (e) => {
      if (reduced) return;
      const p = local(e);
      ring = { x: p[0], y: p[1], t: performance.now() };
      wake();
    };

    layout();
    draw(performance.now());
    wake();

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("pointerdown", onDown);
    const ro = new ResizeObserver(() => {
      layout();
      wake();
    });
    ro.observe(root);
    const io = new IntersectionObserver((entries) => {
      visible = entries[0] ? entries[0].isIntersecting : true;
      if (visible) wake();
    });
    io.observe(root);
    // Смена темы: перечитываем цвета и пересобираем точки.
    const mo = new MutationObserver(() => {
      layout();
      wake();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    // Шрифт мог ещё не загрузиться: просим нужное начертание и ставим слово заново уже настоящим шрифтом.
    if (document.fonts) {
      document.fonts
        .load(`${WEIGHT} 100px ${FONT}`, word)
        .catch(() => {})
        .then(() => {
          if (!alive) return;
          layout();
          wake();
        });
    }

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointerdown", onDown);
    };
  }, [word, dotGap, radius, crop, grain]);

  return (
    <div className="hwf" ref={rootRef}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <span className="sr">{word}</span>
    </div>
  );
}
