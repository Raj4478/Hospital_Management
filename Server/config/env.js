import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
// Server/.env first, then the repo-root .env (the old location) as a fallback.
dotenv.config({ path: path.join(here, "..", ".env") });
dotenv.config({ path: path.join(here, "..", "..", ".env") });

const list = (value, fallback) =>
  (value || fallback).split(",").map((s) => s.trim()).filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProd: process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL),
  isTest: process.env.NODE_ENV === "test",
  port: Number(process.env.PORT) || 8000,
  mongoUri: process.env.MONGODB_URI,
  corsOrigins: list(process.env.CORS_ORIGIN, "http://localhost:5173"),
  accessSecret: process.env.ACCESS_TOKEN_SECRET,
  accessExpiry: process.env.ACCESS_TOKEN_EXPIRY || "15m",
  refreshSecret: process.env.REFRESH_TOKEN_SECRET,
  refreshExpiry: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  signupRoles: list(process.env.SIGNUP_ROLES, "Manager,Pantry"),
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
};

export function assertEnv() {
  const missing = [
    ["MONGODB_URI", env.mongoUri],
    ["ACCESS_TOKEN_SECRET", env.accessSecret],
    ["REFRESH_TOKEN_SECRET", env.refreshSecret],
  ].filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}
