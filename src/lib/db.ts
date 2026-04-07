import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {  var __mongooseCache__: MongooseCache | undefined;
}

const cached = global.__mongooseCache__ ?? {
  conn: null,
  promise: null,
};

global.__mongooseCache__ = cached;

export async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing.");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongoUri, { bufferCommands: false })
      .then((instance) => instance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

