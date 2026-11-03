export type OutletId = string & { __brand: "OutletId" };
export type StationId = string & { __brand: "StationId" };
export type TankId = string & { __brand: "TankId" };
export type DispenserId = string & { __brand: "DispenserId" };
export type NozzleId = string & { __brand: "NozzleId" };

export function outletId(value: string): OutletId {
  return value as OutletId;
}

export function stationId(value: string): StationId {
  return value as StationId;
}

export function tankId(value: string): TankId {
  return value as TankId;
}

export function dispenserId(value: string): DispenserId {
  return value as DispenserId;
}

export function nozzleId(value: string): NozzleId {
  return value as NozzleId;
}

export type TankTelemetry = {
  id: string;
  tankId: string;
  datetime: string;
  atgProbeStatus: string;
  fuelLevelLiters: number | null;
  waterLevelMm: number | null;
  waterLevelLiters: number | null;
  temperature: number | null;
  density: number | null;
  ullageLiters: number | null;
};

export type TankAsset = {
  id: TankId;
  serialNumber: string;
  retailOutletId: OutletId;
  probeStatus: string;
  height: number | null;
  width: number | null;
  customerType: string;
  createdAt: string;
  updatedAt: string;
  latestReading?: TankTelemetry;
};

export type DispenserTransaction = {
  id: string;
  retailOutletId: OutletId;
  datetime: string;
  dispenserSerial: string;
  nozzleNumber: string;
  amount: number | null;
  volume: number | null;
  unitPrice: number | null;
  receiptNumber: string;
  localId: string;
  amountTotalizer: string;
  volumeTotalizer: string;
  product: string;
};

export type NozzleSummary = {
  id: NozzleId;
  dispenserSerial: string;
  nozzleNumber: string;
  transactionCount: number;
  totalAmount: number;
  totalVolume: number;
  product: string;
  latestTransaction?: DispenserTransaction;
};

export type NozzleErrorLog = {
  id: string;
  datetime: string;
  topic: string;
  type: string;
  serialNo: string;
  nza: string;
  dua: string;
  errorCode: string;
  description: string;
  powerResetRequired: string;
};

export type NozzleCpuSpec = {
  id: string;
  datetime: string;
  topic: string;
  type: string;
  serialNo: string;
  nza: string;
  dua: string;
  hardwareSrNo: string;
  softwareVersion: string;
  wlmcCrc: string;
  codeCrc: string;
};

export type DispenserAsset = {
  id: DispenserId;
  serialNumber: string;
  retailOutletId: OutletId;
  batchNumber: string;
  customerType: string;
  loggedUserId: string;
  createdAt: string;
  updatedAt: string;
  transactionCount: number;
  totalAmount: number;
  totalVolume: number;
  latestTransaction?: DispenserTransaction;
  nozzles: NozzleSummary[];
};

export type StationRecord = {
  id: StationId;
  name: string;
  stateOffice: string;
  divisionalOffice: string;
  salesArea: string;
  dealerName: string;
  location: string;
  pincode: string;
  retailOutletId: OutletId;
  active: boolean;
  sapCustCode?: string;
};

export type StationAlert = {
  id: TankId;
  equipment: string;
  issue: string;
};

export type HourlyActivity = {
  label: string;
  count: number;
};

export type StationOverview = {
  station: {
    id: StationId;
    name: string;
    stateOffice: string;
    divisionalOffice: string;
    salesArea: string;
    dealerName: string;
    location: string;
    pincode: string;
    retailOutletId: OutletId;
    active: boolean;
    sapCustCode?: string;
  };
  dispensers: { registered: number };
  nozzles: { observed: number };
  transactions: { today: number; yesterday: number; comparison: string };
  health: { percentage: number; tanksReporting: number; totalTanks: number };
  activity: HourlyActivity[];
  alerts: StationAlert[];
  operational: boolean;
};

export type DailyMetric = {
  date: string;
  transactions: number;
  volume: number;
  amount: number;
};

export type DispenserMetric = {
  dispenserSerial: string;
  transactions: number;
  volume: number;
  amount: number;
};

