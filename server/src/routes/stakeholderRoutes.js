import express from "express";
import { validateRequest } from "../middleware/validateRequest.js";
import { queryOverviewSchema, updateStakeholderProfileSchema } from "../validators/stakeholderValidators.js";

export function createStakeholderRouter({ guards, controller }) {
  if (!guards || !Array.isArray(guards)) {
    throw new Error("createStakeholderRouter requires an array of guards.");
  }
  if (!controller) {
    throw new Error("createStakeholderRouter requires a controller.");
  }

  const router = express.Router();

  // Apply authorization security guards to all sub-routes
  guards.forEach((guard) => router.use(guard));

  // Stakeholder REST endpoints
  router.get("/overview", validateRequest(queryOverviewSchema), controller.getDashboard);
  router.get("/analytics/properties", controller.getPropertyAnalytics);
  router.get("/analytics/realtors", controller.getRealtorAnalytics);
  router.get("/analytics/staff", controller.getStaffAnalytics);
  router.get("/activity", controller.getActivityLogs);
  
  router.get("/profile", controller.getProfile);
  router.patch("/profile", validateRequest(updateStakeholderProfileSchema), controller.updateProfile);

  router.get("/reports/properties", controller.exportPropertiesReport);
  router.get("/reports/performance", controller.exportPerformanceReport);
  router.get("/reports/operations", controller.exportOperationsReport);

  return router;
}
