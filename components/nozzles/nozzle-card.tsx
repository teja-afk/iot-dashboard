import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { NozzleSummary } from "@/types";
import { getFuelColor } from "@/lib/fuel-colors";

export function NozzleCard({ nozzle }: { nozzle: NozzleSummary }) {
  const fuel = getFuelColor(nozzle.product);
  return (
    <Link
      href={`/nozzles/${encodeURIComponent(nozzle.id)}`}
      className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16806c]"
    >
      <Card className="gap-4 border-[#dce9e5] transition-shadow group-hover:shadow-md">
        <CardHeader className="grid-cols-[minmax(0,1fr)_auto] items-start">
          <div className="min-w-0">
            <CardTitle className="truncate text-base text-[#17352f]">Nozzle {nozzle.nozzleNumber}</CardTitle>
            <p className="mt-1 truncate font-mono text-xs text-slate-400">{nozzle.id}</p>
          </div>
          <Badge className={`${fuel.bg} ${fuel.text} border ${fuel.ring}`}>
            {nozzle.product}
          </Badge>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-4">
            <div className="min-w-0">
              <dt className="text-[11px] uppercase tracking-wide text-slate-400">Telemetry records</dt>
              <dd className="mt-1 truncate text-sm font-medium text-[#17352f]">{nozzle.transactionCount.toLocaleString()}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[11px] uppercase tracking-wide text-slate-400">Recorded volume</dt>
              <dd className="mt-1 truncate text-sm font-medium text-[#17352f]">{nozzle.totalVolume.toLocaleString()} L</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[11px] uppercase tracking-wide text-slate-400">Recorded amount</dt>
              <dd className="mt-1 truncate text-sm font-medium text-[#17352f]">{nozzle.totalAmount.toLocaleString()}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[11px] uppercase tracking-wide text-slate-400">Last activity</dt>
              <dd className="mt-1 truncate text-sm font-medium text-[#17352f]">{nozzle.latestTransaction?.datetime ?? "—"}</dd>
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