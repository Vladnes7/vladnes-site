import { approach, protoSites, works } from "@/lib/site";
import Clock from "./Clock";

// Иллюстрации карточек блока «Наш подход». У каждой своя сцена, которая оживает при наведении на карточку.
// Лента: первые экраны четырёх сайтов разных ниш вперемежку с нашими работами.
const reel = protoSites.flatMap((src, i) => [src, works[i % works.length].shots[0]]);

function Art({ id, rows }) {
  if (id === "prototype") {
    // Квадратные окна 524 px, как у visuvate.com: лента уходит за левый край карточки
    // и сдвигается вместе с прокруткой страницы (data-px, см. Motion.jsx).
    return (
      <div className="ap__reel" aria-hidden="true">
        <div className="ap__reel-track" data-px="-420">
          {reel.map((src, i) => (
            <figure className="ap__win" key={i}>
              <span className="ap__dots" />
              <img src={src} alt="" width="1600" height="1000" loading="lazy" />
            </figure>
          ))}
        </div>
      </div>
    );
  }
  if (id === "mobile") {
    // Два телефона: тело (phone-l / phone-r) наложено режимом screen поверх «экрана» с прозрачностью
    // (phone-*-screen: скриншот сайта, уже повёрнутый под наклон телефона). Слева — Diving David, справа — MAREA.
    // Экраны собраны в scripts/ из скриншотов public/works/*-m.webp; при замене сайтов их надо пересобрать.
    return (
      <div className="ap__phone" aria-hidden="true">
        {["r", "l"].map((side) => (
          <div className={`ap__ph ap__ph--${side}`} key={side}>
            <img className="ap__ph-screen" src={`/art/phone-${side}-screen.webp`} alt="" width="1024" height="1536" loading="lazy" />
            <img className="ap__ph-body" src={`/art/phone-${side}.webp`} alt="" width="1024" height="1536" loading="lazy" />
          </div>
        ))}
      </div>
    );
  }
  if (id === "leads") {
    // Условный пример: имя, дело и время придуманы для иллюстрации. Сцена по кругу проигрывается сама.
    return (
      <div className="ap__chat tg" aria-hidden="true">
        <div className="tg__bar">
          <span className="tg__ava">
            <svg viewBox="0 0 24 24">
              <path d="M21 4 3 11l6 2.5L11.5 20l3-4.5L19 18 21 4Z" />
              <path d="m9 13.5 12-9.5" />
            </svg>
          </span>
          <span>
            <b>Заявки</b>
            <small>бот · в сети</small>
          </span>
        </div>
        <div className="tg__body">
          <div className="tg__msg tg__msg--in">
            <b>Новая заявка</b>
            <dl>
              <div>
                <dt>Имя</dt>
                <dd>Анна</dd>
              </div>
              <div>
                <dt>Что нужно</dt>
                <dd>Запись на стрижку</dd>
              </div>
              <div>
                <dt>Когда</dt>
                <dd>Завтра, 14:00</dd>
              </div>
            </dl>
            <span className="tg__btns">
              <i className="tg__ok">Подтвердить</i>
              <i>Позвонить</i>
            </span>
            <time>14:02</time>
          </div>
          <div className="tg__msg tg__msg--out">
            Подтверждено, ждём Анну
            <time>14:02 ✓✓</time>
          </div>
        </div>
      </div>
    );
  }
  if (id === "check") {
    return (
      <div className="ap__laptop" aria-hidden="true">
        <div className="ap__device">
          <div className="ap__screen ap__screen--laptop">
            <img src={works[0].shots[0]} alt="" width="1280" height="800" loading="lazy" />
          </div>
          <img className="ap__frame" src="/art/laptop-frame.webp" alt="" width="1200" height="706" loading="lazy" />
        </div>
      </div>
    );
  }
  if (id === "yours") {
    return (
      <dl className="ap__table">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    );
  }
  return (
    <div className="ap__clock">
      <Clock />
    </div>
  );
}

export default function Approach() {
  return (
    <div className="ap" data-reveal>
      {approach.map((card) => (
        <article className={`ap__card ap__card--${card.id} beam`} key={card.id} data-px-scope>
          <div className="ap__copy">
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </div>
          <Art id={card.id} rows={card.rows} />
        </article>
      ))}
    </div>
  );
}
