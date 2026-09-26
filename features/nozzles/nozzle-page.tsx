"use client";

import { useState } from "react";
import { ArrowUpRight, Cable, Search, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { nozzles } from "@/features/nozzles/data";

export default function NozzlePage() {
  const [query, setQuery] = useState("");
  const visibleNozzles = nozzles.filter((nozzle) =>
    `${nozzle.id} ${nozzle.dispenser} ${nozzle.product}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div className="min-h-[calc(100vh-2.75rem)] bg-[#f6f8f7] p-5 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#16806c]">
              Nozzle network
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#17352f]">
              Nozzle overview
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Live nozzle readiness, flow rates, and calibration status.
            </p>
          </div>
          <a href="/nozzles/reports">
            <Button variant="outline">
              View reports <ArrowUpRight />
            </Button>
          </a>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search nozzle ID or dispenser serial"
            className="h-10 bg-white pl-9"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {visibleNozzles.map((nozzle) => (
            <article
              key={nozzle.id}
              className="rounded-2xl border border-[#dce9e5] bg-white p-5 shadow-[0_12px_40px_-28px_rgba(23,53,47,0.35)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex size-11 items-center justify-center rounded-xl bg-[#e8f6f1] text-[#16806c]">
                  <Cable className="size-6" />
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${nozzle.status === "Ready" ? "bg-[#e6f7ef] text-[#16805b]" : nozzle.status === "In use" ? "bg-[#e7f0ff] text-[#3566ad]" : "bg-[#fff2dc] text-[#ad6b09]"}`}
                >
                  {nozzle.status}
                </span>
              </div>
              <h2 className="mt-5 font-semibold text-[#17352f]">
                {nozzle.id}{" "}
                <span className="font-normal text-slate-400">
                  · {nozzle.product}
                </span>
              </h2>
              <p className="mt-1 font-mono text-xs text-slate-400">
                {nozzle.dispenser}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-y-4 border-t border-[#edf3f0] pt-4">
                <Detail label="Flow rate" value={nozzle.flowRate} icon={<Zap />} />
                <Detail label="Total volume" value={nozzle.totalVolume} />
                <Detail
                  label="Transactions"
                  value={`${nozzle.transactions} total`}
                />
                <Detail label="Calibration" value={nozzle.lastCalibration} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-[#17352f]">{value}</p>
    </div>
  );
}