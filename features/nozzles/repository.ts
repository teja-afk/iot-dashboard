import "server-only";
import type { Nozzle } from "@/features/data";
import { getStationRecord, listStationRecords } from "@/features/mongodb-repository";

export async function listNozzles(): Promise<Nozzle[]> {
  return listStationRecords<Nozzle>("nozzles");
}

export async function getNozzleById(id: string): Promise<Nozzle | undefined> {
  return getStationRecord<Nozzle>("nozzles", { id });
}

export async function listNozzlesByDispenserId(dispenserId: string): Promise<Nozzle[]> {
  return listStationRecords<Nozzle>("nozzles", { dispenser: dispenserId });
}