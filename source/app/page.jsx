import Approach from "@/components/Approach";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroShader from "@/components/HeroShader";
import Fields from "@/components/Fields";
import LeadForm from "@/components/LeadForm";
import LogoCloud from "@/components/LogoCloud";
import ServiceIcon from "@/components/ServiceIcon";
import SonicWave from "@/components/SonicWave";
import Swap from "@/components/Swap";
import WorkCard from "@/components/WorkCard";
import { contacts, directions, hero, plans, posterRows, services, steps, works } from "@/lib/site";

// На главной показываем шесть работ, остальные — на странице «Работы».
const homeWorks = works.slice(0, 6);

export default function Page() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="hero" id="top">
          <HeroShader />
          <div className="wrap hero__copy">
            <p className="badge" data-reveal data-reveal-self data-hero data-delay="0">
              {hero.badge}
            </p>
            <h1 data-split data-hero data-gradient>
              Сайты <em>и автоматизация</em>
              <br />
              для вашего <em>бизнеса</em>
            </h1>
            <div className="hero__sub" data-reveal data-hero>
              <p>{hero.lead}</p>
              <div className="actions">
                <a className="btn btn--solid" href="#lead">
                  <Swap>{hero.cta}</Swap>
                </a>
                <a className="btn" href="#works">
                  <Swap>Смотреть работы</Swap>
                </a>
              </div>
            </div>
          </div>
          <dl className="wrap hero__stats" data-reveal data-hero data-delay="0.9">
            {hero.stats.map((s) => (
              <div key={s.value}>
                <dt>{s.value}</dt>
                <dd>{s.label}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="intro" data-px-scope>
          <div className="strips" aria-hidden="true">
            {posterRows.map((row, r) => (
              <div className="strip" key={r} data-px={r % 2 ? 260 : -260}>
                {row.map((src, i) => (
                  <img key={i} src={src} alt="" width="1200" height="800" loading="lazy" />
                ))}
              </div>
            ))}
          </div>
          <div className="intro__scrim" aria-hidden="true" />
          <div className="wrap intro__grid">
            <div className="intro__text">
              <h2 data-split>
                Сайт сначала.
                <br />
                <em>Деньги потом.</em>
              </h2>
              <div data-reveal>
                <p>
                  Обычно за сайт платят вперёд и надеются на результат. Мы работаем наоборот: собираем рабочий
                  прототип под ваш бизнес и присылаем ссылку. Понравилось — называем сумму и доводим до запуска. Не
                  понравилось — вы ничего не должны.
                </p>
                <div className="actions">
                  <a className="btn btn--solid" href="#lead">
                    <Swap>{hero.cta}</Swap>
                  </a>
                  <a className="btn" href="#steps">
                    <Swap>Как это проходит</Swap>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="works" id="works" aria-labelledby="works-title">
          <div className="wrap">
            <div className="head">
              <h2 id="works-title" data-split>
                Наши <em>работы</em>
              </h2>
              <p className="lead" data-reveal data-reveal-self>
                Сайты, которые мы собрали. Откройте любой: это рабочие сайты, а не картинки.
              </p>
            </div>
            <ul className="wgrid wgrid--home" data-reveal>
              {homeWorks.map((w) => (
                <WorkCard work={w} heading="h3" key={w.id} />
              ))}
            </ul>
            <div className="works__more" data-reveal>
              <a className="btn btn--solid" href="/works/">
                <Swap>Смотреть другие работы</Swap>
              </a>
            </div>
          </div>
        </section>

        <section className="services" id="services">
          <div className="wrap">
            <div className="head">
              <h2 data-split>
                Выведите бизнес
                <br />
                на новый <em>уровень</em>
              </h2>
              <div className="actions" data-reveal>
                <a className="btn btn--solid" href="#pricing">
                  <Swap>Пакеты и цены</Swap>
                </a>
                <a className="btn" href="#lead">
                  <Swap>Начать проект</Swap>
                </a>
              </div>
            </div>
            <ul className="svc" data-reveal>
              {services.map((s) => (
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
          </div>
        </section>

        <section className="approach" id="approach">
          <div className="wrap">
            <h2 className="approach__title" data-split>
              Наш <em>подход</em>
            </h2>
            <Approach />
          </div>
        </section>

        <section className="process" id="steps">
          <div className="wrap process__grid">
            <div className="process__head">
              <h2 data-split>
                Как это <em>проходит</em>
              </h2>
              <p className="lead" data-reveal data-reveal-self>
                Четыре шага. Счёт появляется только после третьего, когда вы уже видели сайт.
              </p>
            </div>
            <ol className="steps" data-progress>
              {steps.map((s, i) => (
                <li key={s.title} data-reveal data-reveal-self>
                  <span className="steps__n">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                  <span className="steps__meta">{s.meta}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="fields" id="fields">
          <div className="wrap">
            <div className="head">
              <h2 data-split>
                Кому это <em>подходит</em>
              </h2>
              <p className="lead" data-reveal data-reveal-self>
                Запись устроена одинаково у автосервиса и стоматологии, калькулятор нужен и типографии, и строителям.
                Меняется вывеска, а не суть.
              </p>
            </div>
            <Fields />
            <div className="fields__more" data-reveal>
              <p>
                Вашей сферы нет в списке? Тем интереснее. Расскажите о бизнесе, соберём прототип и проверим на деле.
              </p>
              <a className="btn btn--solid" href="#lead">
                <Swap>Рассказать о бизнесе</Swap>
              </a>
            </div>
          </div>
        </section>

        <section className="tools" aria-labelledby="tools-title">
          <div className="wrap">
            <h2 className="tools__title" id="tools-title" data-split>
              С чем мы <em>работаем</em>
            </h2>
            <div data-reveal data-reveal-self>
              <LogoCloud />
            </div>
          </div>
        </section>

        <div className="marquee" aria-hidden="true">
          <ul>
            {[...directions, ...directions, ...directions].map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>

        <section className="pricing" id="pricing">
          <div className="wrap">
            <h2 className="display" data-split>
              Цены
            </h2>
            <p className="pricing__note" data-reveal data-reveal-self>
              Любой пакет начинается с бесплатного прототипа. Пересборка сайта стоит столько же. Платите, только когда
              сайт вас устроил.
            </p>
            <div className="plans" data-reveal>
              {plans.map((p) => (
                <article className={`plan beam${p.featured ? " is-featured" : ""}`} key={p.id}>
                  <h3>{p.name}</h3>
                  <p className="plan__price">
                    <span data-count={p.price.replace(/\s/g, "")}>{p.price}</span> <span className="cur">₽</span>
                  </p>
                  <p className="plan__lead">{p.lead}</p>
                  <ul>
                    {p.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <div className="plan__foot">
                    <a className="btn btn--solid" href="#lead">
                      <Swap>Начать с прототипа</Swap>
                      <span className="sr">, пакет «{p.name}»</span>
                    </a>
                    <span>Срок: {p.term}</span>
                  </div>
                </article>
              ))}
            </div>
            <p className="extras__lead" data-reveal>
              После запуска у каждого сайта один из двух вариантов обслуживания. Выберите, какой удобнее, и смените его в
              любой момент.
            </p>
            <div className="extras" data-reveal>
              <article className="extra extra--support beam">
                <div className="extra__price">
                  <span className="extra__tag">Хостинг и сохранность сайта</span>
                  <p>
                    10 000 <span className="cur">₽</span>
                    <small> в год</small>
                  </p>
                  <small className="extra__sub">Вариант А. Сайт остаётся без изменений.</small>
                </div>
                <ul>
                  <li>Размещение сайта и резервные копии</li>
                  <li>Продление сертификата безопасности</li>
                  <li>Исправление неисправностей по нашей части</li>
                </ul>
              </article>
              <article className="extra extra--monthly beam">
                <div className="extra__price">
                  <span className="extra__tag">Ежемесячная поддержка</span>
                  <p>
                    3 000 <span className="cur">₽</span>
                    <small> в месяц</small>
                  </p>
                  <small className="extra__sub">Вариант Б. Хостинг уже включён.</small>
                </div>
                <ul>
                  <li>Всё из варианта А: размещение, копии, сертификат</li>
                  <li>Новые блоки на сайте</li>
                  <li>Публикация новостей, акций, цен и фото</li>
                  <li>Правка текстов и контактов</li>
                </ul>
              </article>
              <article className="extra">
                <div className="extra__price">
                  <span className="extra__tag">Домен</span>
                  <p>
                    200–400 <span className="cur">₽</span>
                    <small> в год</small>
                  </p>
                </div>
                <p className="extra__text">
                  Два варианта: лучше всего оформить на нас, и передадим вам в любой момент. Или сразу на вас, тогда
                  платите регистратору сами.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="faqs" id="faq">
          <div className="wrap faqs__grid">
            <h2 data-split>
              Частые <em>вопросы</em>
            </h2>
            <Faq />
          </div>
        </section>

        <section className="lead-sec" id="lead">
          <div className="glow" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <SonicWave />
          <div className="wrap lead-sec__grid">
            <div className="lead-sec__copy">
              <h2 data-split>
                Покажем сайт
                <br />
                <em>до оплаты</em>
              </h2>
              <p className="lead" data-reveal data-reveal-self>
                Расскажите о бизнесе. Через 2–5 дней пришлём ссылку на рабочий прототип. Понравится — запускаем. Нет
                — вы ничего не должны.
              </p>
              <ul className="lead-sec__direct" data-reveal>
                <li>
                  <a href={contacts.telegram} target="_blank" rel="noopener">
                    Telegram {contacts.telegramHandle}
                  </a>
                </li>
                <li>
                  <a href={contacts.phoneHref}>{contacts.phone}</a>
                </li>
                <li>
                  <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
                </li>
              </ul>
            </div>
            <div data-reveal data-reveal-self>
              <LeadForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
