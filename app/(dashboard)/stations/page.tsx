import { listStations } from "@/lib/data";
import StationListPage from "@/components/stations/station-list";

export default async function Page() {
  const stations = await listStations();
  return <StationListPage stations={stations} />;
}
