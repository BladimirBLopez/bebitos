import { Skeleton, SkeletonMetricCard, SkeletonChartCard } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-6 bg-panel-bg min-h-screen">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>

      <Skeleton className="h-12 w-full rounded-xl mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonMetricCard key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <SkeletonChartCard height={250} />
        </div>
        <SkeletonChartCard height={200} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChartCard height={220} />
        <SkeletonChartCard height={220} />
      </div>
    </div>
  );
}
