import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile, Task, TaskActivity, TaskDetail } from "@/types/database";

const taskSelect = "*, assignee:profiles!tasks_assignee_id_fkey(*), creator:profiles!tasks_created_by_fkey(*)";

export async function getTasks(
  supabase: SupabaseClient,
  profile: Profile,
  searchParams?: Record<string, string | string[] | undefined>
) {
  let query = supabase.from("tasks").select(taskSelect);

  if (searchParams?.status) query = query.eq("status", String(searchParams.status));
  if (searchParams?.priority) query = query.eq("priority", String(searchParams.priority));
  if (searchParams?.assignee && profile.role === "lead") query = query.eq("assignee_id", String(searchParams.assignee));
  if (searchParams?.category) query = query.ilike("category", `%${searchParams.category}%`);
  if (searchParams?.q) query = query.or(`title.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%,category.ilike.%${searchParams.q}%`);
  if (searchParams?.due === "overdue") query = query.lt("due_date", new Date().toISOString().slice(0, 10)).neq("status", "completed");
  if (searchParams?.due === "today") query = query.eq("due_date", new Date().toISOString().slice(0, 10));

  const sort = String(searchParams?.sort ?? "due");
  if (sort === "priority") query = query.order("priority", { ascending: false });
  else if (sort === "created") query = query.order("created_at", { ascending: false });
  else if (sort === "updated") query = query.order("updated_at", { ascending: false });
  else query = query.order("due_date", { ascending: true, nullsFirst: false });

  const { data, error } = await query.limit(50);
  if (error) throw error;
  return (data ?? []) as Task[];
}

export async function getTaskDetail(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select(`${taskSelect}, task_checklist_items(*), task_comments(*, author:profiles(*)), task_blockers(*), task_submissions(*), task_reviews(*), task_activity(*, actor:profiles(*))`)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as TaskDetail;
}

export async function getEmployees(supabase: SupabaseClient) {
  // Query both 'employee' and 'intern' roles for backward compatibility
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("role", ["employee", "intern"])
    .eq("is_active", true)
    .order("full_name");
  if (error) throw error;
  return (data ?? []) as Profile[];
}

/** @deprecated Use getEmployees instead */
export const getInterns = getEmployees;

export async function getRecentActivity(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("task_activity")
    .select("*, actor:profiles(*)")
    .order("created_at", { ascending: false })
    .limit(8);
  if (error) throw error;
  return (data ?? []) as TaskActivity[];
}
