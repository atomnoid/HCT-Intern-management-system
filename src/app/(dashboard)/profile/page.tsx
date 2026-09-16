import { PageTitle } from "@/components/page-title";
import { DataError } from "@/components/data-error";
import { SetupRequired } from "@/components/setup-required";
import { getSessionProfile } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";

export default async function ProfilePage() {
  if (!hasSupabaseEnv()) return <SetupRequired />;
  const session = await getSessionProfile().catch((error) => ({ error }));
  if ("error" in session) return <DataError message={session.error instanceof Error ? session.error.message : "Could not load your profile."} />;
  const { profile } = session;
  return (
    <section className="max-w-2xl p-4 md:p-6">
      <PageTitle title="Profile" subtitle="Authenticated Supabase profile and role." />
      <div className="rounded-lg border border-surface-line bg-surface-panel p-5">
        <h2 className="text-lg font-semibold">{profile.full_name}</h2>
        <p className="mt-1 text-sm text-slate-400">{profile.email}</p>
        <p className="mt-3 text-sm capitalize text-slate-300">Role: {profile.role}</p>
      </div>
    </section>
  );
}
