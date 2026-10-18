"use server";

import { cookies } from "next/headers";
import { STATION_COOKIE_NAME } from "@/lib/station-cookie";

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
