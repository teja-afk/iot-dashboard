import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getNozzleById, listDispenserTransactions } from "@/lib/data";
import { getSelectedOutletId } from "@/lib/station-cookie";

function formatNumber(value: number, unit = ""): string {
  return `${value.toLocaleString()}${unit}`;
}

export default async function NozzleDetailPage({
  params,
}: {
  params: Promise<{ nozzleId: string }>;
}) {
  const { nozzleId } = await params;
  const outletId = await getSelectedOutletId();
  const nozzle = await getNozzleById(nozzleId, outletId);
  if (!nozzle) return null;

  const transactions = (await listDispenserTransactions(nozzle.dispenserSerial, outletId)).filter(
    (transaction) => transaction.nozzleNumber === nozzle.nozzleNumber,
  );

  const events = transactions.slice(0, 10).map((transaction) => ({
    id: transaction.id,
    title: `Telemetry record · ${transaction.receiptNumber}`,
    description: `Volume ${formatNumber(transaction.volume ?? 0, " L")} · amount ${formatNumber(transaction.amount ?? 0)} · unit price ${formatNumber(transaction.unitPrice ?? 0)}`,
    time: transaction.datetime,
    kind: "info" as const,
  }));

  return (
    <main className="min-h-[calc(100vh-2.75rem)] bg-[#f6f8f7] p-5 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link href={`/dispensers/${encodeURIComponent(nozzle.dispenserSerial)}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#16806c]">
          <span aria-hidden="true" className="size-4">←</span> Back to dispenser {nozzle.dispenserSerial}
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-[#17352f]">Nozzle {nozzle.nozzleNumber}</h1>
              <Badge className="bg-sky-50 text-sky-700">Observed</Badge>
            </div>
            <p className="mt-2 font-mono text-sm text-slate-400">{nozzle.id}</p>
            <p className="mt-2 text-sm text-slate-500">
              This nozzle is inferred from the dispenser serial and nza values observed in telemetry.
            </p>
          </div>
        </div>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="gap-2 border-[#dce9e5] py-4">
            <CardContent className="space-y-2">
              <p className="text-xs font-medium text-slate-500">Telemetry records</p>
              <p className="text-2xl font-semibold tracking-tight text-[#17352f]">{nozzle.transactionCount.toLocaleString()}</p>
              <p className="text-xs text-slate-400">Records observed for this nozzle</p>
            </CardContent>
          </Card>
          <Card className="gap-2 border-[#dce9e5] py-4">
            <CardContent className="space-y-2">
              <p className="text-xs font-medium text-slate-500">Reported volume</p>
              <p className="text-2xl font-semibold tracking-tight text-[#17352f]">{formatNumber(nozzle.totalVolume, " L")}</p>
              <p className="text-xs text-slate-400">Sum of telemetry volume values</p>
            </CardContent>
          </Card>
          <Card className="gap-2 border-[#dce9e5] py-4">
            <CardContent className="space-y-2">
              <p className="text-xs font-medium text-slate-500">Reported amount</p>
              <p className="text-2xl font-semibold tracking-tight text-[#17352f]">{formatNumber(nozzle.totalAmount)}</p>
              <p className="text-xs text-slate-400">Sum of telemetry amount values</p>
            </CardContent>
          </Card>
          <Card className="gap-2 border-[#dce9e5] py-4">
            <CardContent className="space-y-2">
              <p className="text-xs font-medium text-slate-500">Last activity</p>
              <p className="text-2xl font-semibold tracking-tight text-[#17352f]">{nozzle.latestTransaction?.datetime ?? "—"}</p>
              <p className="text-xs text-slate-400">Latest matching telemetry record</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            {events.length > 0 ? (
              <Card className="gap-0 border-[#dce9e5] py-0">
                <CardHeader className="border-b border-[#edf3f0] py-4">
                  <CardTitle className="text-base text-[#17352f]">Recent activity</CardTitle>
                  <CardDescription>Recent readings, service events, and equipment alerts.</CardDescription>
                </CardHeader>
                <CardContent className="py-5">
                  <ol className="space-y-5">
                    {events.map((event) => (
                      <li key={event.id} className="flex gap-3">
                        <span className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true">
                          ✓
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
                  <CardTitle className="text-base text-[#17352f]">Nozzle activity</CardTitle>
                  <CardDescription>Telemetry matching this dispenser and nozzle number.</CardDescription>
                </CardHeader>
                <CardContent className="py-5">
                  <p className="text-sm text-slate-500">No telemetry events are available for this nozzle.</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="gap-0 border-[#dce9e5] py-0">
              <CardHeader className="border-b border-[#edf3f0] py-4">
                <CardTitle className="text-base text-[#17352f]">Observed nozzle identifiers</CardTitle>
                <CardDescription>No standalone nozzle inventory collection is configured.</CardDescription>
              </CardHeader>
              <CardContent className="py-5">
                <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Dispenser serial</dt>
                    <dd className="mt-1 text-sm font-medium text-[#17352f]">{nozzle.dispenserSerial}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Nozzle number (nza)</dt>
                    <dd className="mt-1 text-sm font-medium text-[#17352f]">{nozzle.nozzleNumber}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Retail outlet</dt>
                    <dd className="mt-1 text-sm font-medium text-[#17352f]">{transactions[0]?.retailOutletId ?? "—"}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Telemetry records</dt>
                    <dd className="mt-1 text-sm font-medium text-[#17352f]">{nozzle.transactionCount.toLocaleString()}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            <Card className="gap-0 border-[#dce9e5] py-0">
              <CardHeader className="border-b border-[#edf3f0] py-4">
                <CardTitle className="text-base text-[#17352f]">Nozzle report</CardTitle>
                <CardDescription>Review all telemetry records for this dispenser and nozzle pair.</CardDescription>
              </CardHeader>
              <CardContent className="py-5">
                <p className="text-sm leading-6 text-slate-500">Nozzle history is derived from the dispenser_telemetry collection.</p>
                <Link
                  href="/nozzles/reports"
                  className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium text-[#17352f] hover:bg-[#f5faf8]"
                >
                  Open nozzle reports <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
