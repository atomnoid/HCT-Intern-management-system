export const taskStatuses = ["todo", "in_progress", "blocked", "in_review", "completed"] as const;
export const taskPriorities = ["low", "medium", "high", "urgent"] as const;

export const statusLabels = {
  todo: "Todo",
  in_progress: "In progress",
  blocked: "Blocked",
  in_review: "In review",
  completed: "Completed"
} as const;

export const priorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent"
} as const;
