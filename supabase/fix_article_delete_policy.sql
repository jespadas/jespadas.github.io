-- Run this in the Supabase SQL Editor if article deletion returns 0 deleted rows.
-- It refreshes the admin SELECT/DELETE policies needed by PostgREST and RLS.

grant select, delete on public.articles to authenticated;

drop policy if exists "Blog admins can read all articles" on public.articles;
create policy "Blog admins can read all articles"
on public.articles
for select
to authenticated
using (app_private.is_blog_admin());

drop policy if exists "Blog admins can delete articles" on public.articles;
create policy "Blog admins can delete articles"
on public.articles
for delete
to authenticated
using (app_private.is_blog_admin());

grant select, delete on public.media_assets to authenticated;

drop policy if exists "Blog admins can read media assets" on public.media_assets;
create policy "Blog admins can read media assets"
on public.media_assets
for select
to authenticated
using (app_private.is_blog_admin());

drop policy if exists "Blog admins can delete media assets" on public.media_assets;
create policy "Blog admins can delete media assets"
on public.media_assets
for delete
to authenticated
using (app_private.is_blog_admin());
