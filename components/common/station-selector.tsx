"use client";

import { useRef, useState, useTransition } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setSelectedOutletId } from "@/lib/station-actions";
import type { StationOption } from "@/types";

export function StationSelector({
  stations,
  currentOutletId,
}: {
  stations: StationOption[];
  currentOutletId?: string;
}) {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [suggestions, setSuggestions] = useState<StationOption[]>([]);

  const selected = stations.find((s) => s.retailOutletId === currentOutletId);
  const selectedLabel = selected
    ? `${selected.name} (${selected.retailOutletId})`
    : "Select station";

  const allSuggestions = stations.map((station) => ({
    id: station.id,
    name: station.name,
    retailOutletId: station.retailOutletId,
  }));

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setQuery(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (value.trim().length >= 2) {
      debounceTimer.current = setTimeout(() => {
        const lower = value.toLowerCase();
        setSuggestions(
          allSuggestions.filter(
            (s) =>
              s.name.toLowerCase().includes(lower) ||
              s.retailOutletId.toLowerCase().includes(lower),
          ),
        );
      }, 100);
    } else {
      setSuggestions([]);
    }
  }

  function handleSelect(outletId: string) {
    setQuery("");
    setSuggestions([]);
    startTransition(() => {
      setSelectedOutletId(outletId);
    });
  }

  return (
    <div className="relative inline-block w-[280px]">
      <div className="relative">
        <Input
          placeholder="Search station name…"
          value={query}
          onChange={handleInputChange}
          className="text-xs h-8 pl-8"
        />
        <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
        {query.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>

      {suggestions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" disabled={isPending} className="w-full text-left">
                {selectedLabel}
                <ChevronDown className="size-4 ms-auto" />
              </Button>
            }
          />
          <DropdownMenuContent align="start" className="w-[280px] p-0">
            <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Suggestions
            </div>
            {suggestions.map((station) => (
              <DropdownMenuItem
                key={station.id}
                onClick={() => handleSelect(station.retailOutletId)}
                className="text-xs"
              >
                {station.name}
                <span className="ms-auto font-mono text-[10px] text-slate-400 truncate max-w-[80px]">
                  {station.retailOutletId}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleSelect("default")}
              className="text-xs text-slate-500"
            >
              Use default outlet
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
