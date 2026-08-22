import Link from "next/link";
import { str, type SectionInstance } from "./types";

export default function CtaSection({ section }: { section: SectionInstance }) {
  const title = str(section.data, "title", "Ready to build something amazing?");
  const subtitle = str(section.data, "subtitle");
  const ctaText = str(section.data, "ctaText", "Explore the Shop");
  const ctaHref = str(section.data, "ctaHref", "/shop");

  return (
    <section className="xp-container py-12 sm:py-16 text-center">
      <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 max-w-2xl mx-auto">{title}</h2>
      {subtitle && <p className="mt-4 text-slate-500 max-w-xl mx-auto">{subtitle}</p>}
      <Link href={ctaHref} className="xp-btn-primary inline-block mt-7 px-8 py-3.5">
        {ctaText}
      </Link>
    </section>
  );
}
