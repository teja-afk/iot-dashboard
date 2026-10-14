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
  type EquipmentEvent,
} from "@/components/equipment/equipment-detail";
import type { DispenserAsset, DispenserTransaction, NozzleSummary } from "@/features/equipment/model";

function formatNumber(value: number, unit = ""): string {
  return `${value.toLocaleString()}${unit}`;
}

export default function DispenserDetailPage({
  dispenser,
  nozzles,
  activity,
}: {
  dispenser: DispenserAsset;
  nozzles: NozzleSummary[];
  activity: DispenserTransaction[];
}) {
  const nozzleItems: ChildAsset[] = nozzles.map((nozzle) => ({
    id: nozzle.id,
    name: `Nozzle ${nozzle.nozzleNumber}`,
    href: `/nozzles/${encodeURIComponent(nozzle.id)}`,
    status: "Observed",
    statusTone: "info",
    description: `Nozzle number ${nozzle.nozzleNumber} observed on dispenser telemetry.`,
    metrics: [
      { label: "Records", value: nozzle.transactionCount.toLocaleString() },
      { label: "Volume", value: formatNumber(nozzle.totalVolume, " L") },
      { label: "Amount", value: formatNumber(nozzle.totalAmount) },
    ],
  }));
  const recentEvents: EquipmentEvent[] = activity.slice(0, 8).map((transaction) => ({
    id: transaction.id,
    title: `Nozzle ${transaction.nozzleNumber} telemetry`,
    description: `Volume ${formatNumber(transaction.volume ?? 0, " L")} · amount ${formatNumber(transaction.amount ?? 0)} · receipt ${transaction.receiptNumber}`,
    time: transaction.datetime,
    kind: "info",
  }));

  return (
    <main className="min-h-[calc(100vh-2.75rem)] bg-[#f6f8f7] p-5 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <DetailHeader
          backHref="/dispensers"
          backLabel="dispensers"
          eyebrow="Dispenser inventory"
          title={dispenser.serialNumber}
          id={dispenser.id}
          description={`Retail outlet ${dispenser.retailOutletId} · batch ${dispenser.batchNumber}`}
          status={dispenser.latestTransaction ? "Telemetry recorded" : "No telemetry"}
          statusTone={dispenser.latestTransaction ? "good" : "warning"}
          location={`Retail outlet ${dispenser.retailOutletId}`}
        />

        <DetailMetrics items={[
          { label: "Telemetry records", value: dispenser.transactionCount.toLocaleString(), note: "Records available for this dispenser" },
          { label: "Observed volume", value: formatNumber(dispenser.totalVolume, " L"), note: "Sum of reported volume values" },
          { label: "Observed amount", value: formatNumber(dispenser.totalAmount), note: "Sum of reported amount values" },
          { label: "Observed nozzles", value: String(nozzles.length), note: "Unique nza values in telemetry" },
        ]} />

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <ChildAssetList
              title={`Observed nozzles · ${nozzles.length}`}
              description="Nozzle numbers are derived from telemetry records for this dispenser serial."
              items={nozzleItems}
              emptyLabel="No nozzle numbers have been observed in telemetry for this dispenser."
            />
            {recentEvents.length > 0 ? (
              <EventTimeline items={recentEvents} />
            ) : (
              <DetailSection title="Recent telemetry" description="Latest records from dispensers_telemetry.">
                <p className="text-sm text-slate-500">No telemetry records are available for this dispenser.</p>
              </DetailSection>
            )}
          </div>
          <div className="space-y-6">
            <DetailSection title="Inventory record" description="Fields provided by the dispensers collection.">
              <PropertyGrid items={[
                { label: "Dispenser ID", value: dispenser.id },
                { label: "Serial number", value: dispenser.serialNumber },
                { label: "Retail outlet", value: dispenser.retailOutletId },
                { label: "Batch number", value: dispenser.batchNumber },
                { label: "Customer type", value: dispenser.customerType },
                { label: "Created", value: dispenser.createdAt },
                { label: "Updated", value: dispenser.updatedAt },
                { label: "Latest telemetry", value: dispenser.latestTransaction?.datetime ?? "—" },
              ]} />
            </DetailSection>
            <DetailSection title="Transaction reports" description="Inspect telemetry events and reported transaction values.">
              <p className="text-sm leading-6 text-slate-500">Transaction history is sourced from dispensers_telemetry for the configured retail outlet.</p>
              <Link href="/dispensers/reports" className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium text-[#17352f] hover:bg-[#f5faf8]">
                Open dispenser reports <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </DetailSection>
          </div>
        </section>
      </div>
    </main>
  );
}
