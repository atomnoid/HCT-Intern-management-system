import { getSessionProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Task, TaskActivity } from "@/types/database";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export const metadata = {
  title: "Dashboard | HCT Tracker",
  description: "Overview of your team tasks and recent activity",
};

async function getLeadDashboardData() {
  const supabase = await createClient();

  const [tasksResult, activityResult] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title, status, priority, due_date, assignee:profiles!tasks_assignee_id_fkey(full_name)")
      .order("updated_at", { ascending: false })
      .limit(100),
    supabase
      .from("task_activity")
      .select("id, task_id, action, created_at, actor:profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  return {
    tasks: (tasksResult.data ?? []) as Task[],
    activity: (activityResult.data ?? []) as TaskActivity[],
    error: tasksResult.error?.message ?? activityResult.error?.message ?? null,
  };
}

async function getEmployeeDashboardData(userId: string) {
  const supabase = await createClient();

  const [tasksResult, activityResult] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title, status, priority, progress, due_date")
      .eq("assignee_id", userId)
      .order("due_date", { ascending: true })
      .limit(50),
    supabase
      .from("task_activity")
      .select("id, task_id, action, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  return {
    tasks: (tasksResult.data ?? []) as Task[],
    activity: (activityResult.data ?? []) as TaskActivity[],
    error: tasksResult.error?.message ?? null,
  };
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border bg-surface-panel p-4 ${highlight && value > 0 ? "border-red-800/50 bg-red-950/10" : "border-surface-line"}`}>
      <p className="text-xs text-slate-500">{label}</p>
      <strong className={`mt-2 block text-2xl font-semibold ${highlight && value > 0 ? "text-red-300" : "text-slate-100"}`}>
        {value}
      </strong>
    </div>
  );
}

const statusLabel: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  blocked: "Blocked",
  in_review: "In Review",
  completed: "Completed",
};

const statusColor: Record<string, string> = {
  todo: "text-slate-400 border-slate-700",
  in_progress: "text-blue-400 border-blue-800",
  blocked: "text-red-400 border-red-800",
  in_review: "text-amber-400 border-amber-800",
  completed: "text-emerald-400 border-emerald-800",
};

function TaskRow({ task }: { task: Task }) {
  return (
    <Link
      href={`/tasks/${task.id}`}
      className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-surface-raised transition-colors duration-150"
    >
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm text-slate-200">{task.title}</p>
        {task.due_date && (
          <p className="text-xs text-slate-500">
            Due {new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        )}
      </div>
      <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs ${statusColor[task.status] ?? "text-slate-400 border-slate-700"}`}>
        {statusLabel[task.status] ?? task.status}
      </span>
    </Link>
  );
}

export default async function DashboardPage() {
  const { profile, user } = await getSessionProfile();
  const isLead = profile.role === "lead";

  const { tasks, activity, error } = isLead
    ? await getLeadDashboardData()
    : await getEmployeeDashboardData(user.id);

  const today = new Date().toISOString().slice(0, 10);
  const completed = tasks.filter((t) => t.status === "completed").length;
  const blocked = tasks.filter((t) => t.status === "blocked").length;
  const inReview = tasks.filter((t) => t.status === "in_review").length;
  const overdue = tasks.filter(
    (t) => t.due_date && t.due_date < today && t.status !== "completed"
  ).length;
  const active = tasks.filter((t) => !["completed"].includes(t.status)).length;

  const focusTasks = tasks
    .filter((t) =>
      t.status === "blocked" ||
      t.status === "in_review" ||
      (t.due_date && t.due_date <= today && t.status !== "completed")
    )
    .slice(0, 8);

  const recentTasks = tasks.slice(0, 6);

  return (
    <section className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-slate-100">
          {isLead ? "Team Dashboard" : `Welcome back, ${profile.full_name.split(" ")[0]}`}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {isLead
            ? "Overview of your team's tasks, blockers, and review queue."
            : "Your assigned tasks and recent activity."}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-amber-800/50 bg-amber-950/30 px-3 py-2.5">
          <p className="text-sm text-amber-300">
            Some data could not be loaded: {error}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid gap-3 grid-cols-2 md:grid-cols-5">
        <StatCard label="Active" value={active} />
        <StatCard label="Completed" value={completed} />
        <StatCard label="Overdue" value={overdue} highlight />
        <StatCard label="Blocked" value={blocked} highlight />
        <StatCard label="In Review" value={inReview} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        {/* Focus / Tasks list */}
        <div className="rounded-lg border border-surface-line bg-surface-panel">
          <div className="flex items-center justify-between border-b border-surface-line px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-100">
              {focusTasks.length > 0 ? "Needs Attention" : "Recent Tasks"}
            </h2>
            <Link
              href="/tasks"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="p-2">
            {(focusTasks.length > 0 ? focusTasks : recentTasks).length > 0 ? (
              (focusTasks.length > 0 ? focusTasks : recentTasks).map((task) => (
                <TaskRow key={task.id} task={task} />
              ))
            ) : (
              <div className="px-3 py-8 text-center">
                <p className="text-sm text-slate-500">
                  {isLead
                    ? "No tasks yet. Create your first task to get started."
                    : "No tasks assigned to you yet."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg border border-surface-line bg-surface-panel">
          <div className="border-b border-surface-line px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-100">Recent Activity</h2>
          </div>
          <div className="p-4">
            {activity.length > 0 ? (
              <div className="grid gap-3">
                {activity.map((item) => (
                  <Link
                    href={`/tasks/${item.task_id}`}
                    key={item.id}
                    className="border-l-2 border-surface-line pl-3 text-sm text-slate-400 hover:text-slate-200 hover:border-blue-700 transition-colors duration-150"
                  >
                    <span className="block text-slate-300 leading-snug">
                      {item.action.replaceAll("_", " ")}
                    </span>
                    <small className="text-slate-600 text-xs">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </small>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No activity yet.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
