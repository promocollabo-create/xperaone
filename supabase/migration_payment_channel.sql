-- ============================================================================
-- MIGRATION: Track which specific manual payment channel was selected
-- Idempotent — safe to run even if some of this already exists.
-- Run this AFTER migration_payments.sql and migration_shipping_address.sql.
--
-- WHY THIS EXISTS:
-- orders.payment_method only ever stores 'manual' | 'stripe' | 'paypal'.
-- With multiple manual channels configurable in Admin → Payment Settings
-- (Bank Transfer, JazzCash, EasyPaisa, ...), the app also needs to record
-- *which one* the customer picked, so both the customer confirmation page
-- and the admin order view can show "Paid via JazzCash" instead of just
-- "Paid via Manual".
-- ============================================================================

alter table orders add column if not exists payment_channel text;
alter table orders add column if not exists order_notes text;

notify pgrst, 'reload schema';
