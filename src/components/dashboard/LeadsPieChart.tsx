"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type LeadSource = { name: string; value: number };

const COLORS = ["#3B82F6", "#10B981", "#8B5A2B", "#B87A2E", "#6B4226"];

export default function LeadsPieChart({ data }: { data: LeadSource[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Leads por Fuente</h2>
      {data.length === 0 ? (
        <p className="text-gray-400 text-sm">Aún no hay leads registrados</p>
      ) : (
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
      )}
    </div>
  );
}
