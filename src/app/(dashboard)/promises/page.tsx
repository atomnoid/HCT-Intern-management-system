import { Handshake } from "lucide-react";
import { EmptyState } from "@/components/ui/state";

export const metadata = {
  title: "Promises | HCT Tracker",
  description: "Manage your commitments and delivery promises",
};

export default function PromisesPage() {
  return (
    <section className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-slate-100">Promises</h1>
        <p className="mt-1 text-sm text-slate-500">
          Commitments you&apos;ve made to your team and their current status.
        </p>
      </div>

      <div className="mb-4 flex items-center gap-2">
        {["All", "Pending", "Fulfilled", "Missed"].map((tab) => (
          <button
            key={tab}
            disabled
            className="rounded-md border border-surface-line bg-surface-raised px-3 py-1.5 text-xs text-slate-400 opacity-50 cursor-not-allowed"
          >
            {tab}
          </button>
        ))}
      </div>

      <EmptyState
        title="Promise tracking coming in Part 4"
        detail="This section will let you commit to deadlines and track your promises to leads."
        action={
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-surface-line bg-surface-raised">
            <Handshake size={20} className="text-slate-500" />
          </div>
        }
      />
    </section>
  );
}
