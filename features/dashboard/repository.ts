import "server-only";

import type { Document } from "mongodb";
import { getMongoDatabase } from "@/lib/mongodb";

interface TankRecord extends Document {
  id?: string;
  tank_serial_no?: string;
  atgProbeStatus?: string;
  retail_outlet_id?: string | number;
}

interface TankTelemetryRecord extends Document {
  retail_outlet?: string | number;
  tank_id?: string;
  datetime?: string | Date;
  dts?: string | Date;
  atg_probe_status?: string;
  fuel_level_liters?: number;
  water_level_liters?: number;
  temperature?: number;
  ullage_liters?: number;
}

interface DispenserRecord extends Document {
  dispenser_serial_no?: string;
  retail_outlet_id?: string | number;
}

interface DispenserTelemetryRecord extends Document {
  retail_outlet?: string | number;
  serial_no?: string;
  nza?: string | number;
  amount?: number;
  volume?: number;
  datetime?: string | Date;
  dts?: string | Date;
}

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
  retailOutletId: string;
  dispensers: { registered: number };
  nozzles: { observed: number };
  transactions: { today: number; yesterday: number; comparison: string };
  health: { percentage: number; tanksReporting: number; totalTanks: number };
  activity: HourlyActivity[];
  alerts: StationAlert[];
  operational: boolean;
};

function parseTimestamp(value: string | Date | undefined): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value;

  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function getComparison(today: number, yesterday: number): string {
  if (yesterday === 0) {
    return today === 0 ? "No transactions recorded yet" : "No transactions recorded yesterday";
  }
  if (today === yesterday) return "Same as yesterday";

  const change = Math.round((Math.abs(today - yesterday) / yesterday) * 100);
  return `${change}% ${today > yesterday ? "above" : "below"} yesterday`;
}

function getOutletId(): string {
  return process.env.MONGODB_RETAIL_OUTLET_ID || "31483";
}

function outletIdValues(outletId: string): Array<string | number> {
  const values: Array<string | number> = [outletId];
  const numericId = Number(outletId);
  if (Number.isSafeInteger(numericId)) values.push(numericId);
  return values;
}

function getTodayBounds(now: Date): { start: Date; end: Date } {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export async function getStationOverview(now = new Date()): Promise<StationOverview> {
  const database = await getMongoDatabase();
  const retailOutletId = getOutletId();
  const outletValues = outletIdValues(retailOutletId);

  const [tanks, tankTelemetry, dispensers, dispenserTelemetry] = await Promise.all([
    database.collection<TankRecord>("tanks")
      .find({ retail_outlet_id: { $in: outletValues } })
      .toArray(),
    database.collection<TankTelemetryRecord>("tank_telemetry")
      .find({ retail_outlet: { $in: outletValues } })
      .sort({ datetime: -1, dts: -1 })
      .toArray(),
    database.collection<DispenserRecord>("dispensers")
      .find({ retail_outlet_id: { $in: outletValues } })
      .toArray(),
    database.collection<DispenserTelemetryRecord>("dispensers_telemetry")
      .find({ retail_outlet: { $in: outletValues } })
      .sort({ datetime: -1, dts: -1 })
      .limit(5000)
      .toArray(),
  ]);

  const latestTankTelemetry = new Map<string, TankTelemetryRecord>();
  for (const reading of tankTelemetry) {
    if (reading.tank_id && !latestTankTelemetry.has(reading.tank_id)) {
      latestTankTelemetry.set(reading.tank_id, reading);
    }
  }

  const { start: todayStart, end: tomorrowStart } = getTodayBounds(now);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const parsedTransactions = dispenserTelemetry.flatMap((record) => {
    const timestamp = parseTimestamp(record.datetime ?? record.dts);
    return timestamp ? [{ record, timestamp }] : [];
  });
  const todayCount = parsedTransactions.filter(({ timestamp }) => timestamp >= todayStart && timestamp < tomorrowStart).length;
  const yesterdayCount = parsedTransactions.filter(({ timestamp }) => timestamp >= yesterdayStart && timestamp < todayStart).length;

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
      count: parsedTransactions.filter(({ timestamp }) => timestamp >= bucketStart && timestamp < bucketEnd).length,
    };
  });

  const observedNozzles = new Set(
    dispenserTelemetry.flatMap((record) =>
      record.serial_no != null && record.nza != null
        ? [`${record.serial_no}:${record.nza}`]
        : [],
    ),
  );
  const alerts: StationAlert[] = [];

  for (const tank of tanks) {
    const tankId = tank.id;
    if (!tankId) continue;
    const reading = latestTankTelemetry.get(tankId);
    const probeStatus = reading?.atg_probe_status ?? tank.atgProbeStatus;

    if (!reading) {
      alerts.push({ id: tankId, equipment: "Tank", issue: "No telemetry received" });
    } else if (probeStatus && probeStatus.toLowerCase() !== "active") {
      alerts.push({ id: tankId, equipment: "Tank", issue: `Probe ${probeStatus}` });
    }
  }

  const tanksReporting = tanks.filter((tank) => tank.id && latestTankTelemetry.has(tank.id)).length;
  const telemetryCoverage = tanks.length === 0 ? 0 : Math.round((tanksReporting / tanks.length) * 1000) / 10;

  return {
    retailOutletId,
    dispensers: { registered: dispensers.length },
    nozzles: { observed: observedNozzles.size },
    transactions: {
      today: todayCount,
      yesterday: yesterdayCount,
      comparison: getComparison(todayCount, yesterdayCount),
    },
    health: {
      percentage: telemetryCoverage,
      tanksReporting,
      totalTanks: tanks.length,
    },
    activity,
    alerts,
    operational: tanks.length > 0 && tanksReporting === tanks.length && alerts.length === 0,
  };
}
