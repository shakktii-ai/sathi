import { FileSearch } from "lucide-react";

export default function EmptyState({
  title = "No data available",
  description = "There is nothing to show here yet.",
}) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
      <span className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-400">
        <FileSearch size={18} />
      </span>
      <p className="mt-3 text-sm font-semibold text-slate-700">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}
