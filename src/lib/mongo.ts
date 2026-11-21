import mongoose from 'mongoose';

const globalForMongoose = globalThis as unknown as {
  mongooseConn?: Promise<typeof mongoose>;
};

export function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');
  // Fail fast instead of hanging when Mongo is down, and do not cache a failed connection.
  globalForMongoose.mongooseConn ??= mongoose
    .connect(uri, { serverSelectionTimeoutMS: 5000 })
    .catch((error: unknown) => {
      globalForMongoose.mongooseConn = undefined;
      throw error;
    });
  return globalForMongoose.mongooseConn;
}
