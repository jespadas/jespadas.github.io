-- Incremental security hardening for the blog CMS.
-- Run this in Supabase SQL Editor after blog_cms.sql if your project already exists.

create schema if not exists app_private;

create or replace function app_private.is_blog_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.blog_admins
    where user_id = auth.uid()
  );
$$;

alter table public.media_assets
drop constraint if exists media_assets_blog_bucket_check;

alter table public.media_assets
add constraint media_assets_blog_bucket_check
check (storage_bucket = 'blog-images');

alter table public.media_assets
drop constraint if exists media_assets_public_url_https_check;

alter table public.media_assets
add constraint media_assets_public_url_https_check
check (public_url ~ '^https://');

alter table public.media_assets
drop constraint if exists media_assets_owner_path_check;

alter table public.media_assets
add constraint media_assets_owner_path_check
check (split_part(storage_path, '/', 1) = created_by::text);

drop policy if exists "Blog admins can create media assets" on public.media_assets;
create policy "Blog admins can create media assets"
on public.media_assets
for insert
to authenticated
with check (
  app_private.is_blog_admin()
  and created_by = auth.uid()
  and storage_bucket = 'blog-images'
  and split_part(storage_path, '/', 1) = auth.uid()::text
  and public_url ~ '^https://'
);

drop policy if exists "Blog admins can update media assets" on public.media_assets;
create policy "Blog admins can update media assets"
on public.media_assets
for update
to authenticated
using (app_private.is_blog_admin())
with check (
  app_private.is_blog_admin()
  and created_by = auth.uid()
  and storage_bucket = 'blog-images'
  and split_part(storage_path, '/', 1) = auth.uid()::text
  and public_url ~ '^https://'
);

drop policy if exists "Blog admins can upload images" on storage.objects;
create policy "Blog admins can upload images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'blog-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and app_private.is_blog_admin()
);

drop policy if exists "Blog admins can update images" on storage.objects;
create policy "Blog admins can update images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'blog-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and app_private.is_blog_admin()
)
with check (
  bucket_id = 'blog-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and app_private.is_blog_admin()
);

drop policy if exists "Blog admins can delete images" on storage.objects;
create policy "Blog admins can delete images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'blog-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and app_private.is_blog_admin()
);
