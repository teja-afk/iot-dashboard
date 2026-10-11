"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Download,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Tank } from "@/features/data";

const ranges = ["Past 7 days", "Past 30 days", "Past 1 year", "Custom range"];

export default function TankReportsPage({ tanks }: { tanks: Tank[] }) {
  const [query, setQuery] = useState("");
  const [range, setRange] = useState("Past 7 days");
  const filtered = useMemo(
    () =>
      tanks.filter((tank) =>
        `${tank.id} ${tank.name} ${tank.product}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query, tanks],
  );

  return (
    <ReportLayout
      eyebrow="Tank / Reports"
      title="Tank history"
      description="Review historical tank levels, temperatures, and fuel deliveries."
    >
      <div className="rounded-2xl border border-[#dce9e5] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Enter tank ID or product"
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
            <Button variant="outline" size="icon" className="h-10 w-10">
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
        <div className="border-b border-[#e7efec] px-5 py-4">
          <h2 className="font-semibold text-[#17352f]">Tank readings</h2>
          <p className="mt-1 text-xs text-slate-500">
            {filtered.length} records matching {query || "all tanks"} · {range}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-170 text-left text-sm">
            <thead className="bg-[#f8fbfa] text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Tank</th>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Level</th>
                <th className="px-5 py-3 font-medium">Capacity</th>
                <th className="px-5 py-3 font-medium">Temperature</th>
                <th className="px-5 py-3 font-medium">Last Delivery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf3f0]">
              {filtered.map((tank) => (
                <tr key={tank.id} className="hover:bg-[#fbfdfc]">
                  <td className="px-5 py-4">
                    <p className="font-medium text-[#17352f]">{tank.name}</p>
                    <p className="font-mono text-xs text-slate-400">{tank.id}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{tank.product}</td>
                  <td className="px-5 py-4 font-medium text-[#17352f]">
                    {tank.level}{" "}
                    <span className="text-xs font-normal text-slate-400">
                      ({tank.levelPercent}%)
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{tank.capacity}</td>
                  <td className="px-5 py-4 text-slate-600">
                    {tank.temperature}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 font-mono text-xs font-medium tabular-nums text-[#17352f]">
                    {tank.lastDelivery}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ReportLayout>
  );
}

function ReportLayout({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-2.75rem)] bg-[#f6f8f7] p-5 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#16806c]">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#17352f]">
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}