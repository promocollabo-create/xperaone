import Link from "next/link";
import { str, type SectionInstance } from "./types";

export default function BannerSection({ section }: { section: SectionInstance }) {
  const title = str(section.data, "title", "Special Offer");
  const subtitle = str(section.data, "subtitle");
  const ctaText = str(section.data, "ctaText", "Shop Now");
  const ctaHref = str(section.data, "ctaHref", "/shop");

  return (
    <section className="xp-container py-6 sm:py-8">
      <div className="xp-gradient-bg rounded-3xl px-6 sm:px-12 py-10 sm:py-14 text-white flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold">{title}</h2>
          {subtitle && <p className="mt-2 text-purple-100 max-w-lg">{subtitle}</p>}
        </div>
        <Link href={ctaHref} className="bg-white text-purple-700 font-bold px-6 py-3 rounded-xl hover:bg-purple-50 transition shrink-0">
          {ctaText}
        </Link>
      </div>
    </section>
  );
}
