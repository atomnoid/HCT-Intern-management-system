import type { SupabaseClient } from "@supabase/supabase-js";
import type { Task, Profile } from "@/types/database";

export interface TaskMetrics {
  total: number;
  active: number;
  completed: number;
  inReview: number;
  blocked: number;
  overdue: number;
  dueSoon: number;
}

export interface EmployeeWorkload {
  employee: Profile;
  activeCount: number;
  highPriorityCount: number;
  dueSoonCount: number;
  overdueCount: number;
  blockedCount: number;
  inReviewCount: number;
  completedCount: number;
}

export function computeTaskMetrics(tasks: Task[]): TaskMetrics {
  const todayStr = new Date().toISOString().slice(0, 10);
  const nextThreeDays = new Date();
  nextThreeDays.setDate(nextThreeDays.getDate() + 3);
  const nextThreeDaysStr = nextThreeDays.toISOString().slice(0, 10);

  let active = 0;
  let completed = 0;
  let inReview = 0;
  let blocked = 0;
  let overdue = 0;
  let dueSoon = 0;

  for (const t of tasks) {
    if (t.status === "completed") {
      completed++;
    } else {
      active++;
      if (t.status === "in_review") inReview++;
      if (t.status === "blocked") blocked++;

      if (t.due_date) {
        if (t.due_date < todayStr) {
          overdue++;
        } else if (t.due_date <= nextThreeDaysStr) {
          dueSoon++;
        }
      }
    }
  }

  return {
    total: tasks.length,
    active,
    completed,
    inReview,
    blocked,
    overdue,
    dueSoon,
  };
}

export async function getLeadDashboardMetrics(supabase: SupabaseClient) {
  const { data: tasks, error: taskError } = await supabase
    .from("tasks")
    .select("*, assignee:profiles!tasks_assignee_id_fkey(*)")
    .order("updated_at", { ascending: false });

  if (taskError) throw taskError;

  const allTasks = (tasks ?? []) as Task[];
  const metrics = computeTaskMetrics(allTasks);

  // Group tasks requiring lead attention: in_review, blocked, overdue
  const todayStr = new Date().toISOString().slice(0, 10);
  const needsAttention = allTasks.filter(
    (t) =>
      t.status === "in_review" ||
      t.status === "blocked" ||
      (t.status !== "completed" && t.due_date && t.due_date < todayStr)
  );

  const reviewQueue = allTasks.filter((t) => t.status === "in_review");

  return {
    metrics,
    needsAttention,
    reviewQueue,
    allTasks,
  };
}

export async function getTeamWorkload(supabase: SupabaseClient): Promise<EmployeeWorkload[]> {
  const [{ data: employees, error: empError }, { data: tasks, error: taskError }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .in("role", ["employee", "intern"])
      .eq("is_active", true)
      .order("full_name"),
    supabase.from("tasks").select("*"),
  ]);

  if (empError) throw empError;
  if (taskError) throw taskError;

  const todayStr = new Date().toISOString().slice(0, 10);
  const nextThreeDays = new Date();
  nextThreeDays.setDate(nextThreeDays.getDate() + 3);
  const nextThreeDaysStr = nextThreeDays.toISOString().slice(0, 10);

  const allEmployees = (employees ?? []) as Profile[];
  const allTasks = (tasks ?? []) as Task[];

  return allEmployees.map((emp) => {
    const empTasks = allTasks.filter((t) => t.assignee_id === emp.id);

    let activeCount = 0;
    let highPriorityCount = 0;
    let dueSoonCount = 0;
    let overdueCount = 0;
    let blockedCount = 0;
    let inReviewCount = 0;
    let completedCount = 0;

    for (const t of empTasks) {
      if (t.status === "completed") {
        completedCount++;
      } else {
        activeCount++;
        if (t.priority === "high" || t.priority === "urgent") highPriorityCount++;
        if (t.status === "blocked") blockedCount++;
        if (t.status === "in_review") inReviewCount++;

        if (t.due_date) {
          if (t.due_date < todayStr) overdueCount++;
          else if (t.due_date <= nextThreeDaysStr) dueSoonCount++;
        }
      }
    }

    return {
      employee: emp,
      activeCount,
      highPriorityCount,
      dueSoonCount,
      overdueCount,
      blockedCount,
      inReviewCount,
      completedCount,
    };
  });
}

export async function getEmployeeDashboardMetrics(supabase: SupabaseClient, userId: string) {
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*, creator:profiles!tasks_created_by_fkey(*)")
    .eq("assignee_id", userId)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) throw error;

  const empTasks = (tasks ?? []) as Task[];
  const metrics = computeTaskMetrics(empTasks);

  const todayStr = new Date().toISOString().slice(0, 10);

  // Filter Needs Attention for employee: blocked, overdue, or in_review
  const needsAttention = empTasks.filter(
    (t) =>
      t.status === "blocked" ||
      t.status === "in_review" ||
      (t.status !== "completed" && t.due_date && t.due_date < todayStr)
  );

  const recentCompleted = empTasks
    .filter((t) => t.status === "completed")
    .sort((a, b) => Date.parse(b.completed_at || b.updated_at) - Date.parse(a.completed_at || a.updated_at))
    .slice(0, 5);

  const activeTasks = empTasks.filter((t) => t.status !== "completed");

  return {
    metrics,
    needsAttention,
    recentCompleted,
    activeTasks,
    allTasks: empTasks,
  };
}
