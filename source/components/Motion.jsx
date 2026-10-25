"use client";

import { useEffect } from "react";

// Одна точка входа для анимаций прокрутки. Разметка управляет ими через data-атрибуты:
// data-split — заголовок по буквам, data-reveal — каскад дочерних элементов,
// data-px="120" — горизонтальный сдвиг вместе с прокруткой, data-count — число набегает от нуля,
// data-progress — линия заполняется по прокрутке, data-rise — элемент поднимается снизу,
// data-gradient (вместе с data-split) — буквы заголовка плавно меняют цвет от белого к синему.
const GRADIENT = [
  [255, 255, 255],
  [168, 216, 255],
  [31, 155, 255],
];

// Градиент у каждой буквы свой: у букв есть transform от анимации, и background-clip: text у родителя на них не работает.
function paintGradient(el, chars) {
  const box = el.getBoundingClientRect();
  chars.forEach((char) => {
    const r = char.getBoundingClientRect();
    const x = (r.left + r.width / 2 - box.left) / box.width;
    const y = (r.top + r.height / 2 - box.top) / box.height;
    const f = Math.min(1, Math.max(0, (0.65 * x + 0.35 * y - 0.1) / 0.78)) * (GRADIENT.length - 1);
    const i = Math.min(GRADIENT.length - 2, Math.floor(f));
    const [a, b] = [GRADIENT[i], GRADIENT[i + 1]];
    const t = f - i;
    char.style.color = `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * t)).join(",")})`;
  });
}

export default function Motion() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("js-motion")) return;

    let ctx;
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }, { SplitText }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("gsap/SplitText"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger, SplitText);
      await document.fonts.ready;
      if (cancelled) return;

      ctx = gsap.context(() => {
        gsap.utils.toArray("[data-split]").forEach((el) => {
          const split = new SplitText(el, { type: "words,chars", aria: "auto" });
          gsap.set(el, { opacity: 1 });
          if (el.hasAttribute("data-gradient")) paintGradient(el, split.chars);
          const hero = el.hasAttribute("data-hero");
          gsap.from(split.chars, {
            opacity: 0,
            yPercent: 45,
            filter: "blur(7px)",
            duration: 0.7,
            stagger: 0.017,
            ease: "power2.out",
            delay: hero ? 0.15 : 0,
            scrollTrigger: hero ? undefined : { trigger: el, start: "top 82%", once: true },
          });
        });

        gsap.utils.toArray("[data-reveal]").forEach((group) => {
          const items = group.hasAttribute("data-reveal-self") ? [group] : Array.from(group.children);
          const hero = group.hasAttribute("data-hero");
          gsap.set(group, { opacity: 1 });
          gsap.from(items, {
            opacity: 0,
            y: 26,
            duration: 0.75,
            stagger: 0.09,
            ease: "power3.out",
            delay: hero ? Number(group.dataset.delay || 0.55) : 0,
            scrollTrigger: hero ? undefined : { trigger: group, start: "top 84%", once: true },
          });
        });

        // Цена «набегает» от нуля до значения. Итоговый текст уже стоит в разметке, поэтому без JS он виден.
        gsap.utils.toArray("[data-count]").forEach((el) => {
          const target = Number(el.dataset.count);
          if (!target) return;
          const counter = { v: 0 };
          const fmt = new Intl.NumberFormat("ru-RU");
          el.textContent = fmt.format(0);
          gsap.to(counter, {
            v: target,
            duration: 1.6,
            ease: "power3.out",
            onUpdate: () => {
              el.textContent = fmt.format(Math.round(counter.v));
            },
            onComplete: () => {
              el.textContent = fmt.format(target);
            },
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });

        // Линия шагов заполняется по мере прокрутки: переменная --prog идёт от 0 до 1.
        gsap.utils.toArray("[data-progress]").forEach((el) => {
          gsap.fromTo(
            el,
            { "--prog": 0 },
            {
              "--prog": 1,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top 72%", end: "bottom 62%", scrub: 0.4 },
            },
          );
        });

        // Большая марка в подвале поднимается снизу, пока подвал въезжает в экран.
        gsap.utils.toArray("[data-rise]").forEach((el) => {
          gsap.fromTo(
            el,
            { yPercent: 46, opacity: 0.25 },
            {
              yPercent: 0,
              opacity: 1,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: 0.5 },
            },
          );
        });

        gsap.utils.toArray("[data-px]").forEach((el) => {
          const travel = Number(el.dataset.px);
          gsap.fromTo(
            el,
            { x: -travel / 2 },
            {
              x: travel / 2,
              ease: "none",
              scrollTrigger: {
                trigger: el.closest("[data-px-scope]") || el,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.6,
              },
            },
          );
        });
      });

      root.classList.add("motion-ready");
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return null;
}
