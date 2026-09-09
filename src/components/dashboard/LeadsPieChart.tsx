"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Regalo", value: 5 },
  { name: "Web", value: 3 },
  { name: "Redes Sociales", value: 2 },
];

const COLORS = ["#3B82F6", "#10B981", "#8B5A2B"];

export default function LeadsPieChart() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Leads por Fuente</h2>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
