import { clsx } from "clsx";

// ---- Skeleton Primitives ----
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx("skeleton rounded-md", className)}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={clsx("grid gap-2", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={clsx(
            "h-3.5",
            i === lines - 1 && lines > 1 ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <Skeleton className={clsx("h-28 w-full rounded-xl", className)} />;
}

// Stat Card Skeleton
export function SkeletonStatCard() {
  return (
    <div className="rounded-xl border border-white/10 bg-surface-panel/60 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

// Table Row Skeleton
export function SkeletonTableRow() {
  return (
    <tr className="border-b border-white/[0.04]">
      <td className="px-4 py-3.5"><Skeleton className="h-4 w-48" /></td>
      <td className="px-4 py-3.5"><Skeleton className="h-6 w-20 rounded-full" /></td>
      <td className="px-4 py-3.5"><Skeleton className="h-6 w-16 rounded-full" /></td>
      <td className="px-4 py-3.5"><Skeleton className="h-4 w-24" /></td>
      <td className="px-4 py-3.5"><Skeleton className="h-2 w-28 rounded-full" /></td>
    </tr>
  );
}

// Employee Card Skeleton
export function SkeletonEmployeeCard() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-surface-panel/60 p-4">
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="grid gap-2 flex-1">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-28" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

// Page Header Skeleton
export function SkeletonPageHeader() {
  return (
    <div className="mb-6 grid gap-2">
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-4 w-80" />
    </div>
  );
}

// Dashboard Full Skeleton View
export function SkeletonDashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <SkeletonPageHeader />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-surface-panel/60 p-5">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton className="h-12 w-full rounded-lg" key={i} />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-surface-panel/60 p-5">
          <Skeleton className="h-6 w-36 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonEmployeeCard key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

