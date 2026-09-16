"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/auth";
import { internCreateSchema } from "@/lib/validations";

export async function createInternAction(formData: FormData) {
  const { supabase, profile } = await getSessionProfile();
  if (profile.role !== "lead") throw new Error("Only leads can add interns.");

  const parsed = internCreateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Enter the intern name and a valid email if provided.");

  const { error } = await supabase.from("profiles").insert({
    full_name: parsed.data.fullName,
    email: parsed.data.email || null,
    role: "intern"
  });

  if (error) throw new Error(error.message);
  revalidatePath("/interns");
  revalidatePath("/tasks/new");
}
