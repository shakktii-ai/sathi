"use client";

import AnimatedNumber from "@/components/admin/animated-number";

export default function StatCard({ label, value, icon: Icon, accent = "blue" }) {
  const colors = {
    blue: "bg-[#d9f3ed] text-[#087f6b]",
    indigo: "bg-[#d9f3ed] text-[#087f6b]",
    violet: "bg-[#d9f3ed] text-[#087f6b]",
    cyan: "bg-[#d9f3ed] text-[#087f6b]",
    emerald: "bg-[#d9f3ed] text-[#087f6b]",
    amber: "bg-[#d9f3ed] text-[#087f6b]",
    rose: "bg-[#d9f3ed] text-[#087f6b]",
    orange: "bg-[#d9f3ed] text-[#087f6b]",
  };
  return (
    <div className="group flex min-h-[148px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_6px_18px_rgba(20,43,74,0.04)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(20,43,74,0.08)] motion-reduce:transition-none motion-reduce:hover:transform-none">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#52647e]">{label}</p>
          <p className="mt-7 text-[30px] font-semibold leading-none tracking-[-0.04em] text-[#0f1d33]">
            <AnimatedNumber value={value} />
          </p>
        </div>
        <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${colors[accent] || colors.blue}`}>
          <Icon size={19} strokeWidth={2} />
        </span>
      </div>
    </div>
  );
}
