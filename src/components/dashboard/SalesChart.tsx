"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type SalesData = { month: string; sales: number }[];

export default function SalesChart({ data }: { data: SalesData }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-panel-ink mb-3">Ventas por Mes</h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            formatter={(value) => [`Bs. ${value}`, "Ventas"]}
            labelFormatter={(label) => `Mes: ${label}`}
          />
          <Line type="monotone" dataKey="sales" stroke="#6B4226" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
