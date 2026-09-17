// ---- Empty State ----
export function EmptyState({
  title,
  detail,
  action,
}: {
  title: string;
  detail?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-700/80 bg-surface-panel px-6 py-10 text-center">
      <p className="text-sm font-medium text-slate-300">{title}</p>
      {detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ---- Inline Error ----
export function InlineError({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-red-800/50 bg-red-950/30 px-3 py-2.5">
      <p className="text-sm text-red-300">{message}</p>
    </div>
  );
}

// ---- Data Error (for page-level errors) ----
export function DataError({ message }: { message?: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="grid h-10 w-10 place-items-center rounded-full border border-red-800/50 bg-red-900/20">
        <svg
          className="h-5 w-5 text-red-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          />
        </svg>
      </div>
      <p className="text-sm text-slate-300">{message ?? "Something went wrong. Please try again."}</p>
    </div>
  );
}

// Legacy SkeletonBlock export for backward compat
export function SkeletonBlock() {
  return <div className="h-24 animate-pulse rounded-lg bg-slate-800" />;
}
