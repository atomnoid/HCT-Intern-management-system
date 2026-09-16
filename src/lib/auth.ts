import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export async function getSessionProfile() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user.id)
    .single<Profile>();

  if (error || !profile) {
    throw new Error("Your authenticated user does not have a profile row. Apply the Supabase migrations, then create or recreate the user so the profile trigger can run.");
  }

  return { supabase, user: userData.user, profile };
}
