import { notFound } from "next/navigation";
import Carousel from "@/components/Carousel";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ListIcon from "@/components/ListIcon";
import Swap from "@/components/Swap";
import { workBuilt, workPages } from "@/lib/pages";
import { works } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return works.map((w) => ({ id: w.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const work = works.find((w) => w.id === id);
  return work ? { title: `${work.title} — ${work.kind} — Vladnes`, description: workPages[id].overview } : {};
}

const icons = {
  industry: "M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.500C5 14.800 12 21 12 21Zm0-9a2.500 2.500 0 1 0 0-5 2.500 2.500 0 0 0 0 5Z",
  format: "M4 5h16v14H4zM4 9h16M8 5v4",
  pages: "M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5",
  stack: "m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5",
};

export default async function WorkPage({ params }) {
  const { id } = await params;
  const work = works.find((w) => w.id === id);
  const page = workPages[id];
  if (!work || !page) notFound();
  const others = works.filter((w) => w.id !== id);
  const meta = [
    ["industry", work.industry, "Отрасль"],
    ["format", work.format, "Формат"],
    ["pages", work.pageCount, "Страниц"],
    ["stack", work.stack, "Технологии"],
  ];
  const parts = [
    ["Задача", page.task],
    ["Подход", page.approach],
    ["Что получилось", page.outcome],
  ];

  return (
    <>
      <Header />
      <main id="main" className="page page--work">
        <div className="wrap">
          <h1 className="work__title" data-split data-hero>
            {work.title}
          </h1>

          <section className="overview" data-reveal data-hero>
            <div className="overview__text">
              <h2>О проекте</h2>
              <p>{page.overview}</p>
            </div>
            <div className="actions">
              <a className="btn btn--small" href="/works/">
                <Swap>Все работы</Swap>
              </a>
              <a className="btn btn--solid btn--small" href={work.href} target="_blank" rel="noopener">
                <Swap>{work.linkLabel}</Swap>
              </a>
            </div>
          </section>

          <dl className="wmeta" data-reveal data-hero data-delay="0.75">
            {meta.map(([icon, value, label]) => (
              <div key={label}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d={icons[icon]} />
                </svg>
                <dd>{value}</dd>
                <dt>{label}</dt>
              </div>
            ))}
          </dl>
        </div>

        <Carousel shots={work.shots} title={work.title} />

        <div className="wrap">
          <section className="tri" data-reveal>
            {parts.map(([title, text]) => (
              <article className="tri__card beam" key={title}>
                <h2>{title}</h2>
                <p>{text}</p>
              </article>
            ))}
          </section>

          <section className="wabout">
            <div className="wabout__text" data-reveal>
              <h2>Подробнее о проекте</h2>
              {page.about.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <aside className="wabout__side" data-reveal>
              <div>
                <h3>{work.pageCount === "1" ? "Разделы" : "Страницы"}</h3>
                <ul>
                  {page.pages.map((p) => (
                    <li key={p}>
                      <ListIcon label={p} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Возможности</h3>
                <ul>
                  {page.features.map((f) => (
                    <li key={f}>
                      <ListIcon label={f} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </section>

          {workBuilt[work.id] && (
            <section className="wbuilt" data-reveal>
              <h2>Как мы собирали</h2>
              <ol>
                {workBuilt[work.id].map(([title, text], i) => (
                  <li key={title}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="more">
            <div className="more__head">
              <h2>Другие работы</h2>
              <a className="btn btn--small" href="/works/">
                <Swap>Все работы</Swap>
              </a>
            </div>
            <ul className="mgrid" data-reveal>
              {others.map((w) => (
                <li className="wcard beam" key={w.id}>
                  <a className="wcard__shot" href={`/works/${w.id}/`} aria-label={`${w.title}: смотреть проект`}>
                    <img src={w.shots[0]} alt="" width="1600" height="1000" loading="lazy" />
                    <span aria-hidden="true">Смотреть проект</span>
                  </a>
                  <div className="wcard__foot">
                    <div>
                      <h3>{w.title}</h3>
                      <p>{w.industry}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
