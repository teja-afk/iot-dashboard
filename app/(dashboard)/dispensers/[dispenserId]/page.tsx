import { notFound } from "next/navigation";
import DispenserDetailPage from "@/features/dispensers/dispenser-detail-page";
import { getDispenserById } from "@/features/dispensers/repository";
import { listNozzlesByDispenserId } from "@/features/nozzles/repository";

export default async function Page({ params }: { params: Promise<{ dispenserId: string }> }) {
  const { dispenserId } = await params;
  const dispenser = await getDispenserById(dispenserId);
  if (!dispenser) notFound();

  const nozzles = await listNozzlesByDispenserId(dispenser.serial);
  return <DispenserDetailPage dispenser={dispenser} nozzles={nozzles} />;
}