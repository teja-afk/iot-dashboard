"use client";

import { DataTable, type ColumnDef } from "@/components/ui/data-table-bulk-actions";
import type { TankTelemetry } from "@/types";

export function TankReports({ readings }: { readings: TankTelemetry[] }) {
  const columns: ColumnDef<TankTelemetry, unknown>[] = [
    { accessorKey: "tankId", header: "Tank", cell: ({ getValue }) => <span className="font-medium text-[#17352f]">{getValue<string>()}</span> },
    { accessorKey: "datetime", header: "Reading time", cell: ({ getValue }) => <span className="whitespace-nowrap text-xs text-slate-500">{getValue<string>()}</span> },
    { accessorKey: "atgProbeStatus", header: "Probe status" },
    { accessorKey: "fuelLevelLiters", header: "Fuel (L)", meta: { align: "right" }, cell: ({ getValue }) => <span>{getValue<number | null>()?.toLocaleString() ?? "—"}</span> },
    { accessorKey: "waterLevelLiters", header: "Water (L)", meta: { align: "right" }, cell: ({ getValue }) => <span>{getValue<number | null>()?.toLocaleString() ?? "—"}</span> },
    { accessorKey: "waterLevelMm", header: "Water (mm)", meta: { align: "right" }, cell: ({ getValue }) => <span>{getValue<number | null>()?.toLocaleString() ?? "—"}</span> },
    { accessorKey: "temperature", header: "Temperature", meta: { align: "right" }, cell: ({ getValue }) => <span>{getValue<number | null>() ?? "—"}</span> },
    { accessorKey: "density", header: "Density", meta: { align: "right" }, cell: ({ getValue }) => <span>{getValue<number | null>()?.toLocaleString() ?? "—"}</span> },
    { accessorKey: "ullageLiters", header: "Ullage (L)", meta: { align: "right" }, cell: ({ getValue }) => <span>{getValue<number | null>()?.toLocaleString() ?? "—"}</span> },
  ];

  return (
    <main className="min-h-[calc(100svh-3rem)] bg-[#f6f8f7] p-5 sm:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-[#17352f]">Tank telemetry</h1>
          <p className="mt-2 text-sm text-slate-500">ATG readings returned for the configured retail outlet.</p>
        </header>
        <DataTable
          label="Tank telemetry"
          data={readings}
          columns={columns}
          getRowId={(reading) => reading.id}
          searchPlaceholder="Search tank readings"
          selectable
          columnToggle
          pageSize={10}
          fillHeight
          empty={<p className="p-8 text-center text-sm text-slate-500">No tank telemetry records found for this outlet.</p>}
          className="rounded-2xl border border-[#dce9e5] bg-white p-3 shadow-sm"
        />
      </div>
    </main>
  );
}
