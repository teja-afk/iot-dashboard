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
};

export type NozzleSummary = {
  id: NozzleId;
  dispenserSerial: string;
  nozzleNumber: string;
  transactionCount: number;
  totalAmount: number;
  totalVolume: number;
  latestTransaction?: DispenserTransaction;
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
};

export type OverviewItem = {
  id: string;
  name: string;
  subtitle: string;
  href: string;
  status: string;
  statusTone: "good" | "warning" | "critical" | "info";
  icon?: "tank" | "dispenser" | "nozzle";
  metrics: { label: string; value: string }[];
  progress?: number;
  progressLabel?: string;
  visual?: React.ReactNode;
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
