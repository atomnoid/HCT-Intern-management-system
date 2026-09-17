-- Migration: 202609170002_part2_tasks.sql
-- Part 2: Task Management System, Workflow RPCs, Automated Notifications, and Strict RLS

-- 1. Ensure tasks table has all mandatory fields (started_at, category, etc.)
alter table public.tasks
add column if not exists started_at timestamptz,
add column if not exists start_date date default current_date;

-- 2. Enhanced create_task_with_activity procedure with notification trigger
create or replace function public.create_task_with_activity(
  task_title text,
  task_description text,
  task_assignee uuid,
  task_priority public.task_priority,
  task_due_date date,
  task_category text default null,
  checklist_titles text[] default '{}'
)
returns public.tasks language plpgsql security definer set search_path = public as $$
declare
  created_task public.tasks;
  item_title text;
  idx integer := 0;
  creator_name text;
begin
  if not public.is_lead() then
    raise exception 'Only leads can create tasks';
  end if;

  if task_assignee is null then
    raise exception 'Assignee is required';
  end if;

  select coalesce(full_name, 'Lead') into creator_name from public.profiles where id = auth.uid();

  insert into public.tasks(title, description, assignee_id, created_by, priority, due_date, category, start_date)
  values (task_title, task_description, task_assignee, auth.uid(), task_priority, task_due_date, task_category, current_date)
  returning * into created_task;

  -- Checklist items
  foreach item_title in array checklist_titles loop
    if length(trim(item_title)) > 0 then
      insert into public.task_checklist_items(task_id, title, position)
      values (created_task.id, trim(item_title), idx);
      idx := idx + 1;
    end if;
  end loop;

  -- Task created activity
  insert into public.task_activity(task_id, actor_id, action, metadata)
  values (created_task.id, auth.uid(), 'task_created', jsonb_build_object('title', task_title, 'assignee_id', task_assignee));

  -- Task assigned activity
  insert into public.task_activity(task_id, actor_id, action, metadata)
  values (created_task.id, auth.uid(), 'task_assigned', jsonb_build_object('assignee_id', task_assignee));

  -- Automated Notification to assigned employee
  insert into public.notifications (user_id, title, message, type, link_url)
  values (
    task_assignee,
    'New task assigned',
    format('You have been assigned task "%s" by %s.', task_title, creator_name),
    'task_assignment',
    format('/tasks/%s', created_task.id)
  );

  return created_task;
end;
$$;

-- 3. Procedure: Start Task (todo -> in_progress transition)
create or replace function public.start_task(task_uuid uuid)
returns public.tasks language plpgsql security definer set search_path = public as $$
declare
  target_task public.tasks;
begin
  select * into target_task from public.tasks where id = task_uuid;
  if target_task.id is null then
    raise exception 'Task not found';
  end if;

  if target_task.assignee_id != auth.uid() and not public.is_lead() then
    raise exception 'Not authorized to start this task';
  end if;

  if target_task.status != 'todo' then
    raise exception 'Task is already started or not in todo status';
  end if;

  update public.tasks
  set status = 'in_progress',
      started_at = coalesce(started_at, now())
  where id = task_uuid
  returning * into target_task;

  insert into public.task_activity(task_id, actor_id, action, metadata)
  values (task_uuid, auth.uid(), 'task_started', jsonb_build_object('started_at', target_task.started_at));

  return target_task;
end;
$$;

-- 4. Reassignment RPC with metadata & double notification
create or replace function public.reassign_task(task_uuid uuid, new_assignee_id uuid)
returns public.tasks language plpgsql security definer set search_path = public as $$
declare
  target_task public.tasks;
  old_assignee_id uuid;
  assigner_name text;
begin
  if not public.is_lead() then
    raise exception 'Only leads can reassign tasks';
  end if;

  select * into target_task from public.tasks where id = task_uuid;
  if target_task.id is null then
    raise exception 'Task not found';
  end if;

  old_assignee_id := target_task.assignee_id;
  if old_assignee_id = new_assignee_id then
    return target_task;
  end if;

  select coalesce(full_name, 'Lead') into assigner_name from public.profiles where id = auth.uid();

  update public.tasks
  set assignee_id = new_assignee_id
  where id = task_uuid
  returning * into target_task;

  insert into public.task_activity(task_id, actor_id, action, metadata)
  values (task_uuid, auth.uid(), 'assignee_changed', jsonb_build_object(
    'old_assignee_id', old_assignee_id,
    'new_assignee_id', new_assignee_id
  ));

  -- Notify new assignee
  insert into public.notifications (user_id, title, message, type, link_url)
  values (
    new_assignee_id,
    'Task reassigned to you',
    format('Task "%s" was reassigned to you by %s.', target_task.title, assigner_name),
    'task_assignment',
    format('/tasks/%s', task_uuid)
  );

  return target_task;
end;
$$;

