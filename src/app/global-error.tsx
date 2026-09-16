"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body className="bg-[#0b0f14] text-slate-100">
        <main className="grid min-h-screen place-items-center p-4">
          <section className="max-w-2xl rounded-lg border border-red-900/70 bg-red-950/20 p-5">
            <h1 className="text-xl font-semibold text-red-100">Application setup error</h1>
            <p className="mt-2 text-sm leading-6 text-red-100/90">{error.message || "The app could not render this page."}</p>
            <div className="mt-4 rounded-md border border-slate-700 bg-slate-900 p-3 text-sm text-slate-200">
              <p className="font-medium">Check these first:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-300">
                <li><code>.env.local</code> has a valid Supabase URL and anon key.</li>
                <li>Both SQL migration files have been run in Supabase.</li>
                <li>The current user has a matching row in the <code>profiles</code> table.</li>
                <li>The dev server was restarted after config changes.</li>
              </ul>
            </div>
            <button onClick={reset} className="mt-4 rounded-md border border-red-800 px-3 py-2 text-sm text-red-100">Try again</button>
          </section>
        </main>
      </body>
    </html>
  );
}