export type TankStatus = {
  tankId: string;
  serialNumber: string;
  fuelLevel: number | null;
  waterLevel: number | null;
  ullage: number | null;
  status: "Reporting" | "No telemetry" | "Probe inactive";
};

export type HourlyMetric = {
  hour: string;
  transactions: number;
  volume: number;
  amount: number;
};

export type NozzleMetric = {
  id: string;
  dispenserSerial: string;
  nozzleNumber: string;
  transactions: number;
  volume: number;
  amount: number;
  averageTransaction: number;
  product?: string;
};

export type PeriodComparison = {
  current: {
    transactions: number;
    volume: number;
    amount: number;
    averageTransaction: number;
  };
  previous: {
    transactions: number;
    volume: number;
    amount: number;
    averageTransaction: number;
  };
  change: {
    transactions: string;
    volume: string;
    amount: string;
    averageTransaction: string;
  };
};

export type StationAnalytics = {
  station: StationRecord;
  nozzles: { observed: number };
  totals: {
    transactions: number;
    volume: number;
    amount: number;
    averageTransaction: number;
  };
  daily: DailyMetric[];
  hourly?: HourlyMetric[];
  dispensers: { registered: number };
  dispenserMetrics: DispenserMetric[];
  nozzleMetrics?: NozzleMetric[];
  tanks: TankStatus[];
  health: { percentage: number; tanksReporting: number; totalTanks: number };
  activeDispensers: number;
  alerts: StationAlert[];
  operational: boolean;
  recentTransactions: Array<{
    dispenserSerial: string;
    nozzleNumber: string;
    amount: number | null;
    volume: number | null;
    datetime: string;
    product: string;
  }>;
  comparison?: PeriodComparison;
};

export type DateRangePreset =
  | "24hr"
  | "15days"
  | "1mnth"
  | "3mnth"
  | "6mnth"
  | "1yr"
  | "alltime"
  | "custom";

export type StationOption = {
  id: string;
  name: string;
  retailOutletId: string;
  active?: boolean;
  location?: string;
  dealerName?: string;
  salesArea?: string;
  pincode?: string;
  stateOffice?: string;
};

export type DetailMetric = {
  label: string;
  value: string;
  note?: string;
  tone?: "good" | "warning" | "critical";
};

export type Property = { label: string; value: string };

export type EquipmentEvent = {
  id: string;
  title: string;
  description: string;
  time: string;
  kind?: "info" | "warning" | "service";
};

export type ChildAsset = {
  id: string;
  name: string;
  href: string;
  status: string;
  statusTone: "good" | "warning" | "critical" | "info";
  description: string;
  metrics: { label: string; value: string }[];
  product?: string;
};

export type OverviewItem = {
  id: string;
  name: string;
  subtitle?: string;
  href: string;
  status: string;
  statusTone: "good" | "warning" | "critical" | "info";
  icon?: "tank" | "dispenser" | "nozzle";
  metrics: { label: string; value: string }[];
  progress?: number;
  progressLabel?: string;
  visual?: React.ReactNode;
  footer?: React.ReactNode;
};

export type AuthService = {
  requestOtp(input: { mobile: string; password: string }): Promise<{
    challengeId: string;
    maskedMobile: string;
    expiresAt: string;
  }>;
  verifyOtp(input: { challengeId: string; code: string }): Promise<{
    id: string;
    mobile: string;
  }>;
  getSession(): Promise<{ id: string; mobile: string } | null>;
  signOut(): Promise<void>;
};

export type AuthUser = {
  id: string;
  username: string;
  role: "operator" | "manager" | "admin";
  active: boolean;
};

export type ErrorCode = {
  id: string;
  datetime: string;
  revision: string;
  note: string;
  revisionDesc1: string;
  revisionDesc2: string;
  title: string;
  checkCode: string;
  description: string;
  powerResetRequiredToClearCheckCode: string;
  errorRecoverOnNozzleLift: string;
  errorType: string;
  recovery: string;
};
