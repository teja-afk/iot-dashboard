import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { DispenserAsset } from "@/types";

export function DispenserCard({ dispenser }: { dispenser: DispenserAsset }) {
  return (
    <Link
      href={`/dispensers/${encodeURIComponent(dispenser.serialNumber)}`}
      className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16806c]"
    >
      <Card className="gap-4 border-[#dce9e5] transition-shadow group-hover:shadow-md">
        <CardHeader className="grid-cols-[minmax(0,1fr)_auto] items-start">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f6f1] text-[#16806c]">
              <span aria-hidden="true" className="size-5">⛽</span>
            </span>
            <div className="min-w-0">
              <CardTitle className="truncate text-base text-[#17352f]">{dispenser.serialNumber}</CardTitle>
              <p className="mt-1 truncate font-mono text-xs text-slate-400">{dispenser.id}</p>
            </div>
          </div>
          <Badge className={dispenser.latestTransaction ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}>
            {dispenser.latestTransaction ? "Telemetry recorded" : "No telemetry"}
          </Badge>
          <p className="col-span-2 text-sm text-slate-500">
            Retail outlet {dispenser.retailOutletId} · batch {dispenser.batchNumber}
          </p>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-4">
            <div className="min-w-0">
              <dt className="text-[11px] uppercase tracking-wide text-slate-400">Observed nozzles</dt>
              <dd className="mt-1 truncate text-sm font-medium text-[#17352f]">{dispenser.nozzles.length}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[11px] uppercase tracking-wide text-slate-400">Telemetry records</dt>
              <dd className="mt-1 truncate text-sm font-medium text-[#17352f]">{dispenser.transactionCount.toLocaleString()}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[11px] uppercase tracking-wide text-slate-400">Recorded volume</dt>
              <dd className="mt-1 truncate text-sm font-medium text-[#17352f]">{dispenser.totalVolume.toLocaleString()} L</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[11px] uppercase tracking-wide text-slate-400">Latest record</dt>
              <dd className="mt-1 truncate text-sm font-medium text-[#17352f]">{dispenser.latestTransaction?.datetime ?? "—"}</dd>
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
