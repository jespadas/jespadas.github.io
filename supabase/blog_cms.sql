-- Blog CMS schema for Supabase
-- Run this script from the Supabase SQL Editor.
-- After creating your admin user in Supabase Auth, replace the email below
-- and run the final INSERT statement at the bottom.

create schema if not exists app_private;

create table if not exists public.blog_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.blog_admins enable row level security;

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

create or replace function app_private.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 180),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  excerpt text check (excerpt is null or char_length(excerpt) <= 320),
  content text not null check (char_length(content) > 0),
  language text not null default 'es' check (language in ('es', 'en', 'fr')),
  cover_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  author_id uuid not null default auth.uid() references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.articles enable row level security;

alter table public.articles
add column if not exists language text not null default 'es';

alter table public.articles
drop constraint if exists articles_language_check;

alter table public.articles
add constraint articles_language_check check (language in ('es', 'en', 'fr'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-images',
  'blog-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 140),
  alt_text text not null default '',
  storage_bucket text not null default 'blog-images' check (storage_bucket = 'blog-images'),
  storage_path text not null unique,
  public_url text not null check (public_url ~ '^https://'),
  mime_type text,
  size_bytes integer check (size_bytes is null or size_bytes > 0),
  created_by uuid not null default auth.uid() references auth.users (id) on delete restrict,
  created_at timestamptz not null default now()
);

alter table public.media_assets enable row level security;

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

create index if not exists articles_publication_idx
  on public.articles (status, published_at desc, created_at desc);

create index if not exists articles_author_idx
  on public.articles (author_id);

create index if not exists media_assets_created_at_idx
  on public.media_assets (created_at desc);

drop trigger if exists set_articles_updated_at on public.articles;

create trigger set_articles_updated_at
before update on public.articles
for each row
execute function app_private.set_updated_at();

grant usage on schema public to anon, authenticated;
grant select on public.articles to anon, authenticated;
grant insert, update, delete on public.articles to authenticated;
grant select, insert, update, delete on public.media_assets to authenticated;
grant select on public.blog_admins to authenticated;
grant usage on schema app_private to authenticated;
grant execute on function app_private.is_blog_admin() to authenticated;
grant select on storage.objects to anon, authenticated;
grant insert, update, delete on storage.objects to authenticated;

drop policy if exists "Published articles are public" on public.articles;
drop policy if exists "Blog admins can read all articles" on public.articles;
drop policy if exists "Blog admins can create articles" on public.articles;
drop policy if exists "Blog admins can update articles" on public.articles;
drop policy if exists "Blog admins can delete articles" on public.articles;
drop policy if exists "Blog admins can read media assets" on public.media_assets;
drop policy if exists "Blog admins can create media assets" on public.media_assets;
drop policy if exists "Blog admins can update media assets" on public.media_assets;
drop policy if exists "Blog admins can delete media assets" on public.media_assets;
drop policy if exists "Blog images are publicly readable" on storage.objects;
drop policy if exists "Blog admins can upload images" on storage.objects;
drop policy if exists "Blog admins can update images" on storage.objects;
drop policy if exists "Blog admins can delete images" on storage.objects;

create policy "Published articles are public"
on public.articles
for select
to anon, authenticated
using (
  status = 'published'
  and published_at is not null
  and published_at <= now()
);

create policy "Blog admins can read all articles"
on public.articles
for select
to authenticated
using (app_private.is_blog_admin());

create policy "Blog admins can create articles"
on public.articles
for insert
to authenticated
with check (
  app_private.is_blog_admin()
  and author_id = auth.uid()
);

create policy "Blog admins can update articles"
on public.articles
for update
to authenticated
using (app_private.is_blog_admin())
with check (app_private.is_blog_admin());

create policy "Blog admins can delete articles"
on public.articles
for delete
to authenticated
using (app_private.is_blog_admin());

create policy "Blog admins can read media assets"
on public.media_assets
for select
to authenticated
using (app_private.is_blog_admin());

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

create policy "Blog admins can delete media assets"
on public.media_assets
for delete
to authenticated
using (app_private.is_blog_admin());

create policy "Blog images are publicly readable"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'blog-images');

create policy "Blog admins can upload images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'blog-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and app_private.is_blog_admin()
);

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

create policy "Blog admins can delete images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'blog-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and app_private.is_blog_admin()
);

drop policy if exists "Blog admins can read admin list" on public.blog_admins;

create policy "Blog admins can read admin list"
on public.blog_admins
for select
to authenticated
using (app_private.is_blog_admin());

-- Optional seed article. You can remove it after testing.
insert into public.articles (
  title,
  slug,
  excerpt,
  content,
  language,
  status,
  published_at,
  author_id
)
select
  'Primer articulo',
  'primer-articulo',
  'Articulo de prueba para validar el blog.',
  '# Primer articulo' || chr(10) || chr(10) || 'Contenido escrito en Markdown.',
  'es',
  'published',
  now(),
  auth.users.id
from auth.users
where auth.users.email = 'TU_EMAIL_ADMIN@example.com'
on conflict (slug) do nothing;

-- Run this after creating your Auth user. Replace the email first.
insert into public.blog_admins (user_id)
select id
from auth.users
where email = 'TU_EMAIL_ADMIN@example.com'
on conflict (user_id) do nothing;
