import { EquipmentOverview, type OverviewItem } from "@/components/equipment/equipment-overview";
import { listDispensers } from "@/features/dispensers/repository";

export default async function DispenserPage() {
  const dispensers = await listDispensers();
  const items: OverviewItem[] = dispensers.map((dispenser) => ({
      id: dispenser.serial,
      name: dispenser.name,
      subtitle: `${dispenser.location} · ${dispenser.tankId}`,
      href: `/dispensers/${encodeURIComponent(dispenser.serial)}`,
      status: dispenser.status,
      statusTone: dispenser.status === "Online" ? "good" : "warning",
      icon: "dispenser",
      metrics: [
        { label: "Nozzles", value: `${dispenser.nozzles} attached` },
        { label: "Products", value: dispenser.products.join(" / ") },
        { label: "Today's volume", value: dispenser.volume },
        { label: "Transactions", value: String(dispenser.transactions) },
      ],
    }));

  return (
    <EquipmentOverview
      title="Dispenser overview"
      description="Quickly compare dispenser status, products, and activity. Open a unit for diagnostics and its attached nozzles."
      searchPlaceholder="Search dispenser ID, product, or location"
      items={items}
      reportsHref="/dispensers/reports"
    />
  );
}