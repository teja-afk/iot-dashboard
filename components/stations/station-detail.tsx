import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StationSelectButton } from "@/components/common/station-select-button";
import { getStationById } from "@/lib/data";

export default async function StationDetailPage({
  params,
}: {
  params: Promise<{ stationId: string }>;
}) {
  const { stationId } = await params;
  const station = await getStationById(stationId);
  if (!station) notFound();

  return (
    <main className="min-h-[calc(100vh-2.75rem)] bg-[#f6f8f7] p-5 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link href="/stations" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#16806c]">
          <span aria-hidden="true" className="size-4">←</span> Back to stations
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-[#17352f]">{station.name}</h1>
              <Badge className={station.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}>
                {station.active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="mt-2 font-mono text-sm text-slate-400">{station.id}</p>
            <p className="mt-2 text-sm text-slate-500">
              Retail outlet: {station.retailOutletId}
            </p>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-4">
          <Card className="gap-0 border-[#dce9e5] py-0">
            <CardHeader className="border-b border-[#edf3f0] py-4">
              <CardTitle className="text-base text-[#17352f]">Location</CardTitle>
            </CardHeader>
            <CardContent className="py-5">
              <p className="text-sm text-slate-500">{station.location}</p>
            </CardContent>
          </Card>
          <Card className="gap-0 border-[#dce9e5] py-0">
            <CardHeader className="border-b border-[#edf3f0] py-4">
              <CardTitle className="text-base text-[#17352f]">Dealer</CardTitle>
            </CardHeader>
            <CardContent className="py-5">
              <p className="text-sm text-slate-500">{station.dealerName}</p>
            </CardContent>
          </Card>
          <Card className="gap-0 border-[#dce9e5] py-0">
            <CardHeader className="border-b border-[#edf3f0] py-4">
              <CardTitle className="text-base text-[#17352f]">Sales area</CardTitle>
            </CardHeader>
            <CardContent className="py-5">
              <p className="text-sm text-slate-500">{station.salesArea}</p>
            </CardContent>
          </Card>
          <Card className="gap-0 border-[#dce9e5] py-0">
            <CardHeader className="border-b border-[#edf3f0] py-4">
              <CardTitle className="text-base text-[#17352f]">Pincode</CardTitle>
            </CardHeader>
            <CardContent className="py-5">
              <p className="text-sm text-slate-500">{station.pincode}</p>
            </CardContent>
          </Card>
        </section>

        <div className="rounded-xl border border-[#dce9e5] bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[#17352f] mb-4">View station dashboard</h2>
          <p className="mb-4 text-sm text-slate-500">
            Switch to this station and view its tank, dispenser, and nozzle data.
          </p>
          <StationSelectButton station={station} />
        </div>
      </div>
    </main>
  );
}
