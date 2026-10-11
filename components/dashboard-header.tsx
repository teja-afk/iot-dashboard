"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type BreadcrumbEntry = { label: string; href?: string };

const sectionLabels: Record<string, string> = {
  tank: "Tanks",
  tanks: "Tanks",
  dispensers: "Dispensers",
  nozzles: "Nozzles",
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

function getClockTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(date)
    .replaceAll(":", "-");
}

export function DashboardHeader() {
  const pathname = usePathname();
  const [time, setTime] = useState<string | null>(null);
  const breadcrumbs = getBreadcrumbs(pathname);

  useEffect(() => {
    const updateClock = () => setTime(getClockTime(new Date()));
    updateClock();
    const intervalId = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

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

      <div className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#cde4dd] bg-[#f6fbf9] px-3 py-1.5 font-mono text-sm font-semibold tabular-nums text-[#16806c]" aria-label={time ? `Local time ${time.replaceAll("-", ":")}` : "Local clock loading"}>
        <Clock3 aria-hidden="true" className="size-4" />
        <time suppressHydrationWarning>{time ?? "--:--:--"}</time>
      </div>
    </header>
  );
}