-- ============================================================================
-- MIGRATION: Payment verification, order status history, payment/email settings
-- Idempotent — safe to run even if some of this already exists.
-- Run this AFTER schema.sql / rls.sql have been applied.
-- ============================================================================

-- Extend orders with everything the manual-payment workflow needs.
alter table orders add column if not exists customer_name text;
alter table orders add column if not exists customer_email text;
alter table orders add column if not exists customer_phone text;
alter table orders add column if not exists customer_country text;
alter table orders add column if not exists billing_address text;
alter table orders add column if not exists payment_method text not null default 'manual'
  check (payment_method in ('manual', 'stripe', 'paypal'));
alter table orders add column if not exists payment_reference text;
alter table orders add column if not exists payment_screenshot_url text;
alter table orders add column if not exists verified_at timestamptz;
alter table orders add column if not exists verified_by uuid references profiles(id);
alter table orders add column if not exists admin_notes text;
alter table orders add column if not exists invoice_number text unique;

-- payment_status needs a richer set of states than the original schema had.
alter table orders drop constraint if exists orders_payment_status_check;
alter table orders add constraint orders_payment_status_check
  check (payment_status in ('pending', 'verification_pending', 'verified', 'failed', 'rejected', 'refunded'));

-- ---------------------------------------------------------------------------
-- ORDER STATUS HISTORY — full audit trail of every status change
-- ---------------------------------------------------------------------------
create table if not exists order_status_history (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  previous_status text,
  new_status text not null,
  previous_payment_status text,
  new_payment_status text,
  changed_by uuid references profiles(id),
  note text,
  created_at timestamptz not null default now()
);
create index if not exists order_status_history_order_idx on order_status_history(order_id);

-- ---------------------------------------------------------------------------
-- PAYMENT SETTINGS — singleton row admin edits (bank/JazzCash/EasyPaisa details)
-- ---------------------------------------------------------------------------
create table if not exists payment_settings (
  id int primary key default 1 check (id = 1),
  manual_enabled boolean not null default true,
  bank_name text,
  bank_account_title text,
  bank_account_number text,
  bank_iban text,
  jazzcash_number text,
  jazzcash_account_title text,
  easypaisa_number text,
  easypaisa_account_title text,
  payment_instructions text default 'Please transfer the total amount and upload a screenshot of your payment confirmation.',
  verification_time_note text default 'We normally review payments within 2-3 hours.',
  updated_at timestamptz not null default now()
);
insert into payment_settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- EMAIL SETTINGS — singleton row admin edits (sender identity + toggles)
-- SMTP host/user/password stay in environment variables (server-only),
-- never in this table — this table only holds non-secret display config.
-- ---------------------------------------------------------------------------
create table if not exists email_settings (
  id int primary key default 1 check (id = 1),
  store_email text,
  admin_notification_email text,
  sender_name text default 'XperaOne',
  reply_to_email text,
  notify_order_confirmation boolean not null default true,
  notify_payment_pending boolean not null default true,
  notify_payment_verified boolean not null default true,
  notify_payment_rejected boolean not null default true,
  notify_admin_new_order boolean not null default true,
  updated_at timestamptz not null default now()
);
insert into email_settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Keep updated_at fresh on the new tables too
-- ---------------------------------------------------------------------------
drop trigger if exists set_updated_at on payment_settings;
create trigger set_updated_at before update on payment_settings
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at on email_settings;
create trigger set_updated_at before update on email_settings
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS for the new tables
-- ---------------------------------------------------------------------------
alter table order_status_history enable row level security;
alter table payment_settings enable row level security;
alter table email_settings enable row level security;

drop policy if exists "order_status_history_owner_or_admin_select" on order_status_history;
create policy "order_status_history_owner_or_admin_select" on order_status_history
  for select using (
    exists (select 1 from orders o where o.id = order_id and (o.customer_id = auth.uid() or is_admin()))
  );
drop policy if exists "order_status_history_admin_insert" on order_status_history;
create policy "order_status_history_admin_insert" on order_status_history
  for insert with check (is_admin());

drop policy if exists "payment_settings_public_read" on payment_settings;
create policy "payment_settings_public_read" on payment_settings for select using (true);
drop policy if exists "payment_settings_admin_update" on payment_settings;
create policy "payment_settings_admin_update" on payment_settings for update using (is_admin());

drop policy if exists "email_settings_admin_all" on email_settings;
create policy "email_settings_admin_all" on email_settings for all using (is_admin());

-- ---------------------------------------------------------------------------
-- Sequence-backed helper for invoice numbers: XPO-2026-000001 style
-- ---------------------------------------------------------------------------
create sequence if not exists invoice_number_seq start 1;

create or replace function public.next_invoice_number()
returns text as $$
  select 'XPO-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('invoice_number_seq')::text, 6, '0');
$$ language sql;
