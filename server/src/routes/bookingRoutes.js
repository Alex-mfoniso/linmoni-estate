import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authWriteLimiter } from "../middleware/rateLimiters.js";
import { bookingListSchema, cancelBookingSchema, createBookingSchema } from "../validators/bookingValidators.js";
export function createBookingRouter({ guards, controller }) { const router = Router(); router.use(...guards); router.get("/", validateRequest(bookingListSchema), asyncHandler(controller.list)); router.post("/", authWriteLimiter, validateRequest(createBookingSchema), asyncHandler(controller.create)); router.patch("/:bookingId/cancel", authWriteLimiter, validateRequest(cancelBookingSchema), asyncHandler(controller.cancel)); return router; }
