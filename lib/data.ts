import "server-only";

import type { Document, Filter } from "mongodb";
import { getMongoDatabase } from "@/lib/mongodb";
import type {
  DispenserAsset,
  DispenserTransaction,
  NozzleSummary,
  OutletId,
  StationAlert,
  StationId,
  StationRecord,
  StationOverview,
  TankAsset,
  TankId,
  TankTelemetry,
} from "@/types";
import { dispenserId, nozzleId, outletId, stationId, tankId } from "@/types";

const DEFAULT_OUTLET_ID: OutletId = outletId(
  process.env.MONGODB_RETAIL_OUTLET_ID || "31483",
);

interface TankDocument extends Document {
  id?: string | number;
  retail_outlet_id?: string | number;
  tank_serial_no?: string | number;
  atgProbeStatus?: string;
  height?: number;
  width?: number;
  cust_type?: string | number;
  ef?: string | Date;
  et?: string | Date;
}

interface TankTelemetryDocument extends Document {
  retail_outlet?: string | number;
  tank_id?: string | number;
  datetime?: string | Date;
  dts?: string | Date;
  atg_probe_status?: string;
  fuel_level_liters?: number;
  water_level_mm?: number;
  water_level_liters?: number;
  temperature?: number;
  density?: number;
  ullage_liters?: number;
}

interface DispenserDocument extends Document {
  id?: string | number;
  retail_outlet_id?: string | number;
  dispenser_serial_no?: string | number;
  batch_no?: string | number;
  cust_type?: string | number;
  logged_user_id?: string | number;
  ef?: string | Date;
  et?: string | Date;
}

interface DispenserTelemetryDocument extends Document {
  retail_outlet?: string | number;
  serial_no?: string | number;
  du_sr_no?: string | number;
  nza?: string | number;
  amount?: number;
  volume?: number;
  unit_price?: number;
  receipt_no?: string | number;
  local_id?: string | number;
  datetime?: string | Date;
  dts?: string | Date;
  amount_totalizer?: string | number;
  volume_totalizer?: string | number;
}

interface StationDocument extends Document {
  id?: string | number;
  name?: string;
  state_office?: string;
  divisional_office?: string;
  sales_area?: string;
  dealer_ro_name?: string;
  location?: string;
  pincode?: string;
  activeStatus?: number | boolean;
  retail_outlet_id?: string | number;
}

const MAX_TELEMETRY_RECORDS = 10_000;

function resolveOutletId(input?: OutletId | string): OutletId {
  return input ? outletId(input as string) : DEFAULT_OUTLET_ID;
}

function outletIdValues(input: OutletId | string): Array<string | number> {
  const values: Array<string | number> = [input];
  const numericId = Number(input);
  if (Number.isSafeInteger(numericId)) values.push(numericId);
  return values;
}

function outletFilter(
  field: "retail_outlet_id" | "retail_outlet",
  input?: OutletId | string,
): Filter<Document> {
  return { [field]: { $in: outletIdValues(resolveOutletId(input)) } };
}

function text(value: unknown, fallback = "—"): string {
  return value === undefined || value === null || value === "" ? fallback : String(value);
}

function numberOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function dateText(value: string | Date | undefined): string {
  if (!value) return "—";
  if (value instanceof Date) return value.toISOString();
  return value;
}

function mapTankReading(document: TankTelemetryDocument): TankTelemetry {
  const timestamp = dateText(document.datetime ?? document.dts);
  return {
    id: `${text(document.tank_id)}:${timestamp}`,
    tankId: text(document.tank_id),
    datetime: timestamp,
    atgProbeStatus: text(document.atg_probe_status, "Unknown"),
    fuelLevelLiters: numberOrNull(document.fuel_level_liters),
    waterLevelMm: numberOrNull(document.water_level_mm),
    waterLevelLiters: numberOrNull(document.water_level_liters),
    temperature: numberOrNull(document.temperature),
    density: numberOrNull(document.density),
    ullageLiters: numberOrNull(document.ullage_liters),
  };
}

