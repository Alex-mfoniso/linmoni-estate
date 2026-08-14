import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authWriteLimiter } from "../middleware/rateLimiters.js";
import { emptyBodySchema } from "../validators/authValidators.js";
import { notificationActionSchema, notificationListSchema } from "../validators/notificationValidators.js";
export function createNotificationRouter({ guards, controller }) { const router = Router(); router.use(...guards); router.get("/", validateRequest(notificationListSchema), asyncHandler(controller.list)); router.get("/unread-count", validateRequest(emptyBodySchema), asyncHandler(controller.unread)); router.patch("/read-all", authWriteLimiter, validateRequest(emptyBodySchema), asyncHandler(controller.markAll)); router.patch("/:notificationId/read", authWriteLimiter, validateRequest(notificationActionSchema), asyncHandler(controller.markRead)); router.delete("/:notificationId", authWriteLimiter, validateRequest(notificationActionSchema), asyncHandler(controller.remove)); return router; }
