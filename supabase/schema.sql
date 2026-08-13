-- ============================================================================
-- XPERAONE — CORE SCHEMA
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh
-- project. Run supabase/rls.sql immediately after. Run supabase/seed.sql last.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- PROFILES (extends auth.users — one row per Supabase auth user)
-- role drives every permission check in RLS and in middleware.ts
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_role_idx on profiles(role);

-- Auto-create a profile row whenever someone signs up via Supabase Auth.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------------------------
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  icon_url text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index categories_slug_idx on categories(slug);
create index categories_order_idx on categories(display_order);

-- ---------------------------------------------------------------------------
-- PRODUCTS
-- ---------------------------------------------------------------------------
create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  category_id uuid references categories(id) on delete set null,
  price numeric(10,2) not null default 0,
  compare_price numeric(10,2),
  discount_percent int default 0,
  thumbnail_url text,
  gallery jsonb not null default '[]'::jsonb,
  features jsonb not null default '[]'::jsonb,
  specifications jsonb not null default '{}'::jsonb,
  download_url text,               -- private storage path, never public
  delivery_type text not null default 'instant' check (delivery_type in ('instant','manual')),
  featured boolean not null default false,
  best_seller boolean not null default false,
  new_arrival boolean not null default true,
  flash_deal boolean not null default false,
  flash_deal_ends_at timestamptz,
  rating numeric(2,1) default 0,
  review_count int default 0,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  seo_title text,
  seo_description text,
  og_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_slug_idx on products(slug);
create index products_category_idx on products(category_id);
create index products_status_idx on products(status);
create index products_flags_idx on products(featured, best_seller, new_arrival, flash_deal);
create index products_created_idx on products(created_at desc);

-- ---------------------------------------------------------------------------
-- ORDERS / ORDER ITEMS
-- ---------------------------------------------------------------------------
create table orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique,
  customer_id uuid not null references profiles(id) on delete restrict,
  subtotal numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  status text not null default 'pending' check (status in ('pending','processing','completed','cancelled','refunded')),
  coupon_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_customer_idx on orders(customer_id);
create index orders_status_idx on orders(status);
create index orders_created_idx on orders(created_at desc);

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,       -- snapshot at purchase time
  quantity int not null default 1,
  unit_price numeric(10,2) not null,
  discount numeric(10,2) not null default 0,
  download_granted boolean not null default false
);
create index order_items_order_idx on order_items(order_id);

-- ---------------------------------------------------------------------------
-- DOWNLOADS (one row per file a customer is entitled to)
-- ---------------------------------------------------------------------------
create table downloads (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  order_item_id uuid not null references order_items(id) on delete cascade,
  download_count int not null default 0,
  last_downloaded_at timestamptz,
  created_at timestamptz not null default now()
);
create index downloads_customer_idx on downloads(customer_id);

-- ---------------------------------------------------------------------------
-- WISHLISTS
-- ---------------------------------------------------------------------------
create table wishlists (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(customer_id, product_id)
);

-- ---------------------------------------------------------------------------
-- REVIEWS
-- ---------------------------------------------------------------------------
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  customer_id uuid references profiles(id) on delete set null,
  customer_name text not null,       -- snapshot, survives account deletion
  rating int not null check (rating between 1 and 5),
  review_text text,
  verified_purchase boolean not null default false,
  status text not null default 'pending' check (status in ('pending','approved','hidden')),
  created_at timestamptz not null default now()
);
create index reviews_product_idx on reviews(product_id);
create index reviews_status_idx on reviews(status);

