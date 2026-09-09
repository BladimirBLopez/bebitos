"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type SalesData = { month: string; sales: number }[];

export default function SalesChart({ data }: { data: SalesData }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 border border-brown/10">
      <h2 className="font-display text-lg font-semibold text-brown-dark mb-3">
        Ventas por Mes
      </h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip 
            formatter={(value) => [`Bs. ${value}`, "Ventas"]}
            labelFormatter={(label) => `Mes: ${label}`}
          />
          <Line type="monotone" dataKey="sales" stroke="#8B5A2B" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
