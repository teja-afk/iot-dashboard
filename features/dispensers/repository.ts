import "server-only";
import type { Dispenser, Transaction } from "@/features/data";
import { getStationRecord, listStationRecords } from "@/features/mongodb-repository";

export async function listDispensers(): Promise<Dispenser[]> {
  return listStationRecords<Dispenser>("dispensers");
}

export async function getDispenserById(id: string): Promise<Dispenser | undefined> {
  return getStationRecord<Dispenser>("dispensers", { serial: id });
}

export async function listDispensersByTankId(tankId: string): Promise<Dispenser[]> {
  return listStationRecords<Dispenser>("dispensers", { tankId });
}

export async function listTransactions(): Promise<Transaction[]> {
  return listStationRecords<Transaction>("transactions");
}