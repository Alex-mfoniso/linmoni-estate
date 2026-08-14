import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authWriteLimiter } from "../middleware/rateLimiters.js";
import {
  realtorPropertyListSchema,
  createRealtorPropertySchema,
  updateRealtorPropertySchema,
  updateRealtorLeadSchema,
  rescheduleRealtorBookingSchema,
  updateRealtorProfileSchema
} from "../validators/realtorValidators.js";

export function createRealtorRouter({ guards, controller }) {
  const router = Router();

  // Apply all protective authentication, profile, and role-based guards (Realtor role)
  router.use(...guards);

  // 1. Dashboard
  router.get("/dashboard", asyncHandler(controller.getDashboard));

  // 2. Properties CRUD
  router.get("/properties", validateRequest(realtorPropertyListSchema), asyncHandler(controller.getProperties));
  router.post("/properties", authWriteLimiter, validateRequest(createRealtorPropertySchema), asyncHandler(controller.createProperty));
  router.get("/properties/:propertyId", asyncHandler(controller.getPropertyDetail));
  router.patch("/properties/:propertyId", authWriteLimiter, validateRequest(updateRealtorPropertySchema), asyncHandler(controller.updateProperty));
  router.patch("/properties/:propertyId/archive", authWriteLimiter, asyncHandler(controller.archiveProperty));

  // 3. Leads Management
  router.get("/leads", asyncHandler(controller.getLeads));
  router.get("/leads/:leadId", asyncHandler(controller.getLeadDetail));
  router.patch("/leads/:leadId", authWriteLimiter, validateRequest(updateRealtorLeadSchema), asyncHandler(controller.updateLead));

  // 4. Inspection Bookings
  router.get("/bookings", asyncHandler(controller.getBookings));
  router.get("/bookings/:bookingId", asyncHandler(controller.getBookingDetail));
  router.patch("/bookings/:bookingId/confirm", authWriteLimiter, asyncHandler(controller.confirmBooking));
  router.patch("/bookings/:bookingId/reject", authWriteLimiter, asyncHandler(controller.rejectBooking));
  router.patch("/bookings/:bookingId/reschedule", authWriteLimiter, validateRequest(rescheduleRealtorBookingSchema), asyncHandler(controller.rescheduleBooking));
  router.patch("/bookings/:bookingId/complete", authWriteLimiter, asyncHandler(controller.completeBooking));

  // 5. Messaging / Chats
  router.get("/conversations", asyncHandler(controller.getConversations));
  router.get("/conversations/:conversationId/messages", asyncHandler(controller.getMessages));
  router.post("/conversations/:conversationId/messages", authWriteLimiter, asyncHandler(controller.sendMessage));
  router.patch("/conversations/:conversationId/read", authWriteLimiter, asyncHandler(controller.markConversationRead));

  // 6. Profile Settings
  router.get("/profile", asyncHandler(controller.getProfile));
  router.patch("/profile", authWriteLimiter, validateRequest(updateRealtorProfileSchema), asyncHandler(controller.updateProfile));

  return router;
}
