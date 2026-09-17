import Link from "next/link";
import { getSessionProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  getLeadDashboardMetrics,
  getEmployeeDashboardMetrics,
  getTeamWorkload,
} from "@/lib/data/dashboard";
import { StatusBadge, PriorityBadge, ProgressBar } from "@/components/ui/badges";
import { EmptyState } from "@/components/ui/state";
import { AlertTriangle, Clock, CheckCircle2, ShieldAlert } from "lucide-react";
import type { Task } from "@/types/database";

export const metadata = {
  title: "Dashboard | HCT Tracker",
  description: "Factual task metrics and operational workload overview",
};

function MetricCard({
  label,
  value,
  href,
  highlight = false,
}: {
  label: string;
  value: number;
  href?: string;
  highlight?: boolean;
}) {
  const content = (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        highlight && value > 0
          ? "border-red-800/50 bg-red-950/20 hover:bg-red-950/30"
          : "border-surface-line bg-surface-panel hover:bg-surface-raised"
      }`}
    >
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <strong
        className={`mt-2 block text-2xl font-semibold ${
          highlight && value > 0 ? "text-red-300" : "text-slate-100"
        }`}
      >
        {value}
      </strong>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function TaskTableRow({ task, showAssignee = false }: { task: Task; showAssignee?: boolean }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const isOverdue = task.due_date && task.due_date < todayStr && task.status !== "completed";

  return (
    <tr className="group border-b border-surface-line hover:bg-surface-raised transition-colors">
      <td className="px-4 py-3">
        <Link
          href={`/tasks/${task.id}`}
          className="block font-medium text-slate-200 group-hover:text-white truncate max-w-xs"
        >
          {task.title}
        </Link>
        {task.category && <span className="text-xs text-slate-500">{task.category}</span>}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={task.status} />
      </td>
      <td className="px-4 py-3">
        <PriorityBadge priority={task.priority} />
      </td>
      {showAssignee && (
        <td className="px-4 py-3 text-xs text-slate-400">
          {task.assignee?.full_name ?? "Unassigned"}
        </td>
      )}
      <td className="px-4 py-3 text-xs">
        {task.due_date ? (
          <span className={isOverdue ? "font-semibold text-red-400" : "text-slate-400"}>
            {task.due_date} {isOverdue && "(Overdue)"}
          </span>
        ) : (
          <span className="text-slate-600">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <ProgressBar value={task.progress} />
      </td>
    </tr>
  );
}

export default async function DashboardPage() {
  const { profile, user } = await getSessionProfile();
  const supabase = await createClient();
  const isLead = profile.role === "lead";

  if (isLead) {
    const { metrics, needsAttention, reviewQueue } = await getLeadDashboardMetrics(supabase);
    const workload = await getTeamWorkload(supabase);

    return (
      <section className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Team Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time operational overview of team workload and review status.
          </p>
        </div>

        {/* Lead Top Summary */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <MetricCard label="Active Tasks" value={metrics.active} href="/tasks?status=in_progress" />
          <MetricCard label="In Review" value={metrics.inReview} href="/tasks?status=in_review" />
          <MetricCard label="Blocked" value={metrics.blocked} href="/tasks?status=blocked" highlight />
          <MetricCard label="Overdue" value={metrics.overdue} href="/tasks?due=overdue" highlight />
          <MetricCard label="Due Soon" value={metrics.dueSoon} href="/tasks?due=today" />
          <MetricCard label="Completed" value={metrics.completed} href="/tasks?status=completed" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Needs Attention Queue */}
          <div className="rounded-lg border border-surface-line bg-surface-panel p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <ShieldAlert size={16} className="text-amber-400" /> Needs Attention
              </h2>
              <span className="text-xs text-slate-500">{needsAttention.length} items</span>
            </div>

            {needsAttention.length === 0 ? (
              <EmptyState title="All caught up" detail="No blocked, overdue, or pending review tasks." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-surface-line text-slate-500">
                      <th className="pb-2">Task</th>
                      <th className="pb-2">Assignee</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-line">
                    {needsAttention.slice(0, 6).map((t) => (
                      <tr key={t.id} className="hover:bg-surface-raised">
                        <td className="py-2 pr-2 font-medium text-slate-200">
                          <Link href={`/tasks/${t.id}`} className="hover:underline">
                            {t.title}
                          </Link>
                        </td>
                        <td className="py-2 pr-2 text-slate-400">{t.assignee?.full_name ?? "—"}</td>
                        <td className="py-2 pr-2">
                          <StatusBadge status={t.status} />
                        </td>
                        <td className="py-2 text-slate-400">{t.due_date ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Review Queue */}
          <div className="rounded-lg border border-surface-line bg-surface-panel p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Clock size={16} className="text-blue-400" /> Pending Review Queue
              </h2>
              <span className="text-xs text-slate-500">{reviewQueue.length} submissions</span>
            </div>

            {reviewQueue.length === 0 ? (
              <EmptyState title="Review queue clear" detail="No task submissions waiting for review." />
            ) : (
              <div className="space-y-2">
                {reviewQueue.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-md border border-surface-line bg-surface-raised p-3 text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <Link href={`/tasks/${t.id}`} className="font-semibold text-slate-100 hover:underline truncate block">
                        {t.title}
                      </Link>
                      <p className="text-slate-400 mt-0.5">Submitted by {t.assignee?.full_name ?? "Employee"}</p>
                    </div>
                    <Link
                      href={`/tasks/${t.id}`}
                      className="rounded bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-500 flex-shrink-0"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Team Workload Table */}
        <div className="rounded-lg border border-surface-line bg-surface-panel p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100">Team Workload Distribution</h2>
            <Link href="/employees" className="text-xs text-blue-400 hover:underline">
              View employees →
            </Link>
          </div>

          {workload.length === 0 ? (
            <EmptyState title="No active employees" detail="Add employees to start tracking workload." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-line text-xs font-medium text-slate-500">
                    <th className="pb-2.5 px-3">Employee</th>
                    <th className="pb-2.5 px-3">Active Tasks</th>
                    <th className="pb-2.5 px-3">High/Urgent</th>
                    <th className="pb-2.5 px-3">Blocked</th>
                    <th className="pb-2.5 px-3">Overdue</th>
                    <th className="pb-2.5 px-3">Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-line">
                  {workload.map((w) => (
                    <tr key={w.employee.id} className="hover:bg-surface-raised">
                      <td className="py-2.5 px-3">
                        <Link href={`/employees/${w.employee.id}`} className="font-medium text-slate-200 hover:text-white">
                          {w.employee.full_name}
                        </Link>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-100">{w.activeCount}</td>
                      <td className="py-2.5 px-3 text-amber-300">{w.highPriorityCount}</td>
                      <td className="py-2.5 px-3 text-red-400">{w.blockedCount}</td>
                      <td className="py-2.5 px-3 text-red-400">{w.overdueCount}</td>
                      <td className="py-2.5 px-3 text-emerald-400">{w.completedCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Employee Dashboard
  const { metrics, needsAttention, activeTasks, recentCompleted } = await getEmployeeDashboardMetrics(
    supabase,
    user.id
  );

  return (
    <section className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-100">My Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your clear daily priorities and assigned tasks.
        </p>
      </div>

      {/* Employee Top Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard label="Active Tasks" value={metrics.active} href="/tasks" />
        <MetricCard label="Due Soon" value={metrics.dueSoon} href="/tasks?due=today" />
        <MetricCard label="Overdue" value={metrics.overdue} href="/tasks?due=overdue" highlight />
        <MetricCard label="In Review" value={metrics.inReview} href="/tasks?status=in_review" />
        <MetricCard label="Blocked" value={metrics.blocked} href="/tasks?status=blocked" highlight />
        <MetricCard label="Completed" value={metrics.completed} href="/tasks?status=completed" />
      </div>

      {/* Needs Attention Section (Only rendered if items exist or standard empty state) */}
      {needsAttention.length > 0 && (
        <div className="rounded-lg border border-amber-800/40 bg-amber-950/10 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-amber-200 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-400" /> Needs Attention
          </h2>
          <div className="grid gap-2">
            {needsAttention.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-md border border-surface-line bg-surface-panel p-3 text-xs"
              >
                <div>
                  <Link href={`/tasks/${t.id}`} className="font-semibold text-slate-100 hover:underline">
                    {t.title}
                  </Link>
                  <p className="text-slate-400 mt-0.5">
                    Status: <span className="text-slate-200">{t.status.replace("_", " ")}</span>
                  </p>
                </div>
                <Link
                  href={`/tasks/${t.id}`}
                  className="rounded border border-surface-line px-2.5 py-1 text-slate-200 hover:bg-surface-raised"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Work Table */}
      <div className="rounded-lg border border-surface-line bg-surface-panel p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">Assigned Active Work</h2>
          <Link href="/tasks" className="text-xs text-blue-400 hover:underline">
            View all →
          </Link>
        </div>

        {activeTasks.length === 0 ? (
          <EmptyState title="You're all caught up" detail="No active tasks assigned to you right now." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-line text-xs font-medium text-slate-500">
                  <th className="pb-2.5 px-4">Task</th>
                  <th className="pb-2.5 px-4">Status</th>
                  <th className="pb-2.5 px-4">Priority</th>
                  <th className="pb-2.5 px-4">Due Date</th>
                  <th className="pb-2.5 px-4">Progress</th>
                </tr>
              </thead>
              <tbody>
                {activeTasks.map((t) => (
                  <TaskTableRow key={t.id} task={t} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
