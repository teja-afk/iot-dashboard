import { MongoClient, type Document } from "mongodb";
import { seedData } from "../features/data";

type SeedDocument = Document & { _id: string };

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is required. Configure it in .env.local.");
}

const expectedStationId = seedData.stations[0]?.id;
const stationId = process.env.MONGODB_STATION_ID || expectedStationId;
if (!expectedStationId || stationId !== expectedStationId) {
  throw new Error(
    `This seed contains station ${expectedStationId ?? "(missing)"}; MONGODB_STATION_ID must match it.`,
  );
}

const client = new MongoClient(uri);

async function main() {
  try {
    await client.connect();
    const database = client.db(process.env.MONGODB_DATABASE || "iot-dashboard");

    const collectionData = JSON.parse(JSON.stringify(seedData)) as Record<
      string,
      SeedDocument[]
    >;

    for (const [collectionName, documents] of Object.entries(collectionData)) {
      const collection = database.collection<SeedDocument>(collectionName);
      await collection.bulkWrite(
        documents.map((document) => ({
          replaceOne: {
            filter: { _id: document._id },
            replacement: document,
            upsert: true,
          },
        })),
      );
      console.log(`Seeded ${documents.length} documents into ${collectionName}.`);
    }

    await Promise.all([
      database.collection("tanks").createIndex({ stationId: 1 }),
      database.collection("dispensers").createIndex({ stationId: 1, tankId: 1 }),
      database.collection("nozzles").createIndex({ stationId: 1, dispenser: 1 }),
      database.collection("transactions").createIndex({ stationId: 1 }),
    ]);
    console.log("Station relationship indexes are ready.");
  } finally {
    await client.close();
  }
}

main().catch((error: unknown) => {
  console.error("MongoDB seeding failed.", error);
  process.exitCode = 1;
});
