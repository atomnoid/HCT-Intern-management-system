create extension if not exists pgcrypto;

create type public.user_role as enum ('lead', 'intern');
create type public.task_status as enum ('todo', 'in_progress', 'blocked', 'in_review', 'completed');
create type public.task_priority as enum ('low', 'medium', 'high', 'urgent');
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  avatar_url text,
  role public.user_role not null default 'intern',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  assignee_id uuid references public.profiles(id),
  created_by uuid references public.profiles(id),
  status public.task_status not null default 'todo',
  priority public.task_priority not null default 'medium',
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  category text,
  start_date date,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.task_checklist_items (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  title text not null,
  is_completed boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.task_blockers (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  reported_by uuid not null references public.profiles(id),
  reason text not null,
  is_resolved boolean not null default false,
  resolved_by uuid references public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index task_blockers_one_open_per_task on public.task_blockers(task_id) where is_resolved = false;

create table public.task_submissions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  submitted_by uuid not null references public.profiles(id),
  completion_note text,
  github_url text,
  preview_url text,
  created_at timestamptz not null default now()
);

create table public.task_reviews (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  submission_id uuid references public.task_submissions(id) on delete cascade,
  reviewed_by uuid not null references public.profiles(id),
  decision text not null check (decision in ('approved', 'changes_requested')),
  feedback text,
  created_at timestamptz not null default now(),
  constraint changes_need_feedback check (decision <> 'changes_requested' or length(trim(coalesce(feedback, ''))) >= 8)
);

create table public.task_activity (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  action text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index tasks_assignee_id_idx on public.tasks(assignee_id);
create index tasks_status_idx on public.tasks(status);
create index tasks_due_date_idx on public.tasks(due_date);
create index tasks_created_at_idx on public.tasks(created_at desc);
create index tasks_updated_at_idx on public.tasks(updated_at desc);
create index checklist_task_position_idx on public.task_checklist_items(task_id, position);
create index comments_task_created_idx on public.task_comments(task_id, created_at);
create index activity_task_created_idx on public.task_activity(task_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger tasks_updated_at before update on public.tasks for each row execute function public.set_updated_at();
create trigger checklist_updated_at before update on public.task_checklist_items for each row execute function public.set_updated_at();
create trigger comments_updated_at before update on public.task_comments for each row execute function public.set_updated_at();

create or replace function public.is_lead()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'lead');
$$;

create or replace function public.can_access_task(task_uuid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.tasks t
    where t.id = task_uuid and (public.is_lead() or t.assignee_id = auth.uid() or t.created_by = auth.uid())
  );
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'New user'),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'intern')
  );
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.valid_task_transition(from_status public.task_status, to_status public.task_status)
returns boolean language sql immutable as $$
  select case
    when from_status = to_status then true
    when from_status = 'todo' and to_status in ('in_progress', 'blocked') then true
    when from_status = 'in_progress' and to_status in ('blocked', 'in_review') then true
    when from_status = 'blocked' and to_status = 'in_progress' then true
    when from_status = 'in_review' and to_status in ('in_progress', 'completed') then true
    else false
  end;
$$;

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.task_checklist_items enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_blockers enable row level security;
alter table public.task_submissions enable row level security;
alter table public.task_reviews enable row level security;
alter table public.task_activity enable row level security;

create policy "profiles are visible to authenticated users" on public.profiles for select to authenticated using (true);
create policy "users update own non-role profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "leads create intern profiles" on public.profiles for insert to authenticated with check (public.is_lead() and role = 'intern');

create policy "leads see all tasks" on public.tasks for select to authenticated using (public.is_lead());
create policy "interns see assigned tasks" on public.tasks for select to authenticated using (assignee_id = auth.uid() or created_by = auth.uid());
create policy "leads create tasks" on public.tasks for insert to authenticated with check (public.is_lead() and created_by = auth.uid());
create policy "leads update tasks" on public.tasks for update to authenticated using (public.is_lead()) with check (public.is_lead());
create policy "interns limited task update" on public.tasks for update to authenticated
using (assignee_id = auth.uid())
with check (assignee_id = auth.uid() and created_by = created_by and status <> 'completed');

create policy "checklists readable by task access" on public.task_checklist_items for select to authenticated using (public.can_access_task(task_id));
create policy "checklists manageable by task access" on public.task_checklist_items for all to authenticated using (public.can_access_task(task_id)) with check (public.can_access_task(task_id));

create policy "comments readable by task access" on public.task_comments for select to authenticated using (public.can_access_task(task_id));
create policy "comments insert by task access" on public.task_comments for insert to authenticated with check (author_id = auth.uid() and public.can_access_task(task_id));

create policy "blockers readable by task access" on public.task_blockers for select to authenticated using (public.can_access_task(task_id));
create policy "interns create blocker on own tasks" on public.task_blockers for insert to authenticated with check (
  reported_by = auth.uid() and exists(select 1 from public.tasks where id = task_id and assignee_id = auth.uid())
);
create policy "leads resolve blockers" on public.task_blockers for update to authenticated using (public.is_lead()) with check (public.is_lead());

create policy "submissions readable by task access" on public.task_submissions for select to authenticated using (public.can_access_task(task_id));
create policy "interns submit own tasks" on public.task_submissions for insert to authenticated with check (
  submitted_by = auth.uid() and exists(select 1 from public.tasks where id = task_id and assignee_id = auth.uid())
);

create policy "reviews readable by task access" on public.task_reviews for select to authenticated using (public.can_access_task(task_id));
create policy "leads create reviews" on public.task_reviews for insert to authenticated with check (public.is_lead() and reviewed_by = auth.uid());

create policy "activity readable by task access" on public.task_activity for select to authenticated using (public.can_access_task(task_id));
create policy "activity insert by task access" on public.task_activity for insert to authenticated with check (actor_id = auth.uid() and public.can_access_task(task_id));
