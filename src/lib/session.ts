import { getSessionProfile } from "@/lib/auth";
import { demoLead } from "@/lib/demo-data";

export async function getLeadContext() {
  const session = await getSessionProfile().catch(() => null);
  if (!session || session.profile.role !== "lead") {
    return { supabase: null, user: null, profile: demoLead, demo: true as const };
  }

  return { ...session, demo: false as const };
}
