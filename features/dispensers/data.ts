export type Dispenser = {
  serial: string;
  name: string;
  status: "Online" | "Maintenance";
  nozzles: number;
  products: string[];
  lastTransaction: string;
  volume: string;
  transactions: number;
};

export type Transaction = {
  id: string;
  dispenser: string;
  nozzle: string;
  product: string;
  volume: string;
  amount: string;
  timestamp: string;
};

export const dispensers: Dispenser[] = [
  {
    serial: "DVR-10482",
    name: "Dispenser 01",
    status: "Online",
    nozzles: 4,
    products: ["Petrol", "Diesel"],
    lastTransaction: "26-09-2026 10:42:00",
    volume: "42.8 L",
    transactions: 84,
  },
  {
    serial: "DVR-10483",
    name: "Dispenser 02",
    status: "Online",
    nozzles: 4,
    products: ["Petrol", "Diesel", "CNG"],
    lastTransaction: "26-09-2026 10:35:00",
    volume: "38.2 L",
    transactions: 76,
  },
  {
    serial: "DVR-10484",
    name: "Dispenser 03",
    status: "Maintenance",
    nozzles: 2,
    products: ["Diesel"],
    lastTransaction: "26-09-2026 10:01:00",
    volume: "12.6 L",
    transactions: 31,
  },
  {
    serial: "DVR-10485",
    name: "Dispenser 04",
    status: "Online",
    nozzles: 4,
    products: ["Petrol", "Diesel"],
    lastTransaction: "26-09-2026 10:39:00",
    volume: "51.4 L",
    transactions: 102,
  },
  {
    serial: "DVR-10486",
    name: "Dispenser 05",
    status: "Online",
    nozzles: 4,
    products: ["Petrol", "Diesel"],
    lastTransaction: "26-09-2026 10:31:00",
    volume: "46.1 L",
    transactions: 93,
  },
  {
    serial: "DVR-10487",
    name: "Dispenser 06",
    status: "Online",
    nozzles: 4,
    products: ["Petrol", "Diesel", "CNG"],
    lastTransaction: "26-09-2026 10:26:00",
    volume: "27.9 L",
    transactions: 54,
  },
];

export const transactions: Transaction[] = [
  {
    id: "TX-90842",
    dispenser: "DVR-10482",
    nozzle: "N-101",
    product: "Petrol",
    volume: "42.8 L",
    amount: "$58.22",
    timestamp: "26-09-2026 10:42:00",
  },
  {
    id: "TX-90841",
    dispenser: "DVR-10485",
    nozzle: "N-116",
    product: "Diesel",
    volume: "51.4 L",
    amount: "$76.10",
    timestamp: "26-09-2026 10:39:00",
  },
  {
    id: "TX-90840",
    dispenser: "DVR-10483",
    nozzle: "N-108",
    product: "CNG",
    volume: "38.2 L",
    amount: "$42.04",
    timestamp: "26-09-2026 10:35:00",
  },
  {
    id: "TX-90839",
    dispenser: "DVR-10486",
    nozzle: "N-124",
    product: "Petrol",
    volume: "27.9 L",
    amount: "$37.94",
    timestamp: "26-09-2026 10:31:00",
  },
  {
    id: "TX-90838",
    dispenser: "DVR-10482",
    nozzle: "N-102",
    product: "Diesel",
    volume: "19.4 L",
    amount: "$28.73",
    timestamp: "26-09-2026 10:26:00",
  },
];