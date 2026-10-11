import DispenserReportsPage from "@/features/dispensers/dispenser-reports-page";
import { listTransactions } from "@/features/dispensers/repository";

export default async function Page() {
	const transactions = await listTransactions();
	return <DispenserReportsPage transactions={transactions} />;
}
