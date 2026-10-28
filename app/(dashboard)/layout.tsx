import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getSelectedOutletId } from "@/lib/station-cookie";
import { getCurrentSession } from "@/lib/auth-actions";
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
  const session = await getCurrentSession();
  const [stationCount, currentStation, tankCount, dispenserCount, nozzleCount] =
    await Promise.all([
      countStations(),
      outletId ? getStationByOutletId(outletId) : Promise.resolve(undefined),
      countTanks(outletId),
      countDispensers(outletId),
      countNozzles(outletId),
    ]);

  const user = session
    ? { name: session.username, email: `${session.username}@station.local`, avatar: "/avatars/shadcn.jpg" }
    : { name: "Service Engineer", email: "m@example.com", avatar: "/avatars/shadcn.jpg" };

  return (
    <SidebarProvider>
      <AppSidebar
        stationCount={stationCount}
        tankCount={tankCount}
        dispenserCount={dispenserCount}
        nozzleCount={nozzleCount}
        user={user}
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
