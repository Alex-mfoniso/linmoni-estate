import crypto from "node:crypto";
import pino from "pino";
import pinoHttp from "pino-http";
const redact = ["req.headers.authorization", "req.headers.cookie", "password", "newPassword", "confirmPassword", "FIREBASE_PRIVATE_KEY", "MONGODB_URI"];
export const createLogger = (level = "info") => pino({ level, redact });
export const createHttpLogger = (logger) => pinoHttp({ logger, redact, genReqId(req, res) { const id = req.headers["x-request-id"] || crypto.randomUUID(); res.setHeader("x-request-id", id); return id; } });
