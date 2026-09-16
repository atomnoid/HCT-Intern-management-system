import { AppShell } from "@/components/layout/app-shell";
import { SetupRequired } from "@/components/setup-required";
import { getLeadContext } from "@/lib/session";
import { hasSupabaseEnv } from "@/lib/env";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!hasSupabaseEnv()) return <SetupRequired />;
  const { profile } = await getLeadContext();
  return <AppShell profile={profile}>{children}</AppShell>;
}
