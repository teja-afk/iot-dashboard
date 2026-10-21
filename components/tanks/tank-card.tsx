import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import type { TankAsset } from "@/types";

export function TankCard({ tank }: { tank: TankAsset }) {
  return (
    <Link
      href={`/tanks/${encodeURIComponent(tank.id)}`}
      className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16806c]"
    >
      <Card className="gap-4 border-[#dce9e5] transition-shadow group-hover:shadow-md">
        <CardHeader className="grid-cols-[minmax(0,1fr)_auto] items-start">
          <div className="min-w-0">
            <CardTitle className="truncate text-base text-[#17352f]">
              {tank.serialNumber === "—" ? `Tank ${tank.id}` : tank.serialNumber}
            </CardTitle>
            <p className="mt-1 truncate font-mono text-xs text-slate-400">{tank.id}</p>
          </div>
          <Badge className={tank.probeStatus.toLowerCase() === "active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}>
            {tank.probeStatus}
          </Badge>
          <p className="col-span-2 text-sm text-slate-500">
            Retail outlet {tank.retailOutletId} · {tank.height ?? "—"} × {tank.width ?? "—"} mm
          </p>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-4">
            <div className="min-w-0">
              <dt className="text-[11px] uppercase tracking-wide text-slate-400">Fuel</dt>
              <dd className="mt-1 truncate text-sm font-medium text-[#17352f]">
                {tank.latestReading?.fuelLevelLiters == null ? "—" : `${tank.latestReading.fuelLevelLiters.toLocaleString()} L`}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[11px] uppercase tracking-wide text-slate-400">Water</dt>
              <dd className="mt-1 truncate text-sm font-medium text-[#17352f]">
                {tank.latestReading?.waterLevelLiters == null ? "—" : `${tank.latestReading.waterLevelLiters.toLocaleString()} L`}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[11px] uppercase tracking-wide text-slate-400">Temperature</dt>
              <dd className="mt-1 truncate text-sm font-medium text-[#17352f]">
                {tank.latestReading?.temperature == null ? "—" : `${tank.latestReading.temperature}°`}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[11px] uppercase tracking-wide text-slate-400">Last reading</dt>
              <dd className="mt-1 truncate text-sm font-medium text-[#17352f]">
                {tank.latestReading?.datetime ?? "No telemetry"}
              </dd>
            </div>
          </dl>
        </CardContent>
        <CardFooter className="justify-between border-[#edf3f0] pt-3 text-xs text-slate-500">
          <span>View telemetry and maintenance</span>
          <span className="inline-flex items-center gap-1 font-semibold text-[#16806c]">
            Details <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
