"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type TopProduct = { name: string; sales: number };

export default function TopProductsChart({ data }: { data: TopProduct[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Productos Más Vendidos</h2>
      {data.length === 0 ? (
        <p className="text-gray-400 text-sm">Aún no hay ventas registradas</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="#8B5A2B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
