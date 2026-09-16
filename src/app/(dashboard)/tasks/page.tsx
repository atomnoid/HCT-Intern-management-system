import Link from "next/link";
import { Plus } from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { SetupRequired } from "@/components/setup-required";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TaskTable } from "@/components/tasks/task-table";
import { EmptyState } from "@/components/ui/state";
import { getInterns, getTasks } from "@/lib/data";
import { demoInterns, demoTasks } from "@/lib/demo-data";
import { getLeadContext } from "@/lib/session";
import { hasSupabaseEnv } from "@/lib/env";

export default async function TasksPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!hasSupabaseEnv()) return <SetupRequired />;
  const params = await searchParams;
  const { supabase, profile, demo } = await getLeadContext();
  const result = supabase && !demo ? await Promise.all([getTasks(supabase, profile, params), getInterns(supabase)]).catch(() => null) : null;
  const [tasks, interns] = result ?? [demoTasks, demoInterns];
  return (
    <section className="p-4 md:p-6">
      <PageTitle title="Tasks" subtitle="Server-backed search, filters, and task access." action={<Link href="/tasks/new" className="focus-ring inline-flex items-center gap-2 rounded-md bg-sky-600 px-3 py-2 text-sm font-medium hover:bg-sky-500"><Plus size={16} />New task</Link>} />
      <TaskFilters interns={interns} role={profile.role} />
      {tasks.length ? <TaskTable tasks={tasks} /> : <EmptyState title="No tasks found." detail="Try clearing filters or create a new task." />}
    </section>
  );
}
