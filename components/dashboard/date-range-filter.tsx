"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Calendar, ChevronDown, Check } from "lucide-react";
import type { DateRangePreset } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const DATE_RANGE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: "alltime", label: "All time" },
  { value: "24hr", label: "24 hr" },
  { value: "15days", label: "15 days" },
  { value: "1mnth", label: "1 month" },
  { value: "3mnth", label: "3 months" },
  { value: "6mnth", label: "6 months" },
  { value: "1yr", label: "1 year" },
  { value: "custom", label: "Custom range" },
];

export function DateRangeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customOpen, setCustomOpen] = useState(false);

  const currentRange = (searchParams.get("range") ?? "alltime") as DateRangePreset;
  const currentStart = searchParams.get("start") ?? "";
  const currentEnd = searchParams.get("end") ?? "";

  const [prevStart, setPrevStart] = useState(currentStart);
  const [prevEnd, setPrevEnd] = useState(currentEnd);
  const [startDate, setStartDate] = useState(currentStart);
  const [endDate, setEndDate] = useState(currentEnd);

  if (currentStart !== prevStart || currentEnd !== prevEnd) {
    setPrevStart(currentStart);
    setPrevEnd(currentEnd);
    setStartDate(currentStart);
    setEndDate(currentEnd);
  }

  const isCustom = currentRange === "custom" && (currentStart || currentEnd);
  const label = isCustom
    ? `${currentStart || "Start date"} → ${currentEnd || "End date"}`
    : DATE_RANGE_PRESETS.find((p) => p.value === currentRange)?.label ??
      DATE_RANGE_PRESETS[0].label;

  const paramsWith = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    return `?${params.toString()}`;
  };

  const handlePreset = (value: DateRangePreset) => {
    setCustomOpen(false);
    if (value === "custom") {
      setCustomOpen(true);
      return;
    }
    router.push(paramsWith({ range: value, start: null, end: null }), { scroll: false });
  };

  const handleApply = () => {
    if (!startDate || !endDate) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", "custom");
    params.set("start", startDate);
    params.set("end", endDate);
    router.push(`?${params.toString()}`, { scroll: false });
    setCustomOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className="rounded-full px-3 py-1.5 text-xs font-medium"
            />
          }
        >
          <Calendar className="mr-2 size-3.5" />
          <span>{label}</span>
          <ChevronDown className="ml-1 size-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Quick range</DropdownMenuLabel>
            {DATE_RANGE_PRESETS.filter((p) => p.value !== "custom").map((p) => (
              <DropdownMenuItem
                key={p.value}
                onClick={() => handlePreset(p.value)}
                className={
                  currentRange === p.value
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                }
              >
                {p.label}
                {currentRange === p.value && (
                  <Check className="ml-auto size-3.5" aria-hidden="true" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Custom</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setCustomOpen(true)}>Custom date range</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={customOpen} onOpenChange={setCustomOpen}>
        <SheetTrigger style={{ display: "none" }} />
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Custom date range</SheetTitle>
            <SheetDescription>Select a start and end date.</SheetDescription>
          </SheetHeader>
          <div className="grid w-full grid-cols-2 gap-4 px-6">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Start date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">End date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setCustomOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply}>Apply range</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}