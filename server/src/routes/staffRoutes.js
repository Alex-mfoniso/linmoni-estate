import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authWriteLimiter } from "../middleware/rateLimiters.js";
import {
  staffPropertyListSchema,
  staffTaskListSchema,
  updateStaffTaskSchema,
  reassignStaffTaskSchema,
  verifyPropertySchema,
  requestPropertyChangesSchema,
  staffInspectionListSchema,
  updateStaffInspectionSchema,
  staffIssueListSchema,
  createStaffIssueSchema,
  updateStaffIssueSchema,
  updateStaffProfileSchema
} from "../validators/staffValidators.js";

export function createStaffRouter({ guards, controller }) {
  const router = Router();

  // Protect all sub-routes using our core auth, profile, and role filters
  router.use(...guards);

  // 1. Dashboard
  router.get("/dashboard", asyncHandler(controller.getDashboard));

  // 2. Task Management
  router.get("/tasks", validateRequest(staffTaskListSchema), asyncHandler(controller.getTasks));
  router.get("/tasks/:taskId", asyncHandler(controller.getTaskDetail));
  router.patch("/tasks/:taskId", authWriteLimiter, validateRequest(updateStaffTaskSchema), asyncHandler(controller.updateTask));
  router.patch("/tasks/:taskId/reassign", authWriteLimiter, validateRequest(reassignStaffTaskSchema), asyncHandler(controller.reassignTask));

  // 3. Property Review
  router.get("/properties/pending", validateRequest(staffPropertyListSchema), asyncHandler(controller.getPendingProperties));
  router.get("/properties/:propertyId/review", asyncHandler(controller.getPropertyReview));
  router.post("/properties/:propertyId/verify", authWriteLimiter, validateRequest(verifyPropertySchema), asyncHandler(controller.verifyProperty));
  router.post("/properties/:propertyId/request-changes", authWriteLimiter, validateRequest(requestPropertyChangesSchema), asyncHandler(controller.requestPropertyChanges));

  // 4. Inspection Management
  router.get("/inspections", validateRequest(staffInspectionListSchema), asyncHandler(controller.getInspections));
  router.get("/inspections/:inspectionId", asyncHandler(controller.getInspectionDetail));
  router.patch("/inspections/:inspectionId", authWriteLimiter, validateRequest(updateStaffInspectionSchema), asyncHandler(controller.updateInspection));

  // 5. Issue Tracking
  router.get("/issues", validateRequest(staffIssueListSchema), asyncHandler(controller.getIssues));
  router.post("/issues", authWriteLimiter, validateRequest(createStaffIssueSchema), asyncHandler(controller.createIssue));
  router.get("/issues/:issueId", asyncHandler(controller.getIssueDetail));
  router.patch("/issues/:issueId", authWriteLimiter, validateRequest(updateStaffIssueSchema), asyncHandler(controller.updateIssue));

  // 6. Profile Actions
  router.get("/profile", asyncHandler(controller.getProfile));
  router.patch("/profile", authWriteLimiter, validateRequest(updateStaffProfileSchema), asyncHandler(controller.updateProfile));

  return router;
}
