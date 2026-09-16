import Link from "next/link";
import { friendlyDate, isOverdue } from "@/lib/format";
import { PriorityBadge, ProgressBar, StatusBadge } from "@/components/ui/badges";
import type { Task } from "@/types/database";

export function TaskTable({ tasks }: { tasks: Task[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-surface-line bg-surface-panel">
      <div className="hidden grid-cols-[1.7fr_130px_90px_110px_130px_90px] gap-3 border-b border-surface-line px-4 py-3 text-xs uppercase tracking-wide text-slate-500 lg:grid">
        <span>Task</span><span>Assignee</span><span>Priority</span><span>Status</span><span>Progress</span><span>Due</span>
      </div>
      {tasks.map((task) => (
        <Link key={task.id} href={`/tasks/${task.id}`} className="grid gap-3 border-b border-surface-line px-4 py-3 text-sm last:border-b-0 hover:bg-surface-raised lg:grid-cols-[1.7fr_130px_90px_110px_130px_90px] lg:items-center">
          <span><strong className="block text-slate-100">{task.title}</strong><small className="text-slate-500">{task.category || "General"}</small></span>
          <span className="text-slate-300">{task.assignee?.full_name ?? "Unassigned"}</span>
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
          <ProgressBar value={task.progress} />
          <span className={isOverdue(task.due_date, task.status === "completed") ? "text-red-300" : "text-slate-300"}>{friendlyDate(task.due_date)}</span>
        </Link>
      ))}
    </div>
  );
}
