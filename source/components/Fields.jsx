"use client";

import { useState } from "react";
import { industries, works } from "@/lib/site";

// Для отраслей, где у нас есть настоящий сайт, показываем его первый экран как пример.
const example = {
  "Кафе и рестораны": "marea",
  "Клиники и стоматологии": "avelia",
  "Логистика и перевозки": "yalk",
  "Недвижимость": "archipila",
  "Инструкторы и частные мастера": "daviddive",
};

// Выбор отрасли слева, справа «как было → что получает клиент». Формат подсказывает, что список не закрытый.
export default function Fields() {
  // Открываем первую отрасль, для которой есть пример сайта: так панель сразу с картинкой.
  const [active, setActive] = useState(() => Math.max(0, industries.findIndex(([n]) => example[n])));
  const [name, before, after] = industries[active];
  const work = works.find((w) => w.id === example[name]);

  return (
    <div className="fsel" data-reveal>
      <ul className="fsel__tabs" aria-label="Отрасль">
        {industries.map(([n], i) => (
          <li key={n}>
            <button
              type="button"
              className={i === active ? "is-active" : undefined}
              aria-pressed={i === active}
              onClick={() => setActive(i)}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              {n}
            </button>
          </li>
        ))}
      </ul>

      <div className="fsel__panel beam" aria-live="polite">
        <div className="fsel__text" key={name}>
          <h3>{name}</h3>
          <p className="fsel__before">
            <small>Сейчас</small>
            {before}
          </p>
          <p className="fsel__after">
            <small>С нашим сайтом</small>
            {after}
          </p>
        </div>
        {work ? (
          <a className="fsel__shot" key={work.id} href={`/works/${work.id}/`}>
            <img src={work.shots[0]} alt="" width="1600" height="1000" loading="lazy" />
            <span>
              Пример: {work.title}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </a>
        ) : (
          <p className="fsel__none">Своего примера для этой отрасли в портфолио пока нет. Соберём прототип и покажем.</p>
        )}
      </div>
    </div>
  );
}
