import Link from "next/link";
import { str, type SectionInstance } from "./types";

const ALIGN_CLASS: Record<string, string> = { left: "text-left", center: "text-center", right: "text-right" };
const JUSTIFY_CLASS: Record<string, string> = { left: "justify-start", center: "justify-center", right: "justify-end" };

export function HeadingSection({ section }: { section: SectionInstance }) {
  const text = str(section.data, "text", "Heading");
  const align = str(section.data, "align", "center");
  return (
    <section className="xp-container py-6">
      <h2 className={`text-2xl sm:text-3xl font-extrabold text-slate-900 ${ALIGN_CLASS[align] ?? "text-center"}`}>{text}</h2>
    </section>
  );
}

export function TextSection({ section }: { section: SectionInstance }) {
  const text = str(section.data, "text", "");
  const align = str(section.data, "align", "left");
  if (!text) return null;
  return (
    <section className="xp-container py-4 max-w-3xl mx-auto">
      <p className={`text-slate-600 leading-relaxed ${ALIGN_CLASS[align] ?? "text-left"}`}>{text}</p>
    </section>
  );
}

export function ImageSection({ section }: { section: SectionInstance }) {
  const src = str(section.data, "src");
  const alt = str(section.data, "alt", "");
  if (!src) return null;
  return (
    <section className="xp-container py-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="w-full max-h-[520px] object-cover rounded-2xl" />
    </section>
  );
}

export function ButtonSection({ section }: { section: SectionInstance }) {
  const text = str(section.data, "text", "Click Here");
  const href = str(section.data, "href", "/shop");
  const align = str(section.data, "align", "center");
  return (
    <section className={`xp-container py-6 flex ${JUSTIFY_CLASS[align] ?? "justify-center"}`}>
      <Link href={href} className="xp-btn-primary px-6 py-3">
        {text}
      </Link>
    </section>
  );
}
