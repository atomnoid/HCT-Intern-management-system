export function DataError({ message }: { message: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-surface-app p-4">
      <section className="max-w-2xl rounded-lg border border-red-900/70 bg-red-950/20 p-5">
        <h1 className="text-xl font-semibold text-red-100">Database setup needs attention</h1>
        <p className="mt-2 text-sm leading-6 text-red-100/90">{message}</p>
        <div className="mt-4 rounded-md border border-surface-line bg-surface-raised p-3 text-sm text-slate-200">
          <p className="font-medium">Check these items:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-300">
            <li>Run both SQL files in <code>supabase/migrations</code> in your Supabase SQL editor.</li>
            <li>Confirm the <code>profiles</code>, <code>tasks</code>, and workflow tables exist.</li>
            <li>If you signed up before running migrations, create the matching profile row or sign up again after migrations are applied.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
