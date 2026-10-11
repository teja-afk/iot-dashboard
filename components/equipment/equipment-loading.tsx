export function EquipmentLoading() {
  return (
    <main className="min-h-[calc(100vh-2.75rem)] bg-[#f6f8f7] p-5 sm:p-8" aria-label="Loading equipment details" aria-busy="true">
      <div className="mx-auto max-w-7xl animate-pulse space-y-6">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="space-y-3">
          <div className="h-8 w-64 rounded bg-slate-200" />
          <div className="h-4 w-96 max-w-full rounded bg-slate-200" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-28 rounded-xl border bg-white" />)}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="h-80 rounded-xl border bg-white" />
          <div className="h-80 rounded-xl border bg-white" />
        </div>
      </div>
    </main>
  );
}