import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { PageTitle } from "@/components/page-title";
import { SetupRequired } from "@/components/setup-required";
import { TaskTable } from "@/components/tasks/task-table";
import { EmptyState } from "@/components/ui/state";
import { getRecentActivity, getTasks } from "@/lib/data";
import { demoActivity, demoTasks } from "@/lib/demo-data";
import { isOverdue } from "@/lib/format";
import { getLeadContext } from "@/lib/session";
import { hasSupabaseEnv } from "@/lib/env";

export default async function DashboardPage() {
  if (!hasSupabaseEnv()) return <SetupRequired />;
  const { supabase, profile, demo } = await getLeadContext();
  const result = supabase && !demo ? await Promise.all([getTasks(supabase, profile), getRecentActivity(supabase)]).catch(() => null) : null;
  const [tasks, activity] = result ?? [demoTasks, demoActivity];
  const active = tasks.filter((task) => !["completed", "in_review"].includes(task.status));
  const blocked = tasks.filter((task) => task.status === "blocked");
  const review = tasks.filter((task) => task.status === "in_review");
  const overdue = tasks.filter((task) => isOverdue(task.due_date, task.status === "completed"));
  const focus = [...overdue, ...blocked, ...review].slice(0, 6);

  return (
    <section className="p-4 md:p-6">
      <PageTitle title="Lead Dashboard" subtitle="Blocked work, review queue, and team movement from real task data." />
      <div className="mb-5 grid gap-3 md:grid-cols-5">
        {[["Active", active.length], ["Completed", tasks.filter((t) => t.status === "completed").length], ["Overdue", overdue.length], ["Blocked", blocked.length], ["Awaiting Review", review.length]].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-surface-line bg-surface-panel p-4"><p className="text-xs text-slate-400">{label}</p><strong className="mt-2 block text-2xl">{value}</strong></div>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_.8fr]">
        <section>
          <h2 className="mb-3 text-sm font-semibold">Needs Attention</h2>
          {focus.length ? <TaskTable tasks={focus} /> : <EmptyState title="Nothing urgent right now." detail="No blockers, overdue tasks, or review items are waiting." />}
        </section>
        <section className="rounded-lg border border-surface-line bg-surface-panel p-4">
          <h2 className="mb-3 text-sm font-semibold">Recent Activity</h2>
          <div className="grid gap-3">
            {activity.length ? activity.map((item) => (
              <Link href={`/tasks/${item.task_id}`} key={item.id} className="border-l border-surface-line pl-3 text-sm text-slate-300 hover:text-white">
                <span className="block">{item.action.replaceAll("_", " ")}</span>
                <small className="text-slate-500">{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</small>
              </Link>
            )) : <EmptyState title="No activity yet." />}
          </div>
        </section>
      </div>
    </section>
  );
}
