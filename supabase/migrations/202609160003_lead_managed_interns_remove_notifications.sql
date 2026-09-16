drop table if exists public.notifications cascade;
drop type if exists public.notification_type;

alter table public.profiles drop constraint if exists profiles_id_fkey;
alter table public.profiles alter column id set default gen_random_uuid();

drop policy if exists "leads create intern profiles" on public.profiles;
create policy "leads create intern profiles" on public.profiles
for insert to authenticated
with check (public.is_lead() and role = 'intern');
