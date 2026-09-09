"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Producto A", sales: 120 },
  { name: "Producto B", sales: 80 },
  { name: "Producto C", sales: 45 },
  { name: "Producto D", sales: 30 },
];

export default function TopProductsChart() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Productos Más Vendidos</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="sales" fill="#8B5A2B" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
