import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ServiceIcon from "@/components/ServiceIcon";
import Swap from "@/components/Swap";
import { servicePages } from "@/lib/pages";
import { plans, services } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const service = services.find((s) => s.id === id);
  return service ? { title: `${service.title} — Vladnes`, description: servicePages[id].lead } : {};
}

export default async function ServicePage({ params }) {
  const { id } = await params;
  const service = services.find((s) => s.id === id);
  const page = servicePages[id];
  if (!service || !page) notFound();
  const plan = plans.find((p) => p.id === page.plan);
  const others = services.filter((s) => s.id !== id);

  return (
    <>
      <Header />
      <main id="main" className="page">
        <div className="wrap">
          <header className="phead">
            <a className="phead__back" href="/#services" data-reveal data-reveal-self data-hero data-delay="0">
              Все услуги
            </a>
            <h1 className="phead__title" data-split data-hero>
              {/* Неразрывный дефис: «Онлайн-запись» не рвётся на две строки по дефису. */}
              {service.title.replace("-", "\u2011")}
            </h1>
            <p className="phead__lead" data-reveal data-reveal-self data-hero>
              {page.lead}
            </p>
          </header>

          <section className="sgrid" data-reveal>
            <div className="scard beam">
              <h2>Что входит</h2>
              <ul className="ticks">
                {page.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <aside className="scard scard--price beam">
              <h2>Стоимость</h2>
              <p className="scard__price">
                {plan ? "от " : ""}
                {plan ? plan.price : page.price} <span className="cur">₽</span>
              </p>
              <p className="scard__note">{plan ? `Пакет «${plan.name}», срок ${plan.term}` : page.priceNote}</p>
              <p className="scard__note">{page.planNote}</p>
              <a className="btn btn--solid" href="/#lead">
                <Swap>Получить прототип бесплатно</Swap>
              </a>
            </aside>
          </section>

          <section className="how">
            <h2 data-split>
              Как это <em>работает</em>
            </h2>
            <ol className="steps" data-progress>
              {page.how.map(([title, text], i) => (
                <li key={title} data-reveal data-reveal-self>
                  <span className="steps__n">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="more">
            <h2 data-split>
              Другие <em>услуги</em>
            </h2>
            <ul className="svc" data-reveal>
              {others.slice(0, 4).map((s) => (
                <li className="svc__card beam" key={s.id}>
                  <span className="dots" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
                  <ServiceIcon name={s.icon} />
                  <h3>
                    <a className="cover" href={`/services/${s.id}/`}>
                      {s.title}
                    </a>
                  </h3>
                  <p>{s.text}</p>
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
