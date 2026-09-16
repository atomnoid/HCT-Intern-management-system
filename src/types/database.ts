export type UserRole = "lead" | "intern";
export type TaskStatus = "todo" | "in_progress" | "blocked" | "in_review" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type Profile = {
  id: string;
  full_name: string;
  email: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  assignee_id: string | null;
  created_by: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  category: string | null;
  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  assignee?: Profile | null;
  creator?: Profile | null;
};

export type ChecklistItem = {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  position: number;
  created_at: string;
  updated_at: string;
};

export type TaskComment = {
  id: string;
  task_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: Profile | null;
};

export type TaskBlocker = {
  id: string;
  task_id: string;
  reported_by: string;
  reason: string;
  is_resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
};

export type TaskSubmission = {
  id: string;
  task_id: string;
  submitted_by: string;
  completion_note: string | null;
  github_url: string | null;
  preview_url: string | null;
  created_at: string;
};

export type TaskReview = {
  id: string;
  task_id: string;
  submission_id: string | null;
  reviewed_by: string;
  decision: "approved" | "changes_requested";
  feedback: string | null;
  created_at: string;
};

export type TaskActivity = {
  id: string;
  task_id: string;
  actor_id: string | null;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
  actor?: Profile | null;
};

export type TaskDetail = Task & {
  task_checklist_items: ChecklistItem[];
  task_comments: TaskComment[];
  task_blockers: TaskBlocker[];
  task_submissions: TaskSubmission[];
  task_reviews: TaskReview[];
  task_activity: TaskActivity[];
};
