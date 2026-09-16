create or replace function public.update_task_progress(task_uuid uuid, next_progress integer)
returns public.tasks language plpgsql security definer set search_path = public as $$
declare
  old_progress integer;
  updated_task public.tasks;
begin
  if next_progress < 0 or next_progress > 100 then raise exception 'Progress must be between 0 and 100'; end if;
  select progress into old_progress from public.tasks where id = task_uuid and (assignee_id = auth.uid() or public.is_lead());
  if old_progress is null then raise exception 'Task not found or not accessible'; end if;

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

create or replace function public.submit_task_for_review(task_uuid uuid, completion_note text, github_url text default null, preview_url text default null)
returns public.task_submissions language plpgsql security definer set search_path = public as $$
declare
  created_submission public.task_submissions;
  lead_id uuid;
  current_status public.task_status;
begin
  select status, created_by into current_status, lead_id from public.tasks where id = task_uuid and (assignee_id = auth.uid() or public.is_lead());
  if lead_id is null then raise exception 'Task not found or not accessible'; end if;
  if current_status not in ('todo', 'in_progress', 'blocked') then raise exception 'Task cannot be moved to review from this status'; end if;

  insert into public.task_submissions(task_id, submitted_by, completion_note, github_url, preview_url)
  values (task_uuid, auth.uid(), completion_note, github_url, preview_url) returning * into created_submission;
  update public.tasks set status = 'in_review', progress = greatest(progress, 90) where id = task_uuid;
  insert into public.task_activity(task_id, actor_id, action, metadata) values (task_uuid, auth.uid(), 'submission_created', jsonb_build_object('submission_id', created_submission.id));
  return created_submission;
end;
$$;
