/**
 * Color coding for fuel products based on the colors used at Indian petrol pumps.
 * Each product maps to a background, text, and ring color so the same fuel type
 * reads consistently across the dashboard.
 */

export type FuelProduct =
  | "Petrol"
  | "Diesel"
  | "Premium"
  | "Xtra Premium"
  | (string & {});

export interface FuelColor {
  bg: string;
  text: string;
  ring: string;
  dot: string;
}

const DEFAULT: FuelColor = {
  bg: "bg-slate-100",
  text: "text-slate-600",
  ring: "ring-slate-200",
  dot: "bg-slate-400",
};

const FUEL_COLORS: Record<string, FuelColor> = {
  Petrol: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    ring: "ring-amber-200",
    dot: "bg-amber-500",
  },
  Diesel: {
    bg: "bg-red-100",
    text: "text-red-700",
    ring: "ring-red-200",
    dot: "bg-red-500",
  },
  Premium: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    ring: "ring-orange-200",
    dot: "bg-orange-500",
  },
  "Xtra Premium": {
    bg: "bg-violet-100",
    text: "text-violet-700",
    ring: "ring-violet-200",
    dot: "bg-violet-500",
  },
};

export function getFuelColor(product: string | undefined | null): FuelColor {
  if (!product) return DEFAULT;
  return FUEL_COLORS[product] ?? DEFAULT;
}

export function fuelBadgeClass(product: string | undefined | null): string {
  const color = getFuelColor(product);
  return `${color.bg} ${color.text}`;
}