function mapTransaction(document: DispenserTelemetryDocument): DispenserTransaction {
  const serial = text(document.serial_no || document.du_sr_no, "Unknown dispenser");
  const nozzle = text(document.nza, "Unknown nozzle");
  const datetime = dateText(document.datetime ?? document.dts);
  const receipt = text(document.receipt_no, text(document.local_id, "record"));
  return {
    id: `${serial}:${nozzle}:${datetime}:${receipt}`,
    retailOutletId: outletId(text(document.retail_outlet, DEFAULT_OUTLET_ID)),
    datetime,
    dispenserSerial: serial,
    nozzleNumber: nozzle,
    amount: numberOrNull(document.amount),
    volume: numberOrNull(document.volume),
    unitPrice: numberOrNull(document.unit_price),
    receiptNumber: text(document.receipt_no),
    localId: text(document.local_id),
    amountTotalizer: text(document.amount_totalizer),
    volumeTotalizer: text(document.volume_totalizer),
  };
}

function mapTank(
  document: TankDocument,
  latestReading?: TankTelemetry,
): TankAsset {
  const id = tankId(text(document.id, text(document._id)));
  return {
    id,
    serialNumber: text(document.tank_serial_no),
    retailOutletId: outletId(text(document.retail_outlet_id, DEFAULT_OUTLET_ID)),
    probeStatus: latestReading?.atgProbeStatus ?? text(document.atgProbeStatus, "Unknown"),
    height: numberOrNull(document.height),
    width: numberOrNull(document.width),
    customerType: text(document.cust_type),
    createdAt: dateText(document.ef),
    updatedAt: dateText(document.et),
    latestReading,
  };
}

function mapStation(document: StationDocument): StationRecord {
  return {
    id: stationId(String(document.id ?? document._id)),
    name: text(document.name, "Unknown station"),
    stateOffice: document.state_office ?? "",
    divisionalOffice: document.divisional_office ?? "",
    salesArea: document.sales_area ?? "",
    dealerName: document.dealer_ro_name ?? "",
    location: document.location ?? "",
    pincode: document.pincode ?? "",
    retailOutletId: outletId(text(document.retail_outlet_id, DEFAULT_OUTLET_ID)),
    active: document.activeStatus === true || document.activeStatus === 1,
    sapCustCode: text(document.sap_cust_code ?? document.sapCustCode),
  };
}

function summarizeNozzles(transactions: DispenserTransaction[]): NozzleSummary[] {
  const summaries = new Map<string, NozzleSummary>();
  for (const transaction of transactions) {
    if (
      transaction.dispenserSerial === "Unknown dispenser" ||
      transaction.nozzleNumber === "Unknown nozzle"
    )
      continue;
    const id = `${transaction.dispenserSerial}:${transaction.nozzleNumber}`;
    let summary = summaries.get(id);
    if (!summary) {
      summary = {
        id: nozzleId(id),
        dispenserSerial: transaction.dispenserSerial,
        nozzleNumber: transaction.nozzleNumber,
        transactionCount: 0,
        totalAmount: 0,
        totalVolume: 0,
      };
      summaries.set(id, summary);
    }
    summary.transactionCount += 1;
    summary.totalAmount += transaction.amount ?? 0;
    summary.totalVolume += transaction.volume ?? 0;
    if (
      !summary.latestTransaction ||
      transaction.datetime > summary.latestTransaction.datetime
    ) {
      summary.latestTransaction = transaction;
    }
  }
  return [...summaries.values()].sort((left, right) =>
    left.dispenserSerial.localeCompare(right.dispenserSerial, undefined, { numeric: true }) ||
    left.nozzleNumber.localeCompare(right.nozzleNumber, undefined, { numeric: true }),
  );
}

