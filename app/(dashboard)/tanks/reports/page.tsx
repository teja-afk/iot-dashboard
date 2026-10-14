import TankReportsPage from "@/features/tanks/tank-reports-page";
import { listTankReadings } from "@/features/tanks/repository";

export default async function Page() {
	const readings = await listTankReadings();
	return <TankReportsPage readings={readings} />;
}