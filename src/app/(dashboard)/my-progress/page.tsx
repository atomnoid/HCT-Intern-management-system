import { TrendingUp } from "lucide-react";
import { EmptyState } from "@/components/ui/state";

export const metadata = {
  title: "My Progress | HCT Tracker",
  description: "Track your personal task progress and completion history",
};

export default function MyProgressPage() {
  return (
    <section className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-slate-100">My Progress</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your task completion history and personal performance over time.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        {[
          { label: "Tasks Completed", value: "—" },
          { label: "In Progress", value: "—" },
          { label: "Overdue", value: "—" },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-surface-line bg-surface-panel p-4">
            <p className="text-xs text-slate-500">{label}</p>
            <strong className="mt-2 block text-2xl text-slate-100">{value}</strong>
          </div>
        ))}
      </div>

      <EmptyState
        title="Progress tracking coming in Part 3"
        detail="This section will show your task history, completion rates, and personal metrics."
        action={
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-surface-line bg-surface-raised">
            <TrendingUp size={20} className="text-slate-500" />
          </div>
        }
      />
    </section>
  );
}
