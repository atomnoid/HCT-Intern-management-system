import { taskPriorities, taskStatuses } from "@/lib/constants";
import type { Profile } from "@/types/database";

export function TaskFilters({ interns, role }: { interns: Profile[]; role: "lead" | "intern" }) {
  return (
    <form className="mb-4 grid gap-2 md:grid-cols-[1fr_repeat(5,auto)]">
      <input name="q" placeholder="Search tasks, category, description" className="rounded-md border-surface-line bg-surface-panel text-sm text-slate-100 placeholder:text-slate-500" />
      <select name="status" className="rounded-md border-surface-line bg-surface-panel text-sm"><option value="">Status</option>{taskStatuses.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</select>
      <select name="priority" className="rounded-md border-surface-line bg-surface-panel text-sm"><option value="">Priority</option>{taskPriorities.map((p) => <option key={p} value={p}>{p}</option>)}</select>
      {role === "lead" ? <select name="assignee" className="rounded-md border-surface-line bg-surface-panel text-sm"><option value="">Assignee</option>{interns.map((i) => <option key={i.id} value={i.id}>{i.full_name}</option>)}</select> : null}
      <select name="due" className="rounded-md border-surface-line bg-surface-panel text-sm"><option value="">Due</option><option value="today">Today</option><option value="overdue">Overdue</option></select>
      <select name="sort" className="rounded-md border-surface-line bg-surface-panel text-sm"><option value="due">Due soon</option><option value="priority">Priority</option><option value="updated">Recently updated</option><option value="created">Recently created</option></select>
      <button className="focus-ring rounded-md border border-surface-line bg-surface-raised px-3 py-2 text-sm hover:border-slate-500">Apply</button>
    </form>
  );
}
