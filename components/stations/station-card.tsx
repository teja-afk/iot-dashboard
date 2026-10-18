import Link from "next/link";
import { ArrowUpRight, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StationSelectButton } from "@/components/common/station-select-button";
import type { StationRecord } from "@/types";

export function StationCard({ station }: { station: StationRecord }) {
  return (
    <Card className="gap-4 border-[#dce9e5] transition-shadow hover:shadow-md">
      <CardHeader className="grid-cols-[minmax(0,1fr)_auto] items-start">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f6f1] text-[#16806c]">
            <Building2 className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <CardTitle className="truncate text-base text-[#17352f]">{station.name}</CardTitle>
            <p className="mt-1 truncate font-mono text-xs text-slate-400">{station.retailOutletId}</p>
          </div>
        </div>
        <Badge className={station.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}>
          {station.active ? "Active" : "Inactive"}
        </Badge>
        <p className="col-span-2 text-sm text-slate-500">{station.location}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <dl className="grid grid-cols-2 gap-x-3 gap-y-4">
          <div className="min-w-0">
            <dt className="text-[11px] uppercase tracking-wide text-slate-400">Dealer</dt>
            <dd className="mt-1 truncate text-sm font-medium text-[#17352f]">{station.dealerName}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[11px] uppercase tracking-wide text-slate-400">Sales area</dt>
            <dd className="mt-1 truncate text-sm font-medium text-[#17352f]">{station.salesArea}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[11px] uppercase tracking-wide text-slate-400">Pincode</dt>
            <dd className="mt-1 truncate text-sm font-medium text-[#17352f]">{station.pincode}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[11px] uppercase tracking-wide text-slate-400">State office</dt>
            <dd className="mt-1 truncate text-sm font-medium text-[#17352f]">{station.stateOffice}</dd>
          </div>
        </dl>
      </CardContent>
      <CardFooter className="justify-between border-[#edf3f0] pt-3">
        <Link
          href={`/stations/${encodeURIComponent(station.id)}`}
          className="inline-flex items-center gap-1 font-semibold text-[#16806c]"
        >
          Details <ArrowUpRight className="size-3.5" />
        </Link>
        <StationSelectButton station={station} />
      </CardFooter>
    </Card>
  );
}
