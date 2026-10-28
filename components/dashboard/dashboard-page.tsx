"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  AlertTriangle,
  Building2,
  Cable,
  Calendar,
  CheckCircle2,
  Fuel,
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { StationAnalytics } from "@/types";
import {
  DispensersChart,
  TankCompositionChart,
  TransactionsChart,
  VolumeChart,
  HourlyActivityChart,
  SalesChart,
  NozzlesChart,
} from "@/components/dashboard/charts";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFuelColor } from "@/lib/fuel-colors";

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

export function ComparisonCard({ comparison }: { comparison: StationAnalytics["comparison"] }) {
  if (!comparison) return null;
  const items = [
    { label: "Transactions", value: comparison.current.transactions.toLocaleString(), change: comparison.change.transactions },
    { label: "Volume (L)", value: comparison.current.volume.toLocaleString(), change: comparison.change.volume },
    { label: "Sales (₹)", value: comparison.current.amount.toLocaleString(), change: comparison.change.amount },
    { label: "Avg Txn (₹)", value: comparison.current.averageTransaction.toLocaleString(undefined, { maximumFractionDigits: 2 }), change: comparison.change.averageTransaction },
  ];
  return (
    <Card className="border-[#dce9e5]">
      <CardHeader>
        <CardTitle className="text-base text-[#17352f]">Period comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const up = item.change.startsWith("+");
            const down = item.change.startsWith("-");
            return (
              <div key={item.label} className="rounded-lg border border-[#edf3f0] p-3">
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="mt-1 text-lg font-semibold text-[#17352f]">{item.value}</p>
                <div className="mt-1 flex items-center gap-1 text-xs">
                  {up && <TrendingUp className="size-3.5 text-emerald-600" />}
                  {down && <TrendingDown className="size-3.5 text-rose-600" />}
                  {!up && !down && <span className="size-3.5" />}
                  <span className={up ? "text-emerald-600" : down ? "text-rose-600" : "text-slate-500"}>
                    {item.change}
                  </span>
                  <span className="text-slate-400">vs previous period</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function AlertsList({ alerts }: { alerts: StationAnalytics["alerts"] }) {
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
          {alerts.slice(0, 5).map((alert) => (
            <li key={`${alert.equipment}-${alert.id}`}>
              <span className="font-semibold text-white">{alert.equipment} {alert.id}</span>{": "}
              {alert.issue}
            </li>
          ))}
          {alerts.length > 5 && <li>And {alerts.length - 5} more</li>}
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

export function RecentTransactions({
  transactions,
}: {
  transactions: Array<{
    dispenserSerial: string;
    nozzleNumber: string;
    amount: number | null;
    volume: number | null;
    datetime: string;
    product?: string;
  }>;
}) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Recent transactions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100">
                <th className="pb-2 pr-4 font-normal">Dispenser</th>
                <th className="pb-2 pr-4 font-normal">Nozzle</th>
                <th className="pb-2 pr-4 font-normal">Product</th>
                <th className="pb-2 pr-4 font-normal text-right">Amount</th>
                <th className="pb-2 pr-4 font-normal text-right">Volume (L)</th>
                <th className="pb-2 font-normal">Time</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td className="p-4 text-center text-slate-400" colSpan={6}>
                    No transactions in range
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const fuel = getFuelColor(tx.product);
                  return (
                    <tr key={`${tx.dispenserSerial}-${tx.nozzleNumber}-${tx.datetime}`}>
                      <td className="py-3 pr-4">{tx.dispenserSerial}</td>
                      <td className="py-3 pr-4">{tx.nozzleNumber}</td>
                      <td className="py-3 pr-4">
                        {tx.product ? (
                          <Badge className={`${fuel.bg} ${fuel.text} border ${fuel.ring} inline-flex items-center gap-1 text-[10px]`}>
                            <span className={`size-1.5 rounded-full ${fuel.dot}`} aria-hidden="true" />
                            {tx.product}
                          </Badge>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        {tx.amount === null ? "—" : tx.amount.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        {tx.volume === null ? "—" : tx.volume.toLocaleString()}
                      </td>
                      <td className="py-3">{tx.datetime}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPage({ analytics }: { analytics: StationAnalytics }) {
  const station = analytics.station;
  const { totals, daily, hourly, dispensers, tanks, health, activeDispensers, comparison, nozzleMetrics } = analytics;

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
          <DateRangeFilter />
        </div>

        <section className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard
            icon={<Calendar />}
            label="Transactions"
            value={totals.transactions.toLocaleString()}
            detail={`in selected range`}
          />
          <StatCard
            icon={<Fuel />}
            label="Volume dispensed"
            value={totals.volume.toLocaleString()}
            detail="Litres"
          />
          <StatCard
            icon={<LayoutDashboard />}
            label="Total sales"
            value={`₹ ${totals.amount.toLocaleString()}`}
            detail={`Avg ₹${totals.averageTransaction.toLocaleString(undefined, { maximumFractionDigits: 2 })} per transaction`}
          />
          <StatCard
            icon={<Cable />}
            label="Active dispensers"
            value={`${activeDispensers} / ${dispensers.registered}`}
            detail="With activity in range"
          />
          <StatCard
            icon={<Building2 />}
            label="Reporting tanks"
            value={`${health.tanksReporting} / ${health.totalTanks}`}
            detail="With live telemetry"
          />
          <StatCard
            icon={health.percentage >= 90 ? (<CheckCircle2 className="size-9" />) : (<AlertTriangle className="size-9" />)}
            label="Tank health"
            value={`${health.percentage}%`}
            detail={`Tank telemetry coverage`}
          />
        </section>

        <ComparisonCard comparison={comparison} />

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <TransactionsChart daily={daily} />
          <VolumeChart daily={daily} />
          <SalesChart daily={daily} />
          {hourly && hourly.length > 0 ? (
            <HourlyActivityChart hourly={hourly} />
          ) : (
            <TransactionsChart daily={daily} />
          )}
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DispensersChart dispensers={analytics.dispenserMetrics} />
          {nozzleMetrics && nozzleMetrics.length > 0 ? (
            <NozzlesChart nozzles={nozzleMetrics} />
          ) : (
            <DispensersChart dispensers={analytics.dispenserMetrics} />
          )}
          <TankCompositionChart tanks={tanks} />
          <div className="flex flex-col h-full">
            <AlertsList alerts={analytics.alerts} />
          </div>
        </section>

        <section className="grid gap-6">
          <div className="lg:col-span-2">
            <RecentTransactions transactions={analytics.recentTransactions} />
          </div>
        </section>
      </div>
    </div>
  );
}