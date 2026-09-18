import type { Profile, Task, TaskActivity, TaskDetail } from "@/types/database";

const now = new Date();
const iso = (offset: number) => new Date(now.getTime() + offset * 86400000).toISOString();
const date = (offset: number) => iso(offset).slice(0, 10);

export const demoLead: Profile = {
  id: "00000000-0000-4000-8000-000000000001",
  full_name: "Lead User",
  email: "lead@example.com",
  avatar_url: null,
  role: "lead",
  is_active: true,
  created_at: iso(-30),
  updated_at: iso(0)
};

export const demoInterns: Profile[] = [
  { id: "00000000-0000-4000-8000-000000000101", full_name: "Aayush", email: "aayush@example.com", avatar_url: null, role: "intern", is_active: true, created_at: iso(-12), updated_at: iso(0) },
  { id: "00000000-0000-4000-8000-000000000102", full_name: "Rahul", email: "rahul@example.com", avatar_url: null, role: "intern", is_active: true, created_at: iso(-10), updated_at: iso(0) },
  { id: "00000000-0000-4000-8000-000000000103", full_name: "Priya", email: "priya@example.com", avatar_url: null, role: "intern", is_active: true, created_at: iso(-8), updated_at: iso(0) }
];


export const demoTasks: Task[] = [
  { id: "00000000-0000-4000-8000-000000001001", title: "Implement Dashboard UI", description: "Build the lead dashboard and task overview.", assignee_id: demoInterns[0].id, created_by: demoLead.id, status: "in_progress", priority: "high", progress: 75, category: "Frontend", start_date: date(-3), due_date: date(0), completed_at: null, created_at: iso(-3), updated_at: iso(0), assignee: demoInterns[0], creator: demoLead },
  { id: "00000000-0000-4000-8000-000000001002", title: "Build Authentication API", description: "Complete auth validation and role checks.", assignee_id: demoInterns[1].id, created_by: demoLead.id, status: "blocked", priority: "high", progress: 55, category: "Backend", start_date: date(-5), due_date: date(1), completed_at: null, created_at: iso(-5), updated_at: iso(-1), assignee: demoInterns[1], creator: demoLead },
  { id: "00000000-0000-4000-8000-000000001003", title: "Improve Empty States", description: "Make empty states compact and useful.", assignee_id: demoInterns[2].id, created_by: demoLead.id, status: "todo", priority: "medium", progress: 0, category: "UX", start_date: date(0), due_date: date(4), completed_at: null, created_at: iso(-1), updated_at: iso(-1), assignee: demoInterns[2], creator: demoLead }
];

export const demoActivity: TaskActivity[] = [
  { id: "00000000-0000-4000-8000-000000002001", task_id: demoTasks[0].id, actor_id: demoLead.id, action: "progress_updated", metadata: { from: 50, to: 75 }, created_at: iso(0), actor: demoLead },
  { id: "00000000-0000-4000-8000-000000002002", task_id: demoTasks[1].id, actor_id: demoLead.id, action: "blocker_reported", metadata: { reason: "Waiting for API credentials." }, created_at: iso(-1), actor: demoLead }
];

export function demoTaskDetail(id: string): TaskDetail | null {
  const task = demoTasks.find((item) => item.id === id);
  if (!task) return null;
  return {
    ...task,
    task_checklist_items: [
      { id: `${id}-check-1`, task_id: id, title: "Define scope", is_completed: true, position: 0, created_at: iso(-2), updated_at: iso(-1) },
      { id: `${id}-check-2`, task_id: id, title: "Complete implementation", is_completed: false, position: 1, created_at: iso(-2), updated_at: iso(-1) }
    ],
    task_comments: [],
    task_blockers: task.status === "blocked" ? [{ id: `${id}-blocker`, task_id: id, reported_by: demoLead.id, reason: "Waiting for API credentials.", is_resolved: false, resolved_by: null, resolved_at: null, created_at: iso(-1) }] : [],
    task_submissions: [],
    task_reviews: [],
    task_activity: demoActivity.filter((activity) => activity.task_id === id)
  };
}
