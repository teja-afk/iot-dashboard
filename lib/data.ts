import "server-only";

import type { Document, Filter } from "mongodb";
import {
  differenceInCalendarDays,
  endOfDay,
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfWeek,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import { getMongoDatabase } from "@/lib/mongodb";
import type {
  DispenserAsset,
  DispenserTransaction,
  NozzleSummary,
  NozzleErrorLog,
  NozzleCpuSpec,
  AuthUser,
  OutletId,
  StationAlert,
  StationAnalytics,
  StationId,
  StationOverview,
  StationRecord,
  TankAsset,
  TankId,
  TankStatus,
  TankTelemetry,
  DateRangePreset,
} from "@/types";
import { dispenserId, nozzleId, outletId, stationId, tankId } from "@/types";

const DEFAULT_OUTLET_ID: OutletId = outletId(
  process.env.MONGODB_RETAIL_OUTLET_ID || "31483",
);

export { DEFAULT_OUTLET_ID };

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
  product?: string;
}

interface ReadErrorLogDocument extends Document {
  dts?: string | Date;
  topic?: string;
  type?: string;
  serial_no?: string | number;
  nza?: string | number;
  dua?: string | number;
  datetime?: string | Date;
  errorcode?: string | number;
  description?: string;
  power_reset_required?: string;
}

interface ReadCpuSpecDocument extends Document {
  dts?: string | Date;
  topic?: string;
  type?: string;
  serial_no?: string | number;
  nza?: string | number;
  dua?: string | number;
  datetime?: string | Date;
  hardware_sr_no?: string;
  software_version?: string;
  wlmc_crc?: string;
  code_crc?: string;
}

interface AuthUserDocument extends Document {
  id?: string | number;
  username?: string;
  password?: string;
  role?: string;
  active?: boolean | number;
  ef?: string | Date;
  et?: string | Date;
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

let defaultOutletPromise: Promise<OutletId> | undefined;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * The outlet a station belongs to. Station documents either carry an explicit
 * `retail_outlet_id` or use their own `id` as the retail outlet identifier,
 * which is how the tanks/dispensers collections reference them.
 */
function stationOutletId(document: StationDocument): OutletId {
  return outletId(
    text(document.retail_outlet_id, String(document.id ?? DEFAULT_OUTLET_ID)),
  );
}

/**
 * Without an explicit selection the dashboard falls back to the first station
 * in the database so every page still resolves to a real outlet.
 */
async function getDefaultOutletId(): Promise<OutletId> {
  if (process.env.MONGODB_RETAIL_OUTLET_ID) return DEFAULT_OUTLET_ID;
  if (!defaultOutletPromise) {
    defaultOutletPromise = (async () => {
      const database = await getMongoDatabase();
      const document = await database
        .collection<StationDocument>("stations")
        .findOne({}, { sort: { id: 1 }, projection: { id: 1, retail_outlet_id: 1 } });
      if (!document) return DEFAULT_OUTLET_ID;
      return stationOutletId(document);
    })().catch((error: unknown) => {
      defaultOutletPromise = undefined;
      throw error;
    });
  }
  return defaultOutletPromise;
}

async function resolveOutletId(input?: OutletId | string): Promise<OutletId> {
  return input ? outletId(input as string) : getDefaultOutletId();
}

function outletIdValues(input: OutletId | string): Array<string | number> {
  const values: Array<string | number> = [input];
  const numericId = Number(input);
  if (Number.isSafeInteger(numericId)) values.push(numericId);
  return values;
}

async function outletFilter(
  field: "retail_outlet_id" | "retail_outlet",
  input?: OutletId | string,
): Promise<Filter<Document>> {
  const resolved = await resolveOutletId(input);
  return { [field]: { $in: outletIdValues(resolved) } };
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
    product: text(document.product, "Unknown"),
  };
}

