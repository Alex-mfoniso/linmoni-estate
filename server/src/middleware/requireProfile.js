import ApiError from "../utils/ApiError.js";
import { ERROR_CODES } from "../constants/errorCodes.js";
import { sanitizeProfile } from "../utils/sanitizeResponse.js";

/**
 * Middleware to fetch and load full Mongoose user profile parameters.
 * Supports backward-compatible service fallbacks for unit-test mocks.
 */
export const createRequireProfile = (userService) => async (req, _res, next) => {
  try {
    const searchId = req.auth.id || req.auth.uid;
    
    // Fallback to findByFirebaseUid for older testing mock architectures
    const user = typeof userService.findById === "function"
      ? await userService.findById(searchId)
      : await userService.findByFirebaseUid(searchId);

    if (!user) {
      throw new ApiError(404, ERROR_CODES.PROFILE_MISSING, "No application profile is linked to this account.");
    }

    // Dynamic verification synchronization ONLY when explicitly hitting the sync route
    const isSyncRoute = req.path.endsWith("/sync-email-verification");
    if (isSyncRoute && typeof userService.syncVerification === "function" && req.auth.emailVerified !== undefined) {
      await userService.syncVerification(user, req.auth.emailVerified);
    }

    req.userDocument = user;
    req.user = sanitizeProfile(user);
    next();
  } catch (error) {
    next(error);
  }
};
