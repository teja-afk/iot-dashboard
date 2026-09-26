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
};

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
  },
  {
    id: "TANK-003",
    name: "Tank 3",
    product: "Premium Petrol",
    capacity: "30,000 L",
    level: "24,180 L",
    levelPercent: 40,
    waterPercent: 2,
    status: "Healthy",
    temperature: "22.1 C",
    lastDelivery: "21-09-2026 09:10:00",
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
  },
];