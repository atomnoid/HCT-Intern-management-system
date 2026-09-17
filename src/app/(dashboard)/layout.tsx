import { AppShell } from "@/components/layout/app-shell";
import { SetupRequired } from "@/components/setup-required";
import { getSessionProfile } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!hasSupabaseEnv()) return <SetupRequired />;
  const { profile } = await getSessionProfile();
  return <AppShell profile={profile}>{children}</AppShell>;
}
