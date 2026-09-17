"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/actions/auth";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <main className="grid min-h-screen place-items-center bg-surface-app px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-blue-800/60 bg-blue-900/30">
            <span className="text-lg font-bold text-blue-300">HT</span>
          </div>
          <h1 className="text-xl font-semibold text-slate-100">Sign in to HCT Tracker</h1>
          <p className="mt-1.5 text-sm text-slate-500">Use your company account credentials</p>
        </div>

        {/* Card */}
        <div className="rounded-lg border border-surface-line bg-surface-panel p-6 shadow-xl">
          <form action={formAction} className="grid gap-4">
            {state?.error && (
              <div
                role="alert"
                className="rounded-md border border-red-800/50 bg-red-950/30 px-3 py-2.5"
              >
                <p className="text-sm text-red-300">{state.error}</p>
              </div>
            )}

            <div className="grid gap-1.5">
              <label
                htmlFor="login-email"
                className="text-xs font-medium text-slate-300"
              >
                Email address
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
                className="h-9 rounded-md border border-surface-line bg-surface-raised px-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-1.5">
              <label
                htmlFor="login-password"
                className="text-xs font-medium text-slate-300"
              >
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-9 rounded-md border border-surface-line bg-surface-raised px-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
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
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
}
