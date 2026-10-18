import { notFound } from "next/navigation";
import TankDetailPage from "@/components/tanks/tank-detail";
import { getTankById } from "@/lib/data";
import { getSelectedOutletId } from "@/lib/station-cookie";

export default async function Page({ params }: { params: Promise<{ tankId: string }> }) {
  const { tankId } = await params;
  const outletId = await getSelectedOutletId();
  const tank = await getTankById(tankId, outletId);
  if (!tank) notFound();

  return <TankDetailPage params={params} />;
}