async function loadTankTelemetry(
  tankId?: string,
  input?: OutletId | string,
): Promise<TankTelemetry[]> {
  const database = await getMongoDatabase();
  const filter: Filter<TankTelemetryDocument> = {
    retail_outlet: { $in: outletIdValues(resolveOutletId(input)) },
  };
  if (tankId !== undefined) filter.tank_id = tankId;
  const documents = await database
    .collection<TankTelemetryDocument>("tank_telemetry")
    .find(filter)
    .sort({ datetime: -1, dts: -1 })
    .limit(MAX_TELEMETRY_RECORDS)
    .toArray();
  return documents.map(mapTankReading);
}

async function loadDispenserTelemetry(
  serialNumber?: string,
  input?: OutletId | string,
): Promise<DispenserTransaction[]> {
  const database = await getMongoDatabase();
  const resolved = resolveOutletId(input);
  const outletValues = outletIdValues(resolved);

  const filter: Filter<DispenserTelemetryDocument> = {};

  if (serialNumber !== undefined) {
    const serialValues = [serialNumber, Number(serialNumber)].filter(
      (value) => typeof value === "string" || Number.isFinite(value),
    );
    filter.$or = [
      { serial_no: { $in: serialValues } },
      { du_sr_no: { $in: serialValues } },
    ];
    if (input !== undefined) {
      filter.retail_outlet = { $in: outletValues };
    }
  } else {
    // Match telemetry by outlet, and also by dispensers registered for the
    // outlet. Telemetry documents may not carry a retail_outlet field, so
    // matching on dispenser serials keeps nozzle/dispenser data visible.
    const conditions: Filter<DispenserTelemetryDocument>[] = [];
    if (outletValues.length > 0) {
      conditions.push({ retail_outlet: { $in: outletValues } });
    }
    const dispenserDocs = await database
      .collection<DispenserDocument>("dispensers")
      .find(outletFilter("retail_outlet_id", input))
      .project({ dispenser_serial_no: 1, id: 1, _id: 0 })
      .toArray();
    const serialValues = dispenserDocs
      .flatMap((d) => [d.dispenser_serial_no, d.id])
      .filter((value) => typeof value === "string" || Number.isFinite(value));
    if (serialValues.length > 0) {
      conditions.push({
        $or: [
          { serial_no: { $in: serialValues } },
          { du_sr_no: { $in: serialValues } },
        ],
      });
    }
    if (conditions.length === 1) {
      Object.assign(filter, conditions[0]);
    } else if (conditions.length > 1) {
      filter.$or = conditions;
    }
  }

  let documents = await database
    .collection<DispenserTelemetryDocument>("dispenser_telemetry")
    .find(filter)
    .sort({ datetime: -1, dts: -1 })
    .limit(MAX_TELEMETRY_RECORDS)
    .toArray();

  if (documents.length === 0) {
    documents = await database
      .collection<DispenserTelemetryDocument>("dispensers_telemetry")
      .find(filter)
      .sort({ datetime: -1, dts: -1 })
      .limit(MAX_TELEMETRY_RECORDS)
      .toArray();
  }

  return documents.map(mapTransaction);
}

export async function listStations(): Promise<StationRecord[]> {
  const database = await getMongoDatabase();
  const documents = await database.collection<StationDocument>("stations").find().toArray();
  return documents.map(mapStation);
}

export async function getStationById(
  id: StationId | string,
): Promise<StationRecord | undefined> {
  const database = await getMongoDatabase();
  const numericId = Number(id);
  const idValues: Array<string | number> = [id];
  if (Number.isSafeInteger(numericId)) idValues.push(numericId);
  const document = await database
    .collection<StationDocument>("stations")
    .findOne({ id: { $in: idValues } });
  return document ? mapStation(document) : undefined;
}

export async function getStationByOutletId(
  input: OutletId | string,
): Promise<StationRecord | undefined> {
  const database = await getMongoDatabase();
  const document = await database
    .collection<StationDocument>("stations")
    .findOne({ retail_outlet_id: { $in: outletIdValues(input) } });
  return document ? mapStation(document) : undefined;
}

