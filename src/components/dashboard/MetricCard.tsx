import { LucideIcon } from "lucide-react";

type MetricCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "green" | "purple" | "yellow";
};

const colors = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  purple: "bg-purple-50 text-purple-600",
  yellow: "bg-yellow-50 text-yellow-600",
};

export default function MetricCard({ title, value, icon: Icon, color }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4 border border-brown/10">
      <div className={`p-3 rounded-full ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-ink/50 text-sm">{title}</p>
        <p className="font-display text-2xl font-bold text-brown-dark">{value}</p>
      </div>
    </div>
  );
}
