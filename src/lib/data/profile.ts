import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export async function fetchAllEmployees(): Promise<{ data: Profile[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true });

    if (error) {
      console.error("Error fetching employees:", error);
      return { data: [], error: error.message };
    }

    return { data: (data as Profile[]) || [], error: null };
  } catch (err) {
    console.error("Unexpected error in fetchAllEmployees:", err);
    return { data: [], error: "Failed to load employees." };
  }
}

export async function fetchProfileById(userId: string): Promise<{ data: Profile | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single<Profile>();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error in fetchProfileById:", err);
    return { data: null, error: "Failed to load profile." };
  }
}
