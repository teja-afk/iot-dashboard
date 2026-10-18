import { notFound } from "next/navigation";
import DispenserDetailPage from "@/components/dispensers/dispenser-detail";
import { getDispenserBySerial } from "@/lib/data";
import { getSelectedOutletId } from "@/lib/station-cookie";

export default async function Page({
  params,
}: { params: Promise<{ dispenserId: string }> }) {
  const { dispenserId } = await params;
  const outletId = await getSelectedOutletId();
  const dispenser = await getDispenserBySerial(dispenserId, outletId);
  if (!dispenser) notFound();

  return <DispenserDetailPage params={params} />;
}
