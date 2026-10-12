"use client";

import { useState } from "react";
import { CalendarDays, Download, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, type ColumnDef } from "@/components/ui/data-table-bulk-actions";
import type { Nozzle } from "@/features/data";

const ranges = ["Past 7 days", "Past 30 days", "Past 1 year", "Custom range"];

export default function NozzleReportsPage({ nozzles }: { nozzles: Nozzle[] }) {
  const [range, setRange] = useState("Past 7 days");

  const columns: ColumnDef<Nozzle, any>[] = [
    { accessorKey: "id", header: "Nozzle", cell: ({ getValue }) => <span className="font-medium text-[#17352f]">{getValue<string>()}</span> },
    { accessorKey: "dispenser", header: "Dispenser", cell: ({ getValue }) => <span className="text-slate-600">{getValue<string>()}</span> },
    { accessorKey: "product", header: "Product", cell: ({ getValue }) => <span className="text-slate-600">{getValue<string>()}</span> },
    { accessorKey: "totalVolume", header: "Volume", meta: { align: "right" }, cell: ({ getValue }) => <span className="text-slate-600">{getValue<string>()}</span> },
    { accessorKey: "transactions", header: "Transactions", meta: { align: "right" }, cell: ({ getValue }) => <span className="text-slate-600">{getValue<number>()}</span> },
    { accessorKey: "lastCalibration", header: "Calibration", cell: ({ getValue }) => <span className="text-xs text-slate-500">{getValue<string>()}</span> },
  ];

  return (
    <div className="min-h-[calc(100svh-3rem)] bg-[#f6f8f7] p-5 sm:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#16806c]">
            Nozzle / Reports
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#17352f]">
            Nozzle history
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Review nozzle usage, flow performance, and calibration history.
          </p>
        </div>

        <div className="rounded-2xl border border-[#dce9e5] bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {ranges.map((option) => (
              <Button
                key={option}
                variant={range === option ? "secondary" : "outline"}
                onClick={() => setRange(option)}
                className="h-10"
              >
                {option === "Custom range" && <CalendarDays />}
                {option}
              </Button>
            ))}
            <Button variant="outline" size="icon" className="h-10 w-10">
              <SlidersHorizontal />
            </Button>
            <Button className="h-10">
              <Download /> Export
            </Button>
          </div>
          {range === "Custom range" && (
            <div className="mt-3 grid max-w-md grid-cols-2 gap-3">
              <label className="text-xs font-medium text-slate-500">
                From
                <Input type="date" className="mt-1 h-9" />
              </label>
              <label className="text-xs font-medium text-slate-500">
                To
                <Input type="date" className="mt-1 h-9" />
              </label>
            </div>
          )}
        </div>

        <DataTable
          label="Nozzle readings"
          data={nozzles}
          columns={columns}
          searchPlaceholder="Search nozzles"
          selectable
          columnToggle
          pageSize={8}
          fillHeight
          bulkActions={(rows) => (
            <Button variant="outline" size="sm">
              <Download /> Export {rows.length}
            </Button>
          )}
          className="rounded-2xl border border-[#dce9e5] bg-white p-3 shadow-sm"
        />
      </div>
    </div>
  );
}