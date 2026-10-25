"use client";

import { useEffect } from "react";

// Переход между страницами по образцу visuvate.com (разобран по кадрам 2026-10-15):
// экран закрывают пять вертикальных столбцов — каждый поднимается снизу, с задержкой 65 мс от соседа;
// по центру маленькая «V». На новой странице те же столбцы уходят вверх в том же порядке.
const COLS = 5;
const STAGGER_MS = 65;
const CLOSE_MS = 420;
const OPEN_MS = 450;
// Уходим со страницы, когда закрылся последний столбец.
const LEAVE_MS = CLOSE_MS + STAGGER_MS * (COLS - 1) + 60;
// Новая страница держит закрытый экран, пока не отрисуется, потом открывается.
const HOLD_MS = 160;

// Сайт статический, поэтому переход — обычная загрузка страницы. О том, что её надо «открыть»,
// новой странице сообщает запись в sessionStorage: её читает скрипт в <head> и ставит класс is-arriving
// до первой отрисовки, чтобы новая страница не мелькнула открытой.
export default function Transition() {
  useEffect(() => {
    const root = document.documentElement;

    // Ссылка вида /#faq с другой страницы: после загрузки докручиваем до раздела сами,
    // пока экран ещё закрыт, иначе браузер не всегда успевает и оставляет страницу наверху.
    const toHash = () => {
      if (!location.hash) return;
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) target.scrollIntoView({ behavior: "instant", block: "start" });
    };

    let timers = [];
    if (root.classList.contains("is-arriving")) {
      toHash();
      timers.push(
        setTimeout(() => {
          toHash();
          root.classList.add("is-opening");
        }, HOLD_MS),
        setTimeout(
          () => root.classList.remove("is-arriving", "is-opening"),
          HOLD_MS + OPEN_MS + STAGGER_MS * (COLS - 1) + 40,
        ),
      );
    } else if (location.hash) {
      timers.push(setTimeout(toHash, 60));
    }

    // Возврат кнопкой «назад» достаёт страницу из кеша в том виде, в каком её покинули.
    const onShow = (event) => {
      if (event.persisted) root.classList.remove("is-leaving", "is-arriving", "is-opening");
    };
    window.addEventListener("pageshow", onShow);

    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest?.("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname.startsWith("/demo/")) return;
      // Ссылка на раздел той же страницы — обычная прокрутка, без перехода.
      if (url.pathname === location.pathname) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      event.preventDefault();
      try {
        sessionStorage.setItem("arriving", "1");
      } catch {}
      root.classList.add("is-leaving");
      timers.push(
        setTimeout(() => {
          location.href = url.href;
        }, LEAVE_MS),
      );
    };
    document.addEventListener("click", onClick);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("pageshow", onShow);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div className="veil" aria-hidden="true">
      {Array.from({ length: COLS }, (_, i) => (
        <i key={i} style={{ "--i": i }} />
      ))}
      <img src="/brand/mark.png" alt="" width="229" height="197" />
    </div>
  );
}
