"use client";

import { DataTable, type ColumnDef } from "@/components/ui/data-table-bulk-actions";
import type { NozzleSummary } from "@/features/equipment/model";

export default function NozzleReportsPage({ nozzles }: { nozzles: NozzleSummary[] }) {
  const columns: ColumnDef<NozzleSummary, unknown>[] = [
    { accessorKey: "dispenserSerial", header: "Dispenser", cell: ({ getValue }) => <span className="font-medium text-[#17352f]">{getValue<string>()}</span> },
    { accessorKey: "nozzleNumber", header: "Nozzle number (nza)" },
    { accessorKey: "transactionCount", header: "Telemetry records", meta: { align: "right" } },
    { accessorKey: "totalVolume", header: "Recorded volume (L)", meta: { align: "right" }, cell: ({ getValue }) => <span>{getValue<number>().toLocaleString()}</span> },
    { accessorKey: "totalAmount", header: "Recorded amount", meta: { align: "right" }, cell: ({ getValue }) => <span>{getValue<number>().toLocaleString()}</span> },
    { accessorFn: (nozzle) => nozzle.latestTransaction?.datetime ?? "", id: "lastActivity", header: "Last activity", cell: ({ getValue }) => <span className="whitespace-nowrap text-xs text-slate-500">{getValue<string>() || "—"}</span> },
  ];

  return (
    <main className="min-h-[calc(100svh-3rem)] bg-[#f6f8f7] p-5 sm:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-[#17352f]">Observed nozzle activity</h1>
          <p className="mt-2 text-sm text-slate-500">Nozzles are grouped by unique dispenser serial and nza values in telemetry.</p>
        </header>
        <DataTable
          label="Observed nozzle activity"
          data={nozzles}
          columns={columns}
          getRowId={(nozzle) => nozzle.id}
          searchPlaceholder="Search dispenser serial or nozzle number"
          selectable
          columnToggle
          pageSize={10}
          fillHeight
          empty={<p className="p-8 text-center text-sm text-slate-500">No nozzle identifiers have been observed in telemetry for this outlet.</p>}
          className="rounded-2xl border border-[#dce9e5] bg-white p-3 shadow-sm"
        />
      </div>
    </main>
  );
}
