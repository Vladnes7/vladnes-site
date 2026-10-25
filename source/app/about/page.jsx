import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Swap from "@/components/Swap";
import { about } from "@/lib/pages";

export const metadata = {
  title: "О нас — Vladnes",
  description: about.lead,
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main id="main" className="page">
        <div className="wrap">
          <header className="phead">
            <h1 className="phead__title" data-split data-hero>
              О <em>нас</em>
            </h1>
            <p className="phead__lead" data-reveal data-reveal-self data-hero>
              {about.lead}
            </p>
          </header>

          <section className="story" data-reveal>
            {about.text.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>

          <section className="values">
            <h2 data-split>
              Как мы <em>работаем</em>
            </h2>
            <ol className="values__list" data-progress>
              {about.values.map(([title, text], i) => (
                <li key={title} data-reveal data-reveal-self>
                  <span className="values__n">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="cta" data-reveal>
            <h2>
              Покажем сайт <em>до оплаты</em>
            </h2>
            <div className="actions">
              <a className="btn btn--solid" href="/#lead">
                <Swap>Получить прототип бесплатно</Swap>
              </a>
              <a className="btn" href="/works/">
                <Swap>Смотреть работы</Swap>
              </a>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
