"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

type BalanceData = { month: string; ingresos: number; gastos: number }[];

export default function BalanceChart({ data }: { data: BalanceData }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-panel-ink mb-3">Ingresos vs Gastos por Mes</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => `Bs. ${Number(value).toFixed(2)}`} />
          <Legend />
          <Bar dataKey="ingresos" name="Ingresos" fill="#85BF35" radius={[4, 4, 0, 0]} />
          <Bar dataKey="gastos" name="Gastos" fill="#B84226" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
