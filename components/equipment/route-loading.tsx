export function EquipmentOverviewLoading() {
  return (
    <main className="min-h-[calc(100vh-2.75rem)] bg-[#f6f8f7] p-5 sm:p-8" aria-label="Loading equipment overview" aria-busy="true">
      <div className="mx-auto max-w-7xl animate-pulse space-y-7">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <div className="h-8 w-56 rounded bg-slate-200" />
            <div className="h-4 w-96 max-w-full rounded bg-slate-200" />
          </div>
          <div className="flex gap-3">
            <div className="h-9 w-24 rounded-md bg-slate-200" />
            <div className="h-9 w-32 rounded-md bg-slate-200" />
          </div>
        </header>
        <div className="h-10 w-full max-w-md rounded-md bg-slate-200" />
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="space-y-5 rounded-xl border border-[#dce9e5] bg-white p-5">
              <div className="flex justify-between gap-4">
                <div className="space-y-2">
                  <div className="h-5 w-32 rounded bg-slate-200" />
                  <div className="h-3 w-24 rounded bg-slate-200" />
                </div>
                <div className="h-6 w-20 rounded-full bg-slate-200" />
              </div>
              <div className="h-14 rounded-full bg-slate-200" />
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }, (_, metric) => (
                  <div key={metric} className="space-y-2">
                    <div className="h-3 w-16 rounded bg-slate-200" />
                    <div className="h-4 w-24 rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

export function EquipmentReportsLoading() {
  return (
    <main className="min-h-[calc(100svh-3rem)] bg-[#f6f8f7] p-5 sm:p-8" aria-label="Loading equipment report" aria-busy="true">
      <div className="mx-auto max-w-7xl animate-pulse space-y-6">
        <div className="space-y-3">
          <div className="h-8 w-64 rounded bg-slate-200" />
          <div className="h-4 w-96 max-w-full rounded bg-slate-200" />
        </div>
        <div className="flex flex-wrap gap-2 rounded-2xl border border-[#dce9e5] bg-white p-4">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-10 w-28 rounded-md bg-slate-200" />
          ))}
        </div>
        <div className="space-y-4 rounded-2xl border border-[#dce9e5] bg-white p-4">
          <div className="h-10 w-full max-w-xs rounded-md bg-slate-200" />
          <div className="h-10 rounded bg-slate-200" />
          {Array.from({ length: 7 }, (_, index) => (
            <div key={index} className="h-12 rounded bg-slate-100" />
          ))}
        </div>
      </div>
    </main>
  );
}
