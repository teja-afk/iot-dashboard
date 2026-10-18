"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Cable, Database, FileChartColumn, Fuel, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { OverviewItem } from "@/types";

const statusStyles: Record<OverviewItem["statusTone"], string> = {
  good: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  critical: "bg-rose-50 text-rose-700",
  info: "bg-sky-50 text-sky-700",
};

const iconMap = { tank: Database, dispenser: Fuel, nozzle: Cable };

export function AssetList({
  title,
  description,
  searchPlaceholder,
  items,
  reportsHref,
  statusSummaryLabel = "healthy",
}: {
  title: string;
  description: string;
  searchPlaceholder: string;
  items: OverviewItem[];
  reportsHref: string;
  statusSummaryLabel?: string;
}) {
  const [query, setQuery] = useState("");
  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return items;
    return items.filter((item) =>
      `${item.id} ${item.name} ${item.subtitle} ${item.status} ${item.metrics.map((metric) => metric.value).join(" ")}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [items, query]);

  return (
    <main className="min-h-[calc(100vh-2.75rem)] bg-[#f6f8f7] p-5 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#17352f]">{title}</h1>
            <p className="mt-2 text-sm text-slate-500">{description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href={reportsHref} className="inline-flex h-9 items-center gap-2 rounded-md border border-[#cde4dd] bg-white px-3 text-sm font-medium text-[#16806c] transition-colors hover:bg-[#e8f6f1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16806c]">
              <FileChartColumn aria-hidden="true" className="size-4" /> Reports
              <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </Link>
            <Badge className="border-[#cde4dd] bg-white px-3 py-2 text-[#16806c]">
              <span className="size-2 rounded-full bg-emerald-500" />
              {items.length} assets · {items.filter((item) => item.statusTone === "good").length} {statusSummaryLabel}
            </Badge>
          </div>
        </header>

        <div className="relative max-w-md">
          <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-10 bg-white pl-9"
          />
        </div>

        {visibleItems.length > 0 ? (
          <section aria-label={`${title} list`} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((item) => {
              const Icon = iconMap[item.icon];
              return (
                <Link key={item.id} href={item.href} className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16806c]">
                  <Card className="gap-4 border-[#dce9e5] transition-shadow group-hover:shadow-md">
                    <CardHeader className="grid-cols-[minmax(0,1fr)_auto] items-start">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f6f1] text-[#16806c]">
                          <Icon aria-hidden="true" className="size-5" />
                        </span>
                        <div className="min-w-0">
                          <CardTitle className="truncate text-base text-[#17352f]">{item.name}</CardTitle>
                          <p className="mt-1 truncate font-mono text-xs text-slate-400">{item.id}</p>
                        </div>
                      </div>
                      <Badge className={statusStyles[item.statusTone]}>{item.status}</Badge>
                      <p className="col-span-2 text-sm text-slate-500">{item.subtitle}</p>
                    </CardHeader>
                    <CardContent>
                      {item.visual ? (
                        <div className="mb-4">{item.visual}</div>
                      ) : item.progress !== undefined ? (
                        <div className="mb-4">
                          <div className="mb-2 flex justify-between text-xs text-slate-500">
                            <span>{item.progressLabel ?? "Capacity"}</span>
                            <span className="font-semibold text-[#17352f]">{item.progress}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={item.progressLabel ?? "Capacity"} aria-valuenow={item.progress} aria-valuemin={0} aria-valuemax={100}>
                            <div className="h-full rounded-full bg-[#16806c]" style={{ width: `${item.progress}%` }} />
                          </div>
                        </div>
                      ) : null}
                      <dl className="grid grid-cols-2 gap-x-3 gap-y-4">
                        {item.metrics.map((metric) => (
                          <div key={metric.label} className="min-w-0">
                            <dt className="text-[11px] uppercase tracking-wide text-slate-400">{metric.label}</dt>
                            <dd className="mt-1 truncate text-sm font-medium text-[#17352f]">{metric.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </CardContent>
                    <CardFooter className="justify-between border-[#edf3f0] pt-3 text-xs text-slate-500">
                      <span>View telemetry and maintenance</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-[#16806c]">
                        Details <ArrowUpRight aria-hidden="true" className="size-3.5" />
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}
          </section>
        ) : (
          <div className="rounded-xl border border-dashed border-[#c8ddd7] bg-white p-12 text-center text-sm text-slate-500">
            No equipment matches “{query}”. Try another ID or search term.
          </div>
        )}
      </div>
    </main>
  );
}

export function DetailCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <Card className="gap-0 border-[#dce9e5] py-0">
      <CardHeader className="border-b border-[#edf3f0] py-4">
        <CardTitle className="text-base text-[#17352f]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="py-5">
        <p className="text-sm text-slate-500">{value}</p>
      </CardContent>
    </Card>
  );
}
