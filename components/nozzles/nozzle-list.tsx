import { AssetList } from "@/components/common/asset-list";
import { listNozzles } from "@/lib/data";
import { getSelectedOutletId } from "@/lib/station-cookie";
import type { OverviewItem } from "@/types";

export default async function NozzleListPage() {
  const outletId = await getSelectedOutletId();
  const nozzles = await listNozzles(outletId);

  const items: OverviewItem[] = nozzles.map((nozzle) => ({
    id: nozzle.id,
    name: `Nozzle ${nozzle.nozzleNumber}`,
    subtitle: `Observed on dispenser ${nozzle.dispenserSerial}`,
    href: `/nozzles/${encodeURIComponent(nozzle.id)}`,
    status: "Observed",
    statusTone: "good",
    icon: "nozzle",
    metrics: [
      { label: "Telemetry records", value: nozzle.transactionCount.toLocaleString() },
      { label: "Recorded volume", value: `${nozzle.totalVolume.toLocaleString()} L` },
      { label: "Recorded amount", value: nozzle.totalAmount.toLocaleString() },
      { label: "Last activity", value: nozzle.latestTransaction?.datetime ?? "—" },
    ],
  }));

  return (
    <AssetList
      title="Nozzle overview"
      description="Nozzles are derived from unique dispenser and nozzle pairs seen in dispenser telemetry."
      searchPlaceholder="Search dispenser serial or nozzle number"
      items={items}
      reportsHref="/nozzles/reports"
      statusSummaryLabel="observed"
    />
  );
}
