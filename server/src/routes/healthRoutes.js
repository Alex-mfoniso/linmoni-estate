import { Router } from "express";
import { successResponse } from "../utils/sanitizeResponse.js";
export function createHealthRouter(config) {
  const router = Router();
  router.get("/", (_req, res) => successResponse(res, "LINPAL API is running.", { status: "ok", environment: config.NODE_ENV, timestamp: new Date().toISOString(), version: "1.0.0" }));
  return router;
}
