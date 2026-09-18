import { clsx } from "clsx";
import { priorityLabels, statusLabels } from "@/lib/constants";
import type { TaskPriority, TaskStatus, UserRole } from "@/types/database";

// ---- Generic Badge ----
type BadgeVariant = "default" | "blue" | "green" | "yellow" | "red" | "orange" | "purple" | "slate";

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-slate-700/50 bg-slate-800/40 text-slate-300",
  blue:    "border-blue-500/30 bg-blue-500/10 text-blue-400",
  green:   "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  yellow:  "border-amber-500/30 bg-amber-500/10 text-amber-400",
  red:     "border-rose-500/30 bg-rose-500/10 text-rose-400",
  orange:  "border-orange-500/30 bg-orange-500/10 text-orange-400",
  purple:  "border-purple-500/30 bg-purple-500/10 text-purple-400",
  slate:   "border-slate-700/40 bg-slate-800/30 text-slate-400",
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
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-tight transition-colors select-none",
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
      <div className="h-2 overflow-hidden rounded-full bg-surface-raised border border-white/[0.06]">
        <div
          className={clsx(
            "h-full rounded-full transition-all duration-500 ease-out",
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
      <span className="mt-1 block text-[11px] font-medium text-slate-400 text-right">{pct}%</span>
    </div>
  );
}

