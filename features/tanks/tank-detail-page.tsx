import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  DetailHeader,
  DetailMetrics,
  DetailSection,
  EventTimeline,
  PropertyGrid,
  type EquipmentEvent,
} from "@/components/equipment/equipment-detail";
import { TankLevelGraphic } from "@/features/tanks/components/tank-level-graphic";
import type { TankAsset, TankTelemetry } from "@/features/equipment/model";

function formatReading(value: number | null, unit = ""): string {
  return value === null ? "—" : `${value.toLocaleString()}${unit}`;
}

export default function TankDetailPage({
  tank,
  readings,
}: {
  tank: TankAsset;
  readings: TankTelemetry[];
}) {
  const latest = tank.latestReading;
  const events: EquipmentEvent[] = readings.slice(0, 8).map((reading) => ({
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
        <DetailHeader
          backHref="/tanks"
          backLabel="tanks"
          eyebrow="Tank telemetry"
          title={tank.serialNumber === "—" ? `Tank ${tank.id}` : tank.serialNumber}
          id={tank.id}
          description={`Retail outlet ${tank.retailOutletId} · latest probe status ${tank.probeStatus}`}
          status={tank.probeStatus}
          statusTone={tank.probeStatus.toLowerCase() === "active" ? "good" : "warning"}
          location={`Tank ${tank.id}`}
        />

        <DetailMetrics items={[
          { label: "Fuel level", value: formatReading(latest?.fuelLevelLiters ?? null, " L"), note: "Latest tank telemetry" },
          { label: "Water volume", value: formatReading(latest?.waterLevelLiters ?? null, " L"), note: `Water height ${formatReading(latest?.waterLevelMm ?? null, " mm")}` },
          { label: "Temperature", value: formatReading(latest?.temperature ?? null, "°"), note: "Latest probe reading" },
          { label: "Ullage", value: formatReading(latest?.ullageLiters ?? null, " L"), note: "Reported by tank telemetry" },
        ]} />

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <DetailSection title="Current tank contents" description="The graphic compares reported fuel and water volumes; tank capacity is not present in the source records.">
              <div className="grid gap-6 md:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.2fr)] md:items-center">
                <TankLevelGraphic
                  id={tank.id}
                  fuelLevelLiters={latest?.fuelLevelLiters ?? null}
                  waterLevelLiters={latest?.waterLevelLiters ?? null}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <ReadingTile label="Probe status" value={latest?.atgProbeStatus ?? tank.probeStatus} />
                  <ReadingTile label="Water height" value={formatReading(latest?.waterLevelMm ?? null, " mm")} />
                  <ReadingTile label="Density" value={formatReading(latest?.density ?? null)} />
                  <ReadingTile label="Latest timestamp" value={latest?.datetime ?? "No telemetry received"} />
                </div>
              </div>
            </DetailSection>
            {events.length > 0 ? (
              <EventTimeline items={events} />
            ) : (
              <DetailSection title="Recent tank readings" description="Latest records from tank_telemetry for this tank.">
                <p className="text-sm text-slate-500">No telemetry records are available for this tank.</p>
              </DetailSection>
            )}
          </div>

          <div className="space-y-6">
            <DetailSection title="Tank inventory record" description="Fields supplied by the tanks collection.">
              <PropertyGrid items={[
                { label: "Tank ID", value: tank.id },
                { label: "Serial number", value: tank.serialNumber },
                { label: "Retail outlet", value: tank.retailOutletId },
                { label: "ATG probe", value: tank.probeStatus },
                { label: "Height", value: formatReading(tank.height, " mm") },
                { label: "Width", value: formatReading(tank.width, " mm") },
                { label: "Customer type", value: tank.customerType },
                { label: "Created", value: tank.createdAt },
                { label: "Updated", value: tank.updatedAt },
              ]} />
            </DetailSection>
            <DetailSection title="Tank reports" description="Review readings and probe activity for this outlet.">
              <p className="text-sm leading-6 text-slate-500">The tank report lists the telemetry readings available in MongoDB.</p>
              <Link href="/tanks/reports" className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium text-[#17352f] hover:bg-[#f5faf8]">
                Open tank reports <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </DetailSection>
          </div>
        </section>
      </div>
    </main>
  );
}

function ReadingTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#edf3f0] p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 wrap-break-word text-sm font-semibold text-[#17352f]">{value}</p>
    </div>
  );
}
