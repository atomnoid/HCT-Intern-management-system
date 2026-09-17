import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getEmployees } from "@/lib/data";
import { TaskCreateForm } from "@/components/tasks/task-create-form";

export const metadata = {
  title: "New Task | HCT Tracker",
};

export default async function NewTaskPage() {
  const { profile } = await getSessionProfile();

  // Only leads can create tasks
  if (profile.role !== "lead") redirect("/tasks");

  const supabase = await createClient();
  let employees: Awaited<ReturnType<typeof getEmployees>> = [];
  try {
    employees = await getEmployees(supabase);
  } catch {
    // Non-fatal: form will show "no employees" message
  }

  return (
    <section className="max-w-3xl p-4 md:p-6">
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-slate-100">Create Task</h1>
        <p className="mt-1 text-sm text-slate-500">
          Assign focused work with priority, due date, and optional checklist.
        </p>
      </div>
      <TaskCreateForm interns={employees} />
    </section>
  );
}
