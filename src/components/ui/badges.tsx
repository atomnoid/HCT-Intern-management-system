import { clsx } from "clsx";
import { priorityLabels, statusLabels } from "@/lib/constants";
import type { TaskPriority, TaskStatus, UserRole } from "@/types/database";

// ---- Generic Badge ----
type BadgeVariant = "default" | "blue" | "green" | "yellow" | "red" | "orange" | "purple" | "slate";

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-slate-600 bg-slate-800/40 text-slate-300",
  blue:    "border-blue-700/60 bg-blue-900/20 text-blue-300",
  green:   "border-emerald-700/60 bg-emerald-900/20 text-emerald-300",
  yellow:  "border-amber-700/60 bg-amber-900/20 text-amber-300",
  red:     "border-red-700/60 bg-red-900/20 text-red-300",
  orange:  "border-orange-700/60 bg-orange-900/20 text-orange-300",
  purple:  "border-purple-700/60 bg-purple-900/20 text-purple-300",
  slate:   "border-slate-700/60 bg-slate-800/30 text-slate-400",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// ---- Status Badge ----
const statusVariants: Record<TaskStatus, BadgeVariant> = {
  todo:        "slate",
  in_progress: "blue",
  blocked:     "red",
  in_review:   "yellow",
  completed:   "green",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge variant={statusVariants[status]}>
      {statusLabels[status]}
    </Badge>
  );
}

// ---- Priority Badge ----
const priorityVariants: Record<TaskPriority, BadgeVariant> = {
  low:    "slate",
  medium: "default",
  high:   "yellow",
  urgent: "red",
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <Badge variant={priorityVariants[priority]}>
      {priorityLabels[priority]}
    </Badge>
  );
}

// ---- Role Badge ----
export function RoleBadge({ role }: { role: UserRole }) {
  const label = role === "lead" ? "Lead" : "Employee";
  const variant: BadgeVariant = role === "lead" ? "purple" : "blue";
  return <Badge variant={variant}>{label}</Badge>;
}

// ---- Progress Bar ----
export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={clsx("min-w-24", className)}>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-line">
        <div
          className={clsx(
            "h-1.5 rounded-full transition-all duration-300",
            pct === 100
              ? "bg-emerald-500"
              : pct >= 70
              ? "bg-blue-500"
              : pct >= 30
              ? "bg-amber-500"
              : "bg-slate-500"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="mt-0.5 block text-xs text-slate-500">{pct}%</span>
    </div>
  );
}
