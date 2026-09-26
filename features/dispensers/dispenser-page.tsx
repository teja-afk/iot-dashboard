"use client";

import { useState } from "react";
import { ArrowUpRight, Fuel, Search, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dispensers } from "@/features/dispensers/data";

export default function DispenserPage() {
  const [query, setQuery] = useState("");
  const visibleDispensers = dispensers.filter((dispenser) =>
    `${dispenser.name} ${dispenser.serial}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div className="min-h-[calc(100vh-2.75rem)] bg-[#f6f8f7] p-5 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#16806c]">
              Dispenser network
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#17352f]">
              Dispensers
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Live equipment status and latest transaction activity.
            </p>
          </div>
          <a href="/dispensers/reports">
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
            placeholder="Search dispenser serial number"
            className="h-10 bg-white pl-9"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {visibleDispensers.map((dispenser) => (
            <article
              key={dispenser.serial}
              className="rounded-2xl border border-[#dce9e5] bg-white p-5 shadow-[0_12px_40px_-28px_rgba(23,53,47,0.35)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex size-11 items-center justify-center rounded-xl bg-[#e8f6f1] text-[#16806c]">
                  <Fuel className="size-6" />
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${dispenser.status === "Online" ? "bg-[#e6f7ef] text-[#16805b]" : "bg-[#fff2dc] text-[#ad6b09]"}`}
                >
                  {dispenser.status}
                </span>
              </div>
              <h2 className="mt-5 font-semibold text-[#17352f]">
                {dispenser.name}
              </h2>
              <p className="mt-1 font-mono text-xs text-slate-400">
                {dispenser.serial}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-y-4 border-t border-[#edf3f0] pt-4">
                <Detail label="Nozzles" value={`${dispenser.nozzles} active`} />
                <Detail label="Products" value={dispenser.products.join(" / ")} />
                <Detail label="Today's volume" value={dispenser.volume} />
                <Detail
                  label="Transactions"
                  value={`${dispenser.transactions} today`}
                />
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-[#edf3f0] pt-4 text-xs">
                <span className="text-slate-400">
                  Last transaction {dispenser.lastTransaction}
                </span>
                {dispenser.status === "Maintenance" && (
                  <span className="flex items-center gap-1 font-medium text-[#ad6b09]">
                    <Wrench className="size-3.5" /> Service due
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>

        {visibleDispensers.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#c8ddd7] bg-white p-12 text-center text-sm text-slate-500">
            No dispenser matches that serial number.
          </div>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-[#17352f]">{value}</p>
    </div>
  );
}