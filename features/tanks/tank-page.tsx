import { EquipmentOverview, type OverviewItem } from "@/components/equipment/equipment-overview";
import { listTanks } from "@/features/tanks/repository";

export default async function TankPage() {
  const tanks = await listTanks();
  const items: OverviewItem[] = tanks.map((tank) => ({
    id: tank.id,
    name: tank.name,
    subtitle: `${tank.product} · ${tank.location ?? "Location not provided"}`,
    href: `/tanks/${encodeURIComponent(tank.id)}`,
    status: tank.status,
    statusTone: tank.status === "Healthy" ? "good" : tank.status === "Low level" ? "warning" : "critical",
    icon: "tank",
    progress: tank.levelPercent,
    progressLabel: tank.product === "CNG" ? "Available gas" : "Fuel level",
    metrics: [
      { label: "Volume", value: tank.level },
      { label: "Capacity", value: tank.capacity },
      { label: "Temperature", value: tank.temperature ?? "—" },
      { label: "Last delivery", value: tank.lastDelivery ?? "—" },
    ],
  }));

  return (
    <EquipmentOverview
      title="Tank overview"
      description="A quick operational glance across every tank. Open a tank for sensor, maintenance, and connected dispenser details."
      searchPlaceholder="Search tank ID, product, or location"
      items={items}
      reportsHref="/tanks/reports"
    />
  );
}