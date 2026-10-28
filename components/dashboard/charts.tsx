"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import type { DailyMetric, DispenserMetric, HourlyMetric, NozzleMetric, TankStatus } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getFuelColor } from "@/lib/fuel-colors";

const COLORS = {
  fuel: "#d6ad58",
  water: "#68a9d1",
  ullage: "#e2e8f0",
  primary: "#16806c",
  secondary: "#2bb673",
  tertiary: "#0ea5e9",
  quaternary: "#f59e0b",
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: readonly {
    payload?: Record<string, unknown>;
    value?: unknown;
    name?: string | number;
  }[];
  label?: string | number;
};

function EmptyChart({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[220px] items-center justify-center text-xs text-slate-400">
      {children}
    </div>
  );
}

export function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {description && (
          <CardDescription className="text-xs text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1 min-h-0">{children}</CardContent>
    </Card>
  );
}

function downsample<T>(arr: T[], max = 24): T[] {
  if (arr.length <= max) return arr;
  return arr.map((_, i) => arr[Math.round(((arr.length - 1) * i) / (max - 1))]);
}

export function TransactionsChart({ daily }: { daily: DailyMetric[] }) {
  return (
    <ChartCard title="Transactions" description="Dispense transactions over the selected range">
      {daily.length === 0 ? (
        <EmptyChart>No transactions</EmptyChart>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={downsample(daily)}
            margin={{ top: 10, right: 20, bottom: 28, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
              tickCount={10}
            />
            <YAxis tick={{ fontSize: 10 }} width={40} />
            <Tooltip
              content={({ active, payload }: CustomTooltipProps) => {
                if (!active || !payload?.length) return null;
                const entry = (payload[0].payload ?? payload[0]) as Record<string, unknown>;
                return (
                  <div className="bg-white border border-slate-200 p-2 text-xs">
                    <div className="font-medium">{String(entry.date ?? "")}</div>
                    <div className="text-muted-foreground">
                      {Number(entry.transactions ?? 0)} transactions
                    </div>
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="transactions"
              stroke={COLORS.primary}
              strokeWidth={2}
              dot={{ fill: COLORS.primary, strokeWidth: 1 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function VolumeChart({ daily }: { daily: DailyMetric[] }) {
  return (
    <ChartCard title="Volume dispensed" description="Fuel volume in litres over the selected range">
      {daily.length === 0 ? (
        <EmptyChart>No volume dispensed</EmptyChart>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={downsample(daily)}
            margin={{ top: 10, right: 20, bottom: 28, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" tickCount={10} />
            <YAxis tick={{ fontSize: 10 }} width={40} />
            <Tooltip
              content={({ active, payload }: CustomTooltipProps) => {
                if (!active || !payload?.length) return null;
                const entry = (payload[0].payload ?? payload[0]) as Record<string, unknown>;
                return (
                  <div className="bg-white border border-slate-200 p-2 text-xs">
                    <div className="font-medium">{String(entry.date ?? "")}</div>
                    <div className="text-muted-foreground">
                      {Number(entry.volume ?? 0).toLocaleString()} L
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="volume" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function HourlyActivityChart({ hourly }: { hourly: HourlyMetric[] }) {
  return (
    <ChartCard title="Hourly activity" description="Transactions by hour of day">
      {hourly.length === 0 ? (
        <EmptyChart>No activity data</EmptyChart>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart
            data={hourly}
            margin={{ top: 10, right: 20, bottom: 28, left: 0 }}
          >
            <defs>
              <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.tertiary} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.tertiary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} width={40} />
            <Tooltip
              content={({ active, payload }: CustomTooltipProps) => {
                if (!active || !payload?.length) return null;
                const entry = (payload[0].payload ?? payload[0]) as Record<string, unknown>;
                return (
                  <div className="bg-white border border-slate-200 p-2 text-xs">
                    <div className="font-medium">{String(entry.hour ?? "")}</div>
                    <div className="text-muted-foreground">
                      {Number(entry.transactions ?? 0)} transactions · {Number(entry.volume ?? 0).toLocaleString()} L
                    </div>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="transactions"
              stroke={COLORS.tertiary}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTx)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function SalesChart({ daily }: { daily: DailyMetric[] }) {
  return (
    <ChartCard title="Sales amount" description="Revenue in INR over the selected range">
      {daily.length === 0 ? (
        <EmptyChart>No sales data</EmptyChart>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={downsample(daily)}
            margin={{ top: 10, right: 20, bottom: 28, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" tickCount={10} />
            <YAxis tick={{ fontSize: 10 }} width={60} />
            <Tooltip
              content={({ active, payload }: CustomTooltipProps) => {
                if (!active || !payload?.length) return null;
                const entry = (payload[0].payload ?? payload[0]) as Record<string, unknown>;
                return (
                  <div className="bg-white border border-slate-200 p-2 text-xs">
                    <div className="font-medium">{String(entry.date ?? "")}</div>
                    <div className="text-muted-foreground">
                      ₹ {Number(entry.amount ?? 0).toLocaleString()}
                    </div>
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke={COLORS.quaternary}
              strokeWidth={2}
              dot={{ fill: COLORS.quaternary, strokeWidth: 1 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function DispensersChart({ dispensers }: { dispensers: DispenserMetric[] }) {
  const data = dispensers.slice(0, 6).reverse();
  return (
    <ChartCard title="Top dispensers" description="Volume dispensed by dispenser">
      {dispensers.length === 0 ? (
        <EmptyChart>No dispenser activity</EmptyChart>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, bottom: 10, left: 90 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <YAxis
              dataKey="dispenserSerial"
              tick={{ fontSize: 10 }}
              width={90}
              allowDecimals={false}
            />
            <XAxis tick={{ fontSize: 10 }} width={40} />
            <Tooltip
              content={({ active, payload }: CustomTooltipProps) => {
                if (!active || !payload?.length) return null;
                const entry = (payload[0].payload ?? payload[0]) as Record<string, unknown>;
                return (
                  <div className="bg-white border border-slate-200 p-2 text-xs">
                    <div className="font-medium">{String(entry.dispenserSerial ?? "")}</div>
                    <div className="text-muted-foreground">
                      {Number(entry.volume ?? 0).toLocaleString()} L
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="volume" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function TankCompositionChart({ tanks }: { tanks: TankStatus[] }) {
  const fuel = tanks.reduce((sum, t) => sum + (t.fuelLevel ?? 0), 0);
  const water = tanks.reduce((sum, t) => sum + (t.waterLevel ?? 0), 0);
  const ullage = tanks.reduce((sum, t) => sum + (t.ullage ?? 0), 0);
  const total = fuel + water + ullage;
  const data = [
    { name: "Fuel", value: fuel, color: COLORS.fuel },
    { name: "Water", value: water, color: COLORS.water },
    { name: "Ullage", value: ullage, color: COLORS.ullage },
  ].filter((d) => d.value > 0);
  return (
    <ChartCard title="Tank composition" description="Fuel, water and ullage across tanks">
      {total === 0 ? (
        <EmptyChart>No contents reported</EmptyChart>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              labelLine={false}
              label={({ name, percent }: { name?: string; percent?: number }) => {
                if (!percent || percent < 0.05) return null;
                return (
                  <text
                    x={0}
                    y={0}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#17352f"
                    fontSize={10}
                    fontWeight="600"
                  >
                    {name ?? ""}
                  </text>
                );
              }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }: CustomTooltipProps) => {
                if (!active || !payload?.length) return null;
                const entry = (payload[0].payload ?? payload[0]) as Record<string, unknown>;
                const pct = total > 0 ? ((Number(entry.value ?? 0) / total) * 100).toFixed(1) : 0;
                return (
                  <div className="bg-white border border-slate-200 p-2 text-xs">
                    <div className="font-medium">{String(entry.name ?? "")}</div>
                    <div className="text-muted-foreground">
                      {Number(entry.value ?? 0).toLocaleString()} L ({pct}%)
                    </div>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function NozzlesChart({ nozzles }: { nozzles: NozzleMetric[] }) {
  const data = nozzles.slice(0, 6).reverse().map((n) => ({
    ...n,
    fuelColor: getFuelColor(n.product).dot,
  }));
  return (
    <ChartCard title="Top nozzles" description="Volume dispensed by nozzle">
      {nozzles.length === 0 ? (
        <EmptyChart>No nozzle activity</EmptyChart>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, bottom: 10, left: 110 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <YAxis
              dataKey="id"
              tick={{ fontSize: 9 }}
              width={110}
              allowDecimals={false}
            />
            <XAxis tick={{ fontSize: 10 }} width={40} />
            <Tooltip
              content={({ active, payload }: CustomTooltipProps) => {
                if (!active || !payload?.length) return null;
                const entry = (payload[0].payload ?? payload[0]) as Record<string, unknown>;
                return (
                  <div className="bg-white border border-slate-200 p-2 text-xs">
                    <div className="font-medium">{String(entry.dispenserSerial ?? "")} - Nozzle {String(entry.nozzleNumber ?? "")}</div>
                    <div className="text-muted-foreground">
                      {Number(entry.volume ?? 0).toLocaleString()} L · {Number(entry.transactions ?? 0)} txns
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="volume" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fuelColor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}