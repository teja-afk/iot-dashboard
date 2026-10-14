import "server-only";

import type { Document, Filter } from "mongodb";
import { getMongoDatabase } from "@/lib/mongodb";
import type {
  DispenserAsset,
  DispenserTransaction,
  NozzleSummary,
  TankAsset,
  TankTelemetry,
} from "@/features/equipment/model";

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

const MAX_TELEMETRY_RECORDS = 10_000;

function getOutletId(): string {
  return process.env.MONGODB_RETAIL_OUTLET_ID || "31483";
}

function outletIdValues(outletId = getOutletId()): Array<string | number> {
  const values: Array<string | number> = [outletId];
  const numericId = Number(outletId);
  if (Number.isSafeInteger(numericId)) values.push(numericId);
  return values;
}

function outletFilter(field: "retail_outlet_id" | "retail_outlet"): Filter<Document> {
  return { [field]: { $in: outletIdValues() } };
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
    retailOutletId: text(document.retail_outlet, getOutletId()),
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

function mapTank(document: TankDocument, latestReading?: TankTelemetry): TankAsset {
  const id = text(document.id, text(document._id));
  return {
    id,
    serialNumber: text(document.tank_serial_no),
    retailOutletId: text(document.retail_outlet_id),
    probeStatus: latestReading?.atgProbeStatus ?? text(document.atgProbeStatus, "Unknown"),
    height: numberOrNull(document.height),
    width: numberOrNull(document.width),
    customerType: text(document.cust_type),
    createdAt: dateText(document.ef),
    updatedAt: dateText(document.et),
    latestReading,
  };
}

function summarizeNozzles(transactions: DispenserTransaction[]): NozzleSummary[] {
  const summaries = new Map<string, NozzleSummary>();
  for (const transaction of transactions) {
    if (transaction.dispenserSerial === "Unknown dispenser" || transaction.nozzleNumber === "Unknown nozzle") continue;
    const id = `${transaction.dispenserSerial}:${transaction.nozzleNumber}`;
    let summary = summaries.get(id);
    if (!summary) {
      summary = {
        id,
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
    if (!summary.latestTransaction || transaction.datetime > summary.latestTransaction.datetime) {
      summary.latestTransaction = transaction;
    }
  }
  return [...summaries.values()].sort((left, right) =>
    left.dispenserSerial.localeCompare(right.dispenserSerial, undefined, { numeric: true }) ||
    left.nozzleNumber.localeCompare(right.nozzleNumber, undefined, { numeric: true }),
  );
}

async function loadTankTelemetry(tankId?: string): Promise<TankTelemetry[]> {
  const database = await getMongoDatabase();
  const filter: Filter<TankTelemetryDocument> = {};
  if (tankId !== undefined) filter.tank_id = tankId;
  const documents = await database.collection<TankTelemetryDocument>("tank_telemetry")
    .find(filter)
    .sort({ datetime: -1, dts: -1 })
    .limit(MAX_TELEMETRY_RECORDS)
    .toArray();
  return documents.map(mapTankReading);
}

async function loadDispenserTelemetry(serialNumber?: string): Promise<DispenserTransaction[]> {
  const database = await getMongoDatabase();
  const filter: Filter<DispenserTelemetryDocument> = {};
  if (serialNumber !== undefined) {
    const serialValues = [serialNumber, Number(serialNumber)].filter(
      (value) => typeof value === "string" || Number.isFinite(value),
    );
    filter.$or = [
      { serial_no: { $in: serialValues } },
      { du_sr_no: { $in: serialValues } },
    ];
  }

  let documents = await database.collection<DispenserTelemetryDocument>("dispenser_telemetry")
    .find(filter)
    .sort({ datetime: -1, dts: -1 })
    .limit(MAX_TELEMETRY_RECORDS)
    .toArray();

  if (documents.length === 0) {
    documents = await database.collection<DispenserTelemetryDocument>("dispensers_telemetry")
      .find(filter)
      .sort({ datetime: -1, dts: -1 })
      .limit(MAX_TELEMETRY_RECORDS)
      .toArray();
  }

  return documents.map(mapTransaction);
}

export async function listTankReadings(tankId?: string): Promise<TankTelemetry[]> {
  return loadTankTelemetry(tankId);
}

export async function listTanks(): Promise<TankAsset[]> {
  const database = await getMongoDatabase();
  const [documents, readings] = await Promise.all([
    database.collection<TankDocument>("tanks").find(outletFilter("retail_outlet_id")).toArray(),
    loadTankTelemetry(),
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

export async function getTankById(id: string): Promise<TankAsset | undefined> {
  const tanks = await listTanks();
  return tanks.find((tank) => tank.id === id || tank.serialNumber === id);
}

export async function listDispenserTransactions(serialNumber?: string): Promise<DispenserTransaction[]> {
  return loadDispenserTelemetry(serialNumber);
}

export async function listDispensers(): Promise<DispenserAsset[]> {
  const database = await getMongoDatabase();
  const [documents, transactions] = await Promise.all([
    database.collection<DispenserDocument>("dispensers").find(outletFilter("retail_outlet_id")).toArray(),
    loadDispenserTelemetry(),
  ]);
  const nozzleSummaries = summarizeNozzles(transactions);

  return documents.map((document) => {
    const serialNumber = text(document.dispenser_serial_no, text(document.id));
    const dispenserTransactions = transactions.filter((transaction) => transaction.dispenserSerial === serialNumber);
    const lastTransaction = dispenserTransactions[0];
    return {
      id: text(document.id, serialNumber),
      serialNumber,
      retailOutletId: text(document.retail_outlet_id),
      batchNumber: text(document.batch_no),
      customerType: text(document.cust_type),
      loggedUserId: text(document.logged_user_id),
      createdAt: dateText(document.ef),
      updatedAt: dateText(document.et),
      transactionCount: dispenserTransactions.length,
      totalAmount: dispenserTransactions.reduce((sum, transaction) => sum + (transaction.amount ?? 0), 0),
      totalVolume: dispenserTransactions.reduce((sum, transaction) => sum + (transaction.volume ?? 0), 0),
      latestTransaction: lastTransaction,
      nozzles: nozzleSummaries.filter((nozzle) => nozzle.dispenserSerial === serialNumber),
    };
  });
}

export async function getDispenserBySerial(serialNumber: string): Promise<DispenserAsset | undefined> {
  const dispensers = await listDispensers();
  return dispensers.find((dispenser) =>
    dispenser.serialNumber === serialNumber || dispenser.id === serialNumber,
  );
}

export async function listNozzles(): Promise<NozzleSummary[]> {
  const [dispensers, transactions] = await Promise.all([
    listDispensers(),
    loadDispenserTelemetry(),
  ]);
  if (dispensers.length === 0) {
    return summarizeNozzles(transactions);
  }
  const outletSerials = new Set(dispensers.map((d) => d.serialNumber));
  const filtered = transactions.filter((t) => outletSerials.has(t.dispenserSerial));
  return summarizeNozzles(filtered.length > 0 ? filtered : transactions);
}

export async function getNozzleById(rawId: string): Promise<NozzleSummary | undefined> {
  const id = decodeURIComponent(rawId);
  const lastSeparator = id.lastIndexOf(":");
  if (lastSeparator < 1) return undefined;
  const serialNumber = id.slice(0, lastSeparator);
  const nozzleNumber = id.slice(lastSeparator + 1);
  return (await listNozzles()).find((nozzle) =>
    nozzle.id === rawId ||
    nozzle.id === id ||
    (nozzle.dispenserSerial === serialNumber && nozzle.nozzleNumber === nozzleNumber),
  );
}

export async function listNozzlesByDispenserId(dispenserSerial: string): Promise<NozzleSummary[]> {
  return (await listNozzles()).filter((nozzle) => nozzle.dispenserSerial === dispenserSerial);
}
