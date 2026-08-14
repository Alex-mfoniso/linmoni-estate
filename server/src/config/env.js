import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  PORT: z.coerce.number().int().min(1).max(65535),
  MONGODB_URI: z.string().min(1),
  CLIENT_ORIGINS: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(1).default("default_access_secret_linpal_secure_2026"),
  JWT_REFRESH_SECRET: z.string().min(1).default("default_refresh_secret_linpal_secure_2026"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
}).passthrough();

let cached;

export function loadEnv(source = process.env) {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    const names = [...new Set(parsed.error.issues.map((issue) => issue.path.join(".")).filter(Boolean))];
    throw new Error(`Invalid server environment configuration: ${names.join(", ")}`);
  }
  const origins = parsed.data.CLIENT_ORIGINS.split(",").map((v) => v.trim()).filter(Boolean);
  if (!origins.length || (parsed.data.NODE_ENV === "production" && origins.includes("*"))) {
    throw new Error("Invalid server environment configuration: CLIENT_ORIGINS");
  }
  const { NODE_ENV, PORT, MONGODB_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, LOG_LEVEL } = parsed.data;
  return Object.freeze({
    NODE_ENV,
    PORT,
    MONGODB_URI,
    CLIENT_ORIGINS: origins,
    JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET,
    LOG_LEVEL
  });
}

export function getEnv() { cached ??= loadEnv(); return cached; }
export function resetEnvForTests() { cached = undefined; }
