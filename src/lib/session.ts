import { getSessionProfile } from "@/lib/auth";

// Previously returned demo data as fallback - now requires real auth.
// This wrapper is kept for backward compat with pages that import getLeadContext,
// but it now redirects to /login if unauthenticated (via getSessionProfile).
export async function getLeadContext() {
  const session = await getSessionProfile();
  return { ...session, demo: false as const };
}
