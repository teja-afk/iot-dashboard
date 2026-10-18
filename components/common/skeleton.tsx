export function DashboardSkeleton() {
  return (
    <main className="min-h-[calc(100vh-2.75rem)] bg-[#f6f8f7] p-5 sm:p-8" aria-label="Loading station overview" aria-busy="true">
      <div className="mx-auto max-w-7xl animate-pulse space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <div className="h-8 w-64 rounded bg-slate-200" />
            <div className="h-4 w-80 max-w-full rounded bg-slate-200" />
          </div>
          <div className="h-10 w-44 rounded-full bg-slate-200" />
        </header>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-36 rounded-2xl border border-[#dce9e5] bg-white p-5">
              <div className="size-9 rounded-xl bg-slate-200" />
              <div className="mt-5 h-3 w-28 rounded bg-slate-200" />
              <div className="mt-2 h-7 w-20 rounded bg-slate-200" />
              <div className="mt-2 h-3 w-32 rounded bg-slate-200" />
            </div>
          ))}
        </section>
        <section className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="h-80 rounded-2xl border border-[#dce9e5] bg-white p-6">
            <div className="h-5 w-40 rounded bg-slate-200" />
            <div className="mt-8 h-56 rounded bg-slate-100" />
          </div>
          <div className="h-80 rounded-2xl bg-slate-300 p-6" />
        </section>
      </div>
    </main>
  );
}
