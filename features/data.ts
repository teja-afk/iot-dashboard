export type EquipmentEvent = {
  id: string;
  title: string;
  description: string;
  time: string;
};

export type Tank = {
  id: string;
  name: string;
  product: string;
  capacity: string;
  level: string;
  levelPercent: number;
  waterPercent: number | null;
  status: "Healthy" | "Low level" | "Maintenance";
  temperature: string;
  lastDelivery: string;
  manufacturer: string;
  model: string;
  serial: string;
  location: string;
  installedAt: string;
  firmware: string;
  lastInspection: string;
  maintenanceDue: string;
  sensors: { name: string; status: "Online" | "Warning"; reading: string }[];
  events: (EquipmentEvent & { kind: "info" | "warning" | "service" })[];
};

export type Dispenser = {
  serial: string;
  name: string;
  tankId: string;
  status: "Online" | "Maintenance";
  nozzles: number;
  products: string[];
  lastTransaction: string;
  volume: string;
  transactions: number;
  manufacturer: string;
  model: string;
  location: string;
  installedAt: string;
  firmware: string;
  lastHeartbeat: string;
  serviceDue: string;
  pressure: string;
  events: EquipmentEvent[];
};

export type Nozzle = {
  id: string;
  dispenser: string;
  product: string;
  status: "Ready" | "In use" | "Service due";
  totalVolume: string;
  transactions: number;
  lastCalibration: string;
  flowRate: string;
  meterSerial: string;
  model: string;
  firmware: string;
  installedAt: string;
  lastMaintenance: string;
  calibrationDue: string;
  maxFlowRate: string;
  events: EquipmentEvent[];
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

export type Station = {
  id: string;
  name: string;
  status: "Active" | "Maintenance";
};

export const stations: Station[] = [
  { id: "STATION-001", name: "Demo Fuel Station", status: "Active" },
];

export const tanks: Tank[] = [
  {
    id: "TANK-001",
    name: "Tank 1",
    product: "Petrol",
    capacity: "40,000 L",
    level: "28,640 L",
    levelPercent: 72,
    waterPercent: 3,
    status: "Healthy",
    temperature: "22.4 C",
    lastDelivery: "25-09-2026 18:20:00",
    manufacturer: "Franklin Fueling Systems",
    model: "TSP-40000-DW",
    serial: "FFS-TK-001-8842",
    location: "North forecourt · Bay A",
    installedAt: "14 Mar 2022",
    firmware: "v3.8.2",
    lastInspection: "18 Sep 2026",
    maintenanceDue: "18 Dec 2026",
    sensors: [
      { name: "Level probe", status: "Online", reading: "2.84 m" },
      { name: "Water detector", status: "Online", reading: "3%" },
      { name: "Temperature probe", status: "Online", reading: "22.4 °C" },
    ],
    events: [
      { id: "TK1-E1", title: "Delivery completed", description: "8,500 L received · delivery reconciled", time: "25 Sep 2026, 18:20", kind: "info" },
      { id: "TK1-E2", title: "Probe health check", description: "All tank sensors are reporting normally", time: "25 Sep 2026, 12:00", kind: "info" },
      { id: "TK1-E3", title: "Routine inspection", description: "Next inspection window is due in December", time: "18 Sep 2026, 09:30", kind: "service" },
    ],
  },
  {
    id: "TANK-002",
    name: "Tank 2",
    product: "Diesel",
    capacity: "50,000 L",
    level: "19,250 L",
    levelPercent: 39,
    waterPercent: 4,
    status: "Low level",
    temperature: "21.8 C",
    lastDelivery: "23-09-2026 00:00:00",
    manufacturer: "Veeder-Root",
    model: "TLS-450PLUS",
    serial: "VR-TK-002-2917",
    location: "South forecourt · Bay B",
    installedAt: "02 Nov 2021",
    firmware: "v4.2.0",
    lastInspection: "10 Sep 2026",
    maintenanceDue: "10 Oct 2026",
    sensors: [
      { name: "Level probe", status: "Online", reading: "1.93 m" },
      { name: "Water detector", status: "Warning", reading: "4%" },
      { name: "Temperature probe", status: "Online", reading: "21.8 °C" },
    ],
    events: [
      { id: "TK2-E1", title: "Low stock threshold reached", description: "Below the 45% replenishment threshold", time: "26 Sep 2026, 07:10", kind: "warning" },
      { id: "TK2-E2", title: "Water level increased", description: "Schedule a water draw and verify the probe", time: "25 Sep 2026, 20:15", kind: "warning" },
      { id: "TK2-E3", title: "Inspection scheduled", description: "Routine tank integrity inspection", time: "10 Sep 2026, 15:00", kind: "service" },
    ],
  },
  {
    id: "TANK-003",
    name: "Tank 3",
    product: "Premium Petrol",
    capacity: "30,000 L",
    level: "24,180 L",
    levelPercent: 81,
    waterPercent: 2,
    status: "Healthy",
    temperature: "22.1 C",
    lastDelivery: "21-09-2026 09:10:00",
    manufacturer: "Franklin Fueling Systems",
    model: "TSP-30000-DW",
    serial: "FFS-TK-003-4108",
    location: "Central forecourt · Bay C",
    installedAt: "21 Jun 2023",
    firmware: "v3.8.2",
    lastInspection: "21 Sep 2026",
    maintenanceDue: "21 Mar 2027",
    sensors: [
      { name: "Level probe", status: "Online", reading: "2.41 m" },
      { name: "Water detector", status: "Online", reading: "2%" },
      { name: "Temperature probe", status: "Online", reading: "22.1 °C" },
    ],
    events: [
      { id: "TK3-E1", title: "Probe calibration verified", description: "Level variance within 0.2% tolerance", time: "26 Sep 2026, 08:40", kind: "info" },
      { id: "TK3-E2", title: "Delivery completed", description: "5,200 L received · delivery reconciled", time: "21 Sep 2026, 09:10", kind: "info" },
      { id: "TK3-E3", title: "Routine inspection", description: "No defects recorded", time: "21 Sep 2026, 08:00", kind: "service" },
    ],
  },
  {
    id: "TANK-004",
    name: "Tank 4",
    product: "CNG",
    capacity: "12,000 kg",
    level: "8,760 kg",
    levelPercent: 73,
    waterPercent: null,
    status: "Healthy",
    temperature: "19.6 C",
    lastDelivery: "22-09-2026 14:45:00",
    manufacturer: "Endress+Hauser",
    model: "Prosonic Flow G 300",
    serial: "EHO-TK-004-7711",
    location: "Utility compound · Vessel D",
    installedAt: "09 Jan 2024",
    firmware: "v2.6.1",
    lastInspection: "22 Sep 2026",
    maintenanceDue: "22 Mar 2027",
    sensors: [
      { name: "Pressure transmitter", status: "Online", reading: "212 bar" },
      { name: "Temperature probe", status: "Online", reading: "19.6 °C" },
      { name: "Gas detector", status: "Online", reading: "0 ppm" },
    ],
    events: [
      { id: "TK4-E1", title: "Pressure check passed", description: "Operating pressure is within limits", time: "26 Sep 2026, 09:00", kind: "info" },
      { id: "TK4-E2", title: "Delivery completed", description: "1,800 kg received · delivery reconciled", time: "22 Sep 2026, 14:45", kind: "info" },
      { id: "TK4-E3", title: "Safety inspection", description: "No gas leaks detected", time: "22 Sep 2026, 14:00", kind: "service" },
    ],
  },
];

export const dispensers: Dispenser[] = [
  {
    serial: "DVR-10482",
    name: "Dispenser 01",
    tankId: "TANK-001",
    status: "Online",
    nozzles: 3,
    products: ["Petrol", "Diesel"],
    lastTransaction: "26-09-2026 10:42:00",
    volume: "42.8 L",
    transactions: 84,
    manufacturer: "Wayne Fueling Systems",
    model: "Helix 6000 II",
    location: "North forecourt · Position 1",
    installedAt: "14 Mar 2022",
    firmware: "v2.14.7",
    lastHeartbeat: "26 Sep 2026, 10:42:18",
    serviceDue: "14 Dec 2026",
    pressure: "2.8 bar",
    events: [
      { id: "D1-E1", title: "Transaction completed", description: "42.8 L petrol · nozzle N-101", time: "26 Sep 2026, 10:42" },
      { id: "D1-E2", title: "Connectivity check", description: "Controller heartbeat received", time: "26 Sep 2026, 10:40" },
    ],
  },
  {
    serial: "DVR-10483",
    name: "Dispenser 02",
    tankId: "TANK-001",
    status: "Online",
    nozzles: 2,
    products: ["Diesel", "CNG"],
    lastTransaction: "26-09-2026 10:35:00",
    volume: "38.2 L",
    transactions: 76,
    manufacturer: "Gilbarco Veeder-Root",
    model: "Encore 700 S",
    location: "North forecourt · Position 2",
    installedAt: "02 Nov 2021",
    firmware: "v3.6.1",
    lastHeartbeat: "26 Sep 2026, 10:35:20",
    serviceDue: "02 Nov 2026",
    pressure: "2.7 bar",
    events: [
      { id: "D2-E1", title: "Transaction completed", description: "38.2 L CNG · nozzle N-108", time: "26 Sep 2026, 10:35" },
      { id: "D2-E2", title: "Nozzle interlock tested", description: "Interlock response within specification", time: "25 Sep 2026, 16:20" },
    ],
  },
  {
    serial: "DVR-10484",
    name: "Dispenser 03",
    tankId: "TANK-002",
    status: "Maintenance",
    nozzles: 1,
    products: ["Diesel"],
    lastTransaction: "26-09-2026 10:01:00",
    volume: "12.6 L",
    transactions: 31,
    manufacturer: "Tokheim",
    model: "Quantium 510",
    location: "South forecourt · Position 1",
    installedAt: "19 Jul 2020",
    firmware: "v1.9.4",
    lastHeartbeat: "26 Sep 2026, 10:01:05",
    serviceDue: "Overdue · 20 Sep 2026",
    pressure: "2.1 bar",
    events: [
      { id: "D3-E1", title: "Service required", description: "Flow variance detected; dispenser placed in maintenance", time: "26 Sep 2026, 10:03" },
      { id: "D3-E2", title: "Last transaction", description: "12.6 L diesel · transaction completed", time: "26 Sep 2026, 10:01" },
    ],
  },
  {
    serial: "DVR-10485",
    name: "Dispenser 04",
    tankId: "TANK-002",
    status: "Online",
    nozzles: 2,
    products: ["Diesel"],
    lastTransaction: "26-09-2026 10:39:00",
    volume: "51.4 L",
    transactions: 102,
    manufacturer: "Wayne Fueling Systems",
    model: "Helix 6000 II",
    location: "South forecourt · Position 2",
    installedAt: "14 Mar 2022",
    firmware: "v2.14.7",
    lastHeartbeat: "26 Sep 2026, 10:39:11",
    serviceDue: "14 Dec 2026",
    pressure: "2.9 bar",
    events: [
      { id: "D4-E1", title: "Transaction completed", description: "51.4 L diesel · nozzle N-116", time: "26 Sep 2026, 10:39" },
      { id: "D4-E2", title: "Calibration check passed", description: "Meter variance within tolerance", time: "25 Sep 2026, 08:15" },
    ],
  },
  {
    serial: "DVR-10486",
    name: "Dispenser 05",
    tankId: "TANK-003",
    status: "Online",
    nozzles: 2,
    products: ["Petrol", "Diesel"],
    lastTransaction: "26-09-2026 10:31:00",
    volume: "46.1 L",
    transactions: 93,
    manufacturer: "Gilbarco Veeder-Root",
    model: "Encore 700 S",
    location: "Central forecourt · Position 1",
    installedAt: "21 Jun 2023",
    firmware: "v3.6.1",
    lastHeartbeat: "26 Sep 2026, 10:31:42",
    serviceDue: "21 Dec 2026",
    pressure: "2.8 bar",
    events: [
      { id: "D5-E1", title: "Transaction completed", description: "27.9 L petrol · nozzle N-124", time: "26 Sep 2026, 10:31" },
      { id: "D5-E2", title: "Connectivity check", description: "Controller heartbeat received", time: "26 Sep 2026, 10:30" },
    ],
  },
  {
    serial: "DVR-10487",
    name: "Dispenser 06",
    tankId: "TANK-004",
    status: "Online",
    nozzles: 1,
    products: ["CNG"],
    lastTransaction: "26-09-2026 10:26:00",
    volume: "27.9 L",
    transactions: 54,
    manufacturer: "Lanfeng Energy",
    model: "LF-CNG-400",
    location: "Utility compound · Position 1",
    installedAt: "09 Jan 2024",
    firmware: "v2.6.1",
    lastHeartbeat: "26 Sep 2026, 10:26:30",
    serviceDue: "09 Jan 2027",
    pressure: "212 bar",
    events: [
      { id: "D6-E1", title: "Transaction completed", description: "27.9 kg CNG · transaction completed", time: "26 Sep 2026, 10:26" },
      { id: "D6-E2", title: "Pressure check passed", description: "Operating pressure within limits", time: "26 Sep 2026, 09:00" },
    ],
  },
];

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
    meterSerial: "MTR-101-8842",
    model: "ZVA Slimline 2",
    firmware: "v1.8.4",
    installedAt: "14 Mar 2022",
    lastMaintenance: "18 Sep 2026",
    calibrationDue: "12 Dec 2026",
    maxFlowRate: "50 L/min",
    events: [
      { id: "N101-E1", title: "Dispense completed", description: "42.8 L petrol · meter totalizer updated", time: "26 Sep 2026, 10:42" },
      { id: "N101-E2", title: "Calibration verified", description: "Meter accuracy within ±0.2%", time: "12 Sep 2026, 11:10" },
    ],
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
    meterSerial: "MTR-102-8843",
    model: "ZVA Slimline 2",
    firmware: "v1.8.4",
    installedAt: "14 Mar 2022",
    lastMaintenance: "18 Sep 2026",
    calibrationDue: "12 Dec 2026",
    maxFlowRate: "50 L/min",
    events: [
      { id: "N102-E1", title: "Nozzle active", description: "Current dispense session in progress", time: "26 Sep 2026, 10:44" },
      { id: "N102-E2", title: "Calibration verified", description: "Meter accuracy within ±0.2%", time: "12 Sep 2026, 11:10" },
    ],
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
    meterSerial: "MTR-108-1902",
    model: "CNG Twin Hose 25",
    firmware: "v2.1.0",
    installedAt: "02 Nov 2021",
    lastMaintenance: "09 Sep 2026",
    calibrationDue: "09 Dec 2026",
    maxFlowRate: "35 kg/min",
    events: [
      { id: "N108-E1", title: "Dispense completed", description: "38.2 kg CNG · pressure normalized", time: "26 Sep 2026, 10:35" },
      { id: "N108-E2", title: "Safety interlock tested", description: "Emergency disconnect passed", time: "09 Sep 2026, 13:45" },
    ],
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
    meterSerial: "MTR-116-7718",
    model: "ZVA Slimline 2",
    firmware: "v1.7.9",
    installedAt: "19 Jul 2020",
    lastMaintenance: "20 Sep 2026",
    calibrationDue: "Overdue · 18 Sep 2026",
    maxFlowRate: "50 L/min",
    events: [
      { id: "N116-E1", title: "Calibration overdue", description: "Accuracy verification required before next service", time: "26 Sep 2026, 08:00" },
      { id: "N116-E2", title: "Flow variance warning", description: "Observed flow 36.8 L/min vs 42 L/min baseline", time: "25 Sep 2026, 17:12" },
    ],
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
    meterSerial: "MTR-124-4108",
    model: "ZVA Slimline 2",
    firmware: "v1.9.2",
    installedAt: "21 Jun 2023",
    lastMaintenance: "21 Sep 2026",
    calibrationDue: "11 Dec 2026",
    maxFlowRate: "50 L/min",
    events: [
      { id: "N124-E1", title: "Dispense completed", description: "27.9 L petrol · meter totalizer updated", time: "26 Sep 2026, 10:31" },
      { id: "N124-E2", title: "Calibration verified", description: "Meter accuracy within ±0.2%", time: "11 Sep 2026, 10:25" },
    ],
  },
  {
    id: "N-103", dispenser: "DVR-10482", product: "Petrol", status: "Ready",
    totalVolume: "12,320 L", transactions: 103, lastCalibration: "12 Sep 2026", flowRate: "37.4 L/min",
    meterSerial: "MTR-103-8844", model: "ZVA Slimline 2", firmware: "v1.8.4", installedAt: "14 Mar 2022",
    lastMaintenance: "18 Sep 2026", calibrationDue: "12 Dec 2026", maxFlowRate: "50 L/min",
    events: [{ id: "N103-E1", title: "Readiness self-test passed", description: "No faults reported", time: "26 Sep 2026, 10:38" }],
  },
  {
    id: "N-109", dispenser: "DVR-10483", product: "Diesel", status: "Ready",
    totalVolume: "17,410 L", transactions: 118, lastCalibration: "09 Sep 2026", flowRate: "40.2 L/min",
    meterSerial: "MTR-109-1903", model: "ZVA Slimline 2", firmware: "v2.1.0", installedAt: "02 Nov 2021",
    lastMaintenance: "09 Sep 2026", calibrationDue: "09 Dec 2026", maxFlowRate: "50 L/min",
    events: [{ id: "N109-E1", title: "Readiness self-test passed", description: "No faults reported", time: "26 Sep 2026, 10:32" }],
  },
  {
    id: "N-117", dispenser: "DVR-10484", product: "Diesel", status: "Service due",
    totalVolume: "8,210 L", transactions: 62, lastCalibration: "15 Jul 2026", flowRate: "31.2 L/min",
    meterSerial: "MTR-117-2918", model: "ZVA Slimline 2", firmware: "v1.7.9", installedAt: "19 Jul 2020",
    lastMaintenance: "20 Sep 2026", calibrationDue: "Overdue · 15 Sep 2026", maxFlowRate: "50 L/min",
    events: [{ id: "N117-E1", title: "Service required", description: "Nozzle flow test required", time: "26 Sep 2026, 10:04" }],
  },
  {
    id: "N-125", dispenser: "DVR-10485", product: "Diesel", status: "Ready",
    totalVolume: "20,160 L", transactions: 139, lastCalibration: "11 Sep 2026", flowRate: "40.8 L/min",
    meterSerial: "MTR-125-4109", model: "ZVA Slimline 2", firmware: "v1.9.2", installedAt: "21 Jun 2023",
    lastMaintenance: "21 Sep 2026", calibrationDue: "11 Dec 2026", maxFlowRate: "50 L/min",
    events: [{ id: "N125-E1", title: "Readiness self-test passed", description: "No faults reported", time: "26 Sep 2026, 10:29" }],
  },
  {
    id: "N-132", dispenser: "DVR-10486", product: "Diesel", status: "Ready",
    totalVolume: "14,750 L", transactions: 106, lastCalibration: "11 Sep 2026", flowRate: "38.8 L/min",
    meterSerial: "MTR-132-4110", model: "ZVA Slimline 2", firmware: "v1.9.2", installedAt: "21 Jun 2023",
    lastMaintenance: "21 Sep 2026", calibrationDue: "11 Dec 2026", maxFlowRate: "50 L/min",
    events: [{ id: "N132-E1", title: "Readiness self-test passed", description: "No faults reported", time: "26 Sep 2026, 10:27" }],
  },
  {
    id: "N-140", dispenser: "DVR-10487", product: "CNG", status: "Ready",
    totalVolume: "9,940 kg", transactions: 71, lastCalibration: "22 Sep 2026", flowRate: "28.1 kg/min",
    meterSerial: "MTR-140-7712", model: "CNG Twin Hose 25", firmware: "v2.6.1", installedAt: "09 Jan 2024",
    lastMaintenance: "22 Sep 2026", calibrationDue: "22 Dec 2026", maxFlowRate: "35 kg/min",
    events: [{ id: "N140-E1", title: "Pressure test passed", description: "Hose pressure held within limits", time: "26 Sep 2026, 09:01" }],
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

// Each property represents one MongoDB collection. Equipment records are
// scoped to a station and use their stable domain ID as MongoDB's _id.
export const seedData = {
  stations: stations.map((station) => ({ ...station, _id: station.id })),
  tanks: tanks.map((tank) => ({ ...tank, _id: tank.id, stationId: stations[0].id })),
  dispensers: dispensers.map((dispenser) => ({
    ...dispenser,
    _id: dispenser.serial,
    stationId: stations[0].id,
  })),
  nozzles: nozzles.map((nozzle) => ({
    ...nozzle,
    _id: nozzle.id,
    stationId: stations[0].id,
  })),
  transactions: transactions.map((transaction) => ({
    ...transaction,
    _id: transaction.id,
    stationId: stations[0].id,
  })),
};
