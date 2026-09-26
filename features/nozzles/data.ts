export type Nozzle = {
  id: string;
  dispenser: string;
  product: string;
  status: "Ready" | "In use" | "Service due";
  totalVolume: string;
  transactions: number;
  lastCalibration: string;
  flowRate: string;
};

export const nozzles: Nozzle[] = [
  {
    id: "N-101",
    dispenser: "DVR-10482",
    product: "Petrol",
    status: "Ready",
    totalVolume: "18,420 L",
    transactions: 142,
    lastCalibration: "12 Sep 2026",
    flowRate: "38.2 L/min",
  },
  {
    id: "N-102",
    dispenser: "DVR-10482",
    product: "Diesel",
    status: "In use",
    totalVolume: "22,680 L",
    transactions: 168,
    lastCalibration: "12 Sep 2026",
    flowRate: "41.6 L/min",
  },
  {
    id: "N-108",
    dispenser: "DVR-10483",
    product: "CNG",
    status: "Ready",
    totalVolume: "14,250 L",
    transactions: 96,
    lastCalibration: "09 Sep 2026",
    flowRate: "29.4 L/min",
  },
  {
    id: "N-116",
    dispenser: "DVR-10485",
    product: "Diesel",
    status: "Service due",
    totalVolume: "31,890 L",
    transactions: 214,
    lastCalibration: "18 Aug 2026",
    flowRate: "36.8 L/min",
  },
  {
    id: "N-124",
    dispenser: "DVR-10486",
    product: "Petrol",
    status: "Ready",
    totalVolume: "16,740 L",
    transactions: 121,
    lastCalibration: "11 Sep 2026",
    flowRate: "39.1 L/min",
  },
];