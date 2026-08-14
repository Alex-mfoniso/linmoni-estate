import express from "express";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  adminUserFilterSchema,
  updateUserStatusSchema,
  updateUserRoleSchema,
  adminPropertyFilterSchema,
  updatePropertyStatusSchema,
  updatePropertySchema,
  createStakeholderSchema,
  updatePlatformSettingsSchema,
  adminAuditLogsFilterSchema
} from "../validators/adminValidators.js";

export function createAdminRouter({ guards, controller }) {
  if (!guards || !Array.isArray(guards)) {
    throw new Error("createAdminRouter requires an array of guards.");
  }
  if (!controller) {
    throw new Error("createAdminRouter requires an admin controller.");
  }

  const router = express.Router();

  // Apply administrative role guards to all routes
  guards.forEach((guard) => router.use(guard));

  // Platform Dashboard
  router.get("/overview", controller.getDashboard);

  // User Management
  router.get("/users", validateRequest(adminUserFilterSchema), controller.getUsers);
  router.get("/users/:userId", controller.getUserDetail);
  router.patch("/users/:userId/status", validateRequest(updateUserStatusSchema), controller.updateUserStatus);
  router.patch("/users/:userId/role", validateRequest(updateUserRoleSchema), controller.updateUserRole);

  // Stakeholder Provisioning
  router.post("/stakeholders", validateRequest(createStakeholderSchema), controller.createStakeholder);

  // Property Lifecycle Management
  router.get("/properties", validateRequest(adminPropertyFilterSchema), controller.getProperties);
  router.get("/properties/:propertyId", controller.getPropertyDetail);
  router.patch("/properties/:propertyId", validateRequest(updatePropertySchema), controller.updateProperty);
  router.patch("/properties/:propertyId/status", validateRequest(updatePropertyStatusSchema), controller.updatePropertyStatus);
  router.delete("/properties/:propertyId", controller.deleteProperty);

  // Platform Configurations Settings
  router.get("/settings", controller.getPlatformSettings);
  router.patch("/settings", validateRequest(updatePlatformSettingsSchema), controller.updatePlatformSettings);

  // System Audit Events
  router.get("/audit-logs", validateRequest(adminAuditLogsFilterSchema), controller.getAuditLogs);

  return router;
}
