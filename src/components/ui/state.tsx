export function EmptyState({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-700 bg-surface-panel p-5">
      <p className="font-medium text-slate-100">{title}</p>
      {detail ? <p className="mt-1 text-sm text-slate-400">{detail}</p> : null}
    </div>
  );
}

export function SkeletonBlock() {
  return <div className="h-24 animate-pulse rounded-lg bg-slate-800" />;
}
