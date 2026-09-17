import { Bell } from "lucide-react";
import { EmptyState } from "@/components/ui/state";

export const metadata = {
  title: "Notifications | HCT Tracker",
  description: "Your system notifications and activity alerts",
};

export default function NotificationsPage() {
  return (
    <section className="p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">
            System alerts, task updates, and activity from your team.
          </p>
        </div>
        <button
          disabled
          className="rounded-md border border-surface-line bg-surface-raised px-3 py-1.5 text-xs text-slate-400 opacity-50 cursor-not-allowed"
        >
          Mark all read
        </button>
      </div>

      <EmptyState
        title="Notifications coming in Part 5"
        detail="You'll receive alerts for task assignments, status changes, blockers, and reviews."
        action={
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-surface-line bg-surface-raised">
            <Bell size={20} className="text-slate-500" />
          </div>
        }
      />
    </section>
  );
}