-- ---------------------------------------------------------------------------
-- FAQS
-- ---------------------------------------------------------------------------
create table faqs (
  id uuid primary key default uuid_generate_v4(),
  question text not null,
  answer text not null,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- TESTIMONIALS (separate from product reviews — used in homepage "Reviews" section)
-- ---------------------------------------------------------------------------
create table testimonials (
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  avatar_url text,
  rating int not null check (rating between 1 and 5),
  quote text not null,
  product_name text,
  is_active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- BANNERS (promotional banner + featured-product section content)
-- ---------------------------------------------------------------------------
create table banners (
  id uuid primary key default uuid_generate_v4(),
  key text not null unique,           -- e.g. 'promo_banner', 'featured_product_section'
  heading text,
  description text,
  image_url text,
  button_text text,
  button_link text,
  background_style text,
  is_active boolean not null default true,
  extra jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- HOMEPAGE SECTIONS (drives the "Homepage Builder" — enable/disable/reorder)
-- ---------------------------------------------------------------------------
create table homepage_sections (
  id uuid primary key default uuid_generate_v4(),
  key text not null unique,           -- 'hero', 'stats', 'flash_deals', 'faq', ...
  label text not null,                -- human-readable name for the admin UI
  is_enabled boolean not null default true,
  display_order int not null default 0,
  content jsonb not null default '{}'::jsonb,  -- flexible per-section content
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- HOMEPAGE SETTINGS (singleton row — hero text, stats, announcement bar)
-- ---------------------------------------------------------------------------
create table homepage_settings (
  id int primary key default 1 check (id = 1),   -- enforce single row
  announcement_enabled boolean not null default true,
  announcement_text text default 'Instant digital delivery — premium tools delivered automatically.',
  announcement_bg text default '#111936',
  announcement_color text default '#FFFFFF',
  hero_badge text default 'Trusted by thousands of digital creators',
  hero_heading text default 'Powerful Digital Tools. Built for Better Results.',
  hero_description text default 'Discover premium software, automation tools and digital products designed to help creators, marketers and businesses work smarter.',
  hero_image_url text,
  hero_primary_cta_text text default 'Shop All Products',
  hero_primary_cta_link text default '/products',
  hero_secondary_cta_text text default 'View Flash Deals',
  hero_secondary_cta_link text default '/deals',
  stats jsonb not null default '[
    {"value":"10,000+","label":"Happy Customers"},
    {"value":"150+","label":"Premium Products"},
    {"value":"99%","label":"Customer Satisfaction"},
    {"value":"24/7","label":"Support"}
  ]'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- COUPONS
-- ---------------------------------------------------------------------------
create table coupons (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percent','fixed')),
  discount_value numeric(10,2) not null,
  max_uses int,
  used_count int not null default 0,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- SITE SETTINGS (singleton row)
-- ---------------------------------------------------------------------------
create table site_settings (
  id int primary key default 1 check (id = 1),
  site_name text not null default 'XperaOne',
  logo_url text,
  favicon_url text,
  contact_email text,
  contact_phone text,
  whatsapp_number text,
  address text,
  social_links jsonb not null default '{}'::jsonb,
  currency text not null default 'USD',
  timezone text not null default 'UTC',
  footer_text text,
  seo_title text default 'XperaOne — Premium Digital Products & Software Marketplace',
  seo_description text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- MEDIA LIBRARY
-- ---------------------------------------------------------------------------
create table media (
  id uuid primary key default uuid_generate_v4(),
  url text not null,
  storage_path text not null,
  file_name text not null,
  uploaded_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------------
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  recipient_id uuid references profiles(id) on delete cascade,
  title text not null,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- AFFILIATE SETTINGS (singleton)
-- ---------------------------------------------------------------------------
create table affiliate_settings (
  id int primary key default 1 check (id = 1),
  is_enabled boolean not null default true,
  commission_percent numeric(5,2) not null default 20,
  payout_schedule text default 'Monthly',
  heading text default 'Earn With XperaOne',
  description text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Keep updated_at fresh automatically
-- ---------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare t text;
begin
  foreach t in array array['profiles','categories','products','orders','banners',
    'homepage_sections','homepage_settings','site_settings','affiliate_settings']
  loop
    execute format(
      'create trigger set_updated_at before update on %I for each row execute procedure public.set_updated_at();',
      t
    );
  end loop;
end $$;

-- Seed the two singleton rows so the app never has to handle "no row yet".
insert into homepage_settings (id) values (1) on conflict (id) do nothing;
insert into site_settings (id) values (1) on conflict (id) do nothing;
insert into affiliate_settings (id) values (1) on conflict (id) do nothing;
