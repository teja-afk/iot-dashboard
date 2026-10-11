import "server-only";
import type { Tank } from "@/features/data";
import { getStationRecord, listStationRecords } from "@/features/mongodb-repository";

export async function listTanks(): Promise<Tank[]> {
  return listStationRecords<Tank>("tanks");
}

export async function getTankById(id: string): Promise<Tank | undefined> {
  return getStationRecord<Tank>("tanks", { id });
}