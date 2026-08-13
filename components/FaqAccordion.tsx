"use client";

import { useState } from "react";
import type { Faq } from "@/types/database";

export default function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  if (faqs.length === 0) return null;

  return (
    <section className="section faq-section">
      <div className="container faq-container">
        <span className="eyebrow">Support</span>
        <h2>Frequently Asked Questions</h2>

        <div className="faq-list">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} className={`faq-item ${isOpen ? "open" : ""}`}>
                <button
                  className="faq-question"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  aria-expanded={isOpen}
                >
                  {faq.question}
                  <span className="chevron">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && <p className="faq-answer">{faq.answer}</p>}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .faq-container { max-width: 760px; }
        .faq-container h2 { margin: 6px 0 28px; font-size: 28px; }
        .faq-list { display: flex; flex-direction: column; gap: 10px; }
        .faq-item { border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden; }
        .faq-question {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: none;
          border: none;
          padding: 16px 18px;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 15px;
          color: var(--navy);
          text-align: left;
        }
        .faq-item.open .faq-question { color: var(--blue); }
        .chevron { font-size: 18px; color: var(--blue); }
        .faq-answer { padding: 0 18px 16px; font-size: 14px; }
      `}</style>
    </section>
  );
}
