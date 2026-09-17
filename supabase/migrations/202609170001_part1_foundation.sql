-- Migration: 202609170001_part1_foundation.sql
-- Part 1: Core Application & Database Foundation

-- 1. Ensure user_role enum supports 'employee'
do $$
begin
  if not exists (select 1 from pg_type t join pg_enum e on t.oid = e.enumtypid where t.typname = 'user_role' and e.enumlabel = 'employee') then
    alter type public.user_role add value 'employee';
  end if;
exception
  when duplicate_object then null;
end $$;

-- 2. Add is_active column to profiles if it doesn't exist
alter table public.profiles
add column if not exists is_active boolean not null default true;

-- 3. Update existing profiles with 'intern' role to 'employee' if needed
do $$
begin
  execute 'update public.profiles set role = ''employee''::public.user_role where role::text = ''intern''';
exception
  when undefined_object then null;
  when others then null;
end $$;

-- 4. Update is_lead helper function to strictly check role
create or replace function public.is_lead()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'lead' and is_active = true);
$$;

-- 5. Updated trigger function for auth user creation
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  assigned_role public.user_role;
  raw_role text;
begin
  raw_role := new.raw_user_meta_data->>'role';
  if raw_role = 'lead' then
    assigned_role := 'lead'::public.user_role;
  else
    assigned_role := 'employee'::public.user_role;
  end if;

  insert into public.profiles (id, full_name, email, role, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'Employee'),
    new.email,
    assigned_role,
    true
  )
  on conflict (id) do update
  set full_name = excluded.full_name,
      email = excluded.email;
  return new;
end;
$$;

-- 6. Strict RLS Policies on profiles
alter table public.profiles enable row level security;

drop policy if exists "profiles are visible to authenticated users" on public.profiles;
drop policy if exists "users update own non-role profile" on public.profiles;
drop policy if exists "leads create intern profiles" on public.profiles;
drop policy if exists "leads manage employee profiles" on public.profiles;
drop policy if exists "users read own or leads read all profiles" on public.profiles;

-- Allow users to read their own profile, or leads to read all profiles
create policy "users read own or leads read all profiles" on public.profiles
for select to authenticated
using (id = auth.uid() or public.is_lead());

-- Allow users to update their own full_name and avatar_url, but NOT role or is_active
create policy "users update own profile details" on public.profiles
for update to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and role = (select role from public.profiles where id = auth.uid())
  and is_active = (select is_active from public.profiles where id = auth.uid())
);

-- Leads can update any profile (including changing active status or role)
create policy "leads update any profile" on public.profiles
for update to authenticated
using (public.is_lead())
with check (public.is_lead());

-- 7. Notifications table foundation
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info',
  is_read boolean not null default false,
  link_url text,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create index if not exists notifications_user_id_idx on public.notifications(user_id, created_at desc);

drop policy if exists "users read own notifications" on public.notifications;
create policy "users read own notifications" on public.notifications
for select to authenticated using (user_id = auth.uid());

drop policy if exists "users update own notifications" on public.notifications;
create policy "users update own notifications" on public.notifications
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "leads or system create notifications" on public.notifications;
create policy "leads or system create notifications" on public.notifications
for insert to authenticated with check (public.is_lead() or user_id = auth.uid());

-- 8. Promises table foundation
create table if not exists public.promises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete cascade,
  title text not null,
  description text,
  due_date timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'fulfilled', 'missed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.promises enable row level security;

create index if not exists promises_user_id_idx on public.promises(user_id, status);

drop policy if exists "promises read access" on public.promises;
create policy "promises read access" on public.promises
for select to authenticated using (user_id = auth.uid() or public.is_lead());

drop policy if exists "users manage own promises" on public.promises;
create policy "users manage own promises" on public.promises
for all to authenticated using (user_id = auth.uid() or public.is_lead()) with check (user_id = auth.uid() or public.is_lead());

-- Trigger for promises updated_at
drop trigger if exists promises_updated_at on public.promises;
create trigger promises_updated_at before update on public.promises for each row execute function public.set_updated_at();
