"use client";

import { useState } from "react";
import { ArrowUpRight, Search, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { tanks } from "@/features/tanks/data";

export default function TankPage() {
  const [query, setQuery] = useState("");
  const visibleTanks = tanks.filter((tank) =>
    `${tank.id} ${tank.name} ${tank.product}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div className="min-h-[calc(100vh-2.75rem)] bg-[#f6f8f7] p-5 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#16806c]">
              Tank network
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#17352f]">
              Tank overview
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Fuel levels, temperature, and delivery status at a glance.
            </p>
          </div>
          <a href="/tank/reports">
            <Button variant="outline">
              View reports <ArrowUpRight />
            </Button>
          </a>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tank ID or product"
            className="h-10 bg-white pl-9"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {visibleTanks.map((tank) => (
            <article
              key={tank.id}
              className="rounded-2xl border border-[#dce9e5] bg-white p-5 shadow-[0_12px_40px_-28px_rgba(23,53,47,0.35)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-[#17352f]">{tank.name}</h2>
                  <p className="mt-1 text-xs text-slate-500">{tank.product}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${tank.status === "Healthy" ? "bg-[#e6f7ef] text-[#16805b]" : tank.status === "Low level" ? "bg-[#fff2dc] text-[#ad6b09]" : "bg-[#fee9e7] text-[#bd4b3e]"}`}
                >
                  {tank.status}
                </span>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-500">Tank contents</span>
                  <span className="font-semibold text-[#17352f]">
                    {tank.levelPercent}% {tank.product === "CNG" ? "gas" : "fuel"}
                  </span>
                </div>
                <TankLevelGraphic
                  fuelPercent={tank.levelPercent}
                  waterPercent={tank.waterPercent}
                  product={tank.product}
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-[11px]">
                  <span className="inline-flex items-center gap-1.5 text-slate-500">
                    <span
                      className={`size-2 rounded-full ${getProductColors(tank.product).marker}`}
                    />
                    {tank.product === "CNG" ? "Gas" : "Fuel"} · {tank.levelPercent}%
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-slate-500">
                    <span className="size-2 rounded-full bg-[#48a9d6]" />
                    Water · {tank.waterPercent === null ? "N/A" : `${tank.waterPercent}%`}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-[#17352f]">
                  {tank.level}{" "}
                  <span className="font-normal text-slate-400">
                    of {tank.capacity}
                  </span>
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-y-4 border-t border-[#edf3f0] pt-4">
                <Detail label="" value={tank.temperature} icon={<Thermometer />} />
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Last Delivery
                  </p>
                  <p className="mt-1 whitespace-nowrap font-mono text-xs font-medium tabular-nums text-[#17352f]">
                    {tank.lastDelivery}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function TankLevelGraphic({
  fuelPercent,
  waterPercent,
  product,
}: {
  fuelPercent: number;
  waterPercent: number | null;
  product: string;
}) {
  const waterHeight = Math.max(0, Math.min(waterPercent ?? 0, 100));
  const fuelHeight = Math.max(0, Math.min(fuelPercent, 100 - waterHeight));
  const contents = product === "CNG" ? "gas" : "fuel";
  const fuelColors = getProductColors(product);

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div
            role="img"
            tabIndex={0}
            aria-label={`${fuelPercent}% ${contents}${waterPercent === null ? ", water level not applicable" : ` and ${waterPercent}% water`}`}
            className="relative mt-3 h-32 overflow-hidden rounded-full border-2 border-[#b8cbc5] bg-linear-to-r from-[#e3ebe8] via-white to-[#e3ebe8] p-2 shadow-inner"
          >
            <div className="absolute inset-1.5 overflow-hidden rounded-full bg-[#f6faf8]">
              {fuelHeight > 0 && (
                <div
                  className={`absolute right-0 left-0 bg-linear-to-r ${fuelColors.gradient} transition-[height,bottom] duration-500`}
                  style={{ bottom: `${waterHeight}%`, height: `${fuelHeight}%` }}
                />
              )}
              {waterHeight > 0 && (
                <div
                  className="absolute right-0 bottom-0 left-0 bg-linear-to-r from-[#368dbd] via-[#6bc2e5] to-[#368dbd]"
                  style={{ height: `${waterHeight}%` }}
                />
              )}
            </div>
            <span className="absolute bottom-0 left-1/2 h-2 w-8 -translate-x-1/2 rounded-t-md border-x-2 border-t-2 border-[#b8cbc5] bg-white" />
          </div>
        }
      />
      <TooltipContent className="flex-col items-start gap-1">
        <span className="capitalize">
          {contents}: {fuelPercent}%
        </span>
        <span>Water: {waterPercent === null ? "N/A" : `${waterPercent}%`}</span>
      </TooltipContent>
    </Tooltip>
  );
}

function getProductColors(product: string) {
  const colors: Record<string, { gradient: string; marker: string }> = {
    Petrol: {
      gradient: "from-[#df902b] via-[#f5bd5e] to-[#df902b]",
      marker: "bg-[#e9a23b]",
    },
    Diesel: {
      gradient: "from-[#238b70] via-[#55bd94] to-[#238b70]",
      marker: "bg-[#32a77f]",
    },
    "Premium Petrol": {
      gradient: "from-[#7952ad] via-[#ae83d8] to-[#7952ad]",
      marker: "bg-[#9368c1]",
    },
    CNG: {
      gradient: "from-[#257b9b] via-[#52b3c9] to-[#257b9b]",
      marker: "bg-[#3f9eb5]",
    },
  };

  return colors[product] ?? colors.Petrol;
}

function Detail({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-xs font-medium text-[#17352f]">{value}</p>
    </div>
  );
}