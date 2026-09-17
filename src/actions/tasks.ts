"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { blockerSchema, commentSchema, progressSchema, reviewSchema, submissionSchema, taskCreateSchema } from "@/lib/validations";

function cleanMessage(error: unknown) {
  return error instanceof Error ? error.message : "Action failed. Please try again.";
}

export async function createTaskAction(formData: FormData) {
  const { supabase, profile } = await getSessionProfile();
  if (profile.role !== "lead") throw new Error("Only leads can create tasks.");
  const parsed = taskCreateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Check the required task fields.");

  const checklist = formData.getAll("checklist").map((item) => String(item).trim()).filter(Boolean);
  const { data, error } = await supabase.rpc("create_task_with_activity", {
    task_title: parsed.data.title,
    task_description: parsed.data.description ?? "",
    task_assignee: parsed.data.assigneeId,
    task_priority: parsed.data.priority,
    task_due_date: parsed.data.dueDate,
    task_category: parsed.data.category || null,
    checklist_titles: checklist
  });
  if (error) throw new Error(cleanMessage(error));
  revalidatePath("/dashboard");
  revalidatePath("/tasks");
  redirect(`/tasks/${data.id}`);
}

export async function startTaskAction(formData: FormData) {
  const { supabase } = await getSessionProfile();
  const taskId = String(formData.get("taskId"));
  const { error } = await supabase.rpc("start_task", { task_uuid: taskId });
  if (error) throw new Error(cleanMessage(error));
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/dashboard");
}

export async function updateProgressAction(formData: FormData) {
  const { supabase } = await getSessionProfile();
  const parsed = progressSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Progress must be between 0 and 100.");
  const { error } = await supabase.rpc("update_task_progress", { task_uuid: parsed.data.taskId, next_progress: parsed.data.progress });
  if (error) throw new Error(cleanMessage(error));
  revalidatePath(`/tasks/${parsed.data.taskId}`);
  revalidatePath("/dashboard");
}

export async function addCommentAction(formData: FormData) {
  const { supabase, profile } = await getSessionProfile();
  const parsed = commentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Comment cannot be empty.");
  const { error } = await supabase.from("task_comments").insert({ task_id: parsed.data.taskId, author_id: profile.id, content: parsed.data.content });
  if (error) throw new Error(cleanMessage(error));
  await supabase.from("task_activity").insert({ task_id: parsed.data.taskId, actor_id: profile.id, action: "comment_added", metadata: {} });
  revalidatePath(`/tasks/${parsed.data.taskId}`);
}

export async function toggleChecklistAction(formData: FormData) {
  const { supabase, profile } = await getSessionProfile();
  const itemId = String(formData.get("itemId"));
  const taskId = String(formData.get("taskId"));
  const isCompleted = formData.get("isCompleted") === "true";
  const { error } = await supabase.from("task_checklist_items").update({ is_completed: isCompleted }).eq("id", itemId).eq("task_id", taskId);
  if (error) throw new Error(cleanMessage(error));
  await supabase.from("task_activity").insert({ task_id: taskId, actor_id: profile.id, action: "checklist_updated", metadata: { item_id: itemId, is_completed: isCompleted } });
  revalidatePath(`/tasks/${taskId}`);
}

export async function reportBlockerAction(formData: FormData) {
  const { supabase } = await getSessionProfile();
  const parsed = blockerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Add a blocker reason with at least 8 characters.");
  const { error } = await supabase.rpc("report_task_blocker", { task_uuid: parsed.data.taskId, blocker_reason: parsed.data.reason });
  if (error) throw new Error(cleanMessage(error));
  revalidatePath(`/tasks/${parsed.data.taskId}`);
  revalidatePath("/dashboard");
}

export async function resolveBlockerAction(formData: FormData) {
  const { supabase } = await getSessionProfile();
  const blockerId = String(formData.get("blockerId"));
  const taskId = String(formData.get("taskId"));
  const { error } = await supabase.rpc("resolve_task_blocker", { blocker_uuid: blockerId });
  if (error) throw new Error(cleanMessage(error));
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/dashboard");
}

export async function submitTaskAction(formData: FormData) {
  const { supabase } = await getSessionProfile();
  const parsed = submissionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Add a completion note and valid links.");
  const { error } = await supabase.rpc("submit_task_for_review", {
    task_uuid: parsed.data.taskId,
    completion_note: parsed.data.completionNote,
    github_url: parsed.data.githubUrl || null,
    preview_url: parsed.data.previewUrl || null
  });
  if (error) throw new Error(cleanMessage(error));
  revalidatePath(`/tasks/${parsed.data.taskId}`);
  revalidatePath("/dashboard");
}

export async function reviewSubmissionAction(formData: FormData) {
  const { supabase } = await getSessionProfile();
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  const taskId = String(formData.get("taskId"));
  if (!parsed.success) throw new Error("Feedback is required when requesting changes.");
  const { error } = await supabase.rpc("review_task_submission", {
    submission_uuid: parsed.data.submissionId,
    review_decision: parsed.data.decision,
    review_feedback: parsed.data.feedback || null
  });
  if (error) throw new Error(cleanMessage(error));
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/dashboard");
}