-- 5. Updated report_task_blocker with automated notification to Lead
create or replace function public.report_task_blocker(task_uuid uuid, blocker_reason text)
returns public.task_blockers language plpgsql security definer set search_path = public as $$
declare
  created_blocker public.task_blockers;
  target_task public.tasks;
  reporter_name text;
begin
  if length(trim(blocker_reason)) < 8 then
    raise exception 'Blocker reason is too short (minimum 8 characters)';
  end if;

  select * into target_task from public.tasks
  where id = task_uuid and (assignee_id = auth.uid() or public.is_lead());
  if target_task.id is null then
    raise exception 'Task not found or access denied';
  end if;

  if target_task.status = 'completed' then
    raise exception 'Cannot report a blocker on a completed task';
  end if;

  select coalesce(full_name, 'Employee') into reporter_name from public.profiles where id = auth.uid();

  insert into public.task_blockers(task_id, reported_by, reason)
  values (task_uuid, auth.uid(), trim(blocker_reason))
  returning * into created_blocker;

  update public.tasks set status = 'blocked' where id = task_uuid;

  insert into public.task_activity(task_id, actor_id, action, metadata)
  values (task_uuid, auth.uid(), 'blocker_reported', jsonb_build_object('reason', blocker_reason, 'blocker_id', created_blocker.id));

  -- Notify Lead who created the task or all leads if missing
  if target_task.created_by is not null then
    insert into public.notifications (user_id, title, message, type, link_url)
    values (
      target_task.created_by,
      'Task blocked',
      format('%s reported a blocker on task "%s": %s', reporter_name, target_task.title, blocker_reason),
      'blocker_reported',
      format('/tasks/%s', task_uuid)
    );
  end if;

  return created_blocker;
end;
$$;

-- 6. Updated resolve_task_blocker returning task to in_progress with notification
create or replace function public.resolve_task_blocker(blocker_uuid uuid)
returns public.task_blockers language plpgsql security definer set search_path = public as $$
declare
  resolved public.task_blockers;
  target_task public.tasks;
  resolver_name text;
begin
  if not public.is_lead() then
    raise exception 'Only leads can resolve blockers';
  end if;

  update public.task_blockers
  set is_resolved = true, resolved_by = auth.uid(), resolved_at = now()
  where id = blocker_uuid and is_resolved = false
  returning * into resolved;

  if resolved.id is null then
    raise exception 'Open blocker not found';
  end if;

  select * into target_task from public.tasks where id = resolved.task_id;
  select coalesce(full_name, 'Lead') into resolver_name from public.profiles where id = auth.uid();

  -- Return task status to in_progress
  update public.tasks set status = 'in_progress' where id = resolved.task_id;

  insert into public.task_activity(task_id, actor_id, action, metadata)
  values (resolved.task_id, auth.uid(), 'blocker_resolved', jsonb_build_object('blocker_id', blocker_uuid));

  -- Notify assignee employee
  if target_task.assignee_id is not null then
    insert into public.notifications (user_id, title, message, type, link_url)
    values (
      target_task.assignee_id,
      'Blocker resolved',
      format('Blocker on task "%s" was resolved by %s.', target_task.title, resolver_name),
      'blocker_resolved',
      format('/tasks/%s', resolved.task_id)
    );
  end if;

  return resolved;
end;
$$;

-- 7. Updated submit_task_for_review moving task to in_review and notifying Lead
create or replace function public.submit_task_for_review(
  task_uuid uuid,
  completion_note text,
  github_url text default null,
  preview_url text default null
)
returns public.task_submissions language plpgsql security definer set search_path = public as $$
declare
  created_submission public.task_submissions;
  target_task public.tasks;
  submitter_name text;
begin
  select * into target_task from public.tasks
  where id = task_uuid and (assignee_id = auth.uid() or public.is_lead());
  if target_task.id is null then
    raise exception 'Task not found or access denied';
  end if;

  if target_task.status in ('in_review', 'completed') then
    raise exception 'Task is already in review or completed';
  end if;

  select coalesce(full_name, 'Employee') into submitter_name from public.profiles where id = auth.uid();

  insert into public.task_submissions(task_id, submitted_by, completion_note, github_url, preview_url)
  values (task_uuid, auth.uid(), completion_note, github_url, preview_url)
  returning * into created_submission;

  update public.tasks
  set status = 'in_review',
      progress = greatest(progress, 90)
  where id = task_uuid;

  insert into public.task_activity(task_id, actor_id, action, metadata)
  values (task_uuid, auth.uid(), 'submitted_for_review', jsonb_build_object('submission_id', created_submission.id));

  -- Notify task creator Lead
  if target_task.created_by is not null then
    insert into public.notifications (user_id, title, message, type, link_url)
    values (
      target_task.created_by,
      'Task submitted for review',
      format('%s submitted task "%s" for review.', submitter_name, target_task.title),
      'task_submitted',
      format('/tasks/%s', task_uuid)
    );
  end if;

  return created_submission;
end;
$$;

