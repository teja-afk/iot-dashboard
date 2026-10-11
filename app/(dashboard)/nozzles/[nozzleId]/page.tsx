import { notFound } from "next/navigation";
import NozzleDetailPage from "@/features/nozzles/nozzle-detail-page";
import { getNozzleById } from "@/features/nozzles/repository";

export default async function Page({ params }: { params: Promise<{ nozzleId: string }> }) {
  const { nozzleId } = await params;
  const nozzle = await getNozzleById(nozzleId);
  if (!nozzle) notFound();

  return <NozzleDetailPage nozzle={nozzle} />;
}