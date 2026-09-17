import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-surface-app p-8">
      <div className="text-center">
        <p className="mb-3 text-6xl font-bold text-slate-800">404</p>
        <h1 className="mb-2 text-xl font-semibold text-slate-100">Page not found</h1>
        <p className="mb-6 text-sm text-slate-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex h-8 items-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-ring"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
