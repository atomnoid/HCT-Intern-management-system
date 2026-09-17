import { redirect } from "next/navigation";
import Link from "next/link";
import { Users } from "lucide-react";
import { getSessionProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getTeamWorkload } from "@/lib/data/dashboard";
import { EmptyState } from "@/components/ui/state";
import { RoleBadge } from "@/components/ui/badges";

export const metadata = {
  title: "Employees | HCT Tracker",
  description: "View and manage team members and workload distribution",
};

export default async function EmployeesPage() {
  const { profile } = await getSessionProfile();
  const supabase = await createClient();

  if (profile.role !== "lead") {
    redirect("/dashboard");
  }

  const workloadList = await getTeamWorkload(supabase);

  return (
    <section className="p-4 md:p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Employees</h1>
          <p className="mt-1 text-sm text-slate-500">
            Factual workload breakdown across team members.
          </p>
        </div>
        <span className="inline-flex items-center rounded-md border border-surface-line bg-surface-raised px-2.5 py-1 text-xs text-slate-400">
          {workloadList.length} member{workloadList.length !== 1 ? "s" : ""}
        </span>
      </div>

      {workloadList.length === 0 ? (
        <EmptyState
          title="No employees found"
          detail="Active employees will appear here as they join."
          action={
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-surface-line bg-surface-raised">
              <Users size={20} className="text-slate-500" />
            </div>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-surface-line bg-surface-panel">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-surface-line bg-surface-raised text-xs font-medium text-slate-500">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Active Tasks</th>
                <th className="py-3 px-4">High/Urgent</th>
                <th className="py-3 px-4">In Review</th>
                <th className="py-3 px-4">Blocked</th>
                <th className="py-3 px-4">Overdue</th>
                <th className="py-3 px-4">Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-line">
              {workloadList.map(({ employee: emp, activeCount, highPriorityCount, inReviewCount, blockedCount, overdueCount, completedCount }) => (
                <tr key={emp.id} className="hover:bg-surface-raised transition-colors">
                  <td className="py-3 px-4">
                    <Link href={`/employees/${emp.id}`} className="font-medium text-slate-100 hover:underline block truncate max-w-xs">
                      {emp.full_name}
                    </Link>
                    <span className="text-xs text-slate-500 block">{emp.email ?? "—"}</span>
                  </td>
                  <td className="py-3 px-4">
                    <RoleBadge role={emp.role} />
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-100">{activeCount}</td>
                  <td className="py-3 px-4 text-amber-300">{highPriorityCount}</td>
                  <td className="py-3 px-4 text-amber-400">{inReviewCount}</td>
                  <td className="py-3 px-4 text-red-400">{blockedCount}</td>
                  <td className="py-3 px-4 text-red-400">{overdueCount}</td>
                  <td className="py-3 px-4 text-emerald-400">{completedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
