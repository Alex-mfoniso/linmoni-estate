import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { requireActiveAccount } from "../middleware/requireActiveAccount.js";
import { authWriteLimiter } from "../middleware/rateLimiters.js";
import { updateOwnProfileSchema } from "../validators/authValidators.js";

/**
 * Creates the consolidated Auth Express router.
 * Separates public routing pathways from protected JWT pathways.
 */
export function createAuthRouter({ authenticate, requireProfile, controller }) {
  const router = Router();

  // ==========================================
  // Public (Unauthenticated) Routes
  // ==========================================
  router.post("/register", authWriteLimiter, asyncHandler(controller.register));
  router.post("/login", authWriteLimiter, asyncHandler(controller.login));
  router.post("/refresh", authWriteLimiter, asyncHandler(controller.refresh));
  router.post("/forgot-password", authWriteLimiter, asyncHandler(controller.forgotPassword));
  router.post("/reset-password", authWriteLimiter, asyncHandler(controller.resetPassword));
  router.post("/verify-email", authWriteLimiter, asyncHandler(controller.verifyEmail));

  // ==========================================
  // Protected (Authenticated) Routes
  // ==========================================
  router.get("/me", authenticate, requireProfile, requireActiveAccount, asyncHandler(controller.me));
  router.post("/logout", authenticate, asyncHandler(controller.logout));
  router.post("/resend-verification", authenticate, requireProfile, asyncHandler(controller.resendVerification));
  router.patch("/me", authenticate, requireProfile, requireActiveAccount, validateRequest(updateOwnProfileSchema), asyncHandler(controller.updateOwnProfile));
  router.patch("/complete-password-change", authenticate, requireProfile, asyncHandler(controller.completePasswordChange));

  // ==========================================
  // Backward-Compatible Legacy Endpoints
  // ==========================================
  router.post("/register-client-profile", authenticate, asyncHandler(controller.register));
  router.patch("/sync-email-verification", authenticate, requireProfile, asyncHandler(controller.me));
  router.post("/logout-event", authenticate, asyncHandler(controller.logout));

  return router;
}
