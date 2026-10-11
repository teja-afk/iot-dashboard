import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  ChildAssetList,
  DetailHeader,
  DetailMetrics,
  DetailSection,
  EventTimeline,
  PropertyGrid,
  type ChildAsset,
} from "@/components/equipment/equipment-detail";
import type { Dispenser, Tank } from "@/features/data";

export default function TankDetailPage({ tank, dispensers }: { tank: Tank; dispensers: Dispenser[] }) {
  const attachedDispensers: ChildAsset[] = dispensers.map((dispenser) => ({
    id: dispenser.serial,
    name: dispenser.name,
    href: `/dispensers/${encodeURIComponent(dispenser.serial)}`,
    status: dispenser.status,
    statusTone: dispenser.status === "Online" ? "good" : "warning",
    description: `${dispenser.manufacturer} ${dispenser.model} · ${dispenser.location}`,
    metrics: [
      { label: "Products", value: dispenser.products.join(" / ") },
      { label: "Today's volume", value: dispenser.volume },
      { label: "Transactions", value: String(dispenser.transactions) },
    ],
  }));

  return (
    <main className="min-h-[calc(100vh-2.75rem)] bg-[#f6f8f7] p-5 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <DetailHeader
          backHref="/tanks"
          backLabel="tanks"
          eyebrow={`Tank / ${tank.product}`}
          title={tank.name}
          id={tank.id}
          description={`${tank.product} storage · ${tank.level} of ${tank.capacity} · last delivery ${tank.lastDelivery}`}
          status={tank.status}
          statusTone={tank.status === "Healthy" ? "good" : tank.status === "Low level" ? "warning" : "critical"}
          location={tank.location}
        />

        <DetailMetrics items={[
          { label: "Current contents", value: tank.level, note: `${tank.levelPercent}% of capacity`, tone: tank.status === "Healthy" ? "good" : "warning" },
          { label: "Water level", value: tank.waterPercent === null ? "Not applicable" : `${tank.waterPercent}%`, note: tank.waterPercent !== null && tank.waterPercent >= 4 ? "Inspect water accumulation" : "Within operating range", tone: tank.waterPercent !== null && tank.waterPercent >= 4 ? "warning" : "good" },
          { label: "Temperature", value: tank.temperature, note: "Latest probe reading" },
          { label: "Next maintenance", value: tank.maintenanceDue, note: `Last inspection ${tank.lastInspection}` },
        ]} />

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <DetailSection title="Tank telemetry" description="Current levels and connected sensor health.">
              <div className="grid gap-6 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
                <div className="mx-auto flex h-48 w-32 items-end overflow-hidden rounded-[3rem] border-[5px] border-slate-200 bg-slate-50 p-1.5 shadow-inner" role="img" aria-label={`${tank.levelPercent}% tank capacity`}>
                  <div className="w-full rounded-[2.5rem] bg-linear-to-t from-emerald-700 to-emerald-400 transition-all" style={{ height: `${tank.levelPercent}%` }} />
                </div>
                <div className="space-y-5">
                  <div>
                    <div className="mb-2 flex justify-between text-sm"><span className="text-slate-500">Available volume</span><span className="font-semibold text-[#17352f]">{tank.levelPercent}%</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#16806c]" style={{ width: `${tank.levelPercent}%` }} /></div>
                    <p className="mt-2 text-xs text-slate-400">{tank.level} available · {tank.capacity} maximum</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {tank.sensors.map((sensor) => (
                      <div key={sensor.name} className="rounded-lg border border-[#edf3f0] p-3">
                        <p className="text-xs text-slate-500">{sensor.name}</p>
                        <p className="mt-1 text-sm font-semibold text-[#17352f]">{sensor.reading}</p>
                        <p className={`mt-1 text-[11px] ${sensor.status === "Online" ? "text-emerald-700" : "text-amber-700"}`}>{sensor.status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DetailSection>
            <ChildAssetList
              title={`Connected dispensers · ${dispensers.length}`}
              description="Equipment supplied by this tank. Select a dispenser to inspect its nozzles and diagnostics."
              items={attachedDispensers}
              emptyLabel="No dispensers are currently mapped to this tank."
            />
            <EventTimeline items={tank.events} />
          </div>

          <div className="space-y-6">
            <DetailSection title="Asset specifications" description="Identification and service configuration.">
              <PropertyGrid items={[
                { label: "Manufacturer", value: tank.manufacturer },
                { label: "Model", value: tank.model },
                { label: "Serial number", value: tank.serial },
                { label: "Product", value: tank.product },
                { label: "Capacity", value: tank.capacity },
                { label: "Firmware", value: tank.firmware },
                { label: "Installed", value: tank.installedAt },
                { label: "Last delivery", value: tank.lastDelivery },
                { label: "Last inspection", value: tank.lastInspection },
                { label: "Maintenance due", value: tank.maintenanceDue },
              ]} />
            </DetailSection>
            <DetailSection title="Analysis & reports" description="Use history to investigate trends and plan service work.">
              <p className="text-sm leading-6 text-slate-500">Review delivery history, level changes, and sensor readings together before scheduling a maintenance task.</p>
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