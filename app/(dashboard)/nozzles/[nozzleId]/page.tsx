import { notFound } from "next/navigation";
import NozzleDetailPage from "@/features/nozzles/nozzle-detail-page";
import { getNozzleById } from "@/features/nozzles/repository";
import { listTransactions } from "@/features/dispensers/repository";

export default async function Page({ params }: { params: Promise<{ nozzleId: string }> }) {
  const { nozzleId } = await params;
  const nozzle = await getNozzleById(nozzleId);
  if (!nozzle) notFound();

  const transactions = (await listTransactions(nozzle.dispenserSerial)).filter(
    (transaction) => transaction.nozzleNumber === nozzle.nozzleNumber,
  );
  return <NozzleDetailPage nozzle={nozzle} transactions={transactions} />;
}