import TankReportsPage from "@/features/tanks/tank-reports-page";
import { listTanks } from "@/features/tanks/repository";

export default async function Page() {
	const tanks = await listTanks();
	return <TankReportsPage tanks={tanks} />;
}
