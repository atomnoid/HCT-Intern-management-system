import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { getSessionProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getUserNotifications } from "@/lib/data/promises";
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/actions/promises";
import { EmptyState } from "@/components/ui/state";
import { Bell, CheckCheck, Check, AlertCircle, Clock, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Notifications | HCT Tracker",
  description: "System alerts and workflow notifications",
};

export default async function NotificationsPage() {
  const { profile, user } = await getSessionProfile();
  const supabase = await createClient();

  let notifications: Awaited<ReturnType<typeof getUserNotifications>> = [];
  try {
    notifications = await getUserNotifications(supabase, user.id);
  } catch (err) {
    console.error("Failed to load notifications:", err);
  }
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <section className="p-4 md:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            Notifications {unreadCount > 0 && <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">{unreadCount} unread</span>}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Actionable workflow updates, task reviews, and deadline reminders.
          </p>
        </div>

        {unreadCount > 0 && (
          <form action={markAllNotificationsReadAction}>
            <button className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-surface-line bg-surface-panel px-3 py-1.5 text-xs text-slate-300 hover:bg-surface-raised">
              <CheckCheck size={14} /> Mark all read
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          detail="You'll receive notifications when tasks are assigned, reviewed, or deadlines approach."
          action={
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-surface-line bg-surface-raised">
              <Bell size={20} className="text-slate-500" />
            </div>
          }
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start justify-between gap-3 rounded-lg border p-4 transition-colors ${
                n.is_read
                  ? "border-surface-line bg-surface-panel/60 text-slate-400"
                  : "border-blue-800/40 bg-blue-950/10 text-slate-100"
              }`}
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {!n.is_read && <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />}
                  <h2 className="text-sm font-semibold">{n.title}</h2>
                  <span className="text-[11px] text-slate-500">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{n.message}</p>
                {n.link_url && (
                  <Link href={n.link_url} className="inline-block text-xs text-blue-400 hover:underline pt-1">
                    View details →
                  </Link>
                )}
              </div>

              {!n.is_read && (
                <form action={markNotificationReadAction} className="flex-shrink-0">
                  <input type="hidden" name="notificationId" value={n.id} />
                  <button title="Mark as read" className="focus-ring rounded p-1 text-slate-400 hover:bg-surface-raised hover:text-white">
                    <Check size={16} />
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
