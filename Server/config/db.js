import mongoose from "mongoose";
import { env } from "./env.js";

mongoose.set("strictQuery", true);

// Cached across invocations so serverless functions reuse one connection.
let pending = null;

export function withDbName(uri) {
  const url = new URL(uri);
  if (!url.pathname || url.pathname === "/") url.pathname = "/Hospital";
  return url.toString();
}

export async function connectDB(uri = env.mongoUri) {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!pending) {
    pending = mongoose
      .connect(withDbName(uri), { serverSelectionTimeoutMS: 8000 })
      .then((m) => m.connection)
      .catch((err) => {
        pending = null;
        throw err;
      });
  }
  return pending;
}

export async function disconnectDB() {
  pending = null;
  await mongoose.disconnect();
}
