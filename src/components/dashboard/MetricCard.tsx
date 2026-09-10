import { LucideIcon } from "lucide-react";

type MetricCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string | null;
  trendUp?: boolean;
  color: "brown" | "green" | "amber" | "ink" | "amberSoft" | "red";
};

const colors = {
  brown: "bg-brown-dark/10 text-brown-dark",
  green: "bg-green/15 text-green-dark",
  amber: "bg-amber/15 text-amber",
  ink: "bg-ink/10 text-ink",
  amberSoft: "bg-amber-soft text-amber",
  red: "bg-red-50 text-red-600",
};

export default function MetricCard({ title, value, icon: Icon, trend, trendUp, color }: MetricCardProps) {
  return (
    <div className="bg-panel-surface p-4 rounded-xl shadow-panel border border-panel-border flex items-center justify-between">
      <div>
        <p className="text-sm text-panel-ink-soft">{title}</p>
        <p className="text-2xl font-bold text-panel-ink">{value}</p>
        {trend && (
          <p className={`text-xs flex items-center gap-1 ${trendUp ? 'text-green-dark' : 'text-red-600'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
