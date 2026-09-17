import Link from "next/link";
import { getSessionProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getEmployeeDashboardMetrics } from "@/lib/data/dashboard";
import { StatusBadge, PriorityBadge, ProgressBar } from "@/components/ui/badges";
import { EmptyState } from "@/components/ui/state";
import { TrendingUp, CheckCircle } from "lucide-react";

export const metadata = {
  title: "My Progress | HCT Tracker",
  description: "Factual task completion rate and personal progress metrics",
};

export default async function MyProgressPage() {
  const { profile, user } = await getSessionProfile();
  const supabase = await createClient();

  const { metrics, activeTasks, recentCompleted, allTasks } = await getEmployeeDashboardMetrics(
    supabase,
    user.id
  );

  const completionRate =
    metrics.total > 0 ? Math.round((metrics.completed / metrics.total) * 100) : 0;

  return (
    <section className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-100">My Progress</h1>
        <p className="mt-1 text-sm text-slate-500">
          Factual summary of your assigned tasks, active work, and completion rate.
        </p>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <div className="rounded-lg border border-surface-line bg-surface-panel p-4">
          <p className="text-xs text-slate-500">Completion Rate</p>
          <strong className="mt-2 block text-2xl font-bold text-emerald-400">
            {completionRate}%
          </strong>
        </div>
        <div className="rounded-lg border border-surface-line bg-surface-panel p-4">
          <p className="text-xs text-slate-500">Total Assigned</p>
          <strong className="mt-2 block text-2xl font-semibold text-slate-100">
            {metrics.total}
          </strong>
        </div>
        <div className="rounded-lg border border-surface-line bg-surface-panel p-4">
          <p className="text-xs text-slate-500">Completed</p>
          <strong className="mt-2 block text-2xl font-semibold text-emerald-400">
            {metrics.completed}
          </strong>
        </div>
        <div className="rounded-lg border border-surface-line bg-surface-panel p-4">
          <p className="text-xs text-slate-500">Active Work</p>
          <strong className="mt-2 block text-2xl font-semibold text-blue-400">
            {metrics.active}
          </strong>
        </div>
        <div className="rounded-lg border border-surface-line bg-surface-panel p-4">
          <p className="text-xs text-slate-500">In Review</p>
          <strong className="mt-2 block text-2xl font-semibold text-amber-400">
            {metrics.inReview}
          </strong>
        </div>
        <div className="rounded-lg border border-surface-line bg-surface-panel p-4">
          <p className="text-xs text-slate-500">Blocked</p>
          <strong
            className={`mt-2 block text-2xl font-semibold ${
              metrics.blocked > 0 ? "text-red-400" : "text-slate-100"
            }`}
          >
            {metrics.blocked}
          </strong>
        </div>
        <div className="rounded-lg border border-surface-line bg-surface-panel p-4">
          <p className="text-xs text-slate-500">Overdue</p>
          <strong
            className={`mt-2 block text-2xl font-semibold ${
              metrics.overdue > 0 ? "text-red-400" : "text-slate-100"
            }`}
          >
            {metrics.overdue}
          </strong>
        </div>
      </div>

      {/* Task Status Breakdown Bar */}
      <div className="rounded-lg border border-surface-line bg-surface-panel p-4 space-y-3">
        <h2 className="text-sm font-semibold text-slate-100">Task Status Distribution</h2>
        <div className="h-4 w-full bg-surface-raised rounded-full overflow-hidden flex">
          {metrics.total > 0 ? (
            <>
              <div
                style={{ width: `${(metrics.completed / metrics.total) * 100}%` }}
                className="bg-emerald-500"
                title={`Completed: ${metrics.completed}`}
              />
              <div
                style={{ width: `${(metrics.inReview / metrics.total) * 100}%` }}
                className="bg-amber-500"
                title={`In Review: ${metrics.inReview}`}
              />
              <div
                style={{ width: `${(metrics.blocked / metrics.total) * 100}%` }}
                className="bg-red-500"
                title={`Blocked: ${metrics.blocked}`}
              />
              <div
                style={{
                  width: `${
                    ((metrics.active - metrics.inReview - metrics.blocked) / metrics.total) * 100
                  }%`,
                }}
                className="bg-blue-500"
                title="In Progress / Todo"
              />
            </>
          ) : (
            <div className="w-full bg-surface-line" />
          )}
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Completed ({metrics.completed})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> In Review ({metrics.inReview})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Blocked ({metrics.blocked})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> In Progress / Todo (
            {metrics.active - metrics.inReview - metrics.blocked})
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Work list */}
        <div className="rounded-lg border border-surface-line bg-surface-panel p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100">Active Work Items</h2>
            <Link href="/tasks" className="text-xs text-blue-400 hover:underline">
              View all tasks →
            </Link>
          </div>

          {activeTasks.length === 0 ? (
            <EmptyState title="No active tasks" detail="All assigned tasks are completed." />
          ) : (
            <div className="space-y-2">
              {activeTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-md border border-surface-line bg-surface-raised p-3 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <Link href={`/tasks/${t.id}`} className="font-semibold text-slate-100 hover:underline truncate block">
                      {t.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={t.status} />
                      <PriorityBadge priority={t.priority} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-slate-300 font-medium block">{t.progress}%</span>
                    <span className="text-slate-500 text-[11px]">{t.due_date ? `Due ${t.due_date}` : "No due date"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Completed */}
        <div className="rounded-lg border border-surface-line bg-surface-panel p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-400" /> Recently Completed
            </h2>
            <Link href="/tasks?status=completed" className="text-xs text-blue-400 hover:underline">
              View all completed →
            </Link>
          </div>

          {recentCompleted.length === 0 ? (
            <EmptyState title="No completed tasks yet" detail="Completed tasks will appear here." />
          ) : (
            <div className="space-y-2">
              {recentCompleted.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-md border border-surface-line bg-surface-raised p-3 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <Link href={`/tasks/${t.id}`} className="font-medium text-slate-200 hover:underline truncate block">
                      {t.title}
                    </Link>
                    <span className="text-slate-500 mt-0.5 block">
                      Completed {t.completed_at ? t.completed_at.slice(0, 10) : t.updated_at.slice(0, 10)}
                    </span>
                  </div>
                  <PriorityBadge priority={t.priority} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
