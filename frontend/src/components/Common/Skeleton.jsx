
export const SkeletonCard = () => (
  <div className="surface animate-pulse p-5">
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-3">
        <div className="h-3 w-24 rounded bg-slate-150 dark:bg-slate-800" />
        <div className="h-8 w-20 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="h-11 w-11 rounded-premium bg-slate-150 dark:bg-slate-800" />
    </div>
    <div className="mt-5 h-3 w-2/3 rounded bg-slate-150 dark:bg-slate-800" />
  </div>
);

export const SkeletonStats = () => (
  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
    {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
  </div>
);

export const SkeletonTable = () => (
  <div className="surface animate-pulse overflow-hidden">
    <div className="border-b border-slate-100 p-5 dark:border-slate-800">
      <div className="h-6 w-56 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-2 h-3 w-72 rounded bg-slate-150 dark:bg-slate-800" />
    </div>
    <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 p-5">
          <div className="h-10 w-10 shrink-0 rounded-premium bg-slate-150 dark:bg-slate-800" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-1/2 rounded bg-slate-150 dark:bg-slate-800" />
          </div>
          <div className="h-7 w-24 rounded-full bg-slate-150 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  </div>
);
