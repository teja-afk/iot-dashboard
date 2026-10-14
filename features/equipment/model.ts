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
  id: string;
  serialNumber: string;
  retailOutletId: string;
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
  retailOutletId: string;
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
  id: string;
  dispenserSerial: string;
  nozzleNumber: string;
  transactionCount: number;
  totalAmount: number;
  totalVolume: number;
  latestTransaction?: DispenserTransaction;
};

export type DispenserAsset = {
  id: string;
  serialNumber: string;
  retailOutletId: string;
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
