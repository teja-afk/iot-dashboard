import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TankLevelGraphic } from "@/components/tanks/tank-level-graphic";
import { getTankById, listTankReadings } from "@/lib/data";
import { getSelectedOutletId } from "@/lib/station-cookie";

function formatReading(value: number | null, unit = ""): string {
  return value === null ? "—" : `${value.toLocaleString()}${unit}`;
}

export default async function TankDetailPage({
  params,
}: {
  params: Promise<{ tankId: string }>;
}) {
  const { tankId } = await params;
  const outletId = await getSelectedOutletId();
  const [tank, readings] = await Promise.all([
    getTankById(tankId, outletId),
    listTankReadings(tankId, outletId),
  ]);
  if (!tank) notFound();

  const latest = tank.latestReading;
  const events = readings.slice(0, 8).map((reading) => ({
    id: reading.id,
    title: reading.atgProbeStatus === "active" ? "Tank telemetry received" : `Probe status: ${reading.atgProbeStatus}`,
    description: [
      `Fuel ${formatReading(reading.fuelLevelLiters, " L")}`,
      `Water ${formatReading(reading.waterLevelLiters, " L")}`,
      `Temperature ${formatReading(reading.temperature, "°")}`,
    ].join(" · "),
    time: reading.datetime,
    kind: reading.atgProbeStatus === "active" ? "info" : "warning",
  }));

  return (
    <main className="min-h-[calc(100vh-2.75rem)] bg-[#f6f8f7] p-5 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link href="/tanks" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#16806c]">
          <span aria-hidden="true" className="size-4">←</span> Back to tanks
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-[#17352f]">
                {tank.serialNumber === "—" ? `Tank ${tank.id}` : tank.serialNumber}
              </h1>
              <Badge className={tank.probeStatus.toLowerCase() === "active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}>
                {tank.probeStatus}
              </Badge>
            </div>
            <p className="mt-2 font-mono text-sm text-slate-400">{tank.id}</p>
            <p className="mt-2 text-sm text-slate-500">
              Retail outlet {tank.retailOutletId} · latest probe status {tank.probeStatus}
            </p>
          </div>
        </div>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="gap-2 border-[#dce9e5] py-4">
            <CardContent className="space-y-2">
              <p className="text-xs font-medium text-slate-500">Fuel level</p>
              <p className="text-2xl font-semibold tracking-tight text-[#17352f]">{formatReading(latest?.fuelLevelLiters ?? null, " L")}</p>
              <p className="text-xs text-slate-400">Latest tank telemetry</p>
            </CardContent>
          </Card>
          <Card className="gap-2 border-[#dce9e5] py-4">
            <CardContent className="space-y-2">
              <p className="text-xs font-medium text-slate-500">Water volume</p>
              <p className="text-2xl font-semibold tracking-tight text-[#17352f]">{formatReading(latest?.waterLevelLiters ?? null, " L")}</p>
              <p className="text-xs text-slate-400">Water height {formatReading(latest?.waterLevelMm ?? null, " mm")}</p>
            </CardContent>
          </Card>
          <Card className="gap-2 border-[#dce9e5] py-4">
            <CardContent className="space-y-2">
              <p className="text-xs font-medium text-slate-500">Temperature</p>
              <p className="text-2xl font-semibold tracking-tight text-[#17352f]">{formatReading(latest?.temperature ?? null, "°")}</p>
              <p className="text-xs text-slate-400">Latest probe reading</p>
            </CardContent>
          </Card>
          <Card className="gap-2 border-[#dce9e5] py-4">
            <CardContent className="space-y-2">
              <p className="text-xs font-medium text-slate-500">Ullage</p>
              <p className="text-2xl font-semibold tracking-tight text-[#17352f]">{formatReading(latest?.ullageLiters ?? null, " L")}</p>
              <p className="text-xs text-slate-400">Reported by tank telemetry</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Card className="gap-0 border-[#dce9e5] py-0">
              <CardHeader className="border-b border-[#edf3f0] py-4">
                <CardTitle className="text-base text-[#17352f]">Current tank contents</CardTitle>
                <CardDescription>
                  The graphic compares reported fuel and water volumes; tank capacity is not present in the source records.
                </CardDescription>
              </CardHeader>
              <CardContent className="py-5">
                <div className="grid gap-6 md:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.2fr)] md:items-center">
                  <TankLevelGraphic
                    id={tank.id}
                    fuelLevelLiters={latest?.fuelLevelLiters ?? null}
                    waterLevelLiters={latest?.waterLevelLiters ?? null}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-[#edf3f0] p-3">
                      <p className="text-xs text-slate-500">Probe status</p>
                      <p className="mt-1 text-sm font-semibold text-[#17352f]">{latest?.atgProbeStatus ?? tank.probeStatus}</p>
                    </div>
                    <div className="rounded-lg border border-[#edf3f0] p-3">
                      <p className="text-xs text-slate-500">Water height</p>
                      <p className="mt-1 text-sm font-semibold text-[#17352f]">{formatReading(latest?.waterLevelMm ?? null, " mm")}</p>
                    </div>
                    <div className="rounded-lg border border-[#edf3f0] p-3">
                      <p className="text-xs text-slate-500">Density</p>
                      <p className="mt-1 text-sm font-semibold text-[#17352f]">{formatReading(latest?.density ?? null)}</p>
                    </div>
                    <div className="rounded-lg border border-[#edf3f0] p-3">
                      <p className="text-xs text-slate-500">Latest timestamp</p>
                      <p className="mt-1 text-sm font-semibold text-[#17352f]">{latest?.datetime ?? "No telemetry received"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {events.length > 0 ? (
              <Card className="gap-0 border-[#dce9e5] py-0">
                <CardHeader className="border-b border-[#edf3f0] py-4">
                  <CardTitle className="text-base text-[#17352f]">Recent tank readings</CardTitle>
                  <CardDescription>Latest records from tank_telemetry for this tank.</CardDescription>
                </CardHeader>
                <CardContent className="py-5">
                  <ol className="space-y-5">
                    {events.map((event) => (
                      <li key={event.id} className="flex gap-3">
                        <span className={`mt-0.5 size-4 shrink-0 ${event.kind === "warning" ? "text-amber-600" : "text-emerald-600"}`} aria-hidden="true">
                          {event.kind === "warning" ? "⚠" : "✓"}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                            <p className="text-sm font-medium text-[#17352f]">{event.title}</p>
                            <time className="text-xs text-slate-400">{event.time}</time>
                          </div>
                          <p className="mt-1 text-sm text-slate-500">{event.description}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ) : (
              <Card className="gap-0 border-[#dce9e5] py-0">
                <CardHeader className="border-b border-[#edf3f0] py-4">
                  <CardTitle className="text-base text-[#17352f]">Recent tank readings</CardTitle>
                  <CardDescription>Latest records from tank_telemetry for this tank.</CardDescription>
                </CardHeader>
                <CardContent className="py-5">
                  <p className="text-sm text-slate-500">No telemetry records are available for this tank.</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="gap-0 border-[#dce9e5] py-0">
              <CardHeader className="border-b border-[#edf3f0] py-4">
                <CardTitle className="text-base text-[#17352f]">Tank inventory record</CardTitle>
              </CardHeader>
              <CardContent className="py-5">
                <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Tank ID</dt>
                    <dd className="mt-1 text-sm font-medium text-[#17352f]">{tank.id}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Serial number</dt>
                    <dd className="mt-1 text-sm font-medium text-[#17352f]">{tank.serialNumber}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Retail outlet</dt>
                    <dd className="mt-1 text-sm font-medium text-[#17352f]">{tank.retailOutletId}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">ATG probe</dt>
                    <dd className="mt-1 text-sm font-medium text-[#17352f]">{tank.probeStatus}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Height</dt>
                    <dd className="mt-1 text-sm font-medium text-[#17352f]">{formatReading(tank.height, " mm")}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Width</dt>
                    <dd className="mt-1 text-sm font-medium text-[#17352f]">{formatReading(tank.width, " mm")}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Customer type</dt>
                    <dd className="mt-1 text-sm font-medium text-[#17352f]">{tank.customerType}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Created</dt>
                    <dd className="mt-1 text-sm font-medium text-[#17352f]">{tank.createdAt}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Updated</dt>
                    <dd className="mt-1 text-sm font-medium text-[#17352f]">{tank.updatedAt}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            <Card className="gap-0 border-[#dce9e5] py-0">
              <CardHeader className="border-b border-[#edf3f0] py-4">
                <CardTitle className="text-base text-[#17352f]">Tank reports</CardTitle>
                <CardDescription>Review readings and probe activity for this outlet.</CardDescription>
              </CardHeader>
              <CardContent className="py-5">
                <p className="text-sm leading-6 text-slate-500">The tank report lists the telemetry readings available in MongoDB.</p>
                <Link
                  href="/tanks/reports"
                  className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium text-[#17352f] hover:bg-[#f5faf8]"
                >
                  Open tank reports <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
