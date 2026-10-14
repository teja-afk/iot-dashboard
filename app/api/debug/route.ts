import { NextResponse } from "next/server";
import { getMongoDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getMongoDatabase();
    
    // Test loading dispenser telemetry WITHOUT outlet filter
    const dispenserTelemetryCount = await db.collection("dispenser_telemetry").estimatedDocumentCount();
    const dispenserTelemetrySamples = await db.collection("dispenser_telemetry")
      .find({})
      .limit(5)
      .toArray();
    
    // Test loading transactions WITHOUT outlet filter
    const transactionsCount = await db.collection("transactions").estimatedDocumentCount();
    const transactionsSamples = await db.collection("transactions")
      .find({})
      .limit(5)
      .toArray();
    
    return NextResponse.json({
      dispenserTelemetryCount,
      dispenserTelemetrySamples: dispenserTelemetrySamples.map(sample => ({
        _id: sample._id,
        ...Object.fromEntries(
          Object.entries(sample).filter(([k]) => !k.startsWith('_') && k !== '_id')
        )
      })),
      transactionsCount,
      transactionsSamples: transactionsSamples.map(sample => ({
        _id: sample._id,
        ...Object.fromEntries(
          Object.entries(sample).filter(([k]) => !k.startsWith('_') && k !== '_id')
        )
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
