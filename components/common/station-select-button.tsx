"use client";

import { useTransition } from "react";
import { setSelectedOutletId } from "@/lib/station-actions";
import { Button } from "@/components/ui/button";
import type { StationOption } from "@/types";

export function StationSelectButton({
  station,
}: {
  station: StationOption;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(() => {
      setSelectedOutletId(station.retailOutletId);
    });
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      className="w-full bg-[#16806c] text-white hover:bg-[#12594e] disabled:opacity-50"
    >
      {isPending ? "Switching…" : `Switch to ${station.name} & view dashboard`}
    </Button>
  );
}
