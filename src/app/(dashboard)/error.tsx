"use client";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <section className="grid min-h-screen place-items-center bg-surface-app p-4">
      <div className="max-w-2xl rounded-lg border border-red-900/70 bg-red-950/20 p-5">
        <h1 className="text-xl font-semibold text-red-100">This page could not load</h1>
        <p className="mt-2 text-sm leading-6 text-red-100/90">{error.message || "The request could not be completed."}</p>
        <div className="mt-4 rounded-md border border-surface-line bg-surface-raised p-3 text-sm text-slate-200">
          <p className="font-medium">Most common fixes:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-300">
            <li>Run both SQL files in <code>supabase/migrations</code> in Supabase SQL Editor.</li>
            <li>Sign out and create a new account after the migrations are applied.</li>
            <li>Restart <code>npm run dev</code> after changing <code>.env.local</code>.</li>
          </ul>
        </div>
        <button onClick={reset} className="focus-ring mt-4 rounded-md border border-red-800 px-3 py-2 text-sm text-red-100">Try again</button>
      </div>
    </section>
  );
}