-- 8. Updated review_task_submission handling approve & request changes with notifications & progress
create or replace function public.review_task_submission(
  submission_uuid uuid,
  review_decision text,
  review_feedback text default null
)
returns public.task_reviews language plpgsql security definer set search_path = public as $$
declare
  target_submission public.task_submissions;
  target_task public.tasks;
  created_review public.task_reviews;
  reviewer_name text;
begin
  if not public.is_lead() then
    raise exception 'Only leads can review task submissions';
  end if;

  if review_decision not in ('approved', 'changes_requested') then
    raise exception 'Invalid review decision';
  end if;

  if review_decision = 'changes_requested' and length(trim(coalesce(review_feedback, ''))) < 8 then
    raise exception 'Detailed feedback (min 8 chars) is required when requesting changes';
  end if;

  select * into target_submission from public.task_submissions where id = submission_uuid;
  if target_submission.id is null then
    raise exception 'Submission not found';
  end if;

  select * into target_task from public.tasks where id = target_submission.task_id;
  select coalesce(full_name, 'Lead') into reviewer_name from public.profiles where id = auth.uid();

  insert into public.task_reviews(task_id, submission_id, reviewed_by, decision, feedback)
  values (target_submission.task_id, submission_uuid, auth.uid(), review_decision, review_feedback)
  returning * into created_review;

  if review_decision = 'approved' then
    update public.tasks
    set status = 'completed',
        progress = 100,
        completed_at = now()
    where id = target_submission.task_id;

    insert into public.task_activity(task_id, actor_id, action, metadata)
    values (target_submission.task_id, auth.uid(), 'task_approved', jsonb_build_object('submission_id', submission_uuid));

    insert into public.task_activity(task_id, actor_id, action, metadata)
    values (target_submission.task_id, auth.uid(), 'task_completed', jsonb_build_object('completed_at', now()));

    if target_task.assignee_id is not null then
      insert into public.notifications (user_id, title, message, type, link_url)
      values (
        target_task.assignee_id,
        'Task completed',
        format('Congratulations! Task "%s" has been approved and marked as completed.', target_task.title),
        'task_approved',
        format('/tasks/%s', target_submission.task_id)
      );
    end if;

  else -- changes_requested
    update public.tasks
    set status = 'in_progress'
    where id = target_submission.task_id;

    insert into public.task_activity(task_id, actor_id, action, metadata)
    values (target_submission.task_id, auth.uid(), 'changes_requested', jsonb_build_object('submission_id', submission_uuid, 'feedback', review_feedback));

    if target_task.assignee_id is not null then
      insert into public.notifications (user_id, title, message, type, link_url)
      values (
        target_task.assignee_id,
        'Changes requested',
        format('%s requested changes on task "%s": %s', reviewer_name, target_task.title, review_feedback),
        'changes_requested',
        format('/tasks/%s', target_submission.task_id)
      );
    end if;
  end if;

  return created_review;
end;
$$;

-- 9. Strict RLS Policies for tasks and child entities
alter table public.tasks enable row level security;
drop policy if exists "tasks read policy" on public.tasks;
drop policy if exists "tasks insert policy" on public.tasks;
drop policy if exists "tasks update policy" on public.tasks;

create policy "tasks read policy" on public.tasks
for select to authenticated
using (public.is_lead() or assignee_id = auth.uid() or created_by = auth.uid());

create policy "tasks insert policy" on public.tasks
for insert to authenticated
with check (public.is_lead());

create policy "tasks update policy" on public.tasks
for update to authenticated
using (public.is_lead() or assignee_id = auth.uid())
with check (public.is_lead() or assignee_id = auth.uid());

-- Checklist RLS
alter table public.task_checklist_items enable row level security;
drop policy if exists "checklist read policy" on public.task_checklist_items;
drop policy if exists "checklist write policy" on public.task_checklist_items;

create policy "checklist read policy" on public.task_checklist_items
for select to authenticated
using (public.can_access_task(task_id));

create policy "checklist write policy" on public.task_checklist_items
for all to authenticated
using (public.can_access_task(task_id))
with check (public.can_access_task(task_id));

-- Comments RLS
alter table public.task_comments enable row level security;
drop policy if exists "comments read policy" on public.task_comments;
drop policy if exists "comments insert policy" on public.task_comments;

create policy "comments read policy" on public.task_comments
for select to authenticated
using (public.can_access_task(task_id));

create policy "comments insert policy" on public.task_comments
for insert to authenticated
with check (public.can_access_task(task_id) and author_id = auth.uid());

-- Activity RLS (append-only via RPCs/triggers or task accessors)
alter table public.task_activity enable row level security;
drop policy if exists "activity read policy" on public.task_activity;
drop policy if exists "activity insert policy" on public.task_activity;

create policy "activity read policy" on public.task_activity
for select to authenticated
using (public.can_access_task(task_id));

create policy "activity insert policy" on public.task_activity
for insert to authenticated
with check (public.can_access_task(task_id));
