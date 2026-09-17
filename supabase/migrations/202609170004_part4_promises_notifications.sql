-- Migration: 202609170004_part4_promises_notifications.sql
-- Part 4: Promises, Automatic Sync Triggers, Idempotent Reminders & Notification System

-- 1. Ensure promises table schema with strict status check constraint
create table if not exists public.promises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  title text not null,
  description text,
  due_date timestamptz not null,
  status text not null default 'active' check (status in ('active', 'fulfilled', 'missed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.promises enable row level security;
create index if not exists promises_user_id_idx on public.promises(user_id, status);
create index if not exists promises_task_id_idx on public.promises(task_id);

-- Updated trigger for promises updated_at
drop trigger if exists promises_updated_at on public.promises;
create trigger promises_updated_at before update on public.promises for each row execute function public.set_updated_at();

-- 2. Create Promise Function (RPC)
create or replace function public.create_promise(
  task_uuid uuid,
  promise_title text,
  promise_description text default null,
  promise_due_date timestamptz default null
)
returns public.promises language plpgsql security definer set search_path = public as $$
declare
  created_promise public.promises;
  target_task public.tasks;
  employee_name text;
begin
  select * into target_task from public.tasks where id = task_uuid;
  if target_task.id is null then
    raise exception 'Task not found';
  end if;

  if target_task.assignee_id != auth.uid() and not public.is_lead() then
    raise exception 'You can only create commitments for your assigned tasks';
  end if;

  if length(trim(promise_title)) < 3 then
    raise exception 'Promise title is too short';
  end if;

  select coalesce(full_name, 'Employee') into employee_name from public.profiles where id = auth.uid();

  insert into public.promises (
    user_id,
    task_id,
    title,
    description,
    due_date,
    status
  )
  values (
    target_task.assignee_id,
    task_uuid,
    trim(promise_title),
    promise_description,
    coalesce(promise_due_date, target_task.due_date::timestamptz, now() + interval '3 days'),
    case when target_task.status = 'completed' then 'fulfilled' else 'active' end
  )
  returning * into created_promise;

  -- Activity entry
  insert into public.task_activity(task_id, actor_id, action, metadata)
  values (task_uuid, auth.uid(), 'promise_created', jsonb_build_object('promise_id', created_promise.id, 'title', promise_title));

  -- Notify Lead if created by Employee
  if target_task.created_by is not null and target_task.created_by != auth.uid() then
    insert into public.notifications (user_id, title, message, type, link_url)
    values (
      target_task.created_by,
      'New Promise committed',
      format('%s committed to a promise for task "%s": %s', employee_name, target_task.title, promise_title),
      'promise_created',
      format('/promises')
    );
  end if;

  return created_promise;
end;
$$;

-- 3. Automatic Task -> Promise Synchronization Trigger
create or replace function public.sync_task_promise_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'completed' then
    update public.promises
    set status = 'fulfilled'
    where task_id = new.id and status = 'active';

    insert into public.task_activity(task_id, actor_id, action, metadata)
    select new.id, auth.uid(), 'promise_fulfilled', jsonb_build_object('reason', 'Task marked completed')
    from public.promises where task_id = new.id and status = 'fulfilled';
  end if;
  return new;
end;
$$;

drop trigger if exists sync_task_to_promises on public.tasks;
create trigger sync_task_to_promises
  after update of status on public.tasks
  for each row execute function public.sync_task_promise_status();

-- 4. Idempotent Scheduled Job RPC for Overdue and Due-Soon Reminders
create or replace function public.run_deadline_reminders()
returns void language plpgsql security definer set search_path = public as $$
declare
  t record;
  p record;
  today_str text := current_date::text;
  tomorrow_str text := (current_date + interval '1 day')::date::text;
begin
  -- A. Task Due Soon Reminders
  for t in
    select id, title, assignee_id, due_date
    from public.tasks
    where status not in ('completed')
      and due_date::text = tomorrow_str
      and assignee_id is not null
  loop
    if not exists (
      select 1 from public.notifications
      where user_id = t.assignee_id
        and type = 'task_due_soon'
        and link_url = format('/tasks/%s', t.id)
        and created_at::date = current_date
    ) then
      insert into public.notifications (user_id, title, message, type, link_url)
      values (
        t.assignee_id,
        'Task due tomorrow',
        format('Reminder: Task "%s" is due tomorrow (%s).', t.title, t.due_date),
        'task_due_soon',
        format('/tasks/%s', t.id)
      );
    end if;
  end loop;

  -- B. Task Overdue Reminders
  for t in
    select id, title, assignee_id, due_date
    from public.tasks
    where status not in ('completed')
      and due_date < current_date
      and assignee_id is not null
  loop
    if not exists (
      select 1 from public.notifications
      where user_id = t.assignee_id
        and type = 'task_overdue'
        and link_url = format('/tasks/%s', t.id)
        and created_at::date = current_date
    ) then
      insert into public.notifications (user_id, title, message, type, link_url)
      values (
        t.assignee_id,
        'Task is overdue',
        format('Task "%s" passed its deadline of %s and requires immediate attention.', t.title, t.due_date),
        'task_overdue',
        format('/tasks/%s', t.id)
      );
    end if;
  end loop;

  -- C. Promise Missed Sync
  for p in
    select id, user_id, title, task_id
    from public.promises
    where status = 'active'
      and due_date < now()
  loop
    update public.promises set status = 'missed' where id = p.id;

    if not exists (
      select 1 from public.notifications
      where user_id = p.user_id
        and type = 'promise_missed'
        and link_url = format('/promises')
        and created_at::date = current_date
    ) then
      insert into public.notifications (user_id, title, message, type, link_url)
      values (
        p.user_id,
        'Promise commitment missed',
        format('Your promise "%s" passed its target date.', p.title),
        'promise_missed',
        '/promises'
      );
    end if;

    insert into public.task_activity(task_id, actor_id, action, metadata)
    values (p.task_id, p.user_id, 'promise_missed', jsonb_build_object('promise_id', p.id, 'title', p.title));
  end loop;
end;
$$;

-- 5. RLS Policies for Promises
drop policy if exists "promises read access" on public.promises;
create policy "promises read access" on public.promises
for select to authenticated
using (user_id = auth.uid() or public.is_lead());

drop policy if exists "users manage own promises" on public.promises;
create policy "users create own promises" on public.promises
for insert to authenticated
with check (user_id = auth.uid() or public.is_lead());

drop policy if exists "users update own promises" on public.promises;
create policy "users update own promises" on public.promises
for update to authenticated
using (user_id = auth.uid() or public.is_lead())
with check (user_id = auth.uid() or public.is_lead());
