-- ============================================================================
-- STORAGE BUCKETS
-- Run after rls.sql. Creates two buckets with very different trust levels:
--   - "media"     : public, admin-uploaded images (products, banners, categories)
--   - "downloads" : private, purchased digital files — never public
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('downloads', 'downloads', false)
on conflict (id) do nothing;

-- MEDIA bucket: anyone can view (it's product/marketing imagery), only
-- admins can upload/delete.
create policy "media_public_read" on storage.objects
  for select using (bucket_id = 'media');

create policy "media_admin_insert" on storage.objects
  for insert with check (bucket_id = 'media' and public.is_admin());

create policy "media_admin_delete" on storage.objects
  for delete using (bucket_id = 'media' and public.is_admin());

-- DOWNLOADS bucket: nobody gets direct access. Files are served exclusively
-- through app/api/downloads/[id]/route.ts, which checks the `downloads`
-- table (i.e. "did this customer actually buy this?") and then mints a
-- short-lived signed URL server-side. RLS here just makes sure that even a
-- signed-URL bypass attempt from the client-side SDK fails closed.
create policy "downloads_admin_only_direct_access" on storage.objects
  for all using (bucket_id = 'downloads' and public.is_admin())
  with check (bucket_id = 'downloads' and public.is_admin());
