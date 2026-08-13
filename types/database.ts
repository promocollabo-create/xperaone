// Hand-written types matching supabase/schema.sql.
// Once your project is running, replace this file with a generated one:
//   npx supabase gen types typescript --project-id YOUR_PROJECT_REF > types/database.ts
// so it stays exactly in sync with the real schema.

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
  display_order: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  category_id: string | null;
  price: number;
  compare_price: number | null;
  discount_percent: number;
  thumbnail_url: string | null;
  gallery: string[];
  features: string[];
  rating: number;
  review_count: number;
  featured: boolean;
  best_seller: boolean;
  new_arrival: boolean;
  flash_deal: boolean;
  flash_deal_ends_at: string | null;
  status: "draft" | "published" | "archived";
  created_at: string;
  categories?: Pick<Category, "name" | "slug"> | null;
}

export interface HomepageSettings {
  id: number;
  announcement_enabled: boolean;
  announcement_text: string;
  announcement_bg: string;
  announcement_color: string;
  hero_badge: string;
  hero_heading: string;
  hero_description: string;
  hero_image_url: string | null;
  hero_primary_cta_text: string;
  hero_primary_cta_link: string;
  hero_secondary_cta_text: string;
  hero_secondary_cta_link: string;
  stats: { value: string; label: string }[];
}

export interface HomepageSection {
  id: string;
  key: string;
  label: string;
  is_enabled: boolean;
  display_order: number;
  content: Record<string, unknown>;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  avatar_url: string | null;
  rating: number;
  quote: string;
  product_name: string | null;
  is_active: boolean;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "admin";
  status: "active" | "disabled";
}

export interface SiteSettings {
  id: number;
  site_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  whatsapp_number: string | null;
  address: string | null;
  social_links: Record<string, string>;
  currency: string;
  timezone: string;
  footer_text: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  subtotal: number;
  discount: number;
  total: number;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  status: "pending" | "processing" | "completed" | "cancelled" | "refunded";
  coupon_code: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount: number;
  download_granted: boolean;
}

export interface Download {
  id: string;
  customer_id: string;
  product_id: string;
  order_item_id: string;
  download_count: number;
  last_downloaded_at: string | null;
}

export interface Wishlist {
  id: string;
  customer_id: string;
  product_id: string;
}

export interface Review {
  id: string;
  product_id: string;
  customer_id: string | null;
  customer_name: string;
  rating: number;
  review_text: string | null;
  verified_purchase: boolean;
  status: "pending" | "approved" | "hidden";
}

export interface Banner {
  id: string;
  key: string;
  heading: string | null;
  description: string | null;
  image_url: string | null;
  button_text: string | null;
  button_link: string | null;
  background_style: string | null;
  is_active: boolean;
  extra: Record<string, unknown>;
}

// Generic row typing for tables not yet given a dedicated interface above
// (media, notifications, coupons, affiliate_settings). Extend with a real
// interface the same way as the tables above as you build out those admin
// screens — see the pattern used for Order/Review/etc.
type LooseTable = { Row: Record<string, any>; Insert: Record<string, any>; Update: Record<string, any> };

// Database type so createClient<Database>() type-checks against every
// table the app queries. Once your Supabase project is running, prefer
// regenerating this file with:
//   npx supabase gen types typescript --project-id YOUR_PROJECT_REF > types/database.ts
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      categories: { Row: Category; Insert: Partial<Category>; Update: Partial<Category> };
      products: { Row: Product; Insert: Partial<Product>; Update: Partial<Product> };
      homepage_settings: { Row: HomepageSettings; Insert: Partial<HomepageSettings>; Update: Partial<HomepageSettings> };
      homepage_sections: { Row: HomepageSection; Insert: Partial<HomepageSection>; Update: Partial<HomepageSection> };
      faqs: { Row: Faq; Insert: Partial<Faq>; Update: Partial<Faq> };
      testimonials: { Row: Testimonial; Insert: Partial<Testimonial>; Update: Partial<Testimonial> };
      site_settings: { Row: SiteSettings; Insert: Partial<SiteSettings>; Update: Partial<SiteSettings> };
      orders: { Row: Order; Insert: Partial<Order>; Update: Partial<Order> };
      order_items: { Row: OrderItem; Insert: Partial<OrderItem>; Update: Partial<OrderItem> };
      downloads: { Row: Download; Insert: Partial<Download>; Update: Partial<Download> };
      wishlists: { Row: Wishlist; Insert: Partial<Wishlist>; Update: Partial<Wishlist> };
      reviews: { Row: Review; Insert: Partial<Review>; Update: Partial<Review> };
      banners: { Row: Banner; Insert: Partial<Banner>; Update: Partial<Banner> };
      media: LooseTable;
      notifications: LooseTable;
      coupons: LooseTable;
      affiliate_settings: LooseTable;
    };
  };
}
