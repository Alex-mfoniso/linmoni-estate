import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authWriteLimiter } from "../middleware/rateLimiters.js";
import { clientProfileUpdateSchema } from "../validators/profileValidators.js";
export function createProfileRouter({ guards, controller }) { const router = Router(); router.use(...guards); router.get("/", asyncHandler(controller.me)); router.patch("/", authWriteLimiter, validateRequest(clientProfileUpdateSchema), asyncHandler(controller.updateOwnProfile)); return router; }
