import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  DetailHeader,
  DetailMetrics,
  DetailSection,
  EventTimeline,
  PropertyGrid,
} from "@/components/equipment/equipment-detail";
import type { Nozzle } from "@/features/data";

export default function NozzleDetailPage({ nozzle }: { nozzle: Nozzle }) {
  const statusTone = nozzle.status === "Ready" ? "good" : nozzle.status === "In use" ? "info" : "warning";

  return (
    <main className="min-h-[calc(100vh-2.75rem)] bg-[#f6f8f7] p-5 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <DetailHeader
          backHref={`/dispensers/${encodeURIComponent(nozzle.dispenser)}`}
          backLabel={nozzle.dispenser}
          eyebrow={`Nozzle / ${nozzle.product}`}
          parentHref={`/dispensers/${encodeURIComponent(nozzle.dispenser)}`}
          parentLabel={`Dispenser ${nozzle.dispenser}`}
          title={`${nozzle.id} · ${nozzle.product}`}
          id={nozzle.meterSerial}
          description={`${nozzle.model} · attached to dispenser ${nozzle.dispenser}`}
          status={nozzle.status}
          statusTone={statusTone}
          location={`Dispenser ${nozzle.dispenser}`}
        />

        <DetailMetrics items={[
          { label: "Current flow", value: nozzle.flowRate, note: `Maximum ${nozzle.maxFlowRate}`, tone: nozzle.status === "Service due" ? "warning" : "good" },
          { label: "Meter totalizer", value: nozzle.totalVolume, note: `${nozzle.transactions} recorded transactions` },
          { label: "Calibration", value: nozzle.lastCalibration, note: `Due ${nozzle.calibrationDue}`, tone: nozzle.calibrationDue.startsWith("Overdue") ? "warning" : "good" },
          { label: "Last maintenance", value: nozzle.lastMaintenance, note: "Maintenance record" },
        ]} />

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <DetailSection title="Metering & performance" description="Operational readings for analysis and service triage.">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl bg-[#f5faf8] p-5">
                  <p className="text-xs font-medium text-slate-500">Current flow vs. rated maximum</p>
                  <p className="mt-2 text-2xl font-semibold text-[#17352f]">{nozzle.flowRate}</p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-[#16806c]" style={{ width: `${Math.min(100, (Number.parseFloat(nozzle.flowRate) / Number.parseFloat(nozzle.maxFlowRate)) * 100)}%` }} /></div>
                  <p className="mt-2 text-xs text-slate-400">Rated maximum {nozzle.maxFlowRate}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#edf3f0] p-4"><p className="text-xs text-slate-500">Totalized volume</p><p className="mt-2 text-lg font-semibold text-[#17352f]">{nozzle.totalVolume}</p></div>
                  <div className="rounded-xl border border-[#edf3f0] p-4"><p className="text-xs text-slate-500">Transactions</p><p className="mt-2 text-lg font-semibold text-[#17352f]">{nozzle.transactions}</p></div>
                  <div className="rounded-xl border border-[#edf3f0] p-4"><p className="text-xs text-slate-500">Product</p><p className="mt-2 text-lg font-semibold text-[#17352f]">{nozzle.product}</p></div>
                  <div className="rounded-xl border border-[#edf3f0] p-4"><p className="text-xs text-slate-500">Readiness</p><p className="mt-2 text-lg font-semibold text-[#17352f]">{nozzle.status}</p></div>
                </div>
              </div>
            </DetailSection>
            <EventTimeline items={nozzle.events} />
          </div>
          <div className="space-y-6">
            <DetailSection title="Asset specifications" description="Meter, firmware, and service configuration.">
              <PropertyGrid items={[
                { label: "Nozzle ID", value: nozzle.id },
                { label: "Meter serial", value: nozzle.meterSerial },
                { label: "Manufacturer", value: nozzle.model.includes("CNG") ? "Lanfeng Energy" : "OPW" },
                { label: "Model", value: nozzle.model },
                { label: "Dispenser", value: nozzle.dispenser },
                { label: "Product", value: nozzle.product },
                { label: "Firmware", value: nozzle.firmware },
                { label: "Installed", value: nozzle.installedAt },
                { label: "Last maintenance", value: nozzle.lastMaintenance },
                { label: "Last calibration", value: nozzle.lastCalibration },
                { label: "Calibration due", value: nozzle.calibrationDue },
                { label: "Maximum flow", value: nozzle.maxFlowRate },
              ]} />
            </DetailSection>
            <DetailSection title="Analysis & reports" description="Use historical records to troubleshoot performance changes.">
              <p className="text-sm leading-6 text-slate-500">Review flow and calibration history alongside dispenser transactions before raising a maintenance action.</p>
              <Link href="/nozzles/reports" className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium text-[#17352f] hover:bg-[#f5faf8]">
                Open nozzle reports <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </DetailSection>
          </div>
        </section>
      </div>
    </main>
  );
}