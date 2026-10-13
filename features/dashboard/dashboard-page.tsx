import type { ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Gauge,
  RadioTower,
  ShieldCheck,
} from "lucide-react";
import { getStationOverview } from "@/features/dashboard/repository";

export default async function DashboardPage() {
  const overview = await getStationOverview();
  const stationName = overview.station?.name ?? overview.station?.id ?? "Station Overview";
  const maxActivity = Math.max(1, ...overview.activity.map((bucket) => bucket.count));

  return (
    <div className="min-h-[calc(100vh-2.75rem)] bg-[#f6f8f7] p-5 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#17352f]">
              {stationName}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Current status from your station equipment and transactions.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#cde4dd] bg-white px-3 py-2 text-xs font-medium shadow-sm">
            <span className={`size-2 rounded-full ${overview.operational ? "bg-[#2bb673]" : "bg-amber-500"}`} />
            <span className={overview.operational ? "text-[#16806c]" : "text-amber-700"}>
              {overview.operational ? "All systems operational" : "Attention required"}
            </span>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <OverviewCard
            icon={<RadioTower />}
            label="Connected dispensers"
            value={`${overview.dispensers.connected} / ${overview.dispensers.total}`}
            detail={overview.dispensers.total === overview.dispensers.connected ? "All dispensers online" : `${overview.dispensers.total - overview.dispensers.connected} offline or in maintenance`}
          />
          <OverviewCard
            icon={<Gauge />}
            label="Active nozzles"
            value={`${overview.nozzles.active} / ${overview.nozzles.total}`}
            detail={`Across ${overview.nozzles.productCount} products`}
          />
          <OverviewCard
            icon={<Activity />}
            label="Transactions today"
            value={overview.transactions.today.toLocaleString()}
            detail={overview.transactions.comparison}
          />
          <OverviewCard
            icon={<ShieldCheck />}
            label="Station health"
            value={`${overview.health.percentage}%`}
            detail={`${overview.health.healthy} of ${overview.health.total} equipment units healthy`}
          />
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-2xl border border-[#dce9e5] bg-white p-5 shadow-[0_12px_40px_-28px_rgba(23,53,47,0.35)] sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-[#17352f]">Station activity</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Transactions in the last 12 hours
                </p>
              </div>
              <Link
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#16806c]"
                href="/dispensers/reports"
              >
                View reports <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
            <div className="mt-8 flex h-48 items-end gap-2 sm:gap-4">
              {overview.activity.map((bucket) => (
                  <div
                    key={bucket.label}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <div
                      className="w-full rounded-t-md bg-[#b9e5d8]"
                      style={{ height: `${Math.max(4, (bucket.count / maxActivity) * 100)}%` }}
                      title={`${bucket.count} transactions at ${bucket.label}`}
                    />
                    <span className="text-[10px] text-slate-400">
                      {bucket.label}
                    </span>
                  </div>
                ))}
            </div>
          </div>
          <div className="rounded-2xl border border-[#dce9e5] bg-[#17352f] p-6 text-white shadow-[0_12px_40px_-28px_rgba(23,53,47,0.5)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8dd9c7]">
              Attention needed
            </p>
            <h2 className="mt-3 text-2xl font-semibold">
              {overview.alerts.length} equipment {overview.alerts.length === 1 ? "alert" : "alerts"}
            </h2>
            {overview.alerts.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[#b9d5ce]">
                {overview.alerts.slice(0, 3).map((alert) => (
                  <li key={`${alert.equipment}-${alert.id}`}>
                    <span className="font-semibold text-white">{alert.equipment} {alert.id}</span>
                    {": "}{alert.issue}
                  </li>
                ))}
                {overview.alerts.length > 3 && (
                  <li>And {overview.alerts.length - 3} more</li>
                )}
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
              Review nozzles <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function OverviewCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
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
      <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17352f]">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-400">{detail}</p>
    </div>
  );
}