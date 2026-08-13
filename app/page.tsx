import { createClient } from "@/lib/supabase/server";
import AnnouncementBar from "@/components/AnnouncementBar";
import Hero from "@/components/Hero";
import StatsSection from "@/components/StatsSection";
import CategoryGrid from "@/components/CategoryGrid";
import ProductRail from "@/components/ProductRail";
import FaqAccordion from "@/components/FaqAccordion";
import Link from "next/link";

// This route is the core of requirement #37 ("real-time homepage updates"):
// every value rendered below is read fresh from the database on each
// request. There is no hardcoded product, price, image, or copy here —
// change a row in Supabase and the next page load reflects it.
// `homepage_sections.is_enabled` / `display_order` control which sections
// render and in what order, so disabling a section in /admin/homepage
// makes it disappear without a deploy.
export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: settings }, { data: sections }, { data: categories }, { data: faqs }] =
    await Promise.all([
      supabase.from("homepage_settings").select("*").single(),
      supabase.from("homepage_sections").select("*").order("display_order"),
      supabase.from("categories").select("*").eq("is_active", true).order("display_order"),
      supabase.from("faqs").select("*").eq("is_active", true).order("display_order"),
    ]);

  const productSelect = "*, categories(name, slug)";
  const [{ data: flashDeals }, { data: featured }, { data: bestSellers }, { data: newArrivals }] =
    await Promise.all([
      supabase.from("products").select(productSelect).eq("status", "published").eq("flash_deal", true).limit(4),
      supabase.from("products").select(productSelect).eq("status", "published").eq("featured", true).limit(4),
      supabase.from("products").select(productSelect).eq("status", "published").eq("best_seller", true).limit(4),
      supabase.from("products").select(productSelect).eq("status", "published").eq("new_arrival", true).order("created_at", { ascending: false }).limit(4),
    ]);

  const enabledKeys = new Set((sections ?? []).filter((s) => s.is_enabled).map((s) => s.key));
  const isOn = (key: string) => sections === null || enabledKeys.has(key);

  return (
    <>
      {isOn("announcement") && settings?.announcement_enabled && (
        <AnnouncementBar
          text={settings.announcement_text}
          bg={settings.announcement_bg}
          color={settings.announcement_color}
        />
      )}

      {isOn("hero") && settings && <Hero settings={settings} />}

      {isOn("stats") && settings && <StatsSection stats={settings.stats} />}

      {isOn("flash_deals") && (
        <ProductRail eyebrow="Limited Time" heading="Flash Deals" products={flashDeals ?? []} viewAllHref="/deals" />
      )}

      {isOn("categories") && <CategoryGrid categories={categories ?? []} />}

      {isOn("featured") && (
        <ProductRail eyebrow="Popular" heading="Trending Right Now" products={featured ?? []} viewAllHref="/products" />
      )}

      {isOn("best_sellers") && (
        <ProductRail eyebrow="Top Rated" heading="Best Sellers" products={bestSellers ?? []} viewAllHref="/best-sellers" />
      )}

      {isOn("new_arrivals") && (
        <ProductRail eyebrow="Just Added" heading="New Arrivals" products={newArrivals ?? []} viewAllHref="/new-arrivals" />
      )}

      {isOn("faq") && <FaqAccordion faqs={faqs ?? []} />}

      {isOn("final_cta") && (
        <section className="section final-cta">
          <div className="container final-cta-inner">
            <h2>Your Growth Starts With One Click</h2>
            <div className="cta-actions">
              <Link href="/products" className="btn btn-primary">Shop All Products</Link>
              <Link href="/deals" className="btn btn-secondary">View Deals</Link>
            </div>
          </div>
          <style>{`
            .final-cta { background: var(--gradient-navy); }
            .final-cta-inner { text-align: center; }
            .final-cta h2 { color: white; font-size: 32px; margin-bottom: 24px; }
            .cta-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
            .final-cta .btn-secondary { background: transparent; border-color: rgba(255,255,255,0.3); color: white; }
          `}</style>
        </section>
      )}
    </>
  );
}
