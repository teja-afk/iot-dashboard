import { notFound } from "next/navigation";
import StationDetailPage from "@/components/stations/station-detail";
import { getStationById } from "@/lib/data";

export default async function Page({
  params,
}: { params: Promise<{ stationId: string }> }) {
  const { stationId } = await params;
  const station = await getStationById(stationId);
  if (!station) notFound();

  return <StationDetailPage params={params} />;
}
