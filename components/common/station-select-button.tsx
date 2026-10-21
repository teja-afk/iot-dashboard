"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { selectStation } from "@/lib/station-actions";
import { Button } from "@/components/ui/button";
import type { StationOption } from "@/types";

export function StationSelectButton({
  station,
}: {
  station: StationOption;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      await selectStation(station.retailOutletId);
      router.refresh();
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
