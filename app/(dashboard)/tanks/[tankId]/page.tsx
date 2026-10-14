import { notFound } from "next/navigation";
import TankDetailPage from "@/features/tanks/tank-detail-page";
import { getTankById, listTankReadings } from "@/features/tanks/repository";

export default async function Page({ params }: { params: Promise<{ tankId: string }> }) {
  const { tankId } = await params;
  const [tank, readings] = await Promise.all([
    getTankById(tankId),
    listTankReadings(tankId),
  ]);
  if (!tank) notFound();

  return <TankDetailPage tank={tank} readings={readings} />;
}