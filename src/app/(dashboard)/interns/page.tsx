import { createInternAction } from "@/actions/interns";
import { PageTitle } from "@/components/page-title";
import { SetupRequired } from "@/components/setup-required";
import { ProgressBar } from "@/components/ui/badges";
import { getInterns, getTasks } from "@/lib/data";
import { demoInterns, demoTasks } from "@/lib/demo-data";
import { isOverdue } from "@/lib/format";
import { getLeadContext } from "@/lib/session";
import { hasSupabaseEnv } from "@/lib/env";

export default async function InternsPage() {
  if (!hasSupabaseEnv()) return <SetupRequired />;
  const { supabase, profile, demo } = await getLeadContext();
  const result = supabase && !demo ? await Promise.all([getInterns(supabase), getTasks(supabase, profile)]).catch(() => null) : null;
  const [interns, tasks] = result ?? [demoInterns, demoTasks];

  return (
    <section className="p-4 md:p-6">
      <PageTitle title="Interns" subtitle="Lead-managed intern records and factual workload. No intern login required." />
      <form action={createInternAction} className="mb-5 grid gap-3 rounded-lg border border-surface-line bg-surface-panel p-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-slate-200">Intern name</span>
          <input name="fullName" required minLength={2} placeholder="Aayush Sharma" className="rounded-md border-surface-line bg-surface-raised text-slate-100 placeholder:text-slate-500" />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-slate-200">Email optional</span>
          <input name="email" type="email" placeholder="intern@company.com" className="rounded-md border-surface-line bg-surface-raised text-slate-100 placeholder:text-slate-500" />
        </label>
        <button className="focus-ring rounded-md bg-sky-600 px-4 py-2 text-sm font-medium hover:bg-sky-500">Add intern</button>
      </form>
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
        {interns.map((intern) => {
          const assigned = tasks.filter((task) => task.assignee_id === intern.id);
          const average = assigned.length ? Math.round(assigned.reduce((sum, task) => sum + task.progress, 0) / assigned.length) : 0;
          return (
            <article key={intern.id} className="rounded-lg border border-surface-line bg-surface-panel p-4">
              <h2 className="font-semibold">{intern.full_name}</h2>
              <p className="text-sm text-slate-400">{intern.email || "No email recorded"}</p>
              <div className="my-4"><ProgressBar value={average} /></div>
              <p className="text-sm text-slate-300">
                {assigned.filter((task) => !["completed", "in_review"].includes(task.status)).length} active · {assigned.filter((task) => task.status === "blocked").length} blocked · {assigned.filter((task) => isOverdue(task.due_date, task.status === "completed")).length} overdue · {assigned.filter((task) => task.status === "completed").length} completed
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
