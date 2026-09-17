import { format } from "date-fns";
import { notFound } from "next/navigation";
import {
  addCommentAction,
  reportBlockerAction,
  resolveBlockerAction,
  reviewSubmissionAction,
  submitTaskAction,
  toggleChecklistAction,
  updateProgressAction,
} from "@/actions/tasks";
import { PriorityBadge, ProgressBar, StatusBadge } from "@/components/ui/badges";
import { EmptyState } from "@/components/ui/state";
import { getTaskDetail } from "@/lib/data";
import { friendlyDate } from "@/lib/format";
import { getSessionProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile } = await getSessionProfile();
  const supabase = await createClient();

  let task: Awaited<ReturnType<typeof getTaskDetail>> | null = null;
  try {
    task = await getTaskDetail(supabase, id);
  } catch {
    notFound();
  }
  if (!task) notFound();

  const latestSubmission = [...task.task_submissions].sort(
    (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)
  )[0];
  const openBlocker = task.task_blockers.find((blocker) => !blocker.is_resolved);
  const isLead = profile.role === "lead";
  const isAssignee = task.assignee_id === profile.id;

  return (
    <section className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-slate-100">{task.title}</h1>
        {task.description && (
          <p className="mt-1 text-sm text-slate-500">{task.description}</p>
        )}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2 border-y border-surface-line py-3">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
        <span className="text-sm text-slate-400">Assignee: {task.assignee?.full_name ?? "Unassigned"}</span>
        <span className="text-sm text-slate-400">Due {friendlyDate(task.due_date)}</span>
        {task.category && <span className="text-sm text-slate-400">{task.category}</span>}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        {/* Main column */}
        <div className="grid gap-6">
          {/* Progress */}
          <section className="border-b border-surface-line pb-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-100">Progress</h2>
            <div className="flex flex-wrap items-center gap-3">
              <ProgressBar value={task.progress} />
              {(isAssignee || isLead) &&
                [0, 25, 50, 75, 100].map((value) => (
                  <form key={value} action={updateProgressAction}>
                    <input type="hidden" name="taskId" value={task.id} />
                    <input type="hidden" name="progress" value={value} />
                    <button className="focus-ring rounded-md border border-surface-line bg-surface-panel px-3 py-1.5 text-sm text-slate-300 hover:bg-surface-raised">
                      {value}%
                    </button>
                  </form>
                ))}
            </div>
          </section>

          {/* Checklist */}
          <section className="border-b border-surface-line pb-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-100">Checklist</h2>
            <div className="grid gap-2">
              {task.task_checklist_items.length > 0 ? (
                task.task_checklist_items
                  .sort((a, b) => a.position - b.position)
                  .map((item) => (
                    <form
                      key={item.id}
                      action={toggleChecklistAction}
                      className="flex items-center gap-3 rounded-md border border-surface-line bg-surface-panel px-3 py-2.5"
                    >
                      <input type="hidden" name="taskId" value={task.id} />
                      <input type="hidden" name="itemId" value={item.id} />
                      <input type="hidden" name="isCompleted" value={String(!item.is_completed)} />
                      <button
                        className="focus-ring flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border border-slate-600 text-xs text-emerald-400"
                        aria-label={item.is_completed ? "Mark incomplete" : "Mark complete"}
                      >
                        {item.is_completed ? "✓" : ""}
                      </button>
                      <span className={item.is_completed ? "text-slate-500 line-through" : "text-slate-200"}>
                        {item.title}
                      </span>
                    </form>
                  ))
              ) : (
                <EmptyState title="No checklist items." />
              )}
            </div>
          </section>

          {/* Comments */}
          <section className="border-b border-surface-line pb-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-100">Comments</h2>
            <div className="mb-3 grid gap-3">
              {task.task_comments.length > 0 ? (
                task.task_comments.map((comment) => (
                  <div key={comment.id} className="border-l-2 border-surface-line pl-3">
                    <p className="text-sm text-slate-200">{comment.content}</p>
                    <small className="text-xs text-slate-500">
                      {comment.author?.full_name ?? "User"} ·{" "}
                      {format(new Date(comment.created_at), "MMM d, h:mm a")}
                    </small>
                  </div>
                ))
              ) : (
                <EmptyState title="No comments yet." detail="Keep updates focused and useful." />
              )}
            </div>
            <form action={addCommentAction} className="flex gap-2">
              <input type="hidden" name="taskId" value={task.id} />
              <input
                name="content"
                placeholder="Add a comment…"
                className="h-8 flex-1 rounded-md border border-surface-line bg-surface-panel px-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button className="focus-ring h-8 rounded-md bg-blue-600 px-3 text-sm text-white hover:bg-blue-500">
                Post
              </button>
            </form>
          </section>

          {/* Activity */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-slate-100">Activity</h2>
            <div className="grid gap-3">
              {task.task_activity.length > 0 ? (
                task.task_activity.map((item) => (
                  <div key={item.id} className="border-l-2 border-surface-line pl-3 text-sm">
                    <span className="text-slate-300">{item.action.replaceAll("_", " ")}</span>
                    <small className="block text-xs text-slate-500">
                      {item.actor?.full_name ?? "System"} ·{" "}
                      {format(new Date(item.created_at), "MMM d, h:mm a")}
                    </small>
                  </div>
                ))
              ) : (
                <EmptyState title="No activity yet." />
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="grid gap-4 self-start">
          {/* Open Blocker */}
          {openBlocker && (
            <section className="rounded-lg border border-red-800/50 bg-red-950/20 p-4">
              <h2 className="mb-2 text-sm font-semibold text-red-300">Active Blocker</h2>
              <p className="text-sm text-red-100">{openBlocker.reason}</p>
              {isLead && (
                <form action={resolveBlockerAction} className="mt-3">
                  <input type="hidden" name="taskId" value={task.id} />
                  <input type="hidden" name="blockerId" value={openBlocker.id} />
                  <button className="focus-ring rounded-md border border-red-700 px-3 py-1.5 text-sm text-red-200 hover:bg-red-900/40">
                    Resolve blocker
                  </button>
                </form>
              )}
            </section>
          )}

          {/* Actions */}
          <section className="rounded-lg border border-surface-line bg-surface-panel p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-100">
              {isLead ? "Lead Actions" : "My Actions"}
            </h2>

            {/* Report blocker */}
            {!openBlocker && (
              <form action={reportBlockerAction} className="mb-4 grid gap-2">
                <input type="hidden" name="taskId" value={task.id} />
                <textarea
                  name="reason"
                  placeholder="Describe the blocker (min. 8 chars)"
                  className="min-h-16 rounded-md border border-surface-line bg-surface-raised px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
                />
                <button className="focus-ring rounded-md border border-surface-line bg-surface-raised px-3 py-1.5 text-sm text-slate-300 hover:bg-[#1e2d3d]">
                  Report blocker
                </button>
              </form>
            )}

            {/* Submit for review */}
            {(isAssignee || isLead) && task.status !== "completed" && task.status !== "in_review" && (
              <form action={submitTaskAction} className="grid gap-2">
                <input type="hidden" name="taskId" value={task.id} />
                <textarea
                  name="completionNote"
                  placeholder="What was completed?"
                  className="min-h-16 rounded-md border border-surface-line bg-surface-raised px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
                />
                <input
                  name="githubUrl"
                  placeholder="GitHub / PR URL (optional)"
                  className="h-8 rounded-md border border-surface-line bg-surface-raised px-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
                <input
                  name="previewUrl"
                  placeholder="Preview URL (optional)"
                  className="h-8 rounded-md border border-surface-line bg-surface-raised px-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
                <button className="focus-ring rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-500">
                  Submit for review
                </button>
              </form>
            )}
          </section>

          {/* Submission */}
          <section className="rounded-lg border border-surface-line bg-surface-panel p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-100">Submission</h2>
            {latestSubmission ? (
              <div className="grid gap-2 text-sm text-slate-300">
                <p>{latestSubmission.completion_note}</p>
                {latestSubmission.github_url && (
                  <a className="text-blue-400 hover:text-blue-300" href={latestSubmission.github_url} target="_blank" rel="noopener noreferrer">
                    GitHub / PR →
                  </a>
                )}
                {latestSubmission.preview_url && (
                  <a className="text-blue-400 hover:text-blue-300" href={latestSubmission.preview_url} target="_blank" rel="noopener noreferrer">
                    Preview →
                  </a>
                )}
                {isLead && task.status === "in_review" && (
                  <form action={reviewSubmissionAction} className="mt-2 grid gap-2">
                    <input type="hidden" name="taskId" value={task.id} />
                    <input type="hidden" name="submissionId" value={latestSubmission.id} />
                    <textarea
                      name="feedback"
                      placeholder="Feedback (required for changes requested)"
                      className="min-h-16 rounded-md border border-surface-line bg-surface-raised px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        name="decision"
                        value="approved"
                        className="focus-ring rounded-md bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-600"
                      >
                        Approve
                      </button>
                      <button
                        name="decision"
                        value="changes_requested"
                        className="focus-ring rounded-md border border-surface-line px-3 py-1.5 text-sm text-slate-300 hover:bg-surface-raised"
                      >
                        Request changes
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <EmptyState title="No submission yet." />
            )}
          </section>
        </aside>
      </div>
    </section>
  );
}
