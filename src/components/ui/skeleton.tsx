import { clsx } from "clsx";

// ---- Skeleton Primitives ----
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx("skeleton rounded", className)}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={clsx("grid gap-1.5", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={clsx(
            "h-3",
            i === lines - 1 && lines > 1 ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <Skeleton className={clsx("h-24 w-full", className)} />;
}

// Dashboard card skeleton
export function SkeletonStatCard() {
  return (
    <div className="rounded-lg border border-surface-line bg-surface-panel p-4">
      <Skeleton className="mb-3 h-3 w-20" />
      <Skeleton className="h-7 w-12" />
    </div>
  );
}

// Table row skeleton
export function SkeletonTableRow() {
  return (
    <tr>
      <td className="px-3 py-2.5"><Skeleton className="h-3 w-full max-w-48" /></td>
      <td className="px-3 py-2.5"><Skeleton className="h-5 w-16 rounded-full" /></td>
      <td className="px-3 py-2.5"><Skeleton className="h-5 w-14 rounded-full" /></td>
      <td className="px-3 py-2.5"><Skeleton className="h-3 w-20" /></td>
      <td className="px-3 py-2.5"><Skeleton className="h-1.5 w-24 rounded-full" /></td>
    </tr>
  );
}

// Employee card skeleton
export function SkeletonEmployeeCard() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-surface-line bg-surface-panel px-4 py-3">
      <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
      <div className="grid gap-1.5 flex-1">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-2.5 w-24" />
      </div>
      <Skeleton className="h-5 w-16 rounded" />
    </div>
  );
}

// Page header skeleton
export function SkeletonPageHeader() {
  return (
    <div className="mb-5 grid gap-1.5">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-3 w-72" />
    </div>
  );
}
