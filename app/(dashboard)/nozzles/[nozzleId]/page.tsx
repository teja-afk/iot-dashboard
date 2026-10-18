import { notFound } from "next/navigation";
import NozzleDetailPage from "@/components/nozzles/nozzle-detail";
import { getNozzleById } from "@/lib/data";
import { getSelectedOutletId } from "@/lib/station-cookie";

export default async function Page({ params }: { params: Promise<{ nozzleId: string }> }) {
  const { nozzleId } = await params;
  const outletId = await getSelectedOutletId();
  const nozzle = await getNozzleById(nozzleId, outletId);
  if (!nozzle) notFound();

  return <NozzleDetailPage params={params} />;
}
