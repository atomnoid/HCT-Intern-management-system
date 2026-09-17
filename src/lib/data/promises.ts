import type { SupabaseClient } from "@supabase/supabase-js";
import type { PromiseItem, Notification } from "@/types/database";

export async function getPromises(supabase: SupabaseClient, isLead: boolean, userId: string) {
  let query = supabase
    .from("promises")
    .select("*, task:tasks(*, assignee:profiles!tasks_assignee_id_fkey(*)), user:profiles!promises_user_id_fkey(*)")
    .order("created_at", { ascending: false });

  if (!isLead) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as (PromiseItem & { task?: any; user?: any })[];
}

export async function getUserNotifications(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;
  return (data ?? []) as Notification[];
}

export async function getUnreadNotificationCount(supabase: SupabaseClient, userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) return 0;
  return count ?? 0;
}
