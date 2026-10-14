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
import type { DispenserTransaction, NozzleSummary } from "@/features/equipment/model";

function formatNumber(value: number, unit = ""): string {
  return `${value.toLocaleString()}${unit}`;
}

export default function NozzleDetailPage({
  nozzle,
  transactions,
}: {
  nozzle: NozzleSummary;
  transactions: DispenserTransaction[];
}) {
  const events: EquipmentEvent[] = transactions.slice(0, 10).map((transaction) => ({
    id: transaction.id,
    title: `Telemetry record · ${transaction.receiptNumber}`,
    description: `Volume ${formatNumber(transaction.volume ?? 0, " L")} · amount ${formatNumber(transaction.amount ?? 0)} · unit price ${formatNumber(transaction.unitPrice ?? 0)}`,
    time: transaction.datetime,
    kind: "info",
  }));

  return (
    <main className="min-h-[calc(100vh-2.75rem)] bg-[#f6f8f7] p-5 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <DetailHeader
          backHref={`/dispensers/${encodeURIComponent(nozzle.dispenserSerial)}`}
          backLabel={nozzle.dispenserSerial}
          eyebrow="Telemetry-derived nozzle"
          parentHref={`/dispensers/${encodeURIComponent(nozzle.dispenserSerial)}`}
          parentLabel={`Dispenser ${nozzle.dispenserSerial}`}
          title={`Nozzle ${nozzle.nozzleNumber}`}
          id={nozzle.id}
          description="This nozzle is inferred from the dispenser serial and nza values observed in telemetry."
          status="Observed"
          statusTone="info"
          location={`Dispenser ${nozzle.dispenserSerial}`}
        />

        <DetailMetrics items={[
          { label: "Telemetry records", value: nozzle.transactionCount.toLocaleString(), note: "Records observed for this nozzle" },
          { label: "Reported volume", value: formatNumber(nozzle.totalVolume, " L"), note: "Sum of telemetry volume values" },
          { label: "Reported amount", value: formatNumber(nozzle.totalAmount), note: "Sum of telemetry amount values" },
          { label: "Last activity", value: nozzle.latestTransaction?.datetime ?? "—", note: "Latest matching telemetry record" },
        ]} />

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            {events.length > 0 ? (
              <EventTimeline items={events} />
            ) : (
              <DetailSection title="Nozzle activity" description="Telemetry matching this dispenser and nozzle number.">
                <p className="text-sm text-slate-500">No telemetry events are available for this nozzle.</p>
              </DetailSection>
            )}
          </div>
          <div className="space-y-6">
            <DetailSection title="Observed nozzle identifiers" description="No standalone nozzle inventory collection is configured.">
              <PropertyGrid items={[
                { label: "Dispenser serial", value: nozzle.dispenserSerial },
                { label: "Nozzle number (nza)", value: nozzle.nozzleNumber },
                { label: "Retail outlet", value: transactions[0]?.retailOutletId ?? "—" },
                { label: "Telemetry records", value: nozzle.transactionCount.toLocaleString() },
              ]} />
            </DetailSection>
            <DetailSection title="Nozzle report" description="Review all telemetry records for this dispenser and nozzle pair.">
              <p className="text-sm leading-6 text-slate-500">Nozzle history is derived from the dispensers_telemetry collection.</p>
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
