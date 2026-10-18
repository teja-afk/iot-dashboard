"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { Clock } from "@/components/ui/clock";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { StationSelector } from "@/components/common/station-selector";
import { GlobalStationSearch } from "@/components/common/global-station-search";

type BreadcrumbEntry = { label: string; href?: string };

const sectionLabels: Record<string, string> = {
  tank: "Tanks",
  tanks: "Tanks",
  dispensers: "Dispensers",
  nozzles: "Nozzles",
  stations: "Stations",
};

function formatSegment(segment: string) {
  if (segment === "reports") return "Reports";
  return decodeURIComponent(segment);
}

function getBreadcrumbs(pathname: string): BreadcrumbEntry[] {
  if (pathname === "/") return [{ label: "Station Overview" }];

  const segments = pathname.split("/").filter(Boolean);
  const section = segments[0];
  const sectionLabel = sectionLabels[section];
  if (!sectionLabel) return [{ label: "Station Overview", href: "/" }];

  const canonicalSectionPath = section === "tank" ? "/tanks" : `/${section}`;
  const entries: BreadcrumbEntry[] = [
    { label: sectionLabel, href: canonicalSectionPath },
  ];

  if (segments.length > 1) {
    const detail = segments.slice(1).map(formatSegment).join(" / ");
    entries.push({ label: detail });
  }

  return entries;
}

export function DashboardHeader({
  stations,
  currentOutletId,
}: {
  stations: { id: string; name: string; retailOutletId: string }[];
  currentOutletId?: string;
}) {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header className="flex min-h-12 items-center justify-between gap-4 border-b border-[#dce9e5] bg-white/90 px-4 py-2 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Breadcrumb className="min-w-0">
          <BreadcrumbList className="flex-nowrap overflow-hidden">
            {breadcrumbs.map((entry, index) => (
              <Fragment key={`${entry.label}-${index}`}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem className="min-w-0">
                  {entry.href ? (
                    <BreadcrumbLink render={<Link href={entry.href} />} className="truncate">
                      {entry.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="truncate">{entry.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <StationSelector stations={stations} currentOutletId={currentOutletId} />
        <GlobalStationSearch stations={stations} />
        <div className="inline-flex shrink-0 items-center font-mono text-sm font-semibold tabular-nums text-black">
          <Clock />
        </div>
      </div>
    </header>
  );
}
