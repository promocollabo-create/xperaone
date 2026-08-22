import Link from "next/link";
import { str, type SectionInstance } from "./types";

export default function HeroSection({ section }: { section: SectionInstance }) {
  const { data } = section;
  const title = str(data, "title", "Premium Digital Products for Modern Creators");
  const subtitle = str(data, "subtitle", "");
  const ctaText = str(data, "ctaText", "Shop the Store");
  const ctaHref = str(data, "ctaHref", "/shop");
  const secondaryCtaText = str(data, "secondaryCtaText");
  const secondaryCtaHref = str(data, "secondaryCtaHref", "#");
  const image = str(data, "image", "/images/hero-bg.jpg");

  return (
    <section className="relative overflow-hidden bg-[#150f28] text-white">
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#150f28] via-[#1f1240]/90 to-[#2c1568]/60" />
      </div>
      <div className="relative xp-container py-20 sm:py-28">
        <div className="max-w-2xl">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-purple-300 bg-white/10 px-3 py-1 rounded-full mb-5">
            Digital Marketplace
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">{title}</h1>
          {subtitle && <p className="mt-5 text-slate-300 text-base sm:text-lg max-w-xl">{subtitle}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={ctaHref} className="xp-btn-primary px-6 py-3 text-sm sm:text-base">
              {ctaText}
            </Link>
            {secondaryCtaText && (
              <Link
                href={secondaryCtaHref}
                className="px-6 py-3 rounded-xl text-sm sm:text-base font-semibold border border-white/30 hover:bg-white/10 transition"
              >
                {secondaryCtaText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
