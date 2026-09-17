import { AppShell } from "@/components/layout/app-shell";
import { SetupRequired } from "@/components/setup-required";
import { getSessionProfile } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { getUnreadNotificationCount } from "@/lib/data/promises";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!hasSupabaseEnv()) return <SetupRequired />;
  const { profile, user } = await getSessionProfile();
  const supabase = await createClient();
  const unreadCount = await getUnreadNotificationCount(supabase, user.id);

  return <AppShell profile={profile} unreadNotificationsCount={unreadCount}>{children}</AppShell>;
}