export async function countStations(): Promise<number> {
  const database = await getMongoDatabase();
  return database.collection<StationDocument>("stations").countDocuments();
}

export async function countTanks(input?: OutletId | string): Promise<number> {
  const database = await getMongoDatabase();
  return database.collection<TankDocument>("tanks").countDocuments(
    outletFilter("retail_outlet_id", input),
  );
}

export async function countDispensers(input?: OutletId | string): Promise<number> {
  const database = await getMongoDatabase();
  return database.collection<DispenserDocument>("dispensers").countDocuments(
    outletFilter("retail_outlet_id", input),
  );
}

export async function countNozzles(input?: OutletId | string): Promise<number> {
  return (await listNozzles(input)).length;
}

export async function listTankReadings(
  tankId?: string,
  input?: OutletId | string,
): Promise<TankTelemetry[]> {
  const database = await getMongoDatabase();
  const filter: Filter<TankTelemetryDocument> = {
    retail_outlet: { $in: outletIdValues(resolveOutletId(input)) },
  };
  if (tankId !== undefined) filter.tank_id = tankId;
  const documents = await database
    .collection<TankTelemetryDocument>("tank_telemetry")
    .find(filter)
    .sort({ datetime: -1, dts: -1 })
    .limit(MAX_TELEMETRY_RECORDS)
    .toArray();
  return documents.map(mapTankReading);
}

export async function listTanks(input?: OutletId | string): Promise<TankAsset[]> {
  const database = await getMongoDatabase();
  const [documents, readings] = await Promise.all([
    database
      .collection<TankDocument>("tanks")
      .find(outletFilter("retail_outlet_id", input))
      .toArray(),
    loadTankTelemetry(undefined, input),
  ]);
  const latestByTank = new Map<string, TankTelemetry>();
  for (const reading of readings) {
    if (!latestByTank.has(reading.tankId)) latestByTank.set(reading.tankId, reading);
  }
  return documents.map((document) => {
    const id = text(document.id, text(document._id));
    return mapTank(document, latestByTank.get(id));
  });
}

export async function getTankById(
  id: string,
  input?: OutletId | string,
): Promise<TankAsset | undefined> {
  const tanks = await listTanks(input);
  return tanks.find((tank) => tank.id === id || tank.serialNumber === id);
}

export async function listDispenserTransactions(
  serialNumber?: string,
  input?: OutletId | string,
): Promise<DispenserTransaction[]> {
  return loadDispenserTelemetry(serialNumber, input);
}

export async function listDispensers(
  input?: OutletId | string,
): Promise<DispenserAsset[]> {
  const database = await getMongoDatabase();
  const [documents, transactions] = await Promise.all([
    database
      .collection<DispenserDocument>("dispensers")
      .find(outletFilter("retail_outlet_id", input))
      .toArray(),
    loadDispenserTelemetry(undefined, input),
  ]);
  const nozzleSummaries = summarizeNozzles(transactions);

  return documents.map((document) => {
    const serialNumber = text(document.dispenser_serial_no, text(document.id));
    const dispenserTransactions = transactions.filter(
      (transaction) => transaction.dispenserSerial === serialNumber,
    );
    const lastTransaction = dispenserTransactions[0];
    return {
      id: dispenserId(text(document.id, serialNumber)),
      serialNumber,
      retailOutletId: outletId(text(document.retail_outlet_id, DEFAULT_OUTLET_ID)),
      batchNumber: text(document.batch_no),
      customerType: text(document.cust_type),
      loggedUserId: text(document.logged_user_id),
      createdAt: dateText(document.ef),
      updatedAt: dateText(document.et),
      transactionCount: dispenserTransactions.length,
      totalAmount: dispenserTransactions.reduce(
        (sum, transaction) => sum + (transaction.amount ?? 0),
        0,
      ),
      totalVolume: dispenserTransactions.reduce(
        (sum, transaction) => sum + (transaction.volume ?? 0),
        0,
      ),
      latestTransaction: lastTransaction,
      nozzles: nozzleSummaries.filter((nozzle) => nozzle.dispenserSerial === serialNumber),
    };
  });
}

