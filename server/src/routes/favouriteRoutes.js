import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authWriteLimiter } from "../middleware/rateLimiters.js";
import { favouriteListSchema, favouritePropertySchema } from "../validators/favouriteValidators.js";
export function createFavouriteRouter({ guards, controller }) { const router = Router(); router.use(...guards); router.get("/", validateRequest(favouriteListSchema), asyncHandler(controller.list)); router.post("/:propertyId", authWriteLimiter, validateRequest(favouritePropertySchema), asyncHandler(controller.add)); router.delete("/:propertyId", authWriteLimiter, validateRequest(favouritePropertySchema), asyncHandler(controller.remove)); return router; }
