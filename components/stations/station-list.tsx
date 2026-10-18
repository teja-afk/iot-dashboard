"use client";

import Link from "next/link";
import { ArrowUpRight, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { StationSelectButton } from "@/components/common/station-select-button";
import { useMemo, useState } from "react";
import type { StationRecord } from "@/types";

export default function StationListPage({ stations }: { stations: StationRecord[] }) {
  const [query, setQuery] = useState("");

  const filteredStations = useMemo(
    () =>
      stations.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.retailOutletId.toLowerCase().includes(query.toLowerCase()),
      ),
    [stations, query],
  );

  return (
    <main className="min-h-[calc(100vh-2.75rem)] bg-[#f6f8f7] p-5 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#17352f]">Stations</h1>
            <p className="mt-2 text-sm text-slate-500">
              Select a station to view its dashboard data.
            </p>
          </div>
        </header>

        <div className="relative max-w-md">
          <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search station name or outlet ID…"
            aria-label="Search stations"
            className="h-10 pl-9"
          />
        </div>

        {filteredStations.length > 0 ? (
          <section aria-label="Stations list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredStations.map((station) => (
              <Card key={station.id} className="gap-4 border-[#dce9e5] transition-shadow hover:shadow-md">
                <CardHeader className="grid-cols-[minmax(0,1fr)_auto] items-start">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f6f1] text-[#16806c]">
                      <Building2 className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <CardTitle className="truncate text-base text-[#17352f]">{station.name}</CardTitle>
                      <p className="mt-1 truncate font-mono text-xs text-slate-400">{station.retailOutletId}</p>
                    </div>
                  </div>
                  <Badge className={station.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}>
                    {station.active ? "Active" : "Inactive"}
                  </Badge>
                  <p className="col-span-2 text-sm text-slate-500">{station.location}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-4">
                    <div className="min-w-0">
                      <dt className="text-[11px] uppercase tracking-wide text-slate-400">Dealer</dt>
                      <dd className="mt-1 truncate text-sm font-medium text-[#17352f]">{station.dealerName}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[11px] uppercase tracking-wide text-slate-400">Sales area</dt>
                      <dd className="mt-1 truncate text-sm font-medium text-[#17352f]">{station.salesArea}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[11px] uppercase tracking-wide text-slate-400">Pincode</dt>
                      <dd className="mt-1 truncate text-sm font-medium text-[#17352f]">{station.pincode}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[11px] uppercase tracking-wide text-slate-400">State office</dt>
                      <dd className="mt-1 truncate text-sm font-medium text-[#17352f]">{station.stateOffice}</dd>
                    </div>
                  </dl>
                </CardContent>
                <CardFooter className="justify-between border-[#edf3f0] pt-3">
                  <Link
                    href={`/stations/${encodeURIComponent(station.id)}`}
                    className="inline-flex items-center gap-1 font-semibold text-[#16806c]"
                  >
                    Details <ArrowUpRight className="size-3.5" />
                  </Link>
                  <StationSelectButton station={station} />
                </CardFooter>
              </Card>
            ))}
          </section>
        ) : (
          <div className="rounded-xl border border-dashed border-[#c8ddd7] bg-white p-12 text-center text-sm text-slate-500">
            No stations match “{query}”.
          </div>
        )}
      </div>
    </main>
  );
}
