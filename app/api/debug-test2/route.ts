import { NextResponse } from "next/server";
import { getMongoDatabase } from "@/lib/mongodb";
import { listDispenserTransactions } from "@/features/equipment/repository";

export async function GET() {
  try {
    const transactions = await listDispenserTransactions();
    
    return NextResponse.json({
      count: transactions.length,
      transactions: transactions.map(t => ({
        ...t,
        // Convert Dates to strings for JSON serialization
        datetime: t.datetime,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
