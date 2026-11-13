-- ABA Web Agency — questionnaire schema
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('admin', 'client');
create type public.response_status as enum ('in_progress', 'submitted');

-- ---------------------------------------------------------------------------
-- profiles — one row per auth user, created automatically on signup
-- ---------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  company     text,
  role        public.user_role not null default 'client',
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- responses — one questionnaire response per client
-- ---------------------------------------------------------------------------
create table public.responses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null unique references auth.users (id) on delete cascade,
  status        public.response_status not null default 'in_progress',
  answers       jsonb not null default '{}'::jsonb,
  submitted_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index responses_status_idx on public.responses (status, updated_at desc);

-- ---------------------------------------------------------------------------
-- Helper: is the calling user an admin?
-- SECURITY DEFINER so the policy can read profiles without recursing into RLS.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Keep updated_at fresh
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger responses_touch_updated_at
  before update on public.responses
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Create a profile whenever a user signs up
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, company)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'company', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.profiles  enable row level security;
alter table public.responses enable row level security;

-- profiles: read own, or everything if admin
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

-- profiles: a user may edit their own name/company (role stays locked down;
-- promote an admin from the SQL editor, see the note at the bottom)
create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

-- responses: clients see only their own row, admins see all
create policy "responses_select_own_or_admin"
  on public.responses for select
  using (user_id = auth.uid() or public.is_admin());

create policy "responses_insert_own"
  on public.responses for insert
  with check (user_id = auth.uid());

-- a submitted response is locked for the client; admins can still edit
create policy "responses_update_own_while_open"
  on public.responses for update
  using (
    (user_id = auth.uid() and status = 'in_progress')
    or public.is_admin()
  )
  with check (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- Next: run create-users.sql to create the admin and client accounts.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Storage — uploaded logos and brand assets
--
-- Private bucket. Clients write only into a folder named after their own user
-- id; admins can read everything. The app hands out short-lived signed URLs.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('branding', 'branding', false, 10485760)
on conflict (id) do nothing;

create policy "branding_insert_own_folder"
  on storage.objects for insert
  with check (
    bucket_id = 'branding'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "branding_update_own_folder"
  on storage.objects for update
  using (
    bucket_id = 'branding'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "branding_select_own_or_admin"
  on storage.objects for select
  using (
    bucket_id = 'branding'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

create policy "branding_delete_own_folder"
  on storage.objects for delete
  using (
    bucket_id = 'branding'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
