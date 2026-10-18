import { TankReports } from "@/components/tanks/tank-reports";
import { listTankReadings } from "@/lib/data";
import { getSelectedOutletId } from "@/lib/station-cookie";

export default async function Page() {
  const outletId = await getSelectedOutletId();
  const readings = await listTankReadings(undefined, outletId);
  return <TankReports readings={readings} />;
}
