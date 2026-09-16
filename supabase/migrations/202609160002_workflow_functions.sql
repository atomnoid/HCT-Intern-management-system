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
begin
  if not public.is_lead() then raise exception 'Only leads can create tasks'; end if;

  insert into public.tasks(title, description, assignee_id, created_by, priority, due_date, category, start_date)
  values (task_title, task_description, task_assignee, auth.uid(), task_priority, task_due_date, task_category, current_date)
  returning * into created_task;

  foreach item_title in array checklist_titles loop
    if length(trim(item_title)) > 0 then
      insert into public.task_checklist_items(task_id, title, position) values (created_task.id, trim(item_title), idx);
      idx := idx + 1;
    end if;
  end loop;

  insert into public.task_activity(task_id, actor_id, action, metadata)
  values (created_task.id, auth.uid(), 'task_created', jsonb_build_object('title', task_title, 'assignee_id', task_assignee));

  return created_task;
end;
$$;

create or replace function public.update_task_progress(task_uuid uuid, next_progress integer)
returns public.tasks language plpgsql security definer set search_path = public as $$
declare
  old_progress integer;
  updated_task public.tasks;
begin
  if next_progress < 0 or next_progress > 100 then raise exception 'Progress must be between 0 and 100'; end if;
  select progress into old_progress from public.tasks where id = task_uuid and (assignee_id = auth.uid() or public.is_lead());
  if old_progress is null then raise exception 'Task not found or not assigned to you'; end if;

  update public.tasks set progress = next_progress where id = task_uuid returning * into updated_task;
  insert into public.task_activity(task_id, actor_id, action, metadata)
  values (task_uuid, auth.uid(), 'progress_updated', jsonb_build_object('from', old_progress, 'to', next_progress));
  return updated_task;
end;
$$;

create or replace function public.report_task_blocker(task_uuid uuid, blocker_reason text)
returns public.task_blockers language plpgsql security definer set search_path = public as $$
declare
  created_blocker public.task_blockers;
  lead_id uuid;
begin
  if length(trim(blocker_reason)) < 8 then raise exception 'Blocker reason is too short'; end if;
  select created_by into lead_id from public.tasks where id = task_uuid and (assignee_id = auth.uid() or public.is_lead());
  if lead_id is null then raise exception 'Task not found or not accessible'; end if;

  insert into public.task_blockers(task_id, reported_by, reason) values (task_uuid, auth.uid(), trim(blocker_reason)) returning * into created_blocker;
  update public.tasks set status = 'blocked' where id = task_uuid;
  insert into public.task_activity(task_id, actor_id, action, metadata) values (task_uuid, auth.uid(), 'blocker_reported', jsonb_build_object('reason', blocker_reason));
  return created_blocker;
end;
$$;

create or replace function public.resolve_task_blocker(blocker_uuid uuid)
returns public.task_blockers language plpgsql security definer set search_path = public as $$
declare
  resolved public.task_blockers;
  intern_id uuid;
begin
  if not public.is_lead() then raise exception 'Only leads can resolve blockers'; end if;
  update public.task_blockers set is_resolved = true, resolved_by = auth.uid(), resolved_at = now()
  where id = blocker_uuid and is_resolved = false returning * into resolved;
  if resolved.id is null then raise exception 'Open blocker not found'; end if;
  update public.tasks set status = 'in_progress' where id = resolved.task_id returning assignee_id into intern_id;
  insert into public.task_activity(task_id, actor_id, action, metadata) values (resolved.task_id, auth.uid(), 'blocker_resolved', jsonb_build_object('blocker_id', blocker_uuid));
  return resolved;
end;
$$;

create or replace function public.submit_task_for_review(task_uuid uuid, completion_note text, github_url text default null, preview_url text default null)
returns public.task_submissions language plpgsql security definer set search_path = public as $$
declare
  created_submission public.task_submissions;
  lead_id uuid;
  current_status public.task_status;
begin
  select status, created_by into current_status, lead_id from public.tasks where id = task_uuid and (assignee_id = auth.uid() or public.is_lead());
  if lead_id is null then raise exception 'Task not found or not accessible'; end if;
  if current_status not in ('todo', 'in_progress', 'blocked') then raise exception 'Task cannot be submitted from this status'; end if;

  insert into public.task_submissions(task_id, submitted_by, completion_note, github_url, preview_url)
  values (task_uuid, auth.uid(), completion_note, github_url, preview_url) returning * into created_submission;
  update public.tasks set status = 'in_review', progress = greatest(progress, 90) where id = task_uuid;
  insert into public.task_activity(task_id, actor_id, action, metadata) values (task_uuid, auth.uid(), 'submission_created', jsonb_build_object('submission_id', created_submission.id));
  return created_submission;
end;
$$;

create or replace function public.review_task_submission(submission_uuid uuid, review_decision text, review_feedback text default null)
returns public.task_reviews language plpgsql security definer set search_path = public as $$
declare
  target_submission public.task_submissions;
  created_review public.task_reviews;
  intern_id uuid;
begin
  if not public.is_lead() then raise exception 'Only leads can review submissions'; end if;
  if review_decision not in ('approved', 'changes_requested') then raise exception 'Invalid review decision'; end if;
  if review_decision = 'changes_requested' and length(trim(coalesce(review_feedback, ''))) < 8 then raise exception 'Feedback is required'; end if;

  select * into target_submission from public.task_submissions where id = submission_uuid;
  if target_submission.id is null then raise exception 'Submission not found'; end if;

  insert into public.task_reviews(task_id, submission_id, reviewed_by, decision, feedback)
  values (target_submission.task_id, submission_uuid, auth.uid(), review_decision, review_feedback)
  returning * into created_review;

  if review_decision = 'approved' then
    update public.tasks set status = 'completed', progress = 100, completed_at = now() where id = target_submission.task_id returning assignee_id into intern_id;
  else
    update public.tasks set status = 'in_progress' where id = target_submission.task_id returning assignee_id into intern_id;
  end if;

  insert into public.task_activity(task_id, actor_id, action, metadata)
  values (target_submission.task_id, auth.uid(), case when review_decision = 'approved' then 'task_approved' else 'changes_requested' end, jsonb_build_object('submission_id', submission_uuid, 'feedback', review_feedback));
  return created_review;
end;
$$;
