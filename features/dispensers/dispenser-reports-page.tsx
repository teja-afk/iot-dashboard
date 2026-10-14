"use client";

import { DataTable, type ColumnDef } from "@/components/ui/data-table-bulk-actions";
import type { DispenserTransaction } from "@/features/equipment/model";

export default function DispenserReportsPage({ transactions }: { transactions: DispenserTransaction[] }) {
  const columns: ColumnDef<DispenserTransaction, unknown>[] = [
    { accessorKey: "datetime", header: "Date / time", cell: ({ getValue }) => <span className="whitespace-nowrap text-xs text-slate-500">{getValue<string>()}</span> },
    { accessorKey: "dispenserSerial", header: "Dispenser", cell: ({ getValue }) => <span className="font-medium text-[#17352f]">{getValue<string>()}</span> },
    { accessorKey: "nozzleNumber", header: "Nozzle", cell: ({ getValue }) => <span>{getValue<string>()}</span> },
    { accessorKey: "volume", header: "Volume", meta: { align: "right" }, cell: ({ getValue }) => <span>{getValue<number | null>()?.toLocaleString() ?? "—"} L</span> },
    { accessorKey: "amount", header: "Amount", meta: { align: "right" }, cell: ({ getValue }) => <span>{getValue<number | null>()?.toLocaleString() ?? "—"}</span> },
    { accessorKey: "unitPrice", header: "Unit price", meta: { align: "right" }, cell: ({ getValue }) => <span>{getValue<number | null>()?.toLocaleString() ?? "—"}</span> },
    { accessorKey: "receiptNumber", header: "Receipt" },
    { accessorKey: "volumeTotalizer", header: "Volume totalizer", meta: { align: "right" } },
  ];

  return (
    <main className="min-h-[calc(100svh-3rem)] bg-[#f6f8f7] p-5 sm:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-[#17352f]">Dispenser telemetry</h1>
          <p className="mt-2 text-sm text-slate-500">Transaction-like records from dispensers_telemetry for the configured retail outlet.</p>
        </header>
        <DataTable
          label="Dispenser telemetry"
          data={transactions}
          columns={columns}
          getRowId={(transaction) => transaction.id}
          searchPlaceholder="Search serial, nozzle, receipt, or time"
          selectable
          columnToggle
          pageSize={10}
          fillHeight
          empty={<p className="p-8 text-center text-sm text-slate-500">No dispenser telemetry records found for this outlet.</p>}
          className="rounded-2xl border border-[#dce9e5] bg-white p-3 shadow-sm"
        />
      </div>
    </main>
  );
}
