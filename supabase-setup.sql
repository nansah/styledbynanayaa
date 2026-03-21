-- ═══════════════════════════════════════════════════════════════
--  STYLED BY NANA YAA — Supabase Database Setup
--  Run this entire file in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Posts table ──────────────────────────────────────────────
create table if not exists posts (
  id           text primary key,
  slug         text unique not null,
  title        text not null,
  category     text not null check (category in ('fashion', 'faith', 'lifestyle')),
  status       text not null default 'draft' check (status in ('published', 'draft')),
  published_at timestamptz,
  cover_image  text,
  cover_alt    text,
  excerpt      text,
  body         text,
  seo_title    text,
  seo_desc     text,
  tags         text[] default '{}',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ── 2. Auto-update updated_at ────────────────────────────────────
create or replace function handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on posts;
create trigger set_updated_at
  before update on posts
  for each row execute procedure handle_updated_at();

-- ── 3. Row Level Security ────────────────────────────────────────
alter table posts enable row level security;

-- Anyone can read published posts (public blog)
create policy "Public can read published posts"
  on posts for select
  using (status = 'published');

-- Authenticated users (admin) can read ALL posts (including drafts)
create policy "Authenticated users can read all posts"
  on posts for select
  using (auth.role() = 'authenticated');

-- Only authenticated users can insert / update / delete
create policy "Authenticated users can insert posts"
  on posts for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update posts"
  on posts for update
  using (auth.role() = 'authenticated');

create policy "Authenticated users can delete posts"
  on posts for delete
  using (auth.role() = 'authenticated');

-- ── 4. Index for fast lookups ────────────────────────────────────
create index if not exists posts_slug_idx     on posts (slug);
create index if not exists posts_category_idx on posts (category);
create index if not exists posts_status_idx   on posts (status);

-- ── 5. Shop Faves table ──────────────────────────────────────────
create table if not exists faves (
  id            text primary key,
  name          text not null,
  brand         text not null,
  category      text not null check (category in ('fashion', 'beauty', 'home', 'wellness', 'faith')),
  status        text not null default 'draft' check (status in ('published', 'draft')),
  description   text,
  price         text,
  affiliate_url text,
  image_url     text,
  is_fave       boolean default false,
  sort_order    integer default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

drop trigger if exists set_updated_at_faves on faves;
create trigger set_updated_at_faves
  before update on faves
  for each row execute procedure handle_updated_at();

alter table faves enable row level security;

create policy "Public can read published faves"
  on faves for select
  using (status = 'published');

create policy "Authenticated users can read all faves"
  on faves for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert faves"
  on faves for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update faves"
  on faves for update
  using (auth.role() = 'authenticated');

create policy "Authenticated users can delete faves"
  on faves for delete
  using (auth.role() = 'authenticated');

create index if not exists faves_category_idx on faves (category);
create index if not exists faves_status_idx   on faves (status);
create index if not exists faves_sort_idx     on faves (sort_order);

-- ── 6. Done ──────────────────────────────────────────────────────
-- Now go to: Supabase Dashboard → Authentication → Users → Add User
-- Create your admin account (email + password) there.
-- Then add your project URL + anon key to config.js
