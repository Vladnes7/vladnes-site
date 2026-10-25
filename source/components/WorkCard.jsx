import Swap from "./Swap";

// Карточка работы. Общая для главной и каталога: карточка целиком ведёт на страницу работы,
// кнопка «Открыть сайт» — на сам сайт.
export default function WorkCard({ work: w, heading: H = "h2" }) {
  return (
    <li className="wcard beam">
      <a className="wcard__shot" href={`/works/${w.id}/`} aria-label={`${w.title}: смотреть проект`}>
        <img src={w.shots[0]} alt="" width="1600" height="1000" loading="lazy" />
        <span aria-hidden="true">Смотреть проект</span>
      </a>
      <div className="wcard__foot">
        <div>
          <H>{w.title}</H>
          <p>{w.industry}</p>
        </div>
        <a className="btn btn--small" href={w.href} target="_blank" rel="noopener">
          <Swap>{w.linkLabel}</Swap>
          <span className="sr">: {w.title}</span>
        </a>
      </div>
    </li>
  );
}