export async function getDispenserBySerial(
  serialNumber: string,
  input?: OutletId | string,
): Promise<DispenserAsset | undefined> {
  const dispensers = await listDispensers(input);
  return dispensers.find(
    (dispenser) => dispenser.serialNumber === serialNumber || dispenser.id === serialNumber,
  );
}

export async function listNozzles(input?: OutletId | string): Promise<NozzleSummary[]> {
  const [dispensers, transactions] = await Promise.all([
    listDispensers(input),
    loadDispenserTelemetry(undefined, input),
  ]);
  if (dispensers.length === 0) {
    return summarizeNozzles(transactions);
  }
  const outletSerials = new Set(dispensers.map((d) => d.serialNumber));
  const filtered = transactions.filter((t) => outletSerials.has(t.dispenserSerial));
  return summarizeNozzles(filtered.length > 0 ? filtered : transactions);
}

export async function getNozzleById(
  rawId: string,
  input?: OutletId | string,
): Promise<NozzleSummary | undefined> {
  const id = decodeURIComponent(rawId);
  const lastSeparator = id.lastIndexOf(":");
  if (lastSeparator < 1) return undefined;
  const serialNumber = id.slice(0, lastSeparator);
  const nozzleNumber = id.slice(lastSeparator + 1);
  return (await listNozzles(input)).find((nozzle) =>
    nozzle.id === rawId ||
    nozzle.id === id ||
    (nozzle.dispenserSerial === serialNumber && nozzle.nozzleNumber === nozzleNumber),
  );
}

export async function listNozzlesByDispenserId(
  dispenserSerial: string,
  input?: OutletId | string,
): Promise<NozzleSummary[]> {
  return (await listNozzles(input)).filter(
    (nozzle) => nozzle.dispenserSerial === dispenserSerial,
  );
}

