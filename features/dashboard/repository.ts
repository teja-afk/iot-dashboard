import "server-only";

import type { Station } from "@/features/data";
import { listDispensers, listTransactions } from "@/features/dispensers/repository";
import { listNozzles } from "@/features/nozzles/repository";
import { getStationById } from "@/features/stations/repository";
import { listTanks } from "@/features/tanks/repository";

export type StationAlert = {
  id: string;
  equipment: string;
  issue: string;
};

export type HourlyActivity = {
  label: string;
  count: number;
};

export type StationOverview = {
  station: Station | undefined;
  dispensers: { connected: number; total: number };
  nozzles: { active: number; total: number; productCount: number };
  transactions: { today: number; yesterday: number; comparison: string };
  health: { percentage: number; healthy: number; total: number };
  activity: HourlyActivity[];
  alerts: StationAlert[];
  operational: boolean;
};

function parseTimestamp(timestamp: string): Date | undefined {
  const legacyTimestamp = /^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/.exec(timestamp);
  const date = legacyTimestamp
    ? new Date(
        Number(legacyTimestamp[3]),
        Number(legacyTimestamp[2]) - 1,
        Number(legacyTimestamp[1]),
        Number(legacyTimestamp[4]),
        Number(legacyTimestamp[5]),
        Number(legacyTimestamp[6]),
      )
    : new Date(timestamp);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

function getComparison(today: number, yesterday: number): string {
  if (yesterday === 0) {
    return today === 0 ? "No transactions recorded yet" : "No transactions recorded yesterday";
  }

  if (today === yesterday) return "Same as yesterday";

  const change = Math.round(Math.abs((today - yesterday) / yesterday) * 100);
  return `${change}% ${today > yesterday ? "above" : "below"} yesterday`;
}

export async function getStationOverview(now = new Date()): Promise<StationOverview> {
  const stationId = process.env.MONGODB_STATION_ID || "STATION-001";
  const [station, dispensers, nozzles, tanks, transactions] = await Promise.all([
    getStationById(stationId),
    listDispensers(),
    listNozzles(),
    listTanks(),
    listTransactions(),
  ]);

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const nextDayStart = new Date(todayStart);
  nextDayStart.setDate(nextDayStart.getDate() + 1);

  const timestamps = transactions.flatMap((transaction) => {
    const date = parseTimestamp(transaction.timestamp);
    return date ? [{ transaction, date }] : [];
  });
  const todayCount = timestamps.filter(({ date }) => date >= todayStart && date < nextDayStart).length;
  const yesterdayCount = timestamps.filter(({ date }) => date >= yesterdayStart && date < todayStart).length;

  const firstHour = new Date(now);
  firstHour.setMinutes(0, 0, 0);
  firstHour.setHours(firstHour.getHours() - 11);
  const activity: HourlyActivity[] = Array.from({ length: 12 }, (_, index) => {
    const bucketStart = new Date(firstHour);
    bucketStart.setHours(firstHour.getHours() + index);
    const bucketEnd = new Date(bucketStart);
    bucketEnd.setHours(bucketEnd.getHours() + 1);

    return {
      label: `${String(bucketStart.getHours()).padStart(2, "0")}h`,
      count: timestamps.filter(({ date }) => date >= bucketStart && date < bucketEnd).length,
    };
  });

  const connectedDispensers = dispensers.filter((dispenser) => dispenser.status === "Online").length;
  const activeNozzles = nozzles.filter((nozzle) => nozzle.status === "Ready" || nozzle.status === "In use");
  const healthyTanks = tanks.filter((tank) => tank.status === "Healthy").length;
  const healthyEquipment = connectedDispensers + activeNozzles.length + healthyTanks;
  const totalEquipment = dispensers.length + nozzles.length + tanks.length;

  const alerts: StationAlert[] = [
    ...(station?.status === "Maintenance"
      ? [{ id: station.id, equipment: "Station", issue: station.status }]
      : []),
    ...nozzles
      .filter((nozzle) => nozzle.status === "Service due")
      .map((nozzle) => ({ id: nozzle.id, equipment: "Nozzle", issue: nozzle.calibrationDue })),
    ...dispensers
      .filter((dispenser) => dispenser.status !== "Online")
      .map((dispenser) => ({ id: dispenser.serial, equipment: "Dispenser", issue: dispenser.status })),
    ...tanks
      .filter((tank) => tank.status !== "Healthy")
      .map((tank) => ({ id: tank.id, equipment: "Tank", issue: tank.status })),
  ];

  const activeProducts = new Set(activeNozzles.map((nozzle) => nozzle.product));
  const operational = station?.status !== "Maintenance" && alerts.length === 0;

  return {
    station,
    dispensers: { connected: connectedDispensers, total: dispensers.length },
    nozzles: { active: activeNozzles.length, total: nozzles.length, productCount: activeProducts.size },
    transactions: {
      today: todayCount,
      yesterday: yesterdayCount,
      comparison: getComparison(todayCount, yesterdayCount),
    },
    health: {
      percentage: totalEquipment === 0 ? 0 : Math.round((healthyEquipment / totalEquipment) * 1000) / 10,
      healthy: healthyEquipment,
      total: totalEquipment,
    },
    activity,
    alerts,
    operational,
  };
}
