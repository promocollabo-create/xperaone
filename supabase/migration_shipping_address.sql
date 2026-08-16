-- ============================================================================
-- MIGRATION: Shipping address fields + structured address components
-- Idempotent — safe to run even if some of this already exists.
-- Run this AFTER schema.sql and migration_payments.sql have been applied.
--
-- WHY THIS EXISTS:
-- The checkout form and app/checkout/actions.ts insert into orders.billing_address
-- (added by migration_payments.sql) but the app never had a separate
-- shipping_address column, and neither city/state/postal_code existed as
-- structured fields. This migration adds what the checkout flow now needs.
-- ============================================================================

alter table orders add column if not exists shipping_address text;
alter table orders add column if not exists shipping_same_as_billing boolean not null default true;

-- Billing structured fields (customer_country from migration_payments.sql
-- is reused as the billing country to avoid a duplicate column).
alter table orders add column if not exists city text;
alter table orders add column if not exists state text;
alter table orders add column if not exists postal_code text;

-- Shipping structured fields — only populated when shipping_same_as_billing
-- is false; the app copies billing values in when it's true.
alter table orders add column if not exists shipping_city text;
alter table orders add column if not exists shipping_state text;
alter table orders add column if not exists shipping_postal_code text;
alter table orders add column if not exists shipping_country text;

-- Force PostgREST to reload its schema cache immediately instead of waiting
-- for the next auto-refresh. This is what actually clears errors like
-- "Could not find the 'billing_address' column of 'orders' in the schema cache"
-- after you add a column — the column can exist in Postgres and still 404
-- from the API layer until the cache is told to reload.
notify pgrst, 'reload schema';
