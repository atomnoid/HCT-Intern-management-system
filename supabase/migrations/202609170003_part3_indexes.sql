-- Migration: 202609170003_part3_indexes.sql
-- Part 3: Indexes for Dashboard Performance & Aggregations

create index if not exists tasks_assignee_status_idx on public.tasks(assignee_id, status);
create index if not exists tasks_created_by_status_idx on public.tasks(created_by, status);
create index if not exists tasks_due_date_status_idx on public.tasks(due_date, status);
create index if not exists tasks_priority_status_idx on public.tasks(priority, status);
