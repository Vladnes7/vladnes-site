import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { contacts, operator } from "@/lib/site";

export const metadata = {
  title: "Политика конфиденциальности — Vladnes",
  description: "Какие данные мы получаем через форму заявки на сайте Vladnes и что с ними делаем.",
};

export default function PrivacyPage() {
  const who = [operator.name, operator.status, operator.inn && `ИНН ${operator.inn}`].filter(Boolean).join(", ");

  return (
    <>
      <Header />
      <main id="main" className="page">
        <div className="wrap">
          <header className="phead">
            <h1 className="phead__title phead__title--small" data-split data-hero>
              Политика <em>конфиденциальности</em>
            </h1>
            <p className="phead__lead" data-reveal data-reveal-self data-hero>
              Какие данные мы получаем через форму на этом сайте и что с ними делаем.
            </p>
          </header>

          <article className="legal" data-reveal>
            <section>
              <h2>Кто обрабатывает данные</h2>
              <p>
                {who}. Связаться: <a href={`mailto:${contacts.email}`}>{contacts.email}</a>,{" "}
                <a href={contacts.phoneHref}>{contacts.phone}</a>.
              </p>
            </section>
            <section>
              <h2>Какие данные мы получаем</h2>
              <p>Только то, что вы сами пишете в форме заявки:</p>
              <ul>
                <li>имя;</li>
                <li>телефон, если вы его указали;</li>
                <li>описание вашего бизнеса.</li>
              </ul>
              <p>
                Сайт не использует счётчики посещений и рекламные метки. В браузере сохраняется только выбранная тема
                оформления, светлая или тёмная.
              </p>
            </section>
            <section>
              <h2>Зачем они нужны</h2>
              <p>Чтобы ответить на заявку, уточнить детали и собрать прототип сайта. Для рассылок данные не используются.</p>
            </section>
            <section>
              <h2>На каком основании</h2>
              <p>
                На основании вашего согласия: вы даёте его, когда отмечаете галочку под формой. Без галочки форма
                заявку не отправляет. Согласие добровольное, его можно отозвать в любой момент.
              </p>
            </section>
            <section>
              <h2>Как данные передаются и где хранятся</h2>
              <p>
                Форма отправляет заявку на наш сервер в России, сервер пересылает её нам сообщением в мессенджер
                Telegram. На самом сайте заявки не сохраняются. Получатель данных, кроме нас, один — сервис Telegram,
                через который приходит сообщение. Другим лицам данные не передаём, кроме случаев, когда этого требует
                закон.
              </p>
            </section>
            <section>
              <h2>Сколько храним</h2>
              <p>
                Пока идёт общение по заявке и работа над сайтом. По вашей просьбе удалим переписку с вашими данными
                раньше.
              </p>
            </section>
            <section>
              <h2>Ваши права</h2>
              <p>
                Вы можете узнать, какие ваши данные у нас есть, попросить исправить или удалить их и отозвать согласие
                на обработку. Для этого напишите на <a href={`mailto:${contacts.email}`}>{contacts.email}</a>, ответим
                и выполним просьбу в течение 10 рабочих дней.
              </p>
            </section>
            <section>
              <h2>Мессенджеры</h2>
              <p>
                Кнопки Telegram и WhatsApp ведут во внешние сервисы. Переписка в них идёт по правилам этих сервисов.
              </p>
            </section>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
