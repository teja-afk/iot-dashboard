import "server-only";

import type { Station } from "@/features/data";
import { getRecordById, listRecords } from "@/features/mongodb-repository";

export function listStations(): Promise<Station[]> {
  return listRecords<Station>("stations");
}

export function getStationById(id: string): Promise<Station | undefined> {
  return getRecordById<Station>("stations", id);
}
