import { NozzleReports } from "@/components/nozzles/nozzle-reports";
import { listNozzles } from "@/lib/data";
import { getSelectedOutletId } from "@/lib/station-cookie";

export default async function Page() {
  const outletId = await getSelectedOutletId();
  const nozzles = await listNozzles(outletId);
  return <NozzleReports nozzles={nozzles} />;
}
