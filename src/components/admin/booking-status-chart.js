"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts";
import EmptyState from "@/components/admin/empty-state";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#64748b"];

export default function BookingStatusChart({ data = [] }) {
  if (!data.length)
    return (
      <div className="min-h-64">
        <EmptyState
          title="No booking statuses found"
          description="The bookings collection has no status values to chart."
        />
      </div>
    );
  return (
    <div className="min-h-64">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            outerRadius={82}
            paddingAngle={2}
            isAnimationActive
            animationDuration={650}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={32} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
