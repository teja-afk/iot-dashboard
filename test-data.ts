import { getMongoDatabase } from './lib/mongodb';
async function test() {
  try {
    const db = await getMongoDatabase();
    console.log('Connected to database');
    const outletId = process.env.MONGODB_RETAIL_OUTLET_ID || '31483';
    console.log('Outlet ID:', outletId);
    const numericId = Number(outletId);
    const outletIdValues = [outletId, numericId].filter(v => typeof v === 'string' || Number.isFinite(v));
    console.log('Outlet ID values:', outletIdValues);
    const filter = { retail_outlet: { $in: outletIdValues } };
    console.log('Filter:', JSON.stringify(filter));
    const count = await db.collection('dispensers_telemetry').countDocuments(filter);
    console.log('Count of dispensers_telemetry documents:', count);
    if (count > 0) {
      const documents = await db.collection('dispensers_telemetry').find(filter).limit(5).toArray();
      console.log('First 5 documents:', JSON.stringify(documents, null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
test();
