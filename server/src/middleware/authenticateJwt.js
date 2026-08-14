import jwt from "jsonwebtoken";
import { getEnv } from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import { ERROR_CODES } from "../constants/errorCodes.js";

/**
 * Express middleware to authenticate incoming JWT access tokens.
 * Supports a backward-compatible testing mock verification path.
 */
export const createAuthenticateJwt = (configInput, adminAuthMock) => {
  const config = configInput || getEnv();
  const secret = config.JWT_ACCESS_SECRET || "default_access_secret_linpal_secure_2026";

  return async (req, _res, next) => {
    try {
      const header = req.get("authorization") || "";
      if (!header) {
        throw new ApiError(401, ERROR_CODES.AUTH_MISSING_TOKEN, "Authentication is required.");
      }

      const [scheme, token, extra] = header.trim().split(/\s+/);
      if (scheme?.toLowerCase() !== "bearer" || !token || extra) {
        throw new ApiError(401, ERROR_CODES.AUTH_INVALID_SCHEME, "Your session could not be verified.");
      }

      // Backward-compatible verification for integration testing suites
      if (adminAuthMock && typeof adminAuthMock.verifyIdToken === "function") {
        let decoded;
        try {
          decoded = await adminAuthMock.verifyIdToken(token);
        } catch (error) {
          const isExpired = error?.code === "auth/id-token-expired" || error?.name === "TokenExpiredError";
          throw new ApiError(
            401,
            isExpired ? ERROR_CODES.AUTH_EXPIRED_TOKEN : ERROR_CODES.AUTH_INVALID_TOKEN,
            isExpired ? "Your session has expired." : "Your session could not be verified."
          );
        }

        req.auth = {
          id: decoded.uid || decoded.id,
          email: String(decoded.email || "").trim().toLowerCase(),
          role: decoded.role || "stakeholder",
          emailVerified: decoded.email_verified === true || decoded.emailVerified === true
        };
        return next();
      }

      let decoded;
      try {
        decoded = jwt.verify(token, secret);
      } catch (error) {
        const expired = error?.name === "TokenExpiredError";
        throw new ApiError(
          401,
          expired ? ERROR_CODES.AUTH_EXPIRED_TOKEN : ERROR_CODES.AUTH_INVALID_TOKEN,
          expired ? "Your session has expired." : "Your session could not be verified."
        );
      }

      if (!decoded?.id) {
        throw new ApiError(401, ERROR_CODES.AUTH_INVALID_TOKEN, "Your session could not be verified.");
      }

      req.auth = {
        id: decoded.id,
        email: String(decoded.email || "").trim().toLowerCase(),
        role: decoded.role,
        emailVerified: decoded.emailVerified === true
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};
