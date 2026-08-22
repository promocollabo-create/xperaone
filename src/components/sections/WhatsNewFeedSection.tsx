import Link from "next/link";
import { getPublishedWhatsNew } from "@/lib/data/whatsNew";
import { formatDateShort } from "@/lib/utils";
import { num, str, type SectionInstance } from "./types";

const TYPE_LABEL: Record<string, string> = {
  announcement: "Announcement",
  news: "News",
  product_release: "Product Release",
  update: "Update",
  offer: "Offer",
};

export default async function WhatsNewFeedSection({ section }: { section: SectionInstance }) {
  const limit = num(section.data, "limit", 3);
  const items = await getPublishedWhatsNew(limit);
  if (items.length === 0) return null;
  const title = str(section.data, "title", "What's New at XperaOne");

  return (
    <section className="xp-container py-12 sm:py-16">
      <div className="flex items-end justify-between mb-8 gap-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{title}</h2>
        <Link href="/whats-new" className="text-sm font-semibold text-purple-700 hover:underline shrink-0">
          View All →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {items.map((item) => (
          <Link key={item.id} href={`/whats-new/${item.slug}`} className="xp-card p-5 flex flex-col hover:-translate-y-0.5 transition">
            <span className="xp-badge bg-purple-100 text-purple-700 self-start mb-3">{TYPE_LABEL[item.type] ?? item.type}</span>
            <h3 className="font-semibold text-slate-900 line-clamp-2">{item.title}</h3>
            <p className="text-xs text-slate-500 mt-2">{item.publishedAt ? formatDateShort(item.publishedAt) : ""}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
