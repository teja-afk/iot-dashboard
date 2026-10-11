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
import type { Dispenser, Nozzle } from "@/features/data";

export default function DispenserDetailPage({ dispenser, nozzles }: { dispenser: Dispenser; nozzles: Nozzle[] }) {
  const attachedNozzles: ChildAsset[] = nozzles.map((nozzle) => ({
    id: nozzle.id,
    name: `${nozzle.id} · ${nozzle.product}`,
    href: `/nozzles/${encodeURIComponent(nozzle.id)}`,
    status: nozzle.status,
    statusTone: nozzle.status === "Ready" ? "good" : nozzle.status === "In use" ? "info" : "warning",
    description: `${nozzle.model} · meter ${nozzle.meterSerial}`,
    metrics: [
      { label: "Flow", value: nozzle.flowRate },
      { label: "Total volume", value: nozzle.totalVolume },
      { label: "Calibration due", value: nozzle.calibrationDue },
    ],
  }));

  return (
    <main className="min-h-[calc(100vh-2.75rem)] bg-[#f6f8f7] p-5 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <DetailHeader
          backHref="/dispensers"
          backLabel="dispensers"
          eyebrow="Dispenser"
          parentHref={`/tanks/${encodeURIComponent(dispenser.tankId)}`}
          parentLabel={`Tank ${dispenser.tankId}`}
          title={dispenser.name}
          id={dispenser.serial}
          description={`${dispenser.manufacturer} ${dispenser.model} · ${dispenser.products.join(" / ")}`}
          status={dispenser.status}
          statusTone={dispenser.status === "Online" ? "good" : "warning"}
          location={dispenser.location}
        />

        <DetailMetrics items={[
          { label: "Today's volume", value: dispenser.volume, note: `${dispenser.transactions} transactions today` },
          { label: "Connected nozzles", value: String(nozzles.length), note: `${dispenser.products.length} products supported` },
          { label: "Line pressure", value: dispenser.pressure, note: "Latest sensor reading" },
          { label: "Next service", value: dispenser.serviceDue, note: `Heartbeat ${dispenser.lastHeartbeat}`, tone: dispenser.status === "Maintenance" ? "warning" : "good" },
        ]} />

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <ChildAssetList
              title={`Attached nozzles · ${nozzles.length}`}
              description="Per-nozzle readiness, metering totals, flow rate, and calibration state."
              items={attachedNozzles}
              emptyLabel="No nozzles are currently mapped to this dispenser."
            />
            <EventTimeline items={dispenser.events} />
          </div>
          <div className="space-y-6">
            <DetailSection title="Asset specifications" description="Controller, installation, and network information.">
              <PropertyGrid items={[
                { label: "Manufacturer", value: dispenser.manufacturer },
                { label: "Model", value: dispenser.model },
                { label: "Serial number", value: dispenser.serial },
                { label: "Parent tank", value: dispenser.tankId },
                { label: "Products", value: dispenser.products.join(", ") },
                { label: "Firmware", value: dispenser.firmware },
                { label: "Installed", value: dispenser.installedAt },
                { label: "Last heartbeat", value: dispenser.lastHeartbeat },
                { label: "Service due", value: dispenser.serviceDue },
              ]} />
            </DetailSection>
            <DetailSection title="Analysis & reports" description="Investigate transaction, flow, and service patterns.">
              <p className="text-sm leading-6 text-slate-500">Compare transaction activity with nozzle flow and service alerts to help isolate equipment issues.</p>
              <Link href="/dispensers/reports" className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium text-[#17352f] hover:bg-[#f5faf8]">
                Open transaction reports <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </DetailSection>
          </div>
        </section>
      </div>
    </main>
  );
}