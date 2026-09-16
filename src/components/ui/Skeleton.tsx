export function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`animate-pulse rounded-md bg-panel-border/60 ${className}`} style={style} />
  );
}

export function SkeletonMetricCard() {
  return (
    <div className="bg-panel-surface p-4 rounded-xl border border-panel-border shadow-panel flex items-center justify-between">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-11 w-11 rounded-lg shrink-0" />
    </div>
  );
}

export function SkeletonChartCard({ height = 250 }: { height?: number }) {
  return (
    <div className="bg-panel-surface p-4 rounded-xl border border-panel-border shadow-panel">
      <Skeleton className="h-4 w-40 mb-4" />
      <Skeleton className={`w-full`} style={{ height }} />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="bg-panel-surface rounded-xl border border-panel-border p-4 flex items-center gap-3">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  );
}
