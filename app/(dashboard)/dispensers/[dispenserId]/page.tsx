import { notFound } from "next/navigation";
import DispenserDetailPage from "@/features/dispensers/dispenser-detail-page";
import { getDispenserById } from "@/features/dispensers/repository";
import { listNozzlesByDispenserId } from "@/features/nozzles/repository";
import { listTransactions } from "@/features/dispensers/repository";

export default async function Page({ params }: { params: Promise<{ dispenserId: string }> }) {
  const { dispenserId } = await params;
  const [dispenser, nozzles, activity] = await Promise.all([
    getDispenserById(dispenserId),
    listNozzlesByDispenserId(dispenserId),
    listTransactions(dispenserId),
  ]);
  if (!dispenser) notFound();

  return <DispenserDetailPage dispenser={dispenser} nozzles={nozzles} activity={activity} />;
}