import { getMongoDatabase } from "@/lib/mongodb";
import type { DispenserTelemetryDocument } from "@/features/equipment/model";

async function testLoadDispenserTelemetry() {
  try {
    const database = await getMongoDatabase();
    const documents = await database.collection<DispenserTelemetryDocument>("dispenser_telemetry")
      .find({})
      .limit(5)
      .toArray();
    
    console.log("Found documents:", documents.length);
    for (const doc of documents) {
      console.log("Document:", JSON.stringify(doc, null, 2));
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

testLoadDispenserTelemetry();
