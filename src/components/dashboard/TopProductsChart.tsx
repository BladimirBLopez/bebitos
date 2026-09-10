"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type TopProduct = { name: string; sales: number };

export default function TopProductsChart({ data }: { data: TopProduct[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-panel-ink mb-3">Productos Más Vendidos</h2>
      {data.length === 0 ? (
        <p className="text-panel-ink-soft text-sm">Aún no hay ventas registradas</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="#6B4226" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
