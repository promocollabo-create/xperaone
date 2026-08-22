import { arr, str, type SectionInstance } from "./types";

type BenefitItem = { icon?: string; title?: string; text?: string };

export default function BenefitsSection({ section }: { section: SectionInstance }) {
  const title = str(section.data, "title", "Why Choose XperaOne");
  const items = arr<BenefitItem>(section.data, "items");
  if (items.length === 0) return null;

  return (
    <section className="xp-container py-12 sm:py-16">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-center mb-10">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, i) => (
          <div key={i} className="xp-card p-6 text-center">
            <div className="text-3xl mb-3">{item.icon}</div>
            <h3 className="font-semibold text-slate-900 mb-1.5">{item.title}</h3>
            <p className="text-sm text-slate-500">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
