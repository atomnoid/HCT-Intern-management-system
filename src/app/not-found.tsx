import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <div className="rounded-lg border border-surface-line bg-surface-panel p-5">
        <h1 className="text-lg font-semibold">Record not found</h1>
        <p className="mt-1 text-sm text-slate-400">It may have been removed or you may not have access.</p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm text-sky-300">Back to dashboard</Link>
      </div>
    </main>
  );
}
