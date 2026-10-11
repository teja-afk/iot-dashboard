import { notFound } from "next/navigation";
import TankDetailPage from "@/features/tanks/tank-detail-page";
import { getTankById } from "@/features/tanks/repository";
import { listDispensersByTankId } from "@/features/dispensers/repository";

export default async function Page({ params }: { params: Promise<{ tankId: string }> }) {
  const { tankId } = await params;
  const tank = await getTankById(tankId);
  if (!tank) notFound();

  const dispensers = await listDispensersByTankId(tank.id);
  return <TankDetailPage tank={tank} dispensers={dispensers} />;
}