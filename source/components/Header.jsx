"use client";

import { useEffect, useState } from "react";
import { contacts, menuNav, nav } from "@/lib/site";
import Swap from "./Swap";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("top");

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Текущий раздел для точки в меню: тот, что пересекает линию на трети высоты экрана.
  useEffect(() => {
    // На внутренних страницах точка стоит у раздела, к которому относится адрес.
    const path = location.pathname;
    const inner = menuNav.find((item) => item.href.length > 2 && !item.href.includes("#") && path.startsWith(item.href));
    if (inner) setCurrent(inner.id);
    const sections = menuNav.map((item) => document.getElementById(item.id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setCurrent(e.target.id));
      },
      { rootMargin: "-33% 0px -66% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={`header${compact ? " is-compact" : ""}${open ? " is-open" : ""}`}>
      <div className="header__bar">
        <a className="logo" href="/#top" aria-label="Vladnes, наверх" onClick={() => setOpen(false)}>
          <img className="logo__mark" src="/brand/mark.png" alt="" width="229" height="197" />
          <img className="logo__word" src="/brand/word.png" alt="Vladnes" width="679" height="252" />
        </a>

        <nav className="header__nav" aria-label="Разделы">
          {nav.map((item) => (
            <a key={item.href} href={item.href}>
              <Swap>{item.label}</Swap>
            </a>
          ))}
        </nav>

        <div className="header__side">
          <ThemeToggle />
          <a className="btn btn--solid header__cta" href="/#lead">
            <Swap>Прототип бесплатно</Swap>
          </a>
          <button
            className="burger"
            type="button"
            aria-expanded={open}
            aria-controls="menu"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className="menu" id="menu" aria-hidden={!open} inert={!open}>
        <nav aria-label="Разделы, мобильное меню">
          {menuNav.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              className={current === item.id ? "is-current" : undefined}
              style={{ "--i": i }}
              onClick={() => setOpen(false)}
            >
              <span className="menu__n">{String(i + 1).padStart(2, "0")}</span>
              <span className="menu__w">
                <span className="menu__t">{item.label}</span>
              </span>
              <i aria-hidden="true" />
            </a>
          ))}
        </nav>
        <div className="menu__foot">
          <a
            className="btn btn--accent menu__cta"
            href={contacts.telegram}
            target="_blank"
            rel="noopener"
            onClick={() => setOpen(false)}
          >
            <Swap>Связаться в Telegram</Swap>
          </a>
          <p className="menu__contacts">
            <a href={contacts.whatsapp} target="_blank" rel="noopener">
              WhatsApp
            </a>
            <a href={contacts.phoneHref}>{contacts.phone}</a>
          </p>
        </div>
      </div>
    </header>
  );
}
