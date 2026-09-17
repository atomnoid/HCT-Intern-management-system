import Link from "next/link";
import { Plus } from "lucide-react";
import { getSessionProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getTasks, getEmployees } from "@/lib/data";
import { EmptyState } from "@/components/ui/state";
import { StatusBadge, PriorityBadge, ProgressBar } from "@/components/ui/badges";

export const metadata = {
  title: "Tasks | HCT Tracker",
  description: "Browse and manage your team's tasks",
};

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { profile, user } = await getSessionProfile();
  const supabase = await createClient();
  const isLead = profile.role === "lead";

  let tasks: Awaited<ReturnType<typeof getTasks>> = [];
  let fetchError: string | null = null;

  try {
    tasks = await getTasks(supabase, profile, params);
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load tasks.";
  }

  return (
    <section className="p-4 md:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Tasks</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isLead
              ? "All tasks across your team."
              : "Tasks assigned to you."}
          </p>
        </div>
        {isLead && (
          <Link
            href="/tasks/new"
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-blue-600 px-3 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-ring flex-shrink-0"
          >
            <Plus size={14} />
            New task
          </Link>
        )}
      </div>

      {fetchError && (
        <div className="mb-4 rounded-md border border-red-800/50 bg-red-950/30 px-3 py-2.5">
          <p className="text-sm text-red-300">{fetchError}</p>
        </div>
      )}

      {tasks.length === 0 && !fetchError ? (
        <EmptyState
          title={isLead ? "No tasks yet" : "No tasks assigned to you"}
          detail={
            isLead
              ? "Create your first task to get started."
              : "Your lead will assign tasks to you."
          }
          action={
            isLead ? (
              <Link
                href="/tasks/new"
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-blue-600 px-3 text-sm font-medium text-white transition-colors hover:bg-blue-500"
              >
                <Plus size={14} />
                New task
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-surface-line bg-surface-panel">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-line bg-surface-raised">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Task</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Status</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Priority</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-slate-500 md:table-cell">Due</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-slate-500 lg:table-cell">Progress</th>
                {isLead && (
                  <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-slate-500 lg:table-cell">Assignee</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-line">
              {tasks.map((task) => {
                const isOverdue =
                  task.due_date &&
                  task.due_date < new Date().toISOString().slice(0, 10) &&
                  task.status !== "completed";

                return (
                  <tr
                    key={task.id}
                    className="group hover:bg-surface-raised transition-colors duration-100"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/tasks/${task.id}`}
                        className="block max-w-xs truncate font-medium text-slate-200 group-hover:text-white transition-colors"
                      >
                        {task.title}
                      </Link>
                      {task.category && (
                        <span className="text-xs text-slate-500">{task.category}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      {task.due_date ? (
                        <span className={isOverdue ? "text-red-400" : "text-slate-400"}>
                          {new Date(task.due_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                          {isOverdue && " ·overdue"}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <ProgressBar value={task.progress} />
                    </td>
                    {isLead && (
                      <td className="hidden px-4 py-3 lg:table-cell text-slate-400">
                        {task.assignee?.full_name ?? "—"}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
