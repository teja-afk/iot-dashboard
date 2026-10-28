import { getSelectedOutletId } from "@/lib/station-cookie";
import { getStationAnalytics } from "@/lib/data";
import { DashboardPage as DashboardContent } from "@/components/dashboard/dashboard-page";
import type { DateRangePreset } from "@/types";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; start?: string; end?: string }>;
}) {
  const { range, start, end } = await searchParams;
  const outletId = await getSelectedOutletId();
  const analytics = await getStationAnalytics(
    outletId,
    (range ?? "alltime") as DateRangePreset,
    start,
    end,
  );
  return <DashboardContent analytics={analytics} />;
}