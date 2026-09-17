import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSessionProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getEmployeeDashboardMetrics } from "@/lib/data/dashboard";
import { fetchProfileById } from "@/lib/data/profile";
import { RoleBadge, StatusBadge, PriorityBadge, ProgressBar } from "@/components/ui/badges";
import { EmptyState } from "@/components/ui/state";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: emp } = await fetchProfileById(id);
  return {
    title: emp ? `${emp.full_name} | Employee Detail` : "Employee Detail | HCT Tracker",
  };
}

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile } = await getSessionProfile();
  const supabase = await createClient();

  if (profile.role !== "lead") {
    redirect("/dashboard");
  }

  const { data: employee, error: profileError } = await fetchProfileById(id);
  if (profileError || !employee) {
    notFound();
  }

  const { metrics, activeTasks, recentCompleted, allTasks } = await getEmployeeDashboardMetrics(
    supabase,
    id
  );

  return (
    <section className="p-4 md:p-6 space-y-6">
      <div>
        <Link href="/employees" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 mb-2">
          <ArrowLeft size={14} /> Back to employees
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-semibold text-slate-100">{employee.full_name}</h1>
          <RoleBadge role={employee.role} />
        </div>
        <p className="mt-1 text-sm text-slate-500">{employee.email ?? "No email recorded"}</p>
      </div>

      {/* Factual Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-lg border border-surface-line bg-surface-panel p-4">
          <p className="text-xs text-slate-500">Active Tasks</p>
          <strong className="mt-2 block text-2xl font-semibold text-slate-100">{metrics.active}</strong>
        </div>
        <div className="rounded-lg border border-surface-line bg-surface-panel p-4">
          <p className="text-xs text-slate-500">In Review</p>
          <strong className="mt-2 block text-2xl font-semibold text-amber-400">{metrics.inReview}</strong>
        </div>
        <div className="rounded-lg border border-surface-line bg-surface-panel p-4">
          <p className="text-xs text-slate-500">Blocked</p>
          <strong className={`mt-2 block text-2xl font-semibold ${metrics.blocked > 0 ? "text-red-400" : "text-slate-100"}`}>
            {metrics.blocked}
          </strong>
        </div>
        <div className="rounded-lg border border-surface-line bg-surface-panel p-4">
          <p className="text-xs text-slate-500">Overdue</p>
          <strong className={`mt-2 block text-2xl font-semibold ${metrics.overdue > 0 ? "text-red-400" : "text-slate-100"}`}>
            {metrics.overdue}
          </strong>
        </div>
        <div className="rounded-lg border border-surface-line bg-surface-panel p-4">
          <p className="text-xs text-slate-500">Completed</p>
          <strong className="mt-2 block text-2xl font-semibold text-emerald-400">{metrics.completed}</strong>
        </div>
        <div className="rounded-lg border border-surface-line bg-surface-panel p-4">
          <p className="text-xs text-slate-500">Total Assigned</p>
          <strong className="mt-2 block text-2xl font-semibold text-slate-100">{metrics.total}</strong>
        </div>
      </div>

      {/* Currently Assigned Active Tasks */}
      <div className="rounded-lg border border-surface-line bg-surface-panel p-4 space-y-3">
        <h2 className="text-sm font-semibold text-slate-100">Assigned Active Work</h2>

        {activeTasks.length === 0 ? (
          <EmptyState title="No active tasks" detail="This employee has no active tasks currently assigned." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-line text-xs font-medium text-slate-500">
                  <th className="pb-2.5 px-3">Task</th>
                  <th className="pb-2.5 px-3">Status</th>
                  <th className="pb-2.5 px-3">Priority</th>
                  <th className="pb-2.5 px-3">Due Date</th>
                  <th className="pb-2.5 px-3">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-line">
                {activeTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-raised">
                    <td className="py-2.5 px-3">
                      <Link href={`/tasks/${t.id}`} className="font-medium text-slate-200 hover:text-white truncate block max-w-xs">
                        {t.title}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-2.5 px-3">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="py-2.5 px-3 text-xs text-slate-400">{t.due_date ?? "—"}</td>
                    <td className="py-2.5 px-3">
                      <ProgressBar value={t.progress} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Completed Work */}
      <div className="rounded-lg border border-surface-line bg-surface-panel p-4 space-y-3">
        <h2 className="text-sm font-semibold text-slate-100">Recent Completed Work</h2>

        {recentCompleted.length === 0 ? (
          <EmptyState title="No completed tasks" detail="Completed tasks will appear here." />
        ) : (
          <div className="space-y-2">
            {recentCompleted.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-md border border-surface-line bg-surface-raised p-3 text-xs">
                <div>
                  <Link href={`/tasks/${t.id}`} className="font-medium text-slate-200 hover:underline">
                    {t.title}
                  </Link>
                  <p className="text-slate-500 mt-0.5">
                    Completed {t.completed_at ? t.completed_at.slice(0, 10) : t.updated_at.slice(0, 10)}
                  </p>
                </div>
                <PriorityBadge priority={t.priority} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
