# XperaOne — Digital Marketplace

Next.js 14 (App Router) + TypeScript + Supabase (Postgres, Auth, Storage) marketplace.
This build was verified with `npm run build` — it compiles cleanly end-to-end.

## What's implemented

- **Database**: full schema with RLS (`supabase/schema.sql`, `rls.sql`, `storage.sql`, `seed.sql`), plus a payments/invoicing migration (`supabase/migration_payments.sql`, `migration_payments_storage.sql`)
- **Public site**: home (fully DB-driven), products, categories, deals, best-sellers, new-arrivals, cart, FAQ, legal pages
- **Auth**: customer register/login/logout, separate role-checked admin login, protected via `middleware.ts` + RLS
- **Manual payment checkout**: 3-step wizard (customer info → review → payment) at `/checkout`. Shows bank/JazzCash/EasyPaisa details from `payment_settings` (editable in `/admin/settings/payment`), customer uploads a payment screenshot to a **private** storage bucket, order is created as `payment_status = 'verification_pending'` — nothing is ever auto-marked as paid.
- **Admin payment verification**: `/admin/orders/[id]` shows the screenshot (via a short-lived signed URL), lets the admin Approve or Reject. Approving is the **only** place that sets `payment_status = 'verified'`, grants `downloads` rows, and marks `order_items.download_granted = true` — this is what fixes the "Completed but Downloads = 0" bug: downloads are now created exactly once, exactly when a human actually confirms payment.
- **Order status history**: every status/payment change is logged to `order_status_history` with who changed it and when; visible on the admin order page.
- **Invoices**: PDF invoices generated server-side (`lib/invoice/generate.ts`, pdfkit), downloadable from `/api/invoice/[orderId]` (RLS-scoped) and attached to order-confirmation/payment-verified emails.
- **Transactional email**: sent via **your own business email's SMTP** (not a third-party API) — see Email setup below. Covers order confirmation, payment pending, payment verified, payment rejected, order status updates, and new-order notification to the admin. All configurable/toggleable in `/admin/settings/email`, with a built-in test-send button.
- **Admin dashboard, Products/Categories CRUD, Homepage Builder, Website Settings**: as before.

## What's scaffolded but not built out

- Automatic payment gateways (Stripe/PayPal) — `orders.payment_method` already supports `'stripe' | 'paypal'` as values, but no gateway integration is wired up. Add it as a webhook-driven route that calls the same `verifyPayment`-style logic in `app/admin/(protected)/orders/[id]/actions.ts`, triggered by the provider's webhook instead of an admin click.
- Reviews moderation UI, testimonials/banners/coupons/media admin screens (tables + RLS already exist).
- Order confirmation/status emails don't yet retry on failure — a failed send is logged to the server console but doesn't block the order.

## Local setup

1. Create a Supabase project. In the SQL editor, run in this order:
   ```
   supabase/schema.sql
   supabase/rls.sql
   supabase/storage.sql
   supabase/migration_payments.sql
   supabase/migration_payments_storage.sql
   supabase/seed.sql
   ```
2. Copy `.env.local.example` → `.env.local`, fill in your Supabase keys.
3. **Email setup** — add your business email's SMTP settings to `.env.local` (and to your host's environment variables in production):
   ```
   SMTP_HOST=smtp.yourmailprovider.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=orders@yourdomain.com
   SMTP_PASS=your-mailbox-password
   ```
   Hostinger-hosted email, Google Workspace, and Zoho all expose these settings under their mail account's "SMTP settings" or "other mail client" section. Without these set, the app still works — emails are just skipped (logged to the server console) rather than failing the order.
4. `npm install && npm run dev`.
5. Register an account, promote to admin via SQL (see below), then set your payment account details in `/admin/settings/payment` and your notification email in `/admin/settings/email` (use the test-send button there to confirm SMTP works) before taking real orders.

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
