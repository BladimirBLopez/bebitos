"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type CategoryData = { name: string; value: number };

const COLORS = ["#6B4226", "#85BF35", "#B87A2E", "#B6794C", "#3D2B1F", "#4A7C59", "#8B5A2B"];

export default function GastosPieChart({ data }: { data: CategoryData[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-panel-ink mb-3">Gastos por Categoría</h2>
      {data.length === 0 ? (
        <p className="text-panel-ink-soft text-sm">Aún no hay gastos registrados</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `Bs. ${Number(value).toFixed(2)}`} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
