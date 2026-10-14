import "server-only";

import type { Document, Filter } from "mongodb";
import { getMongoDatabase } from "@/lib/mongodb";

export type StationRecord = {
  id: string;
  stateOffice: string;
  divisionalOffice: string;
  salesArea: string;
  dealerName: string;
  location: string;
  pincode: string;
  active: boolean;
};

interface StationDocument extends Document {
  id?: string | number;
  state_office?: string;
  divisional_office?: string;
  sales_area?: string;
  dealer_ro_name?: string;
  location?: string;
  pincode?: string;
  activeStatus?: number | boolean;
}

function mapStation(document: StationDocument): StationRecord {
  return {
    id: String(document.id ?? document._id),
    stateOffice: document.state_office ?? "",
    divisionalOffice: document.divisional_office ?? "",
    salesArea: document.sales_area ?? "",
    dealerName: document.dealer_ro_name ?? "",
    location: document.location ?? "",
    pincode: document.pincode ?? "",
    active: document.activeStatus === true || document.activeStatus === 1,
  };
}

export async function listStations(): Promise<StationRecord[]> {
  const database = await getMongoDatabase();
  const documents = await database.collection<StationDocument>("stations").find().toArray();
  return documents.map(mapStation);
}

export async function getStationById(id: string): Promise<StationRecord | undefined> {
  const database = await getMongoDatabase();
  const numericId = Number(id);
  const idValues: Array<string | number> = [id];
  if (Number.isSafeInteger(numericId)) idValues.push(numericId);
  const filter: Filter<StationDocument> = { id: { $in: idValues } };
  const document = await database.collection<StationDocument>("stations").findOne(filter);
  return document ? mapStation(document) : undefined;
}
