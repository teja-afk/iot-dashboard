import { AssetList } from "@/components/common/asset-list";
import { listDispensers } from "@/lib/data";
import { getSelectedOutletId } from "@/lib/station-cookie";
import type { OverviewItem } from "@/types";

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
