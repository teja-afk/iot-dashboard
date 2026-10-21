import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getSelectedOutletId } from "@/lib/station-cookie";
import {
  countDispensers,
  countNozzles,
  countStations,
  countTanks,
  getStationByOutletId,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const outletId = await getSelectedOutletId();
  const [stationCount, currentStation, tankCount, dispenserCount, nozzleCount] =
    await Promise.all([
      countStations(),
      outletId ? getStationByOutletId(outletId) : Promise.resolve(undefined),
      countTanks(outletId),
      countDispensers(outletId),
      countNozzles(outletId),
    ]);

  return (
    <SidebarProvider>
      <AppSidebar
        stationCount={stationCount}
        tankCount={tankCount}
        dispenserCount={dispenserCount}
        nozzleCount={nozzleCount}
      />
      <main className="min-w-0 flex-1">
        <DashboardHeader
          currentStation={
            currentStation
              ? {
                  id: currentStation.id,
                  name: currentStation.name,
                  retailOutletId: currentStation.retailOutletId,
                }
              : undefined
          }
        />
        {children}
      </main>
    </SidebarProvider>
  );
}
