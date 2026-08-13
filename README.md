# XperaOne — Digital Marketplace

Next.js 14 (App Router) + TypeScript + Supabase (Postgres, Auth, Storage) marketplace.
This build was verified with `npm run build` — it compiles cleanly end-to-end.

## What's implemented

- **Database**: full schema with RLS (`supabase/schema.sql`, `rls.sql`, `storage.sql`, `seed.sql`)
- **Public site**: home (fully DB-driven hero/stats/flash-deals/categories/featured/best-sellers/new-arrivals/FAQ/final CTA, with per-section enable/reorder from the admin), products list + detail, categories, deals, best-sellers, new-arrivals, cart, FAQ, about, contact, legal pages
- **Auth**: customer register/login/logout, separate admin login with role verification, protected via `middleware.ts` + RLS (defense in depth — never just one or the other)
- **Admin dashboard**: overview stats, Products (add/list/publish/delete), Categories (add/list/toggle/delete), Homepage Builder (edit hero/announcement copy, enable/disable/reorder every homepage section), Orders (list + update status), Website Settings
- **Customer dashboard**: orders, downloads (via a protected signed-URL API route), wishlist, profile editing
- **Checkout**: client-side cart (localStorage) → real `orders`/`order_items`/`downloads` rows on checkout

## What's scaffolded but not built out

The pattern (Supabase query in a Server Component + a `"use server"` actions file for writes) is established everywhere above. These follow the exact same pattern and are mechanical to add:
- Reviews moderation UI (table + RLS policies already exist)
- Testimonials/Banners/Coupons/Media library admin screens (tables + RLS already exist)
- Real payment provider integration (checkout currently marks orders "paid" immediately for demo purposes — see the comment in `app/cart/actions.ts`)
- Wishlist "add" button (table + RLS exist; wishlist *page* is built, just needs a toggle button wired into ProductCard the same way AddToCartButton is)
- Sitemap/robots.txt, structured data
- Remaining homepage sections from the original spec (promo banner, social growth section, tools showcase, comparison table, affiliate banner) — `homepage_sections` and `banners` tables already model these; add a component + a branch in `app/page.tsx` the same way `ProductRail`/`StatsSection` were added

## Local setup

1. Create a Supabase project at supabase.com.
2. In the Supabase SQL editor, run in this order:
   ```
   supabase/schema.sql
   supabase/rls.sql
   supabase/storage.sql
   supabase/seed.sql
   ```
3. Copy `.env.local.example` to `.env.local` and fill in your project's URL/keys (Project Settings → API).
4. Create your first admin: sign up a user normally (via `/register` or Supabase Auth dashboard), then in the SQL editor run:
   ```sql
   update profiles set role = 'admin' where email = 'you@example.com';
   ```
5. Install and run:
   ```
   npm install
   npm run dev
   ```
6. Visit `/admin/login` with that account.

## Production build

```
npm run build
npm start
```

## Deploying to Hostinger

Hostinger's shared/business hosting is PHP-oriented and does **not** run a persistent Node.js server the way Next.js (with server components, server actions, and middleware) needs. For this app you have two realistic paths:

**Option A — Hostinger VPS or Cloud Hosting (recommended, keeps everything as built):**
1. Provision a Hostinger VPS with Node.js 18+.
2. `git clone` your repo, `npm install`, `npm run build`.
3. Run with a process manager: `npm install -g pm2 && pm2 start npm --name xperaone -- start`.
4. Point Nginx (or Hostinger's reverse proxy panel) at port 3000, and attach your domain + SSL.

**Option B — Deploy the Next.js app on Vercel/Netlify/Railway, point your Hostinger domain's DNS at it.**
This is the path of least resistance if you don't need the app files to physically live on Hostinger — you keep the `xperaone.com` domain registered/managed at Hostinger but delegate hosting via DNS (CNAME/A record) to a Node-friendly platform.

Either way, Supabase remains your database/auth/storage regardless of where the Next.js app itself runs.

## Regenerating real database types

`types/database.ts` is hand-written to unblock development. Once your Supabase project exists, replace it with generated types for full type safety:
```
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > types/database.ts
```
Note: the Supabase client helpers in `lib/supabase/*.ts` are currently called without the `<Database>` generic (see comments in those files) because the current `@supabase/supabase-js` query-builder types need the full generated shape (Relationships/Views/Functions/Enums) to type-check `.select()` calls correctly — a hand-written partial schema isn't enough. After generating real types, you can pass `<Database>` back into `createBrowserClient<Database>()` / `createServerClient<Database>()` for autocomplete and compile-time query safety.

## Security notes

- RLS is the real enforcement layer, not the frontend. Every table has `alter table ... enable row level security` plus explicit policies in `supabase/rls.sql` — test this by trying to query as a non-admin from the Supabase client directly.
- The service-role key (`SUPABASE_SERVICE_ROLE_KEY`) is never imported into anything that runs in the browser. Only use `createAdminClient()` from trusted `app/api/**` route handlers, after independently verifying the caller's role.
- Purchased files live in a **private** storage bucket and are only ever reachable through `app/api/downloads/[id]/route.ts`, which checks the `downloads` table (itself RLS-scoped to `customer_id = auth.uid()`) before minting a 60-second signed URL.
