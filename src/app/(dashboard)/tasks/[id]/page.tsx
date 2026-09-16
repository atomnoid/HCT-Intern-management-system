import { format } from "date-fns";
import { notFound } from "next/navigation";
import { addCommentAction, reportBlockerAction, resolveBlockerAction, reviewSubmissionAction, submitTaskAction, toggleChecklistAction, updateProgressAction } from "@/actions/tasks";
import { PageTitle } from "@/components/page-title";
import { DataError } from "@/components/data-error";
import { SetupRequired } from "@/components/setup-required";
import { PriorityBadge, ProgressBar, StatusBadge } from "@/components/ui/badges";
import { EmptyState } from "@/components/ui/state";
import { getTaskDetail } from "@/lib/data";
import { friendlyDate } from "@/lib/format";
import { getSessionProfile } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!hasSupabaseEnv()) return <SetupRequired />;
  const { id } = await params;
  const session = await getSessionProfile().catch((error) => ({ error }));
  if ("error" in session) return <DataError message={session.error instanceof Error ? session.error.message : "Could not load your profile."} />;
  const { supabase, profile } = session;
  const taskResult = await getTaskDetail(supabase, id).catch((error) => ({ error }));
  if ("error" in taskResult) return <DataError message={taskResult.error instanceof Error ? taskResult.error.message : "Could not load task details."} />;
  const task = taskResult;
  if (!task) notFound();
  const latestSubmission = [...task.task_submissions].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))[0];
  const openBlocker = task.task_blockers.find((blocker) => !blocker.is_resolved);

  return (
    <section className="p-4 md:p-6">
      <PageTitle title={task.title} subtitle={task.description || "No description provided."} />
      <div className="mb-5 flex flex-wrap items-center gap-2 border-y border-surface-line py-3 text-sm text-slate-300">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
        <span>Assignee: {task.assignee?.full_name ?? "Unassigned"}</span>
        <span>Due {friendlyDate(task.due_date)}</span>
        <span>{task.category || "General"}</span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          <section className="border-b border-surface-line pb-5">
            <h2 className="mb-3 text-sm font-semibold">Progress</h2>
            <div className="flex flex-wrap items-center gap-3">
              <ProgressBar value={task.progress} />
              {[0, 25, 50, 75, 100].map((value) => (
                <form key={value} action={updateProgressAction}>
                  <input type="hidden" name="taskId" value={task.id} />
                  <input type="hidden" name="progress" value={value} />
                  <button className="focus-ring rounded-md border border-surface-line bg-surface-panel px-3 py-2 text-sm hover:bg-surface-raised">{value}%</button>
                </form>
              ))}
            </div>
          </section>

          <section className="border-b border-surface-line pb-5">
            <h2 className="mb-3 text-sm font-semibold">Checklist</h2>
            <div className="grid gap-2">
              {task.task_checklist_items.length ? task.task_checklist_items.sort((a, b) => a.position - b.position).map((item) => (
                <form key={item.id} action={toggleChecklistAction} className="flex items-center gap-3 rounded-md bg-surface-panel p-3">
                  <input type="hidden" name="taskId" value={task.id} />
                  <input type="hidden" name="itemId" value={item.id} />
                  <input type="hidden" name="isCompleted" value={String(!item.is_completed)} />
                  <button className="focus-ring h-5 w-5 rounded border border-slate-600 text-xs">{item.is_completed ? "✓" : ""}</button>
                  <span className={item.is_completed ? "text-slate-500 line-through" : "text-slate-200"}>{item.title}</span>
                </form>
              )) : <EmptyState title="No checklist items." />}
            </div>
          </section>

          <section className="border-b border-surface-line pb-5">
            <h2 className="mb-3 text-sm font-semibold">Comments</h2>
            <div className="mb-3 grid gap-3">
              {task.task_comments.length ? task.task_comments.map((comment) => (
                <div key={comment.id} className="border-l border-surface-line pl-3">
                  <p className="text-sm text-slate-200">{comment.content}</p>
                  <small className="text-slate-500">{comment.author?.full_name ?? "User"} · {format(new Date(comment.created_at), "MMM d, h:mm a")}</small>
                </div>
              )) : <EmptyState title="No comments yet." detail="Keep updates focused and useful." />}
            </div>
            <form action={addCommentAction} className="flex gap-2">
              <input type="hidden" name="taskId" value={task.id} />
              <input name="content" placeholder="Add a comment" className="flex-1 rounded-md border-surface-line bg-surface-panel" />
              <button className="focus-ring rounded-md bg-sky-600 px-4 py-2 text-sm hover:bg-sky-500">Comment</button>
            </form>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold">Activity</h2>
            <div className="grid gap-3">
              {task.task_activity.length ? task.task_activity.map((item) => (
                <div key={item.id} className="border-l border-surface-line pl-3 text-sm">
                  <span>{item.action.replaceAll("_", " ")}</span>
                  <small className="block text-slate-500">{item.actor?.full_name ?? "System"} · {format(new Date(item.created_at), "MMM d, h:mm a")}</small>
                </div>
              )) : <EmptyState title="No activity yet." />}
            </div>
          </section>
        </div>

        <aside className="grid gap-4 self-start">
          {openBlocker ? (
            <section className="rounded-lg border border-red-900/70 bg-red-950/20 p-4">
              <h2 className="mb-2 text-sm font-semibold text-red-200">Current Blocker</h2>
              <p className="text-sm text-red-100">{openBlocker.reason}</p>
              {profile.role === "lead" ? <form action={resolveBlockerAction} className="mt-3"><input type="hidden" name="taskId" value={task.id} /><input type="hidden" name="blockerId" value={openBlocker.id} /><button className="focus-ring rounded-md border border-red-800 px-3 py-2 text-sm text-red-100 hover:bg-red-950">Resolve blocker</button></form> : null}
            </section>
          ) : null}

          <section className="rounded-lg border border-surface-line bg-surface-panel p-4">
            <h2 className="mb-3 text-sm font-semibold">Lead Actions</h2>
            <form action={reportBlockerAction} className="mb-4 grid gap-2">
              <input type="hidden" name="taskId" value={task.id} />
              <textarea name="reason" placeholder="Blocker reason" className="rounded-md border-surface-line bg-surface-raised" />
              <button className="focus-ring rounded-md border border-surface-line px-3 py-2 text-sm hover:bg-surface-raised">Mark blocked</button>
            </form>
            <form action={submitTaskAction} className="grid gap-2">
              <input type="hidden" name="taskId" value={task.id} />
              <textarea name="completionNote" placeholder="Completion note" className="rounded-md border-surface-line bg-surface-raised" />
              <input name="githubUrl" placeholder="GitHub / PR URL" className="rounded-md border-surface-line bg-surface-raised" />
              <input name="previewUrl" placeholder="Preview URL" className="rounded-md border-surface-line bg-surface-raised" />
              <button className="focus-ring rounded-md bg-sky-600 px-3 py-2 text-sm hover:bg-sky-500">Move to review</button>
            </form>
          </section>

          <section className="rounded-lg border border-surface-line bg-surface-panel p-4">
            <h2 className="mb-3 text-sm font-semibold">Submission</h2>
            {latestSubmission ? (
              <div className="grid gap-2 text-sm text-slate-300">
                <p>{latestSubmission.completion_note}</p>
                {latestSubmission.github_url ? <a className="text-sky-300" href={latestSubmission.github_url}>GitHub / PR</a> : null}
                {latestSubmission.preview_url ? <a className="text-sky-300" href={latestSubmission.preview_url}>Preview</a> : null}
                {profile.role === "lead" && task.status === "in_review" ? (
                  <form action={reviewSubmissionAction} className="mt-2 grid gap-2">
                    <input type="hidden" name="taskId" value={task.id} />
                    <input type="hidden" name="submissionId" value={latestSubmission.id} />
                    <textarea name="feedback" placeholder="Feedback required for changes" className="rounded-md border-surface-line bg-surface-raised" />
                    <div className="flex gap-2">
                      <button name="decision" value="approved" className="focus-ring rounded-md bg-emerald-700 px-3 py-2 text-sm hover:bg-emerald-600">Approve</button>
                      <button name="decision" value="changes_requested" className="focus-ring rounded-md border border-surface-line px-3 py-2 text-sm hover:bg-surface-raised">Request changes</button>
                    </div>
                  </form>
                ) : null}
              </div>
            ) : <EmptyState title="No submission yet." />}
          </section>
        </aside>
      </div>
    </section>
  );
}
