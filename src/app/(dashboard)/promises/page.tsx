import Link from "next/link";
import { getSessionProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getPromises } from "@/lib/data/promises";
import { getTasks } from "@/lib/data";
import { createPromiseAction } from "@/actions/promises";
import { EmptyState } from "@/components/ui/state";
import { StatusBadge, PriorityBadge, ProgressBar } from "@/components/ui/badges";
import { Handshake, Plus, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Promises | HCT Tracker",
  description: "Track task commitments and promises",
};

const statusBadgeColor: Record<string, string> = {
  active: "text-blue-400 border-blue-800 bg-blue-950/20",
  fulfilled: "text-emerald-400 border-emerald-800 bg-emerald-950/20",
  missed: "text-red-400 border-red-800 bg-red-950/20",
  cancelled: "text-slate-400 border-slate-700 bg-slate-900/20",
};

export default async function PromisesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { profile, user } = await getSessionProfile();
  const supabase = await createClient();
  const isLead = profile.role === "lead";

  const [promises, tasks] = await Promise.all([
    getPromises(supabase, isLead, user.id),
    getTasks(supabase, profile),
  ]);

  // Trigger automated deadline & promise missed check
  try {
    await supabase.rpc("run_deadline_reminders");
  } catch {
    // Non-fatal error fallback
  }

  const activeTasks = tasks.filter((t) => t.status !== "completed");
  const filterTab = String(params.filter ?? "all");

  const filteredPromises = promises.filter((p) => {
    if (filterTab === "active") return p.status === "active";
    if (filterTab === "fulfilled") return p.status === "fulfilled";
    if (filterTab === "missed") return p.status === "missed";
    return true;
  });

  return (
    <section className="p-4 md:p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">
            {isLead ? "Team Promises" : "My Promises"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Explicit work commitments tied directly to assigned tasks.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-line pb-3">
        {[
          { key: "all", label: "All Promises" },
          { key: "active", label: "Active" },
          { key: "fulfilled", label: "Fulfilled" },
          { key: "missed", label: "Missed" },
        ].map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "all" ? "/promises" : `/promises?filter=${tab.key}`}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              filterTab === tab.key
                ? "bg-blue-600 text-white"
                : "border border-surface-line bg-surface-panel text-slate-400 hover:bg-surface-raised"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Main List */}
        <div className="space-y-3">
          {filteredPromises.length === 0 ? (
            <EmptyState
              title="No promises found"
              detail={
                isLead
                  ? "Team promises committed by employees will appear here."
                  : "Commit to a target date on your assigned tasks to create a promise."
              }
              action={
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-surface-line bg-surface-raised">
                  <Handshake size={20} className="text-slate-500" />
                </div>
              }
            />
          ) : (
            <div className="grid gap-3">
              {filteredPromises.map((p) => (
                <div
                  key={p.id}
                  className="rounded-lg border border-surface-line bg-surface-panel p-4 space-y-2 hover:bg-surface-raised transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-100">{p.title}</h2>
                      {p.description && <p className="text-xs text-slate-400 mt-0.5">{p.description}</p>}
                    </div>
                    <span
                      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium uppercase tracking-wider ${
                        statusBadgeColor[p.status] ?? "text-slate-400"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  {p.task && (
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-surface-line pt-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">Linked Task:</span>
                        <Link href={`/tasks/${p.task.id}`} className="font-medium text-blue-400 hover:underline">
                          {p.task.title}
                        </Link>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={p.task.status} />
                        <span className="text-slate-400">
                          Target: {p.due_date ? p.due_date.slice(0, 10) : "—"}
                        </span>
                      </div>
                    </div>
                  )}

                  {isLead && p.user && (
                    <p className="text-[11px] text-slate-500">Committed by: {p.user.full_name}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Promise Creator Sidebar (Employee/Lead) */}
        <aside className="rounded-lg border border-surface-line bg-surface-panel p-4 space-y-4 self-start">
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Plus size={16} className="text-blue-400" /> Create Task Promise
          </h2>
          <p className="text-xs text-slate-400">
            Make an explicit commitment to finish a task by a target deadline.
          </p>

          {activeTasks.length === 0 ? (
            <p className="text-xs text-amber-300">You must have an active assigned task to create a promise.</p>
          ) : (
            <form action={createPromiseAction} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Select Task</label>
                <select
                  name="taskId"
                  required
                  className="w-full rounded-md border border-surface-line bg-surface-raised px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                >
                  {activeTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.status.replace("_", " ")})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Promise Commitment Title</label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Complete authentication module testing"
                  className="w-full rounded-md border border-surface-line bg-surface-raised px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Description (Optional)</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Specific scope promised..."
                  className="w-full rounded-md border border-surface-line bg-surface-raised px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Target Commitment Date</label>
                <input
                  name="dueDate"
                  type="date"
                  className="w-full rounded-md border border-surface-line bg-surface-raised px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button className="focus-ring w-full rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500">
                Commit Promise
              </button>
            </form>
          )}
        </aside>
      </div>
    </section>
  );
}
