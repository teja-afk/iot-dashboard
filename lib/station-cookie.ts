import type { OutletId } from "@/types";
import { outletId } from "@/types";
import { cookies } from "next/headers";

export const STATION_COOKIE_NAME = "iot_selected_station";

export async function getSelectedOutletId(): Promise<OutletId | undefined> {
  const cookieStore = await cookies();
  const value = cookieStore.get(STATION_COOKIE_NAME)?.value;
  if (!value) return undefined;
  return outletId(value);
}
