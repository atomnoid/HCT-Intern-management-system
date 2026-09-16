import { clsx } from "clsx";
import { priorityLabels, statusLabels } from "@/lib/constants";
import type { TaskPriority, TaskStatus } from "@/types/database";

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={clsx("inline-flex rounded-full border px-2 py-1 text-xs", {
      "border-slate-600 text-slate-300": status === "todo",
      "border-sky-700 text-sky-300": status === "in_progress",
      "border-red-800 text-red-300": status === "blocked",
      "border-amber-700 text-amber-300": status === "in_review",
      "border-emerald-700 text-emerald-300": status === "completed"
    })}>
      {statusLabels[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={clsx("inline-flex rounded-full border px-2 py-1 text-xs", {
      "border-slate-600 text-slate-300": priority === "low",
      "border-slate-500 text-slate-200": priority === "medium",
      "border-amber-700 text-amber-300": priority === "high",
      "border-red-800 text-red-300": priority === "urgent"
    })}>
      {priorityLabels[priority]}
    </span>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="min-w-28">
      <div className="h-2 rounded-full bg-slate-800">
        <div className="h-2 rounded-full bg-sky-500" style={{ width: `${value}%` }} />
      </div>
      <span className="mt-1 block text-xs text-slate-400">{value}%</span>
    </div>
  );
}
