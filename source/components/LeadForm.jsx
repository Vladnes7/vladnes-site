"use client";

import { useState } from "react";
import { contacts, leadUrl } from "@/lib/site";
import Swap from "./Swap";

const ERRORS = {
  business: "Напишите пару слов о бизнесе, без этого прототип не собрать.",
  consent: "Отметьте согласие на обработку данных, без него заявку отправить нельзя.",
  rate: "Слишком много заявок подряд. Попробуйте через несколько минут или напишите нам в мессенджер.",
  send: "Не получилось отправить. Напишите нам в Telegram или WhatsApp, кнопки ниже.",
};

// Форма заявки. Отправляет данные обработчику на сервере (server/lead.mjs), тот пересылает их в Telegram.
// Ключа бота в коде страницы нет. Если сервер не ответил, остаются прямые ссылки на мессенджеры.
export default function LeadForm() {
  const [state, setState] = useState("idle"); // idle | sending | done
  const [error, setError] = useState(null); // { field, text }

  const fail = (field, key) => {
    setError({ field, text: ERRORS[key] });
    setState("idle");
  };

  const send = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const business = String(data.get("business") || "").trim();
    if (!business) {
      fail("business", "business");
      form.elements.business.focus();
      return;
    }
    if (!data.get("consent")) {
      fail("consent", "consent");
      form.elements.consent.focus();
      return;
    }
    setError(null);
    setState("sending");
    try {
      const response = await fetch(leadUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") || "").trim(),
          phone: String(data.get("phone") || "").trim(),
          business,
          website: String(data.get("website") || ""),
          consent: true,
        }),
      });
      if (response.ok) return setState("done");
      fail("form", response.status === 429 ? "rate" : "send");
    } catch {
      fail("form", "send");
    }
  };

  if (state === "done") {
    return (
      <div className="lead__form lead__done" role="status">
        <h3>Заявка у нас</h3>
        <p>Ответим в ближайшее время и уточним детали. Если удобнее, напишите нам сразу в мессенджер.</p>
        <div className="lead__send">
          <a className="btn" href={contacts.telegram} target="_blank" rel="noopener">
            <Swap>Написать в Telegram</Swap>
          </a>
          <a className="btn" href={contacts.whatsapp} target="_blank" rel="noopener">
            <Swap>Написать в WhatsApp</Swap>
          </a>
        </div>
      </div>
    );
  }

  const invalid = (field) => (error?.field === field ? "true" : undefined);

  return (
    <form className="lead__form" onSubmit={send} noValidate>
      <div className="field">
        <label htmlFor="lead-name">Как к вам обращаться</label>
        <input id="lead-name" name="name" type="text" autoComplete="given-name" placeholder="Имя" maxLength={80} />
      </div>
      <div className="field">
        <label htmlFor="lead-phone">Телефон, по желанию</label>
        <input id="lead-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+7" maxLength={40} />
      </div>
      <div className="field field--wide">
        <label htmlFor="lead-business">Что за бизнес</label>
        <textarea
          id="lead-business"
          name="business"
          rows="3"
          maxLength={1200}
          placeholder="Например: барбершоп, два мастера, нужна запись"
          aria-describedby={error?.field === "business" ? "lead-error" : undefined}
          aria-invalid={invalid("business")}
        />
      </div>
      {/* Поле-ловушка для роботов: людям не видно и не читается программами чтения. */}
      <div className="field--trap" aria-hidden="true">
        <label htmlFor="lead-website">Сайт</label>
        <input id="lead-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="consent">
        <input
          type="checkbox"
          name="consent"
          aria-describedby={error?.field === "consent" ? "lead-error" : undefined}
          aria-invalid={invalid("consent")}
        />
        <span>
          Даю согласие на обработку моих персональных данных, чтобы получить ответ на заявку, по{" "}
          <a href="/privacy/">политике конфиденциальности</a>. Согласие можно отозвать в любой момент.
        </span>
      </label>
      {error ? (
        <p className="field__error" id="lead-error" role="alert">
          {error.text}
        </p>
      ) : null}
      <div className="lead__send">
        <button className="btn btn--solid" type="submit" disabled={state === "sending"}>
          <Swap>{state === "sending" ? "Отправляем" : "Отправить заявку"}</Swap>
        </button>
      </div>
      <div className="lead__hint">
        <span className="lead__plane" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M21 4 3 11l6 2.5L11.5 20l3-4.5L19 18 21 4Z" />
            <path d="m9 13.5 12-9.5" />
          </svg>
        </span>
        <p>Заявка сразу приходит нам в Telegram. Или напишите сами:</p>
        <span className="lead__alt">
          <a href={contacts.telegram} target="_blank" rel="noopener">
            Telegram
          </a>
          <a href={contacts.whatsapp} target="_blank" rel="noopener">
            WhatsApp
          </a>
        </span>
      </div>
    </form>
  );
}
