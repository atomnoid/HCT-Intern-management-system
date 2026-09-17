import {
  SkeletonPageHeader,
  SkeletonStatCard,
  Skeleton,
} from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <section className="p-4 md:p-6">
      <SkeletonPageHeader />

      {/* Stat cards */}
      <div className="mb-6 grid gap-3 grid-cols-2 md:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Content panels */}
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-surface-line bg-surface-panel">
          <div className="border-b border-surface-line px-4 py-3">
            <Skeleton className="h-3.5 w-32" />
          </div>
          <div className="p-4 grid gap-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1 grid gap-1.5">
                  <Skeleton className="h-3 w-full max-w-64" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
                <Skeleton className="h-5 w-16 rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-surface-line bg-surface-panel">
          <div className="border-b border-surface-line px-4 py-3">
            <Skeleton className="h-3.5 w-28" />
          </div>
          <div className="p-4 grid gap-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="border-l-2 border-surface-line pl-3 grid gap-1">
                <Skeleton className="h-3 w-full max-w-48" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
