"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Calendar,
  ChevronDown,
  LayoutDashboard,
  Fuel,
  Cable,
  Building2,
} from "lucide-react";
import { useState } from "react";
import type { StationAlert, StationOverview } from "@/types";

export function StatCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-[#dce9e5] bg-white p-5 shadow-[0_12px_40px_-28px_rgba(23,53,47,0.35)]">
      <div className="flex items-center justify-between">
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#e8f6f1] text-[#16806c]">
          {icon}
        </span>
        <span className="text-xs text-[#2bb673]">Live</span>
      </div>
      <p className="mt-5 text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17352f]">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{detail}</p>
    </div>
  );
}

export function ActivityChart({ activity }: { activity: { label: string; count: number }[] }) {
  return (
    <div className="rounded-2xl border border-[#dce9e5] bg-white p-5 shadow-[0_12px_40px_-28px_rgba(23,53,47,0.35)] sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-[#17352f]">Station activity</h2>
          <p className="mt-1 text-xs text-slate-500">Transactions in the last 12 hours</p>
        </div>
        <Link
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#16806c]"
          href="/dispensers/reports"
        >
          View reports <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
      <div className="mt-8 flex h-48 items-end gap-2 sm:gap-4">
        {activity.map((bucket) => (
          <div key={bucket.label} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-md bg-[#b9e5d8]"
              style={{ height: `${Math.max(4, (bucket.count / 1) * 100)}%` }}
              title={`${bucket.count} transactions at ${bucket.label}`}
            />
            <span className="text-[10px] text-slate-400">{bucket.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AlertsList({ alerts }: { alerts: StationAlert[] }) {
  return (
    <div className="rounded-2xl border border-[#dce9e5] bg-[#17352f] p-6 text-white shadow-[0_12px_40px_-28px_rgba(23,53,47,0.5)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8dd9c7]">
        Attention needed
      </p>
      <h2 className="mt-3 text-2xl font-semibold">
        {alerts.length} equipment {alerts.length === 1 ? "alert" : "alerts"}
      </h2>
      {alerts.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[#b9d5ce]">
          {alerts.slice(0, 3).map((alert) => (
            <li key={`${alert.equipment}-${alert.id}`}>
              <span className="font-semibold text-white">{alert.equipment} {alert.id}</span>{": "}
              {alert.issue}
            </li>
          ))}
          {alerts.length > 3 && <li>And {alerts.length - 3} more</li>}
        </ul>
      ) : (
        <p className="mt-2 text-sm leading-6 text-[#b9d5ce]">
          No active station or equipment alerts.
        </p>
      )}
      <Link
        className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#8dd9c7]"
        href="/nozzles"
      >
        Review tanks <ArrowUpRight className="size-4" />
      </Link>
    </div>
  );
}

type DateRangePreset = "week" | "month" | "year" | "custom";

const DATE_RANGE_LABELS: Record<DateRangePreset, string> = {
  week: "Past week",
  month: "Past month",
  year: "Past year",
  custom: "Custom range",
};

function computeTransactionsInRange(
  activity: { label: string; count: number }[],
  range: DateRangePreset,
): { label: string; count: number; total: number } {
  const total = activity.reduce((sum, b) => sum + b.count, 0);
  const label = DATE_RANGE_LABELS[range];
  return { label, count: total, total };
}

export function DateRangeFilter({
  range,
  onChange,
}: {
  range: DateRangePreset;
  onChange: (range: DateRangePreset) => void;
}) {
  return (
    <div className="relative inline-block">
      <button
        onClick={() => onChange(range === "custom" ? "week" : "custom")}
        className="inline-flex items-center gap-2 rounded-full border border-[#cde4dd] bg-white px-3 py-2 text-xs font-medium shadow-sm hover:bg-[#f0f6f4] transition-colors"
      >
        <Calendar className="size-3.5" />
        <span>{DATE_RANGE_LABELS[range]}</span>
        <ChevronDown className="size-3.5" />
      </button>
      <div className="absolute z-50 mt-2 w-48 rounded-md border border-[#dce9e5] bg-white shadow-lg py-1">
        {["week", "month", "year"].map((preset) => (
          <button
            key={preset}
            onClick={() => onChange(preset as DateRangePreset)}
            className="block w-full text-left px-3 py-2 text-xs hover:bg-[#f0f6f4] cursor-pointer"
          >
            {DATE_RANGE_LABELS[preset as DateRangePreset]}
          </button>
        ))}
        <div className="h-px bg-[#e8f0ec]" />
        <button
          onClick={() => onChange("custom")}
          className="block w-full text-left px-3 py-2 text-xs hover:bg-[#f0f6f4] cursor-pointer"
        >
          Custom range
        </button>
      </div>
    </div>
  );
}

export function DashboardPage({ overview }: { overview: StationOverview }) {
  const [range, setRange] = useState<DateRangePreset>("month");
  const station = overview.station;

  const transactionMetrics = computeTransactionsInRange(overview.activity, range);

  return (
    <div className="min-h-[calc(100vh-2.75rem)] bg-[#f6f8f7] p-5 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#17352f]">
              {station.name}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Station {station.id} · {station.stateOffice} {station.divisionalOffice}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#cde4dd] bg-white px-3 py-2 text-xs font-medium shadow-sm">
            <span className={`size-2 rounded-full ${station.active ? "bg-[#2bb673]" : "bg-amber-500"}`} />
            <span className={station.active ? "text-[#16806c]" : "text-amber-700"}>
              {station.active ? "All systems operational" : "Attention required"}
            </span>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <StatCard
            icon={<Building2 />}
            label="Station ID"
            value={station.id}
            detail={station.sapCustCode ? `SAP: ${station.sapCustCode}` : "SAP code not set"}
          />
          <StatCard
            icon={<LayoutDashboard />}
            label="Registered tanks"
            value={overview.health.totalTanks.toLocaleString()}
            detail={`${overview.health.tanksReporting} reporting telemetry`}
          />
          <StatCard
            icon={<Fuel />}
            label="Registered dispensers"
            value={overview.dispensers.registered.toLocaleString()}
            detail="From dispenser inventory"
          />
          <StatCard
            icon={<Cable />}
            label="Observed nozzles"
            value={overview.nozzles.observed.toLocaleString()}
            detail="Unique dispenser and nozzle pairs"
          />
        </section>

        {/* <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#dce9e5] bg-white p-5 shadow-[0_12px_40px_-28px_rgba(23,53,47,0.35)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#17352f]">Sale transactions</h2>
              <DateRangeFilter range={range} onChange={setRange} />
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#f0f6f4]">
                <p className="text-xs text-slate-500 uppercase font-medium">Transactions ({DATE_RANGE_LABELS[range]})</p>
                <p className="mt-1 text-2xl font-semibold text-[#17352f]">{transactionMetrics.count.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#f0f6f4]">
                <p className="text-xs text-slate-500 uppercase font-medium">Avg per hour</p>
                <p className="mt-1 text-2xl font-semibold text-[#17352f]">
                  {Math.round(transactionMetrics.count / 24).toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#f0f6f4]">
                <p className="text-xs text-slate-500 uppercase font-medium">Peak hour</p>
                <p className="mt-1 text-2xl font-semibold text-[#17352f]">{transactionMetrics.count.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#f0f6f4]">
                <p className="text-xs text-slate-500 uppercase font-medium">Status</p>
                <p className="mt-1 text-xs font-semibold text-[#16806c]">Active</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Comparing activity across the selected date range.
            </p>
          </div>

          <div className="rounded-2xl border border-[#dce9e5] bg-white p-5 shadow-[0_12px_40px_-28px_rgba(23,53,47,0.35)]">
            <ActivityChart activity={overview.activity} />
          </div>

          <div className="rounded-2xl border border-[#dce9e5] bg-[#17352f] p-6 text-white shadow-[0_12px_40px_-28px_rgba(23,53,47,0.5)] lg:col-span-2">
            <AlertsList alerts={overview.alerts} />
          </div>
        </section> */}
        {/*
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#dce9e5] bg-white p-5 shadow-[0_12px_40px_-28px_rgba(23,53,47,0.35)] lg:col-span-2">
            <h2 className="font-semibold text-[#17352f] mb-4">Station details</h2>
            <dl className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4 border-b border-[#dce9e5] pb-2 last:border-none">
                <dt className="text-slate-500">Station name</dt>
                <dd className="font-medium text-[#17352f]">{station.name}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4 border-b border-[#dce9e5] pb-2 last:border-none">
                <dt className="text-slate-500">Station ID</dt>
                <dd className="font-mono text-[#17352f]">{station.id}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4 border-b border-[#dce9e5] pb-2 last:border-none">
                <dt className="text-slate-500">SAP customer code</dt>
                <dd className={station.sapCustCode ? "font-mono text-[#17352f]" : "font-mono text-slate-400"}>
                  {station.sapCustCode || "Not configured"}
                </dd>
              </div>
              <div className="grid grid-cols-2 gap-4 border-b border-[#dce9e5] pb-2 last:border-none">
                <dt className="text-slate-500">State office</dt>
                <dd className="text-[#17352f]">{station.stateOffice}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4 border-b border-[#dce9e5] pb-2 last:border-none">
                <dt className="text-slate-500">Divisional office</dt>
                <dd className="text-[#17352f]">{station.divisionalOffice}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4 border-b border-[#dce9e5] pb-2 last:border-none">
                <dt className="text-slate-500">Sales area</dt>
                <dd className="text-[#17352f]">{station.salesArea}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4 border-b border-[#dce9e5] pb-2 last:border-none">
                <dt className="text-slate-500">Dealer name</dt>
                <dd className="text-[#17352f]">{station.dealerName}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4 border-b border-[#dce9e5] pb-2 last:border-none">
                <dt className="text-slate-500">Location</dt>
                <dd className="text-[#17352f]">{station.location}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4 border-b border-[#dce9e5] pb-2 last:border-none">
                <dt className="text-slate-500">Pincode</dt>
                <dd className="text-[#17352f]">{station.pincode}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4 border-b border-[#dce9e5] pb-2 last:border-none">
                <dt className="text-slate-500">Retail outlet ID</dt>
                <dd className="font-mono text-[#17352f]">{station.retailOutletId}</dd>
              </div>
            </dl>
          </div>
        </section>
        */}
      </div>
    </div>
  );
}
