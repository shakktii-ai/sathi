export function Panel({ title, action, children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_6px_18px_rgba(20,43,74,0.04)] sm:p-6 ${className}`}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-slate-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
