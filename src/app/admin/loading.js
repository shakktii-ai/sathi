function Skeleton({ className = "" }) {
  return <div className={`skeleton-shimmer rounded-lg bg-slate-200/80 ${className}`} />;
}

function TableSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((row) => (
          <div key={row} className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-2.5 w-1/3" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminLoading() {
  return (
    <main className="min-h-screen bg-[#f6f8fb] p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-7 space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-36" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(20,43,74,0.04)]"
            >
              <div className="flex items-start justify-between">
                <Skeleton className="size-10 rounded-lg" />
                <Skeleton className="size-4 rounded" />
              </div>
              <div className="mt-8 space-y-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="mb-5 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-36" />
            </div>
            <Skeleton className="h-56 w-full rounded-lg" />
          </div>
          <TableSkeleton />
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <TableSkeleton />
          <TableSkeleton />
        </div>
      </div>
    </main>
  );
}
