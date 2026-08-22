"use client";

import { useState } from "react";
import { arr, str, type SectionInstance } from "./types";

type FaqItem = { q?: string; a?: string };

export default function FaqSection({ section }: { section: SectionInstance }) {
  const title = str(section.data, "title", "Frequently Asked Questions");
  const items = arr<FaqItem>(section.data, "items");
  const [open, setOpen] = useState<number | null>(0);
  if (items.length === 0) return null;

  return (
    <section className="xp-container py-12 sm:py-16 max-w-3xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-center mb-8">{title}</h2>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="xp-card overflow-hidden">
            <button
              className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="font-semibold text-slate-800 text-sm sm:text-base">{item.q}</span>
              <span className="text-purple-600 text-xl shrink-0">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && <div className="px-5 pb-4 text-sm text-slate-500">{item.a}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