function mapErrorLog(document: ReadErrorLogDocument): NozzleErrorLog {
  const serial = text(document.serial_no, "Unknown dispenser");
  const nozzle = text(document.nza, "Unknown nozzle");
  const dua = text(document.dua, "Unknown dua");
  const datetime = dateText(document.datetime ?? document.dts);
  return {
    id: `${serial}:${nozzle}:${datetime}:${document.errorcode ?? "error"}`,
    datetime,
    topic: text(document.topic),
    type: text(document.type),
    serialNo: serial,
    nza: nozzle,
    dua,
    errorCode: text(document.errorcode),
    description: text(document.description),
    powerResetRequired: text(document.power_reset_required, "NO"),
  };
}

function mapCpuSpec(document: ReadCpuSpecDocument): NozzleCpuSpec {
  const serial = text(document.serial_no, "Unknown dispenser");
  const nozzle = text(document.nza, "Unknown nozzle");
  const dua = text(document.dua, "Unknown dua");
  const datetime = dateText(document.datetime ?? document.dts);
  return {
    id: `${serial}:${nozzle}:${datetime}`,
    datetime,
    topic: text(document.topic),
    type: text(document.type),
    serialNo: serial,
    nza: nozzle,
    dua,
    hardwareSrNo: text(document.hardware_sr_no),
    softwareVersion: text(document.software_version),
    wlmcCrc: text(document.wlmc_crc),
    codeCrc: text(document.code_crc),
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
  const id = String(document.id ?? document._id);
  return {
    id: stationId(id),
    name: text(document.name, text(document.location, `Station ${id}`)),
    stateOffice: document.state_office ?? "",
    divisionalOffice: document.divisional_office ?? "",
    salesArea: document.sales_area ?? "",
    dealerName: document.dealer_ro_name ?? "",
    location: document.location ?? "",
    pincode: document.pincode ?? "",
    retailOutletId: stationOutletId(document),
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
        product: transaction.product,
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
  const resolved = await resolveOutletId(input);
  const outletValues = outletIdValues(resolved);

  // Telemetry may carry a stale retail_outlet, so also match readings by the
  // tank ids registered for the outlet.
  const tankDocs = await database
    .collection<TankDocument>("tanks")
    .find(await outletFilter("retail_outlet_id", input))
    .project({ id: 1, _id: 0 })
    .toArray();
  const tankIds = tankDocs
    .map((document) => document.id)
    .filter((value): value is string | number => value !== undefined && value !== null);

  const conditions: Filter<TankTelemetryDocument>[] = [
    { retail_outlet: { $in: outletValues } },
  ];
  if (tankIds.length > 0) {
    // Tank ids repeat across stations, so readings without an outlet can only
    // be attributed by tank id when the outlet is unknown.
    conditions.push({
      retail_outlet: { $exists: false },
      tank_id: { $in: tankIds },
    });
  }

  const filter: Filter<TankTelemetryDocument> = { $or: conditions };
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
  const resolved = await resolveOutletId(input);
  const outletValues = outletIdValues(resolved);

  const filter: Filter<DispenserTelemetryDocument> = {};

  if (serialNumber !== undefined) {
    const serialValues = [serialNumber, Number(serialNumber)].filter(
      (value) => typeof value === "string" || Number.isFinite(value),
    );
    // Telemetry documents may not carry a retail_outlet field, so the
    // dispenser serial is the authoritative match for a specific dispenser.
    filter.$or = [
      { serial_no: { $in: serialValues } },
      { du_sr_no: { $in: serialValues } },
    ];
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
      .find(await outletFilter("retail_outlet_id", input))
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

async function loadErrorLogs(
  serialNumber?: string,
  nza?: string,
  input?: OutletId | string,
): Promise<NozzleErrorLog[]> {
  const database = await getMongoDatabase();
  const resolved = await resolveOutletId(input);
  const outletValues = outletIdValues(resolved);

  const conditions: Filter<ReadErrorLogDocument>[] = [];

  if (serialNumber !== undefined) {
    const serialValues = [serialNumber, Number(serialNumber)].filter(
      (value) => typeof value === "string" || Number.isFinite(value),
    );
    const orConditions: Filter<ReadErrorLogDocument>[] = [
      { serial_no: { $in: serialValues } },
    ];
    if (nza !== undefined) orConditions.push({ nza });
    conditions.push({ $or: orConditions });
  } else {
    if (outletValues.length > 0) {
      conditions.push({ retail_outlet: { $in: outletValues } });
    }
    const dispenserDocs = await database
      .collection<DispenserDocument>("dispensers")
      .find(await outletFilter("retail_outlet_id", input))
      .project({ dispenser_serial_no: 1, id: 1, _id: 0 })
      .toArray();
    const outletSerialValues = dispenserDocs
      .flatMap((d) => [d.dispenser_serial_no, d.id])
      .filter((value) => typeof value === "string" || Number.isFinite(value));
    if (outletSerialValues.length > 0) {
      conditions.push({
        $or: [{ serial_no: { $in: outletSerialValues } }, { du_sr_no: { $in: outletSerialValues } }],
      });
    }
  }

  const filter: Filter<ReadErrorLogDocument> =
    conditions.length === 1 ? conditions[0] : { $and: conditions };

  let documents = await database
    .collection<ReadErrorLogDocument>("ReadErrorLog")
    .find(filter)
    .sort({ datetime: -1, dts: -1 })
    .limit(MAX_TELEMETRY_RECORDS)
    .toArray();

  if (documents.length === 0) {
    documents = await database
      .collection<ReadErrorLogDocument>("read_error_log")
      .find(filter)
      .sort({ datetime: -1, dts: -1 })
      .limit(MAX_TELEMETRY_RECORDS)
      .toArray();
  }

  return documents.map(mapErrorLog);
}

async function loadCpuSpecs(
  serialNumber?: string,
  nza?: string,
  input?: OutletId | string,
): Promise<NozzleCpuSpec[]> {
  const database = await getMongoDatabase();
  const resolved = await resolveOutletId(input);
  const outletValues = outletIdValues(resolved);

  const conditions: Filter<ReadCpuSpecDocument>[] = [];

  if (serialNumber !== undefined) {
    const serialValues = [serialNumber, Number(serialNumber)].filter(
      (value) => typeof value === "string" || Number.isFinite(value),
    );
    const orConditions: Filter<ReadCpuSpecDocument>[] = [
      { serial_no: { $in: serialValues } },
    ];
    if (nza !== undefined) orConditions.push({ nza });
    conditions.push({ $or: orConditions });
  } else {
    if (outletValues.length > 0) {
      conditions.push({ retail_outlet: { $in: outletValues } });
    }
    const dispenserDocs = await database
      .collection<DispenserDocument>("dispensers")
      .find(await outletFilter("retail_outlet_id", input))
      .project({ dispenser_serial_no: 1, id: 1, _id: 0 })
      .toArray();
    const outletSerialValues = dispenserDocs
      .flatMap((d) => [d.dispenser_serial_no, d.id])
      .filter((value) => typeof value === "string" || Number.isFinite(value));
    if (outletSerialValues.length > 0) {
      conditions.push({
        $or: [{ serial_no: { $in: outletSerialValues } }, { du_sr_no: { $in: outletSerialValues } }],
      });
    }
  }

  const filter: Filter<ReadCpuSpecDocument> =
    conditions.length === 1 ? conditions[0] : { $and: conditions };

  let documents = await database
    .collection<ReadCpuSpecDocument>("ReadCPUSpecificationWithNewSrNo")
    .find(filter)
    .sort({ datetime: -1, dts: -1 })
    .limit(MAX_TELEMETRY_RECORDS)
    .toArray();

  if (documents.length === 0) {
    documents = await database
      .collection<ReadCpuSpecDocument>("read_cpu_specification_with_new_sr_no")
      .find(filter)
      .sort({ datetime: -1, dts: -1 })
      .limit(MAX_TELEMETRY_RECORDS)
      .toArray();
  }

  return documents.map(mapCpuSpec);
}

export async function listStations(): Promise<StationRecord[]> {
  const database = await getMongoDatabase();
  const documents = await database.collection<StationDocument>("stations").find().toArray();
  return documents.map(mapStation);
}

/**
 * Searches the stations collection by station id or by any of the descriptive
 * fields that act as the station name (location, dealer, SAP code, offices).
 */
export async function searchStations(
  query: string,
  limit = 20,
): Promise<StationRecord[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const database = await getMongoDatabase();
  const numericId = Number(trimmed);
  const idValues: Array<string | number> = [trimmed];
  if (Number.isSafeInteger(numericId)) idValues.push(numericId);

  const pattern = new RegExp(escapeRegExp(trimmed), "i");
  const documents = await database
    .collection<StationDocument>("stations")
    .find({
      $or: [
        { id: { $in: idValues } },
        { name: pattern },
        { location: pattern },
        { dealer_ro_name: pattern },
        { sap_cust_code: pattern },
        { state_office: pattern },
        { divisional_office: pattern },
        { sales_area: pattern },
        { pincode: pattern },
      ],
    })
    .limit(limit)
    .toArray();

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
  if (document) return mapStation(document);

  // Fall back to retail_outlet_id so a station can be reached via its outlet ID.
  return getStationByOutletId(id);
}

export async function getStationByOutletId(
  input: OutletId | string,
): Promise<StationRecord | undefined> {
  const database = await getMongoDatabase();
  const values = outletIdValues(input);
  const document = await database
    .collection<StationDocument>("stations")
    .findOne({
      $or: [{ retail_outlet_id: { $in: values } }, { id: { $in: values } }],
    });
  return document ? mapStation(document) : undefined;
}

export async function countStations(): Promise<number> {
  const database = await getMongoDatabase();
  return database.collection<StationDocument>("stations").countDocuments();
}

export async function countTanks(input?: OutletId | string): Promise<number> {
  const database = await getMongoDatabase();
  return database.collection<TankDocument>("tanks").countDocuments(
    await outletFilter("retail_outlet_id", input),
  );
}

export async function countDispensers(input?: OutletId | string): Promise<number> {
  const database = await getMongoDatabase();
  return database.collection<DispenserDocument>("dispensers").countDocuments(
    await outletFilter("retail_outlet_id", input),
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
    retail_outlet: { $in: outletIdValues(await resolveOutletId(input)) },
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
      .find(await outletFilter("retail_outlet_id", input))
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

export async function listErrorLogs(
  serialNumber?: string,
  nza?: string,
  input?: OutletId | string,
): Promise<NozzleErrorLog[]> {
  return loadErrorLogs(serialNumber, nza, input);
}

export async function listCpuSpecs(
  serialNumber?: string,
  nza?: string,
  input?: OutletId | string,
): Promise<NozzleCpuSpec[]> {
  return loadCpuSpecs(serialNumber, nza, input);
}

export async function listDispensers(
  input?: OutletId | string,
): Promise<DispenserAsset[]> {
  const database = await getMongoDatabase();
  const [documents, transactions] = await Promise.all([
    database
      .collection<DispenserDocument>("dispensers")
      .find(await outletFilter("retail_outlet_id", input))
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
  const resolved = await resolveOutletId(input);
  const outletValues = outletIdValues(resolved);

  const [stationDoc, tanks, dispensers] = await Promise.all([
    database.collection<StationDocument>("stations").findOne({
      $or: [
        { retail_outlet_id: { $in: outletValues } },
        { id: { $in: outletValues } },
      ],
    }),
    database
      .collection<TankDocument>("tanks")
      .find({ retail_outlet_id: { $in: outletValues } })
      .toArray(),
    database
      .collection<DispenserDocument>("dispensers")
      .find({ retail_outlet_id: { $in: outletValues } })
      .toArray(),
  ]);

  // Tank ids repeat across stations, so readings without an outlet can only be
  // attributed by tank id when the outlet is unknown.
  const tankIds = tanks
    .map((tank) => tank.id)
    .filter((value): value is string | number => value !== undefined && value !== null);

  const tankTelemetry = await database
    .collection<TankTelemetryDocument>("tank_telemetry")
    .find({
      $or: [
        { retail_outlet: { $in: outletValues } },
        { retail_outlet: { $exists: false }, tank_id: { $in: tankIds } },
      ],
    })
    .sort({ datetime: -1, dts: -1 })
    .toArray();

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
      ? mapStation(stationDoc)
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

export async function getStationAnalytics(
  input?: OutletId | string,
  range: DateRangePreset = "1mnth",
  start?: string,
  end?: string,
): Promise<StationAnalytics> {
  const database = await getMongoDatabase();
  const resolved = await resolveOutletId(input);
  const outletValues = outletIdValues(resolved);

  const now = new Date();
  let rangeStart: Date;
  let rangeEnd: Date = now;

  if (range === "custom" && start && end) {
    rangeStart = startOfDay(parseISO(start));
    rangeEnd = endOfDay(parseISO(end));
  } else if (range === "alltime") {
    rangeStart = startOfDay(subYears(now, 50));
  } else {
    switch (range) {
      case "24hr":
        rangeStart = subDays(now, 1);
        break;
      case "15days":
        rangeStart = subDays(now, 15);
        break;
      case "3mnth":
        rangeStart = subMonths(now, 3);
        break;
      case "6mnth":
        rangeStart = subMonths(now, 6);
        break;
      case "1yr":
        rangeStart = subMonths(now, 12);
        break;
      default:
        rangeStart = subMonths(now, 1);
    }
    rangeStart = startOfDay(rangeStart);
  }

  const [stationDoc, tanks, dispensers] = await Promise.all([
    database.collection<StationDocument>("stations").findOne({
      $or: [
        { retail_outlet_id: { $in: outletValues } },
        { id: { $in: outletValues } },
      ],
    }),
    database
      .collection<TankDocument>("tanks")
      .find({ retail_outlet_id: { $in: outletValues } })
      .toArray(),
    database
      .collection<DispenserDocument>("dispensers")
      .find({ retail_outlet_id: { $in: outletValues } })
      .toArray(),
  ]);

  const tankIds = tanks
    .map((tank) => tank.id)
    .filter((value): value is string | number => value !== undefined && value !== null);

  const tankTelemetry = await database
    .collection<TankTelemetryDocument>("tank_telemetry")
    .find({
      $or: [
        { retail_outlet: { $in: outletValues } },
        { retail_outlet: { $exists: false }, tank_id: { $in: tankIds } },
      ],
    })
    .sort({ datetime: -1, dts: -1 })
    .toArray();

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

  const rangeDays = Math.max(1, differenceInCalendarDays(rangeEnd, rangeStart) + 1);
  const granularity = rangeDays <= 2 ? "hour" : rangeDays <= 90 ? "day" : "week";

  function bucketKey(timestamp: Date): string {
    if (granularity === "hour") return format(timestamp, "MMM d, h a");
    if (granularity === "week") return format(startOfWeek(timestamp), "MMM d");
    return format(timestamp, "MMM d");
  }

  const dailyMap = new Map<string, { date: string; timestamp: Date; transactions: number; volume: number; amount: number }>();
  const hourlyMap = new Map<string, { hour: string; timestamp: Date; transactions: number; volume: number; amount: number }>();
  const dispenserMap = new Map<string, { dispenserSerial: string; transactions: number; volume: number; amount: number }>();
  const nozzleMap = new Map<string, { id: string; dispenserSerial: string; nozzleNumber: string; transactions: number; volume: number; amount: number }>();
  let totalTransactions = 0;
  let totalVolume = 0;
  let totalAmount = 0;
  const activeDispensers = new Set<string>();
  const parsed: Array<{ record: DispenserTelemetryDocument; timestamp: Date }> = [];

  for (const record of dispenserTelemetry) {
    const timestamp = parseTimestamp(record.datetime ?? record.dts);
    if (!timestamp || !isWithinInterval(timestamp, { start: rangeStart, end: rangeEnd })) continue;
    parsed.push({ record, timestamp });

    const volume = numberOrNull(record.volume) ?? 0;
    const amount = numberOrNull(record.amount) ?? 0;
    const key = bucketKey(timestamp);
    const existing = dailyMap.get(key) || { date: key, timestamp, transactions: 0, volume: 0, amount: 0 };
    existing.transactions += 1;
    existing.volume += volume;
    existing.amount += amount;
    dailyMap.set(key, existing);

    const hourKey = format(timestamp, "HH:00");
    const hourExisting = hourlyMap.get(hourKey) || { hour: hourKey, timestamp, transactions: 0, volume: 0, amount: 0 };
    hourExisting.transactions += 1;
    hourExisting.volume += volume;
    hourExisting.amount += amount;
    hourlyMap.set(hourKey, hourExisting);

    const serial = text(record.serial_no ?? record.du_sr_no, "Unknown dispenser");
    const dispenser = dispenserMap.get(serial) || { dispenserSerial: serial, transactions: 0, volume: 0, amount: 0 };
    dispenser.transactions += 1;
    dispenser.volume += volume;
    dispenser.amount += amount;
    dispenserMap.set(serial, dispenser);

    const nozzleKey = `${serial}:${text(record.nza, "Unknown nozzle")}`;
    const nozzle = nozzleMap.get(nozzleKey) || { id: nozzleKey, dispenserSerial: serial, nozzleNumber: text(record.nza, "Unknown nozzle"), transactions: 0, volume: 0, amount: 0, product: text(record.product, "Unknown") };
    nozzle.transactions += 1;
    nozzle.volume += volume;
    nozzle.amount += amount;
    nozzleMap.set(nozzleKey, nozzle);

    activeDispensers.add(serial);
    totalTransactions += 1;
    totalVolume += volume;
    totalAmount += amount;
  }

  const daily = Array.from(dailyMap.values())
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    .map(({ date, transactions, volume, amount }) => ({ date, transactions, volume, amount }));

  const hourly = Array.from(hourlyMap.values())
    .sort((a, b) => a.hour.localeCompare(b.hour))
    .map(({ hour, transactions, volume, amount }) => ({ hour, transactions, volume, amount }));

  const dispensersList = Array.from(dispenserMap.values())
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 8);

  const nozzleList = Array.from(nozzleMap.values())
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 10)
    .map((n) => ({ ...n, averageTransaction: n.transactions === 0 ? 0 : n.amount / n.transactions }));

  const recentTransactions = parsed
    .slice()
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5)
    .map(({ record }) => ({
      dispenserSerial: text(record.serial_no ?? record.du_sr_no, "Unknown dispenser"),
      nozzleNumber: text(record.nza, "Unknown nozzle"),
      amount: numberOrNull(record.amount),
      volume: numberOrNull(record.volume),
      datetime: dateText(record.datetime ?? record.dts),
      product: text(record.product, "Unknown"),
    }));

  const tanksReporting = tanks.filter((tank) => latestTankTelemetry.has(String(tank.id))).length;
  const healthPercentage = tanks.length === 0 ? 0 : Math.round((tanksReporting / tanks.length) * 1000) / 10;

  const tankStatuses: TankStatus[] = tanks.map((tank) => {
    const tankId = String(tank.id);
    const reading = latestTankTelemetry.get(tankId);
    const probeStatus = reading?.atg_probe_status ?? tank.atgProbeStatus;
    let status: TankStatus["status"] = "Reporting";
    if (!reading) status = "No telemetry";
    else if (probeStatus && probeStatus.toLowerCase() !== "active") status = "Probe inactive";
    return {
      tankId,
      serialNumber: text(tank.tank_serial_no),
      fuelLevel: numberOrNull(reading?.fuel_level_liters) ?? null,
      waterLevel: numberOrNull(reading?.water_level_liters) ?? null,
      ullage: numberOrNull(reading?.ullage_liters) ?? null,
      status,
    };
  });

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

  const averageTransaction = totalTransactions === 0 ? 0 : totalAmount / totalTransactions;

  let comparison;
  try {
    const periodLength = rangeEnd.getTime() - rangeStart.getTime();
    const prevEnd = new Date(rangeStart.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - periodLength);
    let prevTx = 0, prevVol = 0, prevAmt = 0;
    for (const record of dispenserTelemetry) {
      const ts = parseTimestamp(record.datetime ?? record.dts);
      if (!ts || ts < prevStart || ts > prevEnd) continue;
      prevTx += 1;
      prevVol += numberOrNull(record.volume) ?? 0;
      prevAmt += numberOrNull(record.amount) ?? 0;
    }
    const prevAvg = prevTx === 0 ? 0 : prevAmt / prevTx;
    const changePct = (cur: number, prev: number) => {
      if (prev === 0) return cur === 0 ? "0%" : "+100%";
      const p = ((cur - prev) / prev) * 100;
      const sign = p >= 0 ? "+" : "";
      return `${sign}${p.toFixed(1)}%`;
    };
    comparison = {
      current: { transactions: totalTransactions, volume: totalVolume, amount: totalAmount, averageTransaction },
      previous: { transactions: prevTx, volume: prevVol, amount: prevAmt, averageTransaction: prevAvg },
      change: {
        transactions: changePct(totalTransactions, prevTx),
        volume: changePct(totalVolume, prevVol),
        amount: changePct(totalAmount, prevAmt),
        averageTransaction: changePct(averageTransaction, prevAvg),
      },
    };
  } catch {
    // ignore comparison errors
  }

  return {
    station: stationDoc
      ? mapStation(stationDoc)
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
    nozzles: { observed: observedNozzles(dispenserTelemetry) },
    totals: {
      transactions: totalTransactions,
      volume: totalVolume,
      amount: totalAmount,
      averageTransaction,
    },
    daily,
    hourly,
    dispenserMetrics: dispensersList,
    nozzleMetrics: nozzleList,
    tanks: tankStatuses,
    health: {
      percentage: healthPercentage,
      tanksReporting,
      totalTanks: tanks.length,
    },
    activeDispensers: activeDispensers.size,
    alerts,
    recentTransactions,
    comparison,
    operational: tanks.length > 0 && tanksReporting === tanks.length && alerts.length === 0,
  };
}

function observedNozzles(records: DispenserTelemetryDocument[]): number {
  const observed = new Set(
    records.flatMap((record) => {
      const serial = record.serial_no ?? record.du_sr_no;
      return serial != null && record.nza != null ? [`${serial}:${record.nza}`] : [];
    }),
  );
  return observed.size;
}

// ---------------------------------------------------------------------------
// Authentication users
// ---------------------------------------------------------------------------

import { createHash } from "node:crypto";

function hashPassword(password: string): string {
  return createHash("md5").update(password).digest("hex");
}

function mapAuthUser(document: AuthUserDocument): AuthUser {
  return {
    id: String(document.id ?? document._id),
    username: text(document.username, "user"),
    role: (document.role as AuthUser["role"]) ?? "operator",
    active: document.active !== false && document.active !== 0,
  };
}

export async function getAuthUserById(
  id: string,
): Promise<AuthUser | undefined> {
  const database = await getMongoDatabase();
  const document = await database
    .collection<AuthUserDocument>("auth_users")
    .findOne({ id: id });
  if (!document) return undefined;
  return mapAuthUser(document);
}

export async function verifyAuthUser(
  username: string,
  password: string,
): Promise<AuthUser | undefined> {
  const database = await getMongoDatabase();
  const document = await database
    .collection<AuthUserDocument>("auth_users")
    .findOne({ username: username });
  if (!document) return undefined;
  if (document.active === false || document.active === 0) return undefined;
  const stored = text(document.password);
  const provided = hashPassword(password);
  if (stored !== provided) return undefined;
  return mapAuthUser(document);
}

export async function createAuthUser(input: {
  id: string;
  username: string;
  password: string;
  role?: AuthUser["role"];
  active?: boolean;
}): Promise<AuthUser> {
  const document: AuthUserDocument = {
    id: input.id,
    username: input.username,
    password: hashPassword(input.password),
    role: input.role ?? "operator",
    active: input.active ?? true,
    ef: new Date(),
    et: new Date(),
  };
  const database = await getMongoDatabase();
  await database.collection<AuthUserDocument>("auth_users").insertOne(document);
  return mapAuthUser(document);
}
