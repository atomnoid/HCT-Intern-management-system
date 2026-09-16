"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { createTaskAction } from "@/actions/tasks";
import { taskPriorities } from "@/lib/constants";
import type { Profile } from "@/types/database";

export function TaskCreateForm({ interns }: { interns: Profile[] }) {
  const [checklist, setChecklist] = useState([""]);
  const hasInterns = interns.length > 0;

  const updateChecklist = (index: number, value: string) => {
    setChecklist((items) => items.map((item, itemIndex) => itemIndex === index ? value : item));
  };

  const addChecklistItem = () => setChecklist((items) => [...items, ""]);
  const removeChecklistItem = (index: number) => {
    setChecklist((items) => items.length === 1 ? [""] : items.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <form action={createTaskAction} className="grid gap-5 rounded-lg border border-surface-line bg-surface-panel p-5">
      {!hasInterns ? (
        <div className="rounded-md border border-amber-800/70 bg-amber-950/20 p-3 text-sm text-amber-100">
          No intern records are available yet. Add interns from the Interns page before assigning a task.
        </div>
      ) : null}

      <div className="grid gap-2">
        <label htmlFor="title" className="text-sm font-medium text-slate-200">Task title</label>
        <input id="title" name="title" required minLength={3} placeholder="Example: Build intern dashboard" className="rounded-md border-surface-line bg-surface-raised text-slate-100 placeholder:text-slate-500" />
      </div>

      <div className="grid gap-2">
        <label htmlFor="description" className="text-sm font-medium text-slate-200">Description</label>
        <textarea id="description" name="description" rows={4} placeholder="What should be done, and what does finished look like?" className="rounded-md border-surface-line bg-surface-raised text-slate-100 placeholder:text-slate-500" />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="grid gap-2">
          <label htmlFor="assigneeId" className="text-sm font-medium text-slate-200">Assignee</label>
          <select id="assigneeId" name="assigneeId" required disabled={!hasInterns} defaultValue="" className="rounded-md border-surface-line bg-surface-raised text-slate-100 disabled:cursor-not-allowed disabled:opacity-60">
            <option value="" disabled>{hasInterns ? "Select intern" : "No interns available"}</option>
            {interns.map((intern) => <option key={intern.id} value={intern.id}>{intern.full_name}</option>)}
          </select>
        </div>
        <div className="grid gap-2">
          <label htmlFor="priority" className="text-sm font-medium text-slate-200">Priority</label>
          <select id="priority" name="priority" defaultValue="medium" className="rounded-md border-surface-line bg-surface-raised text-slate-100">{taskPriorities.map((p) => <option key={p} value={p}>{p}</option>)}</select>
        </div>
        <div className="grid gap-2">
          <label htmlFor="dueDate" className="text-sm font-medium text-slate-200">Due date</label>
          <input id="dueDate" name="dueDate" required type="date" className="rounded-md border-surface-line bg-surface-raised text-slate-100" />
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="category" className="text-sm font-medium text-slate-200">Category</label>
        <input id="category" name="category" placeholder="Frontend, Backend, QA, Design..." className="rounded-md border-surface-line bg-surface-raised text-slate-100 placeholder:text-slate-500" />
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium text-slate-200">Checklist</h2>
            <p className="text-xs text-slate-500">Add clear subtasks. Empty rows are ignored.</p>
          </div>
          <button type="button" onClick={addChecklistItem} className="focus-ring inline-flex items-center gap-2 rounded-md border border-surface-line px-3 py-2 text-sm text-slate-200 hover:bg-surface-raised">
            <Plus size={16} /> Add item
          </button>
        </div>

        <div className="grid gap-2">
          {checklist.map((item, index) => (
            <div key={index} className="grid grid-cols-[1fr_auto] gap-2">
              <input
                name="checklist"
                value={item}
                onChange={(event) => updateChecklist(index, event.target.value)}
                placeholder={`Checklist item ${index + 1}`}
                className="rounded-md border-surface-line bg-surface-raised text-slate-100 placeholder:text-slate-500"
              />
              <button type="button" onClick={() => removeChecklistItem(index)} aria-label={`Remove checklist item ${index + 1}`} className="focus-ring rounded-md border border-surface-line px-3 text-slate-400 hover:bg-surface-raised hover:text-red-200">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button disabled={!hasInterns} className="focus-ring w-max rounded-md bg-sky-600 px-4 py-2 text-sm font-medium hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50">Create task</button>
    </form>
  );
}
