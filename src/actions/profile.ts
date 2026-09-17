"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileActionResult = {
  error?: string;
  success?: boolean;
  message?: string;
};

export async function updateProfileAction(
  prevState: ProfileActionResult | null,
  formData: FormData
): Promise<ProfileActionResult> {
  const fullName = formData.get("fullName")?.toString().trim();
  const avatarUrl = formData.get("avatarUrl")?.toString().trim() || null;

  if (!fullName) {
    return { error: "Full name cannot be empty." };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return { error: "Not authenticated." };
  }

  // Update profile without mutating role or is_active
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userData.user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");

  return { success: true, message: "Profile updated successfully." };
}
