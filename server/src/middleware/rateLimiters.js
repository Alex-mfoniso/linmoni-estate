import { rateLimit } from "express-rate-limit";
import { ERROR_CODES } from "../constants/errorCodes.js";
const handler = (_req, res) => res.status(429).json({ success: false, message: "Too many requests. Please try again later.", code: ERROR_CODES.RATE_LIMITED, errors: [] });
export const generalLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 300, standardHeaders: "draft-8", legacyHeaders: false, handler });
export const authWriteLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 30, standardHeaders: "draft-8", legacyHeaders: false, handler });
