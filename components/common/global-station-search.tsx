"use client";

import { useCallback, useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchStationOptions, selectStation } from "@/lib/station-actions";
import type { StationOption } from "@/types";

export function GlobalStationSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StationOption[]>([]);
  const [resultsQuery, setResultsQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const trimmedQuery = query.trim();

  useEffect(() => {
    if (trimmedQuery.length === 0) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const matches = await searchStationOptions(trimmedQuery);
        if (cancelled) return;
        setResults(matches);
        setResultsQuery(trimmedQuery);
        setActiveIndex(matches.length > 0 ? 0 : -1);
        setIsOpen(true);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmedQuery]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const chooseStation = useCallback(
    (station: StationOption) => {
      setQuery("");
      setResults([]);
      setIsOpen(false);
      setActiveIndex(-1);
      startTransition(async () => {
        await selectStation(station.retailOutletId);
        router.refresh();
      });
    },
    [router],
  );

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((index) =>
        visibleResults.length === 0 ? -1 : (index + 1) % visibleResults.length,
      );
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((index) =>
        visibleResults.length === 0
          ? -1
          : (index - 1 + visibleResults.length) % visibleResults.length,
      );
      return;
    }
    if (event.key === "Enter") {
      if (activeIndex >= 0 && visibleResults[activeIndex]) {
        event.preventDefault();
        chooseStation(visibleResults[activeIndex]);
      }
      return;
    }
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  // Results are only shown once they match the current query.
  const visibleResults = resultsQuery === trimmedQuery ? results : [];
  const showEmptyState =
    isOpen && trimmedQuery.length > 0 && !isSearching && visibleResults.length === 0;

  return (
    <div ref={containerRef} className="relative inline-block w-[280px]">
      <Input
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex >= 0 && visibleResults[activeIndex]
            ? `${listboxId}-${activeIndex}`
            : undefined
        }
        placeholder="Search station id or name…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        className="text-xs h-8 pl-8 pr-8"
      />
      <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
      {query.length > 0 && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setResults([]);
            setIsOpen(false);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </button>
      )}
      {isOpen && trimmedQuery.length > 0 && (visibleResults.length > 0 || showEmptyState) && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-md border border-[#dce9e5] bg-white shadow-lg py-1"
        >
          {visibleResults.length === 0 && showEmptyState && (
            <p className="px-3 py-2 text-xs text-slate-400">No station matches “{trimmedQuery}”.</p>
          )}
          {visibleResults.map((station, index) => (
            <button
              key={station.id}
              id={`${listboxId}-${index}`}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              disabled={isPending}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => chooseStation(station)}
              className={`block w-full px-3 py-2 text-left text-xs transition-colors ${
                index === activeIndex ? "bg-[#f0f6f4]" : "hover:bg-[#f0f6f4]"
              } ${isPending ? "opacity-60" : "cursor-pointer"}`}
            >
              <div className="font-medium text-[#17352f] truncate">{station.name}</div>
              <div className="text-[10px] text-slate-400 font-mono truncate">
                {station.id} · outlet {station.retailOutletId}
                {station.location ? ` · ${station.location}` : ""}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
