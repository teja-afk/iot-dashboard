import "server-only";

import { MongoClient, type Db } from "mongodb";

const globalForMongo = globalThis as typeof globalThis & {
  mongoClientPromise?: Promise<MongoClient>;
};

export async function getMongoDatabase(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not configured. Add it to your local .env.local file.");
  }

  if (!globalForMongo.mongoClientPromise) {
    const client = new MongoClient(uri);
    globalForMongo.mongoClientPromise = client.connect().catch((error: unknown) => {
      globalForMongo.mongoClientPromise = undefined;
      if (error instanceof Error && /tls|ssl/i.test(error.message)) {
        throw new Error(
          "MongoDB TLS negotiation failed. Verify the exact connection URI and that your network, VPN, firewall, or TLS-inspecting proxy allows direct MongoDB TLS connections. Keep TLS certificate validation enabled.",
          { cause: error },
        );
      }
      throw error;
    });
  }

  const client = await globalForMongo.mongoClientPromise;
  return client.db(process.env.MONGODB_DATABASE || "iot-dashboard");
}
