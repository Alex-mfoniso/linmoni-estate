import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { limitSchema, propertyIdSchema, propertyListSchema } from "../validators/propertyValidators.js";
export function createPropertyRouter({ guards, controller }) { const router = Router(); router.use(...guards); router.get("/", validateRequest(propertyListSchema), asyncHandler(controller.list)); router.get("/featured", validateRequest(limitSchema), asyncHandler(controller.featured)); router.get("/recommended", validateRequest(limitSchema), asyncHandler(controller.recommended)); router.get("/:propertyId/similar", validateRequest(propertyIdSchema), asyncHandler(controller.similar)); router.get("/:propertyId", validateRequest(propertyIdSchema), asyncHandler(controller.detail)); return router; }
