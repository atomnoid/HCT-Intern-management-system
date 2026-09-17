"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/auth";
import { z } from "zod";

const promiseSchema = z.object({
  taskId: z.string().uuid(),
  title: z.string().min(3),
  description: z.string().optional(),
  dueDate: z.string().optional(),
});

function cleanMessage(error: unknown) {
  return error instanceof Error ? error.message : "Action failed. Please try again.";
}

export async function createPromiseAction(formData: FormData) {
  const { supabase } = await getSessionProfile();
  const parsed = promiseSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    throw new Error("Provide a valid title (min 3 chars) and task selection.");
  }

  const { error } = await supabase.rpc("create_promise", {
    task_uuid: parsed.data.taskId,
    promise_title: parsed.data.title,
    promise_description: parsed.data.description || null,
    promise_due_date: parsed.data.dueDate ? new Date(parsed.data.dueDate).toISOString() : null,
  });

  if (error) throw new Error(cleanMessage(error));

  revalidatePath("/promises");
  revalidatePath(`/tasks/${parsed.data.taskId}`);
  revalidatePath("/dashboard");
}

export async function markNotificationReadAction(formData: FormData) {
  const { supabase, user } = await getSessionProfile();
  const notificationId = String(formData.get("notificationId"));

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) throw new Error(cleanMessage(error));

  revalidatePath("/notifications");
  revalidatePath("/dashboard");
}

export async function markAllNotificationsReadAction() {
  const { supabase, user } = await getSessionProfile();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) throw new Error(cleanMessage(error));

  revalidatePath("/notifications");
  revalidatePath("/dashboard");
}
