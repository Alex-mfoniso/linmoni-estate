import { describe, expect, it } from "vitest";
import { loadEnv } from "../../src/config/env.js";

const valid = {
  NODE_ENV: "test",
  PORT: "3000",
  MONGODB_URI: "mongodb://mock",
  CLIENT_ORIGINS: "http://localhost:8081,https://app.example.com",
  JWT_ACCESS_SECRET: "test_access_secret_token",
  JWT_REFRESH_SECRET: "test_refresh_secret_token",
  LOG_LEVEL: "silent"
};

describe("environment validation", () => {
  it("normalizes origins and parses secure parameters correctly", () => {
    const env = loadEnv(valid);
    expect(env.CLIENT_ORIGINS).toHaveLength(2);
    expect(env.JWT_ACCESS_SECRET).toBe("test_access_secret_token");
    expect(env.JWT_REFRESH_SECRET).toBe("test_refresh_secret_token");
  });

  it("fails fast and rejects production wildcard CORS", () => {
    expect(() => loadEnv({ ...valid, MONGODB_URI: "" })).toThrow(/MONGODB_URI/);
    expect(() => loadEnv({ ...valid, NODE_ENV: "production", CLIENT_ORIGINS: "*" })).toThrow(/CLIENT_ORIGINS/);
  });
});
