"use client";

import { useState } from "react";
import { faq } from "@/lib/site";

export default function Faq() {
  const [open, setOpen] = useState(-1);

  return (
    <div className="faq" data-reveal>
      {faq.map((item, i) => {
        const isOpen = open === i;
        return (
          <div className={`faq__row${isOpen ? " is-open" : ""}`} key={item.q}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-${i}`}
                id={`faq-btn-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span>
                  <b>{i + 1}.</b> {item.q}
                </span>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </h3>
            <div className="faq__panel" id={`faq-${i}`} role="region" aria-labelledby={`faq-btn-${i}`}>
              <div>
                <p>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