export async function getStationOverview(
  input?: OutletId | string,
  now = new Date(),
): Promise<StationOverview> {
  const database = await getMongoDatabase();
  const resolved = resolveOutletId(input);
  const outletValues = outletIdValues(resolved);

  const [stationDoc, tanks, tankTelemetry, dispensers] = await Promise.all([
    database.collection<StationDocument>("stations").findOne({
      retail_outlet_id: { $in: outletValues },
    }),
    database
      .collection<TankDocument>("tanks")
      .find({ retail_outlet_id: { $in: outletValues } })
      .toArray(),
    database
      .collection<TankTelemetryDocument>("tank_telemetry")
      .find({ retail_outlet: { $in: outletValues } })
      .sort({ datetime: -1, dts: -1 })
      .toArray(),
    database
      .collection<DispenserDocument>("dispensers")
      .find({ retail_outlet_id: { $in: outletValues } })
      .toArray(),
  ]);

  const dispenserSerials = dispensers
    .flatMap((d) => [d.dispenser_serial_no, d.id])
    .filter((s): s is string => Boolean(s));

  const telemetryFilter = dispenserSerials.length > 0
    ? {
        $or: [
          { retail_outlet: { $in: outletValues } },
          { serial_no: { $in: dispenserSerials } },
          { du_sr_no: { $in: dispenserSerials } },
        ],
      }
    : {
        $or: [
          { retail_outlet: { $in: outletValues } },
          {},
        ],
      };

  let dispenserTelemetry = await database
    .collection<DispenserTelemetryDocument>("dispenser_telemetry")
    .find(telemetryFilter)
    .sort({ datetime: -1, dts: -1 })
    .limit(5000)
    .toArray();

  if (dispenserTelemetry.length === 0) {
    dispenserTelemetry = await database
      .collection<DispenserTelemetryDocument>("dispensers_telemetry")
      .find(telemetryFilter)
      .sort({ datetime: -1, dts: -1 })
      .limit(5000)
      .toArray();
  }

  const latestTankTelemetry = new Map<string, TankTelemetryDocument>();
  for (const reading of tankTelemetry) {
    if (reading.tank_id && !latestTankTelemetry.has(String(reading.tank_id))) {
      latestTankTelemetry.set(String(reading.tank_id), reading);
    }
  }

  const { start: todayStart, end: tomorrowStart } = getTodayBounds(now);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const parsedTransactions = dispenserTelemetry.flatMap((record) => {
    const timestamp = parseTimestamp(record.datetime ?? record.dts);
    return timestamp ? [{ record, timestamp }] : [];
  });
  const todayCount = parsedTransactions.filter(
    ({ timestamp }) => timestamp >= todayStart && timestamp < tomorrowStart,
  ).length;
  const yesterdayCount = parsedTransactions.filter(
    ({ timestamp }) => timestamp >= yesterdayStart && timestamp < todayStart,
  ).length;

  const firstHour = new Date(now);
  firstHour.setMinutes(0, 0, 0);
  firstHour.setHours(firstHour.getHours() - 11);
  const activity: { label: string; count: number }[] = Array.from(
    { length: 12 },
    (_, index) => {
      const bucketStart = new Date(firstHour);
      bucketStart.setHours(firstHour.getHours() + index);
      const bucketEnd = new Date(bucketStart);
      bucketEnd.setHours(bucketEnd.getHours() + 1);
      return {
        label: `${String(bucketStart.getHours()).padStart(2, "0")}h`,
        count: parsedTransactions.filter(
          ({ timestamp }) => timestamp >= bucketStart && timestamp < bucketEnd,
        ).length,
      };
    },
  );

  const observedNozzles = new Set(
    dispenserTelemetry.flatMap((record) => {
      const serial = record.serial_no ?? record.du_sr_no;
      return serial != null && record.nza != null ? [`${serial}:${record.nza}`] : [];
    }),
  );
  const alerts: StationAlert[] = [];

  for (const tank of tanks) {
    const tankId = String(tank.id);
    if (!tankId) continue;
    const reading = latestTankTelemetry.get(tankId);
    const probeStatus = reading?.atg_probe_status ?? tank.atgProbeStatus;

    if (!reading) {
      alerts.push({ id: tankId as TankId, equipment: "Tank", issue: "No telemetry received" });
    } else if (probeStatus && probeStatus.toLowerCase() !== "active") {
      alerts.push({ id: tankId as TankId, equipment: "Tank", issue: `Probe ${probeStatus}` });
    }
  }

  const tanksReporting = tanks.filter(
    (tank) => latestTankTelemetry.has(String(tank.id)),
  ).length;
  const telemetryCoverage =
    tanks.length === 0 ? 0 : Math.round((tanksReporting / tanks.length) * 1000) / 10;

  return {
    station: stationDoc
      ? {
          id: stationId(String(stationDoc.id ?? stationDoc._id)),
          name: text(stationDoc.name, "Unknown station"),
          stateOffice: stationDoc.state_office ?? "",
          divisionalOffice: stationDoc.divisional_office ?? "",
          salesArea: stationDoc.sales_area ?? "",
          dealerName: stationDoc.dealer_ro_name ?? "",
          location: stationDoc.location ?? "",
          pincode: stationDoc.pincode ?? "",
          retailOutletId: outletId(text(stationDoc.retail_outlet_id, DEFAULT_OUTLET_ID)),
          active: stationDoc.activeStatus === true || stationDoc.activeStatus === 1,
          sapCustCode: text(stationDoc.sap_cust_code ?? stationDoc.sapCustCode),
        }
      : {
          id: stationId(text(resolved)),
          name: "Unknown station",
          stateOffice: "",
          divisionalOffice: "",
          salesArea: "",
          dealerName: "",
          location: "",
          pincode: "",
          retailOutletId: outletId(resolved),
          active: false,
        },
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

function getTodayBounds(now: Date): { start: Date; end: Date } {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}
