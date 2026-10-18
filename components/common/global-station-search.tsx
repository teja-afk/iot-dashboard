"use client";

import { useRef, useState } from "react";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export function GlobalStationSearch({
  stations,
}: {
  stations: { id: string; name: string; retailOutletId: string }[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const suggestions = stations.filter(
    (s) =>
      query.length > 0 &&
      (s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.retailOutletId.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <div className="relative inline-block w-[280px]">
      <Input
        ref={inputRef}
        placeholder="Search station…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        className="text-xs h-8 pl-8"
      />
      <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
      {query.length > 0 && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setIsOpen(false);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </button>
      )}
      {isOpen && suggestions.length > 0 && (
        <div
          className="absolute z-50 mt-1 w-full rounded-md border border-[#dce9e5] bg-white shadow-lg py-1"
          onMouseLeave={() => setIsOpen(false)}
        >
          {suggestions.map((station) => (
            <Link
              key={station.id}
              href={`/stations/${station.id}`}
              onClick={() => {
                setQuery("");
                setIsOpen(false);
              }}
              className="block px-3 py-2 text-xs hover:bg-[#f0f6f4] cursor-pointer"
            >
              <div className="font-medium text-[#17352f]">{station.name}</div>
              <div className="text-[10px] text-slate-400 font-mono truncate">
                {station.retailOutletId}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
