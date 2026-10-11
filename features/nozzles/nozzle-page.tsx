import { EquipmentOverview, type OverviewItem } from "@/components/equipment/equipment-overview";
import { listNozzles } from "@/features/nozzles/repository";

export default async function NozzlePage() {
  const nozzles = await listNozzles();
  const items: OverviewItem[] = nozzles.map((nozzle) => ({
    id: nozzle.id,
    name: `${nozzle.id} · ${nozzle.product}`,
    subtitle: `Attached to ${nozzle.dispenser}`,
    href: `/nozzles/${encodeURIComponent(nozzle.id)}`,
    status: nozzle.status,
    statusTone: nozzle.status === "Ready" ? "good" : nozzle.status === "In use" ? "info" : "warning",
    icon: "nozzle",
    metrics: [
      { label: "Flow rate", value: nozzle.flowRate },
      { label: "Total volume", value: nozzle.totalVolume },
      { label: "Transactions", value: String(nozzle.transactions) },
      { label: "Calibration due", value: nozzle.calibrationDue },
    ],
  }));

  return (
    <EquipmentOverview
      title="Nozzle overview"
      description="Scan nozzle readiness, flow, and calibration at a glance. Open a nozzle to review meter information and service history."
      searchPlaceholder="Search nozzle ID, product, or dispenser"
      items={items}
      reportsHref="/nozzles/reports"
    />
  );
}