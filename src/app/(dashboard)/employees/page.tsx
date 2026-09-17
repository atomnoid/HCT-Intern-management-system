import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { getSessionProfile } from "@/lib/auth";
import { fetchAllEmployees } from "@/lib/data/profile";
import { EmptyState } from "@/components/ui/state";
import { RoleBadge } from "@/components/ui/badges";

export const metadata = {
  title: "Employees | HCT Tracker",
  description: "View and manage your team members",
};

function EmployeeRow({
  profile,
}: {
  profile: {
    id: string;
    full_name: string;
    email: string | null;
    role: "lead" | "employee" | "intern";
    is_active: boolean;
    created_at: string;
  };
}) {
  const initials = profile.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 rounded-lg border border-surface-line bg-surface-panel px-4 py-3 hover:bg-surface-raised transition-colors duration-150">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-blue-800/40 bg-blue-900/30">
        <span className="text-xs font-semibold text-blue-300">{initials}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-slate-100">{profile.full_name}</p>
        <p className="truncate text-xs text-slate-500">{profile.email ?? "—"}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <RoleBadge role={profile.role} />
        {!profile.is_active && (
          <span className="inline-flex items-center rounded border border-slate-700 px-1.5 py-0.5 text-xs text-slate-500">
            Inactive
          </span>
        )}
      </div>
    </div>
  );
}

export default async function EmployeesPage() {
  const { profile } = await getSessionProfile();

  // Server-side role enforcement (not just hiding nav)
  if (profile.role !== "lead") {
    redirect("/dashboard");
  }

  const { data: employees, error } = await fetchAllEmployees();

  return (
    <section className="p-4 md:p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Employees</h1>
          <p className="mt-1 text-sm text-slate-500">
            All team members in your organization.
          </p>
        </div>
        <span className="inline-flex items-center rounded-md border border-surface-line bg-surface-raised px-2.5 py-1 text-xs text-slate-400">
          {employees.length} member{employees.length !== 1 ? "s" : ""}
        </span>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-800/50 bg-red-950/30 px-3 py-2.5">
          <p className="text-sm text-red-300">Failed to load employees: {error}</p>
        </div>
      )}

      {employees.length === 0 && !error ? (
        <EmptyState
          title="No employees yet"
          detail="Employees will appear here once they create their accounts."
          action={
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-surface-line bg-surface-raised">
              <Users size={20} className="text-slate-500" />
            </div>
          }
        />
      ) : (
        <div className="grid gap-2">
          {employees.map((emp) => (
            <EmployeeRow key={emp.id} profile={emp} />
          ))}
        </div>
      )}
    </section>
  );
}
