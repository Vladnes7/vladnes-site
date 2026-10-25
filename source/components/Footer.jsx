import { contacts, nav, services } from "@/lib/site";
import HalftoneWordmark from "./HalftoneWordmark";

const channels = [
  { label: "Telegram", href: contacts.telegram, external: true },
  { label: "WhatsApp", href: contacts.whatsapp, external: true },
  { label: "Почта", href: `mailto:${contacts.email}` },
  { label: "Позвонить", href: contacts.phoneHref },
];

// Подвал: сверху ряд каналов связи и колонки ссылок, внизу огромное слово vladnes из полутоновых точек
// (HalftoneWordmark), обрезанное нижним краем страницы.
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__body">
        <ul className="footer__channels wrap">
          {channels.map((c) => (
            <li key={c.label}>
              <a href={c.href} {...(c.external ? { target: "_blank", rel: "noopener" } : {})}>
                <span>{c.label}</span>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </li>
          ))}
        </ul>
        <div className="footer__cols wrap">
          <div>
            <h2>Разделы</h2>
            <ul>
              {nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Услуги</h2>
            <ul>
              {services.slice(0, 5).map((s) => (
                <li key={s.id}>
                  <a href={`/services/${s.id}/`}>{s.title}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Ещё</h2>
            <ul>
              {services.slice(5).map((s) => (
                <li key={s.id}>
                  <a href={`/services/${s.id}/`}>{s.title}</a>
                </li>
              ))}
              <li>
                <a href="/#lead">Бесплатный прототип</a>
              </li>
            </ul>
          </div>
          <div>
            <h2>Контакты</h2>
            <ul>
              <li>
                <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
              </li>
              <li>
                <a href={contacts.phoneHref}>{contacts.phone}</a>
              </li>
              <li>
                <a href={contacts.telegram} target="_blank" rel="noopener">
                  Telegram {contacts.telegramHandle}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className="footer__legal wrap">
          © 2026 Vladnes. Кнопки Telegram и WhatsApp ведут во внешние мессенджеры. Информация и цены на сайте не
          являются публичной офертой. <a href="/privacy/">Политика конфиденциальности</a>
        </p>
      </div>
      <HalftoneWordmark />
    </footer>
  );
}
