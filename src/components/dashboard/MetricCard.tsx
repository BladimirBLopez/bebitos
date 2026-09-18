import { LucideIcon } from "lucide-react";

type MetricCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string | null;
  trendUp?: boolean;
  color: "brown" | "green" | "amber" | "ink" | "amberSoft" | "red";
  emphasis?: boolean;
};

const colors = {
  brown: "bg-brown-dark/10 text-brown-dark",
  green: "bg-green/15 text-green-dark",
  amber: "bg-amber/15 text-amber",
  ink: "bg-ink/10 text-ink",
  amberSoft: "bg-amber-soft text-amber",
  red: "bg-red-50 text-red-600",
};

export default function MetricCard({ title, value, icon: Icon, trend, trendUp, color, emphasis = false }: MetricCardProps) {
  return (
    <div
      className={`bg-panel-surface p-3.5 sm:p-4 rounded-xl min-w-0 ${
        emphasis
          ? "border-2 border-brown-dark/20 shadow-card"
          : "border border-panel-border shadow-panel"
      }`}
    >
      <div className="flex items-center justify-between mb-2 gap-2">
        <p className="text-xs sm:text-sm text-panel-ink-soft truncate">{title}</p>
        <div className={`p-2 rounded-lg shrink-0 ${colors[color]}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
      <p
        className={`font-bold text-panel-ink leading-tight whitespace-nowrap overflow-hidden text-ellipsis ${
          emphasis ? "text-xl sm:text-3xl" : "text-lg sm:text-2xl"
        }`}
      >
        {value}
      </p>
      {trend && (
        <p className={`text-xs flex items-center gap-1 mt-1 ${trendUp ? 'text-green-dark' : 'text-red-600'}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </p>
      )}
    </div>
  );
}
