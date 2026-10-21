"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { STATION_COOKIE_NAME } from "@/lib/station-cookie";
import { searchStations } from "@/lib/data";
import type { StationOption } from "@/types";

export async function setSelectedOutletId(outletId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(STATION_COOKIE_NAME, outletId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

/**
 * Searches stations by id or name and returns the matching options so the
 * header search can offer them without loading every station client-side.
 */
export async function searchStationOptions(
  query: string,
): Promise<StationOption[]> {
  const stations = await searchStations(query, 20);
  return stations.map((station) => ({
    id: station.id,
    name: station.name,
    retailOutletId: station.retailOutletId,
    location: station.location,
    dealerName: station.dealerName,
    salesArea: station.salesArea,
    pincode: station.pincode,
    stateOffice: station.stateOffice,
    active: station.active,
  }));
}

/**
 * Selects a station and refreshes every page that renders station-scoped data
 * so the overview, tanks, dispensers and nozzles views all reflect it.
 */
export async function selectStation(outletId: string): Promise<void> {
  await setSelectedOutletId(outletId);
  revalidatePath("/", "layout");
}
