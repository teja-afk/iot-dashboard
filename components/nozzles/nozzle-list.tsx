import { AssetList } from "@/components/common/asset-list";
import { listNozzles } from "@/lib/data";
import { getSelectedOutletId } from "@/lib/station-cookie";
import { Badge } from "@/components/ui/badge";
import type { OverviewItem } from "@/types";
import { getFuelColor } from "@/lib/fuel-colors";

export default async function NozzleListPage() {
  const outletId = await getSelectedOutletId();
  const nozzles = await listNozzles(outletId);

  const items: OverviewItem[] = nozzles.map((nozzle) => {
    const fuel = getFuelColor(nozzle.product);
    return {
      id: nozzle.id,
      name: `Nozzle ${nozzle.nozzleNumber}`,
      subtitle: `Observed on dispenser ${nozzle.dispenserSerial}`,
      href: `/nozzles/${encodeURIComponent(nozzle.id)}`,
      status: "Observed",
      statusTone: "good",
      icon: "nozzle",
      visual: nozzle.product ? (
        <Badge className={`${fuel.bg} ${fuel.text} border ${fuel.ring} inline-flex w-fit items-center gap-1.5`}>
          <span className={`size-2 rounded-full ${fuel.dot}`} aria-hidden="true" />
          {nozzle.product}
        </Badge>
      ) : undefined,
      metrics: [
        { label: "Telemetry records", value: nozzle.transactionCount.toLocaleString() },
        { label: "Recorded volume", value: `${nozzle.totalVolume.toLocaleString()} L` },
        { label: "Recorded amount", value: nozzle.totalAmount.toLocaleString() },
        { label: "Last activity", value: nozzle.latestTransaction?.datetime ?? "—" },
      ],
    };
  });

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
