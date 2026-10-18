import { getSelectedOutletId } from "@/lib/station-cookie";
import { getStationOverview } from "@/lib/data";
import { DashboardPage as DashboardContent } from "@/components/dashboard/dashboard-page";

export const dynamic = "force-dynamic";

export default async function Page() {
  const outletId = await getSelectedOutletId();
  const overview = await getStationOverview(outletId);
  return <DashboardContent overview={overview} />;
}
