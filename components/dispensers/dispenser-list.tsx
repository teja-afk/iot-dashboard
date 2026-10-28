import { AssetList } from "@/components/common/asset-list";
import { listDispensers } from "@/lib/data";
import { getSelectedOutletId } from "@/lib/station-cookie";
import type { OverviewItem } from "@/types";
import { getFuelColor } from "@/lib/fuel-colors";

export default async function DispenserListPage() {
  const outletId = await getSelectedOutletId();
  const dispensers = await listDispensers(outletId);

  const items: OverviewItem[] = dispensers.map((dispenser) => ({
    id: dispenser.serialNumber,
    name: dispenser.serialNumber,
    subtitle: `Retail outlet ${dispenser.retailOutletId} · batch ${dispenser.batchNumber}`,
    href: `/dispensers/${encodeURIComponent(dispenser.serialNumber)}`,
    status: dispenser.latestTransaction ? "Telemetry recorded" : "No telemetry",
    statusTone: dispenser.latestTransaction ? "good" : "warning",
    icon: "dispenser",
    visual: dispenser.nozzles.length > 0 ? (
      <div>
        <p className="mb-1.5 text-[11px] uppercase tracking-wide text-slate-400">Observed nozzles</p>
        <div className="flex flex-wrap items-center gap-1.5">
          {dispenser.nozzles.map((nozzle) => {
            const fuel = getFuelColor(nozzle.product);
            return (
              <span
                key={nozzle.id}
                className={`inline-flex items-center gap-1 rounded-md border ${fuel.ring} ${fuel.bg} ${fuel.text} px-2 py-0.5 text-xs font-medium`}
              >
                <span className={`size-2 rounded-full ${fuel.dot}`} aria-hidden="true" />
                Nozzle {nozzle.nozzleNumber}
              </span>
            );
          })}
        </div>
      </div>
    ) : undefined,
    metrics: [
      { label: "Observed nozzles", value: String(dispenser.nozzles.length) },
      { label: "Telemetry records", value: dispenser.transactionCount.toLocaleString() },
      { label: "Recorded volume", value: `${dispenser.totalVolume.toLocaleString()} L` },
      { label: "Latest record", value: dispenser.latestTransaction?.datetime ?? "—" },
    ],
  }));

  return (
    <AssetList
      title="Dispenser overview"
      description="Dispenser inventory and activity calculated from dispenser telemetry."
      searchPlaceholder="Search dispenser serial, outlet, or batch"
      items={items}
      reportsHref="/dispensers/reports"
      statusSummaryLabel="with telemetry"
    />
  );
}
