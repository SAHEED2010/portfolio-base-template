-- Initial schema: seven tables + RLS.
-- Reasoning: DECISIONS.md ("Schema" and "Schema details" sections).
-- Reference: SCHEMA.md.
--
-- NOT YET APPLIED. Review checkpoint per CLAUDE.md — do not run
-- against Supabase until this is confirmed.

-- ---------------------------------------------------------------
-- gen_random_uuid() is core Postgres since v13, so this is belt-and-
-- braces for forks that land on an older or non-Supabase Postgres.
-- `if not exists` is correct here (environment setup, not schema) —
-- unlike the tables below, which must fail loudly on re-run.
-- ---------------------------------------------------------------
create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------
-- Shared trigger: keeps updated_at current on every UPDATE.
-- One function, attached per table below.
-- ---------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------
-- 1. site_settings
-- ---------------------------------------------------------------
create table public.site_settings (
  key         text primary key,
  value       jsonb not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

create policy "site_settings_public_select"
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy "site_settings_authenticated_write"
  on public.site_settings for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------
-- 2. skills
-- ---------------------------------------------------------------
create table public.skills (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  display_order  integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.skills
  for each row execute function public.set_updated_at();

alter table public.skills enable row level security;

create policy "skills_public_select"
  on public.skills for select
  to anon, authenticated
  using (true);

create policy "skills_authenticated_write"
  on public.skills for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------
-- 3. experiences
-- ---------------------------------------------------------------
create table public.experiences (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  org            text not null,
  logo_url       text,
  start_date     date not null,
  end_date       date,
  type           text,
  description    text,
  display_order  integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.experiences
  for each row execute function public.set_updated_at();

alter table public.experiences enable row level security;

create policy "experiences_public_select"
  on public.experiences for select
  to anon, authenticated
  using (true);

create policy "experiences_authenticated_write"
  on public.experiences for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------
-- 4. works (Projects + Portfolio merged — do not split)
-- ---------------------------------------------------------------
create table public.works (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  subtitle       text,
  image_url      text,
  external_url   text not null,
  display_order  integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.works
  for each row execute function public.set_updated_at();

alter table public.works enable row level security;

create policy "works_public_select"
  on public.works for select
  to anon, authenticated
  using (true);

create policy "works_authenticated_write"
  on public.works for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------
-- 5. testimonials
-- ---------------------------------------------------------------
create table public.testimonials (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  avatar_url     text,
  quote          text not null,
  rating         integer check (rating between 1 and 5),
  display_order  integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();

alter table public.testimonials enable row level security;

create policy "testimonials_public_select"
  on public.testimonials for select
  to anon, authenticated
  using (true);

create policy "testimonials_authenticated_write"
  on public.testimonials for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------
-- 6. stats
-- ---------------------------------------------------------------
create table public.stats (
  id          uuid primary key default gen_random_uuid(),
  label       text not null,
  number      text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.stats
  for each row execute function public.set_updated_at();

alter table public.stats enable row level security;

create policy "stats_public_select"
  on public.stats for select
  to anon, authenticated
  using (true);

create policy "stats_authenticated_write"
  on public.stats for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------
-- 7. contact_messages
-- Public can INSERT only — no public SELECT/UPDATE/DELETE, ever.
-- ---------------------------------------------------------------
create table public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  message     text not null,
  read        boolean not null default false,
  ip_address  text,
  created_at  timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "contact_messages_public_insert"
  on public.contact_messages for insert
  to anon
  with check (true);

create policy "contact_messages_authenticated_select"
  on public.contact_messages for select
  to authenticated
  using (true);

create policy "contact_messages_authenticated_update"
  on public.contact_messages for update
  to authenticated
  using (true)
  with check (true);

create policy "contact_messages_authenticated_delete"
  on public.contact_messages for delete
  to authenticated
  using (true);
