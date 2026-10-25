"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme || "dark");
  }, []);

  const apply = (next) => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
  };

  const toggle = (event) => {
    const next = theme === "dark" ? "light" : "dark";
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduce) return apply(next);

    // Новая тема раскрывается кругом из точки нажатия.
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const transition = document.startViewTransition(() => apply(next));
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 480, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" },
      );
    });
  };

  return (
    <button
      className="theme"
      type="button"
      role="switch"
      aria-checked={theme === "light"}
      aria-label="Светлая тема"
      onClick={toggle}
    >
      <span className="theme__knob" />
    </button>
  );
}
