import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { countDispensers, countNozzles, countStations, countTanks, listStations } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [stations, stationCount] = await Promise.all([
    listStations(),
    countStations(),
  ]);
  const stationOptions = stations.map((s) => ({
    id: s.id,
    name: s.name,
    retailOutletId: s.retailOutletId,
  }));
  const [tankCount, dispenserCount, nozzleCount] = await Promise.all([
    countTanks(),
    countDispensers(),
    countNozzles(),
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
        <DashboardHeader stations={stationOptions} />
        {children}
      </main>
    </SidebarProvider>
  );
}
