"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/actions/profile";
import type { Profile } from "@/types/database";
import { RoleBadge } from "@/components/ui/badges";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, null);

  const initials = profile.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="grid gap-6">
      {/* Avatar section */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border border-blue-800/40 bg-blue-900/30">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <span className="text-xl font-bold text-blue-300">{initials}</span>
          )}
        </div>
        <div>
          <p className="font-semibold text-slate-100">{profile.full_name}</p>
          <p className="text-sm text-slate-500">{profile.email}</p>
          <div className="mt-1.5">
            <RoleBadge role={profile.role} />
          </div>
        </div>
      </div>

      {/* Status messages */}
      {state?.error && (
        <div role="alert" className="rounded-md border border-red-800/50 bg-red-950/30 px-3 py-2.5">
          <p className="text-sm text-red-300">{state.error}</p>
        </div>
      )}
      {state?.success && (
        <div role="status" className="rounded-md border border-emerald-800/50 bg-emerald-950/30 px-3 py-2.5">
          <p className="text-sm text-emerald-300">{state.message}</p>
        </div>
      )}

      {/* Edit form */}
      <form action={formAction} className="grid gap-4">
        <div className="grid gap-1.5">
          <label htmlFor="profile-name" className="text-xs font-medium text-slate-300">
            Full name <span className="text-slate-500">*</span>
          </label>
          <input
            id="profile-name"
            name="fullName"
            type="text"
            required
            defaultValue={profile.full_name}
            className="h-9 rounded-md border border-surface-line bg-surface-raised px-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="profile-avatar" className="text-xs font-medium text-slate-300">
            Avatar URL <span className="text-slate-500">(optional)</span>
          </label>
          <input
            id="profile-avatar"
            name="avatarUrl"
            type="url"
            defaultValue={profile.avatar_url ?? ""}
            placeholder="https://example.com/avatar.jpg"
            className="h-9 rounded-md border border-surface-line bg-surface-raised px-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Read-only fields */}
        <div className="grid gap-1.5">
          <p className="text-xs font-medium text-slate-300">Email</p>
          <p className="text-sm text-slate-500">{profile.email}</p>
        </div>
        <div className="grid gap-1.5">
          <p className="text-xs font-medium text-slate-300">Role</p>
          <p className="text-sm text-slate-500 capitalize">{profile.role} — contact your administrator to change your role.</p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="flex h-8 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 focus-ring"
          >
            {pending && (
              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
