-- ============================================================================
-- PAYMENT SCREENSHOTS STORAGE
-- Private bucket: customers can upload their own screenshot, only admins
-- (and the uploading customer) can view it — never public.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('payment-screenshots', 'payment-screenshots', false)
on conflict (id) do nothing;

-- Path convention enforced by the app: {customer_id}/{order_id}.{ext}
-- so a customer can only write into their own folder.
drop policy if exists "payment_screenshots_owner_insert" on storage.objects;
create policy "payment_screenshots_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'payment-screenshots'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "payment_screenshots_owner_or_admin_select" on storage.objects;
create policy "payment_screenshots_owner_or_admin_select" on storage.objects
  for select using (
    bucket_id = 'payment-screenshots'
    and ((storage.foldername(name))[1] = auth.uid()::text or is_admin())
  );

drop policy if exists "payment_screenshots_admin_delete" on storage.objects;
create policy "payment_screenshots_admin_delete" on storage.objects
  for delete using (bucket_id = 'payment-screenshots' and is_admin());
