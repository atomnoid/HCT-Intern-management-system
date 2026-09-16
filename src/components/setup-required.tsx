export function SetupRequired() {
  return (
    <main className="grid min-h-screen place-items-center bg-surface-app p-4">
      <section className="max-w-xl rounded-lg border border-surface-line bg-surface-panel p-5">
        <h1 className="text-xl font-semibold text-white">Supabase setup required</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          The app is running, but it cannot connect to Supabase yet. Add these values to
          <code className="mx-1 rounded bg-surface-raised px-1.5 py-0.5 text-slate-100">.env.local</code>
          from your Supabase project API settings.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-md border border-surface-line bg-surface-raised p-3 text-sm text-slate-200">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}
        </pre>
        <p className="mt-4 text-sm text-slate-400">
          After saving the file, restart <code className="rounded bg-surface-raised px-1.5 py-0.5">npm run dev</code>.
          Then apply the SQL migrations in <code className="rounded bg-surface-raised px-1.5 py-0.5">supabase/migrations</code>.
        </p>
      </section>
    </main>
  );
}
