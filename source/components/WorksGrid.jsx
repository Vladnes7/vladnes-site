"use client";

import { useState } from "react";
import WorkCard from "./WorkCard";

// Каталог работ: фильтр по отрасли и сетка карточек. Карточка целиком ведёт на страницу работы,
// кнопка «Открыть сайт» — на сам сайт.
export default function WorksGrid({ works }) {
  const filters = ["Все", ...new Set(works.map((w) => w.industry))];
  const [active, setActive] = useState("Все");
  const shown = active === "Все" ? works : works.filter((w) => w.industry === active);

  return (
    <>
      <ul className="filters" aria-label="Отрасль" data-reveal data-hero>
        {filters.map((f) => (
          <li key={f}>
            <button type="button" className={f === active ? "is-active" : undefined} aria-pressed={f === active} onClick={() => setActive(f)}>
              {f}
            </button>
          </li>
        ))}
      </ul>
      <ul className="wgrid">
        {shown.map((w) => (
          <WorkCard work={w} key={w.id} />
        ))}
      </ul>
    </>
  );
}
