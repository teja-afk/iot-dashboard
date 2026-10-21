import { AssetList } from "@/components/common/asset-list";
import { TankLevelGraphic } from "@/components/tanks/tank-level-graphic";
import { listTanks } from "@/lib/data";
import { getSelectedOutletId } from "@/lib/station-cookie";
import type { OverviewItem } from "@/types";

export default async function TankListPage() {
  const outletId = await getSelectedOutletId();
  const tanks = await listTanks(outletId);

  const items: OverviewItem[] = tanks.map((tank) => ({
    id: tank.id,
    name: tank.serialNumber === "—" ? `Tank ${tank.id}` : tank.serialNumber,
    subtitle: `Retail outlet ${tank.retailOutletId} · ${tank.height ?? "—"} × ${tank.width ?? "—"} mm`,
    href: `/tanks/${encodeURIComponent(tank.id)}`,
    status: tank.probeStatus,
    statusTone: tank.probeStatus.toLowerCase() === "active" ? "good" : "warning",
    visual: (
      <TankLevelGraphic
        id={tank.id}
        fuelLevelLiters={tank.latestReading?.fuelLevelLiters ?? null}
        waterLevelLiters={tank.latestReading?.waterLevelLiters ?? null}
        size="compact"
      />
    ),
    metrics: [
      { label: "Fuel", value: tank.latestReading?.fuelLevelLiters == null ? "—" : `${tank.latestReading.fuelLevelLiters.toLocaleString()} L` },
      { label: "Water", value: tank.latestReading?.waterLevelLiters == null ? "—" : `${tank.latestReading.waterLevelLiters.toLocaleString()} L` },
      { label: "Temperature", value: tank.latestReading?.temperature == null ? "—" : `${tank.latestReading.temperature}°` },
      { label: "Last reading", value: tank.latestReading?.datetime ?? "No telemetry" },
    ],
  }));

  return (
    <AssetList
      title="Tank overview"
      description="Current tank inventory, probe status, and latest reported fuel, water, temperature, and ullage readings."
      searchPlaceholder="Search tank ID, serial, probe status, or reading"
      items={items}
      reportsHref="/tanks/reports"
      statusSummaryLabel="probes active"
      columns={4}
    />
  );
}
