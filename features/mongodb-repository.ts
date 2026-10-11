import "server-only";

import type { Document, Filter } from "mongodb";
import { getMongoDatabase } from "@/lib/mongodb";

type StoredDocument = Document & { _id: string; stationId?: string };

function getStationId(): string {
  return process.env.MONGODB_STATION_ID || "STATION-001";
}

function stripMongoFields<T>(document: Document): T {
  const record = Object.fromEntries(
    Object.entries(document).filter(([key]) => key !== "_id" && key !== "stationId"),
  );
  return record as T;
}

export async function listStationRecords<T>(
  collectionName: string,
  filter: Filter<StoredDocument> = {},
): Promise<T[]> {
  const database = await getMongoDatabase();
  const documents = await database
    .collection<StoredDocument>(collectionName)
    .find({ $and: [{ stationId: getStationId() }, filter] })
    .toArray();

  return documents.map((document) => stripMongoFields<T>(document));
}

export async function getStationRecord<T>(
  collectionName: string,
  filter: Filter<StoredDocument>,
): Promise<T | undefined> {
  const database = await getMongoDatabase();
  const document = await database.collection<StoredDocument>(collectionName).findOne({
    $and: [{ stationId: getStationId() }, filter],
  });

  return document ? stripMongoFields<T>(document) : undefined;
}

export async function getRecordById<T>(
  collectionName: string,
  id: string,
): Promise<T | undefined> {
  const database = await getMongoDatabase();
  const document = await database
    .collection<StoredDocument>(collectionName)
    .findOne({ _id: id });

  return document ? stripMongoFields<T>(document) : undefined;
}

export async function listRecords<T>(collectionName: string): Promise<T[]> {
  const database = await getMongoDatabase();
  const documents = await database
    .collection<StoredDocument>(collectionName)
    .find()
    .toArray();

  return documents.map((document) => stripMongoFields<T>(document));
}
