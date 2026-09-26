"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Download,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { transactions } from "@/features/dispensers/data";

const ranges = ["Past 7 days", "Past 30 days", "Past 1 year", "Custom range"];

export default function DispenserReportsPage() {
  const [query, setQuery] = useState("");
  const [range, setRange] = useState("Past 7 days");
  const filtered = useMemo(
    () =>
      transactions.filter(
        (transaction) =>
          transaction.dispenser.toLowerCase().includes(query.toLowerCase()) ||
          transaction.id.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <div className="min-h-[calc(100vh-2.75rem)] bg-[#f6f8f7] p-5 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#16806c]">
            Dispenser / Reports
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#17352f]">
            Transaction history
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Search historical dispenser activity by serial number or transaction
            ID.
          </p>
        </div>

        <div className="rounded-2xl border border-[#dce9e5] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Enter dispenser serial number, e.g. DVR-10482"
                className="h-10 pl-9"
              />
            </div>
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
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                title="More filters"
              >
                <SlidersHorizontal />
              </Button>
              <Button className="h-10">
                <Download /> Export
              </Button>
            </div>
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

        <div className="rounded-2xl border border-[#dce9e5] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e7efec] px-5 py-4">
            <div>
              <h2 className="font-semibold text-[#17352f]">All transactions</h2>
              <p className="mt-1 text-xs text-slate-500">
                {filtered.length} records matching {query || "all dispensers"} ·{" "}
                {range}
              </p>
            </div>
            <Button variant="ghost" size="sm">
              Newest first <ChevronDown />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-180 text-left text-sm">
              <thead className="bg-[#f8fbfa] text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Transaction</th>
                  <th className="px-5 py-3 font-medium">Dispenser</th>
                  <th className="px-5 py-3 font-medium">Nozzle / Product</th>
                  <th className="px-5 py-3 font-medium">Volume</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf3f0]">
                {filtered.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-[#fbfdfc]">
                    <td className="px-5 py-4 font-medium text-[#17352f]">
                      {transaction.id}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {transaction.dispenser}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-slate-700">{transaction.nozzle}</span>
                      <span className="ml-2 text-xs text-slate-400">
                        {transaction.product}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {transaction.volume}
                    </td>
                    <td className="px-5 py-4 font-medium text-[#17352f]">
                      {transaction.amount}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {transaction.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}