import { redirect } from "next/navigation";
import { PageTitle } from "@/components/page-title";
import { DataError } from "@/components/data-error";
import { SetupRequired } from "@/components/setup-required";
import { TaskCreateForm } from "@/components/tasks/task-create-form";
import { getInterns } from "@/lib/data";
import { getSessionProfile } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";

export default async function NewTaskPage() {
  if (!hasSupabaseEnv()) return <SetupRequired />;
  const session = await getSessionProfile().catch((error) => ({ error }));
  if ("error" in session) return <DataError message={session.error instanceof Error ? session.error.message : "Could not load your profile."} />;
  const { supabase, profile } = session;
  if (profile.role !== "lead") redirect("/tasks");
  const interns = await getInterns(supabase).catch((error) => ({ error }));
  if (!Array.isArray(interns)) return <DataError message={interns.error instanceof Error ? interns.error.message : "Could not load intern profiles."} />;
  return (
    <section className="max-w-3xl p-4 md:p-6">
      <PageTitle title="Create Task" subtitle="Assign focused work with priority, due date, and optional checklist." />
      <TaskCreateForm interns={interns} />
    </section>
  );
}
