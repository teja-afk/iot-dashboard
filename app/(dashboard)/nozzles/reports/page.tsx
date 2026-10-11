import NozzleReportsPage from "@/features/nozzles/nozzle-reports-page";
import { listNozzles } from "@/features/nozzles/repository";

export default async function Page() {
	const nozzles = await listNozzles();
	return <NozzleReportsPage nozzles={nozzles} />;
}
