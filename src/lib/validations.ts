import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const signUpSchema = signInSchema.extend({
  fullName: z.string().min(2)
});

export const internCreateSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email().optional().or(z.literal(""))
});

export const taskCreateSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  assigneeId: z.string().uuid(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  dueDate: z.string().min(8),
  category: z.string().optional()
});

export const progressSchema = z.object({
  taskId: z.string().uuid(),
  progress: z.coerce.number().min(0).max(100)
});

export const commentSchema = z.object({
  taskId: z.string().uuid(),
  content: z.string().min(2).max(800)
});

export const blockerSchema = z.object({
  taskId: z.string().uuid(),
  reason: z.string().min(8).max(500)
});

export const submissionSchema = z.object({
  taskId: z.string().uuid(),
  completionNote: z.string().min(8),
  githubUrl: z.string().url().optional().or(z.literal("")),
  previewUrl: z.string().url().optional().or(z.literal(""))
});

export const reviewSchema = z.object({
  submissionId: z.string().uuid(),
  decision: z.enum(["approved", "changes_requested"]),
  feedback: z.string().optional()
}).refine((value) => value.decision === "approved" || (value.feedback?.trim().length ?? 0) >= 8, {
  message: "Feedback is required when requesting changes.",
  path: ["feedback"]
});
