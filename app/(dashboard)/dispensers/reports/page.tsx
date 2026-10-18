import { DispenserReports } from "@/components/dispensers/dispenser-reports";
import { listDispenserTransactions } from "@/lib/data";
import { getSelectedOutletId } from "@/lib/station-cookie";

export default async function Page() {
  const outletId = await getSelectedOutletId();
  const transactions = await listDispenserTransactions(undefined, outletId);
  return <DispenserReports transactions={transactions} />;
}
