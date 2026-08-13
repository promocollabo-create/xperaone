-- ============================================================================
-- ROW LEVEL SECURITY
-- Run after schema.sql. This is the real enforcement layer — the Next.js
-- middleware and API routes are a UX convenience, not the security boundary.
-- Even if someone calls the Supabase REST API directly with a stolen anon
-- key, these policies are what stop them from reading/writing data they
-- shouldn't.
-- ============================================================================

-- Helper: is the current authenticated user an admin?
create function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table downloads enable row level security;
alter table wishlists enable row level security;
alter table reviews enable row level security;
alter table faqs enable row level security;
alter table testimonials enable row level security;
alter table banners enable row level security;
alter table homepage_sections enable row level security;
alter table homepage_settings enable row level security;
alter table coupons enable row level security;
alter table site_settings enable row level security;
alter table media enable row level security;
alter table notifications enable row level security;
alter table affiliate_settings enable row level security;

-- PROFILES ------------------------------------------------------------------
create policy "profiles_select_own_or_admin" on profiles
  for select using (auth.uid() = id or is_admin());
create policy "profiles_update_own_or_admin" on profiles
  for update using (auth.uid() = id or is_admin());
create policy "profiles_admin_all" on profiles
  for all using (is_admin());

-- CATEGORIES ------------------------------------------------------------------
create policy "categories_public_read" on categories
  for select using (is_active = true or is_admin());
create policy "categories_admin_write" on categories
  for insert with check (is_admin());
create policy "categories_admin_update" on categories
  for update using (is_admin());
create policy "categories_admin_delete" on categories
  for delete using (is_admin());

-- PRODUCTS ------------------------------------------------------------------
create policy "products_public_read" on products
  for select using (status = 'published' or is_admin());
create policy "products_admin_insert" on products
  for insert with check (is_admin());
create policy "products_admin_update" on products
  for update using (is_admin());
create policy "products_admin_delete" on products
  for delete using (is_admin());

-- ORDERS ----------------------------------------------------------------------
create policy "orders_owner_or_admin_select" on orders
  for select using (customer_id = auth.uid() or is_admin());
create policy "orders_owner_insert" on orders
  for insert with check (customer_id = auth.uid());
create policy "orders_admin_update" on orders
  for update using (is_admin());

-- ORDER ITEMS -------------------------------------------------------------------
create policy "order_items_owner_or_admin_select" on order_items
  for select using (
    exists (select 1 from orders o where o.id = order_id and (o.customer_id = auth.uid() or is_admin()))
  );
create policy "order_items_owner_insert" on order_items
  for insert with check (
    exists (select 1 from orders o where o.id = order_id and o.customer_id = auth.uid())
  );
create policy "order_items_admin_update" on order_items
  for update using (is_admin());

-- DOWNLOADS ---------------------------------------------------------------------
-- Customers can only ever see their OWN entitlements — this is what keeps
-- purchased files from being reachable by anyone who guesses a URL.
create policy "downloads_owner_or_admin_select" on downloads
  for select using (customer_id = auth.uid() or is_admin());
create policy "downloads_admin_insert" on downloads
  for insert with check (is_admin());
create policy "downloads_owner_update_count" on downloads
  for update using (customer_id = auth.uid() or is_admin());

-- WISHLISTS -----------------------------------------------------------------
create policy "wishlists_owner_all" on wishlists
  for all using (customer_id = auth.uid()) with check (customer_id = auth.uid());
create policy "wishlists_admin_read" on wishlists
  for select using (is_admin());

-- REVIEWS -----------------------------------------------------------------
create policy "reviews_public_read_approved" on reviews
  for select using (status = 'approved' or is_admin() or customer_id = auth.uid());
create policy "reviews_owner_insert" on reviews
  for insert with check (customer_id = auth.uid());
create policy "reviews_admin_moderate" on reviews
  for update using (is_admin());
create policy "reviews_admin_delete" on reviews
  for delete using (is_admin());

-- FAQS / TESTIMONIALS / BANNERS / HOMEPAGE — public read, admin write ------
create policy "faqs_public_read" on faqs for select using (is_active = true or is_admin());
create policy "faqs_admin_write" on faqs for insert with check (is_admin());
create policy "faqs_admin_update" on faqs for update using (is_admin());
create policy "faqs_admin_delete" on faqs for delete using (is_admin());

create policy "testimonials_public_read" on testimonials for select using (is_active = true or is_admin());
create policy "testimonials_admin_write" on testimonials for insert with check (is_admin());
create policy "testimonials_admin_update" on testimonials for update using (is_admin());
create policy "testimonials_admin_delete" on testimonials for delete using (is_admin());

create policy "banners_public_read" on banners for select using (is_active = true or is_admin());
create policy "banners_admin_write" on banners for insert with check (is_admin());
create policy "banners_admin_update" on banners for update using (is_admin());
create policy "banners_admin_delete" on banners for delete using (is_admin());

create policy "homepage_sections_public_read" on homepage_sections for select using (true);
create policy "homepage_sections_admin_write" on homepage_sections for insert with check (is_admin());
create policy "homepage_sections_admin_update" on homepage_sections for update using (is_admin());

create policy "homepage_settings_public_read" on homepage_settings for select using (true);
create policy "homepage_settings_admin_update" on homepage_settings for update using (is_admin());

create policy "site_settings_public_read" on site_settings for select using (true);
create policy "site_settings_admin_update" on site_settings for update using (is_admin());

create policy "affiliate_settings_public_read" on affiliate_settings for select using (true);
create policy "affiliate_settings_admin_update" on affiliate_settings for update using (is_admin());

-- COUPONS — never publicly listable, only validated by code (server-side) ---
create policy "coupons_admin_all" on coupons for all using (is_admin());

-- MEDIA -----------------------------------------------------------------------
create policy "media_admin_all" on media for all using (is_admin());

-- NOTIFICATIONS ---------------------------------------------------------------
create policy "notifications_owner_select" on notifications
  for select using (recipient_id = auth.uid() or is_admin());
create policy "notifications_owner_update" on notifications
  for update using (recipient_id = auth.uid());
