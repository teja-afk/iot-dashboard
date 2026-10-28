import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDispenserBySerial, listNozzlesByDispenserId, listDispenserTransactions } from "@/lib/data";
import { getSelectedOutletId } from "@/lib/station-cookie";
import { getFuelColor } from "@/lib/fuel-colors";

function formatNumber(value: number, unit = ""): string {
  return `${value.toLocaleString()}${unit}`;
}

export default async function DispenserDetailPage({
  params,
}: {
  params: Promise<{ dispenserId: string }>;
}) {
  const { dispenserId } = await params;
  const outletId = await getSelectedOutletId();
  const [dispenser, nozzles, activity] = await Promise.all([
    getDispenserBySerial(dispenserId, outletId),
    listNozzlesByDispenserId(dispenserId, outletId),
    listDispenserTransactions(dispenserId, outletId),
  ]);
  if (!dispenser) return null;

  const nozzleItems = nozzles.map((nozzle) => ({
    id: nozzle.id,
    name: `Nozzle ${nozzle.nozzleNumber}`,
    href: `/nozzles/${encodeURIComponent(nozzle.id)}`,
    status: "Observed",
    statusTone: "info" as const,
    description: `Nozzle number ${nozzle.nozzleNumber} observed on dispenser telemetry.`,
    metrics: [
      { label: "Records", value: nozzle.transactionCount.toLocaleString() },
      { label: "Volume", value: formatNumber(nozzle.totalVolume, " L") },
      { label: "Amount", value: formatNumber(nozzle.totalAmount) },
    ],
    product: nozzle.product,
  }));

  const recentEvents = activity.slice(0, 8).map((transaction) => ({
    id: transaction.id,
    title: `Nozzle ${transaction.nozzleNumber} telemetry`,
    description: `Volume ${formatNumber(transaction.volume ?? 0, " L")} · amount ${formatNumber(transaction.amount ?? 0)} · receipt ${transaction.receiptNumber}`,
    time: transaction.datetime,
    kind: "info" as const,
    product: transaction.product,
  }));

  return (
    <main className="min-h-[calc(100vh-2.75rem)] bg-[#f6f8f7] p-5 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link href="/dispensers" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#16806c]">
          <span aria-hidden="true" className="size-4">←</span> Back to dispensers
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-[#17352f]">{dispenser.serialNumber}</h1>
              <Badge className={dispenser.latestTransaction ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}>
                {dispenser.latestTransaction ? "Telemetry recorded" : "No telemetry"}
              </Badge>
            </div>
            <p className="mt-2 font-mono text-sm text-slate-400">{dispenser.id}</p>
            <p className="mt-2 text-sm text-slate-500">
              Retail outlet {dispenser.retailOutletId} · batch {dispenser.batchNumber}
            </p>
          </div>
        </div>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="gap-2 border-[#dce9e5] py-4">
            <CardContent className="space-y-2">
              <p className="text-xs font-medium text-slate-500">Telemetry records</p>
              <p className="text-2xl font-semibold tracking-tight text-[#17352f]">{dispenser.transactionCount.toLocaleString()}</p>
              <p className="text-xs text-slate-400">Records available for this dispenser</p>
            </CardContent>
          </Card>
          <Card className="gap-2 border-[#dce9e5] py-4">
            <CardContent className="space-y-2">
              <p className="text-xs font-medium text-slate-500">Observed volume</p>
              <p className="text-2xl font-semibold tracking-tight text-[#17352f]">{formatNumber(dispenser.totalVolume, " L")}</p>
              <p className="text-xs text-slate-400">Sum of reported volume values</p>
            </CardContent>
          </Card>
          <Card className="gap-2 border-[#dce9e5] py-4">
            <CardContent className="space-y-2">
              <p className="text-xs font-medium text-slate-500">Observed amount</p>
              <p className="text-2xl font-semibold tracking-tight text-[#17352f]">{formatNumber(dispenser.totalAmount)}</p>
              <p className="text-xs text-slate-400">Sum of reported amount values</p>
            </CardContent>
          </Card>
          <Card className="gap-2 border-[#dce9e5] py-4">
            <CardContent className="space-y-2">
              <p className="text-xs font-medium text-slate-500">Observed nozzles</p>
              <p className="text-2xl font-semibold tracking-tight text-[#17352f]">{String(nozzles.length)}</p>
              <p className="text-xs text-slate-400">Unique nza values in telemetry</p>
            </CardContent>
          </Card>
        </section>

        {/* Observed nozzles in horizontal row-wise layout */}
        <Card className="gap-0 border-[#dce9e5] py-0">
          <CardHeader className="border-b border-[#edf3f0] py-4">
            <CardTitle className="text-base text-[#17352f]">Observed nozzles · {nozzles.length}</CardTitle>
            <CardDescription>
              Nozzle numbers are derived from telemetry records for this dispenser serial.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-5">
            {nozzleItems.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {nozzleItems.map((item) => {
  const itemFuel = getFuelColor(item.product);
  return (
    <article
      key={item.id}
      className="flex flex-col justify-between rounded-xl border border-[#dce9e5] bg-white p-4 shadow-sm transition-all hover:border-[#16806c]/40 hover:shadow-md"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={item.href}
              className="block truncate font-semibold text-sm text-[#17352f] hover:text-[#16806c]"
            >
              {item.name}
            </Link>
            <p className="truncate font-mono text-[11px] text-slate-400">{item.id}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <Badge className="bg-sky-50 text-[10px] text-sky-700 shrink-0">
              {item.status}
            </Badge>
            {item.product ? (
              <Badge className={`${itemFuel.bg} ${itemFuel.text} border ${itemFuel.ring} text-[10px] inline-flex items-center gap-1`}>
                <span className={`size-1.5 rounded-full ${itemFuel.dot}`} aria-hidden="true" />
                {item.product}
              </Badge>
            ) : null}
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500 line-clamp-2">{item.description}</p>
      </div>

      <div className="mt-4 border-t border-[#edf3f0] pt-3">
        <div className="grid grid-cols-3 gap-2">
          {item.metrics.map((metric) => (
            <div key={metric.label} className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-slate-400 truncate">
                {metric.label}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-[#17352f] truncate">
                {metric.value}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-end border-t border-[#edf3f0]/60 pt-2.5">
          <Link
            href={item.href}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#16806c] hover:underline"
          >
            View details <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
})}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No nozzle numbers have been observed in telemetry for this dispenser.</p>
            )}
          </CardContent>
        </Card>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            {recentEvents.length > 0 ? (
              <Card className="gap-0 border-[#dce9e5] py-0">
                <CardHeader className="border-b border-[#edf3f0] py-4">
                  <CardTitle className="text-base text-[#17352f]">Recent activity</CardTitle>
                  <CardDescription>Recent readings, service events, and equipment alerts.</CardDescription>
                </CardHeader>
                <CardContent className="py-5">
                  <ol className="space-y-5">
                    {recentEvents.map((event) => {
                      const evFuel = getFuelColor(event.product);
                      return (
                        <li key={event.id} className="flex gap-3">
                          <span className="mt-0.5 size-4 shrink-0 rounded-full bg-emerald-600" aria-hidden="true" />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                              <p className="text-sm font-medium text-[#17352f]">{event.title}</p>
                              <time className="text-xs text-slate-400">{event.time}</time>
                            </div>
                            <p className="mt-1 text-sm text-slate-500">{event.description}</p>
                            <span className={`mt-1.5 inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${evFuel.bg} ${evFuel.text}`}>
                              <span className={`size-2 rounded-full ${evFuel.dot}`} aria-hidden="true" />
                              {event.product}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </CardContent>
              </Card>
            ) : (
              <Card className="gap-0 border-[#dce9e5] py-0">
                <CardHeader className="border-b border-[#edf3f0] py-4">
                  <CardTitle className="text-base text-[#17352f]">Recent telemetry</CardTitle>
                  <CardDescription>Latest records from dispenser_telemetry.</CardDescription>
                </CardHeader>
                <CardContent className="py-5">
                  <p className="text-sm text-slate-500">No telemetry records are available for this dispenser.</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="gap-0 border-[#dce9e5] py-0">
              <CardHeader className="border-b border-[#edf3f0] py-4">
                <CardTitle className="text-base text-[#17352f]">Inventory record</CardTitle>
              </CardHeader>
              <CardContent className="py-5">
                <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Dispenser ID</dt>
                    <dd className="mt-1 text-sm font-medium text-[#17352f]">{dispenser.id}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Serial number</dt>
                    <dd className="mt-1 text-sm font-medium text-[#17352f]">{dispenser.serialNumber}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Retail outlet</dt>
                    <dd className="mt-1 text-sm font-medium text-[#17352f]">{dispenser.retailOutletId}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Batch number</dt>
                    <dd className="mt-1 text-sm font-medium text-[#17352f]">{dispenser.batchNumber}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Customer type</dt>
                    <dd className="mt-1 text-sm font-medium text-[#17352f]">{dispenser.customerType}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Created</dt>
                    <dd className="mt-1 text-sm font-medium text-[#17352f]">{dispenser.createdAt}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Updated</dt>
                    <dd className="mt-1 text-sm font-medium text-[#17352f]">{dispenser.updatedAt}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Latest telemetry</dt>
                    <dd className="mt-1 text-sm font-medium text-[#17352f]">{dispenser.latestTransaction?.datetime ?? "—"}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            <Card className="gap-0 border-[#dce9e5] py-0">
              <CardHeader className="border-b border-[#edf3f0] py-4">
                <CardTitle className="text-base text-[#17352f]">Transaction reports</CardTitle>
                <CardDescription>Inspect telemetry events and reported transaction values.</CardDescription>
              </CardHeader>
              <CardContent className="py-5">
                <p className="text-sm leading-6 text-slate-500">Transaction history is sourced from dispenser_telemetry for the configured retail outlet.</p>
                <Link
                  href="/dispensers/reports"
                  className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium text-[#17352f] hover:bg-[#f5faf8]"
                >
                  Open dispenser reports <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
