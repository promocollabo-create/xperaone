"use client";

import { useState } from "react";
import { str, type SectionInstance } from "./types";

export default function NewsletterSection({ section }: { section: SectionInstance }) {
  const title = str(section.data, "title", "Stay in the loop");
  const subtitle = str(section.data, "subtitle");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="xp-container py-12 sm:py-16">
      <div className="xp-card p-8 sm:p-12 text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-extrabold text-slate-900">{title}</h2>
        {subtitle && <p className="text-slate-500 mt-2">{subtitle}</p>}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="xp-input"
          />
          <button type="submit" disabled={status === "loading"} className="xp-btn-primary px-6 py-2.5 shrink-0">
            {status === "loading" ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
        {status === "done" && <p className="text-emerald-600 text-sm mt-3">Thanks for subscribing! 🎉</p>}
        {status === "error" && <p className="text-red-600 text-sm mt-3">Something went wrong. Try again.</p>}
      </div>
    </section>
  );
}
