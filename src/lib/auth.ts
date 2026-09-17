import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export async function getSessionProfile() {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user.id)
    .single<Profile>();

  if (!profile) {
    const fallbackProfile: Profile = {
      id: userData.user.id,
      full_name: userData.user.user_metadata?.full_name || userData.user.email?.split("@")[0] || "Employee",
      email: userData.user.email || null,
      avatar_url: userData.user.user_metadata?.avatar_url || null,
      role: (userData.user.user_metadata?.role as Profile["role"]) || "employee",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return { supabase, user: userData.user, profile: fallbackProfile };
  }

  return { supabase, user: userData.user, profile };
}
