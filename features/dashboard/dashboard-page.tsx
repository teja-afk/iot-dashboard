import type { ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Gauge,
  RadioTower,
  ShieldCheck,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-[calc(100vh-2.75rem)] bg-[#f6f8f7] p-5 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#16806c]">
              Station control
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#17352f]">
              Good morning, service team
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              A live pulse of your connected fuel station.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#cde4dd] bg-white px-3 py-2 text-xs font-medium text-[#16806c] shadow-sm">
            <span className="size-2 rounded-full bg-[#2bb673]" />
            All systems operational
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <OverviewCard
            icon={<RadioTower />}
            label="Connected dispensers"
            value="12 / 12"
            detail="No offline units"
          />
          <OverviewCard
            icon={<Gauge />}
            label="Active nozzles"
            value="31"
            detail="Across 4 products"
          />
          <OverviewCard
            icon={<Activity />}
            label="Transactions today"
            value="486"
            detail="18% above yesterday"
          />
          <OverviewCard
            icon={<ShieldCheck />}
            label="Station health"
            value="98.4%"
            detail="Last checked 2 min ago"
          />
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-2xl border border-[#dce9e5] bg-white p-5 shadow-[0_12px_40px_-28px_rgba(23,53,47,0.35)] sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-[#17352f]">Station activity</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Transactions processed today
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
              {[42, 58, 46, 72, 64, 84, 68, 91, 76, 88, 80, 96].map(
                (height, index) => (
                  <div
                    key={index}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <div
                      className="w-full rounded-t-md bg-[#b9e5d8]"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-[10px] text-slate-400">
                      {index + 8}h
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-[#dce9e5] bg-[#17352f] p-6 text-white shadow-[0_12px_40px_-28px_rgba(23,53,47,0.5)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8dd9c7]">
              Attention needed
            </p>
            <h2 className="mt-3 text-2xl font-semibold">2 nozzle alerts</h2>
            <p className="mt-2 text-sm leading-6 text-[#b9d5ce]">
              Nozzle N-104 has exceeded its calibration window. Nozzle N-208
              reported a low-flow event.
            </p>
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