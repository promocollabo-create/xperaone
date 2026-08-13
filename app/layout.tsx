import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/lib/cart/CartContext";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("site_settings").select("*").single();

  return {
    title: settings?.seo_title ?? "XperaOne — Premium Digital Products & Software Marketplace",
    description:
      settings?.seo_description ??
      "Discover premium software, automation tools and digital products.",
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("site_settings").select("*").single();
  const { data: categories } = await supabase
    .from("categories")
    .select("name, slug")
    .eq("is_active", true)
    .order("display_order");

  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Header siteName={settings?.site_name ?? "XperaOne"} logoUrl={settings?.logo_url ?? null} categories={categories ?? []} />
          <main>{children}</main>
          <Footer settings={settings} />
        </CartProvider>
      </body>
    </html>
  );
}
