import { NextResponse } from "next/server";
import { getMongoDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getMongoDatabase();
    
    const { listNozzles } = await import("@/features/nozzles/repository");
    const { getStationOverview } = await import("@/features/dashboard/repository");
    const { listDispensers } = await import("@/features/dispensers/repository");

    const nozzles = await listNozzles();
    const stationOverview = await getStationOverview();
    const dispensers = await listDispensers();

    return NextResponse.json({
      nozzles,
      dispensersCount: dispensers.length,
      dispensersWithNozzles: dispensers.map(d => ({
        id: d.id,
        serialNumber: d.serialNumber,
        nozzles: d.nozzles,
        transactionCount: d.transactionCount,
      })),
      stationOverviewNozzles: stationOverview.nozzles,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
