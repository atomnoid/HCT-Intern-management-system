"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction } from "@/actions/auth";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupAction, null);

  return (
    <main className="grid min-h-screen place-items-center bg-surface-app px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-blue-800/60 bg-blue-900/30">
            <span className="text-lg font-bold text-blue-300">HT</span>
          </div>
          <h1 className="text-xl font-semibold text-slate-100">Create an account</h1>
          <p className="mt-1.5 text-sm text-slate-500">Join your company&apos;s internal tracker</p>
        </div>

        {/* Card */}
        <div className="rounded-lg border border-surface-line bg-surface-panel p-6 shadow-xl">
          {state?.success ? (
            <div className="py-4 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-emerald-700/50 bg-emerald-900/20">
                <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-100">Account created!</p>
              <p className="mt-1 text-xs text-slate-400">
                Check your email to confirm your account, then{" "}
                <Link href="/login" className="text-blue-400 hover:text-blue-300">
                  sign in
                </Link>
                .
              </p>
            </div>
          ) : (
            <form action={formAction} className="grid gap-4">
              {state?.error && (
                <div role="alert" className="rounded-md border border-red-800/50 bg-red-950/30 px-3 py-2.5">
                  <p className="text-sm text-red-300">{state.error}</p>
                </div>
              )}

              <div className="grid gap-1.5">
                <label htmlFor="signup-name" className="text-xs font-medium text-slate-300">
                  Full name
                </label>
                <input
                  id="signup-name"
                  name="fullName"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Jane Smith"
                  className="h-9 rounded-md border border-surface-line bg-surface-raised px-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="signup-email" className="text-xs font-medium text-slate-300">
                  Email address
                </label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                  className="h-9 rounded-md border border-surface-line bg-surface-raised px-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="signup-password" className="text-xs font-medium text-slate-300">
                  Password
                </label>
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="Minimum 6 characters"
                  minLength={6}
                  className="h-9 rounded-md border border-surface-line bg-surface-raised px-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="signup-role" className="text-xs font-medium text-slate-300">
                  Role
                </label>
                <select
                  id="signup-role"
                  name="role"
                  className="h-9 rounded-md border border-surface-line bg-surface-raised px-3 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  defaultValue="employee"
                >
                  <option value="employee">Employee</option>
                  <option value="lead">Lead</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={pending}
                className="mt-1 flex h-9 w-full items-center justify-center gap-2 rounded-md bg-blue-600 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 focus-ring"
              >
                {pending && (
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {pending ? "Creating account…" : "Create account"}
              </button>
            </form>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
