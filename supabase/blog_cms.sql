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
set search_path = public, auth
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
  cover_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  author_id uuid not null default auth.uid() references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.articles enable row level security;

create index if not exists articles_publication_idx
  on public.articles (status, published_at desc, created_at desc);

create index if not exists articles_author_idx
  on public.articles (author_id);

drop trigger if exists set_articles_updated_at on public.articles;

create trigger set_articles_updated_at
before update on public.articles
for each row
execute function app_private.set_updated_at();

grant usage on schema public to anon, authenticated;
grant select on public.articles to anon, authenticated;
grant insert, update, delete on public.articles to authenticated;
grant select on public.blog_admins to authenticated;
grant usage on schema app_private to authenticated;
grant execute on function app_private.is_blog_admin() to authenticated;

drop policy if exists "Published articles are public" on public.articles;
drop policy if exists "Blog admins can read all articles" on public.articles;
drop policy if exists "Blog admins can create articles" on public.articles;
drop policy if exists "Blog admins can update articles" on public.articles;
drop policy if exists "Blog admins can delete articles" on public.articles;

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
  status,
  published_at,
  author_id
)
select
  'Primer articulo',
  'primer-articulo',
  'Articulo de prueba para validar el blog.',
  '# Primer articulo' || chr(10) || chr(10) || 'Contenido escrito en Markdown.',
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
