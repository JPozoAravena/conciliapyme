import mongoose from 'mongoose';

const globalForMongoose = globalThis as unknown as {
  mongooseConn?: Promise<typeof mongoose>;
};

export function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');
  globalForMongoose.mongooseConn ??= mongoose.connect(uri);
  return globalForMongoose.mongooseConn;
}