import crypto from "crypto";
import jwt from "jsonwebtoken";
import { getEnv } from "../config/env.js";
import { sanitizeProfile, successResponse } from "../utils/sanitizeResponse.js";
import { verifyPassword, hashPassword } from "../utils/password.js";
import ApiError from "../utils/ApiError.js";
import { ERROR_CODES } from "../constants/errorCodes.js";

/**
 * SHA256 helper to store secure, non-reversible hashes of refresh/verification tokens.
 */
function hashSecuredToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Helper to generate access and refresh JWT pairs.
 */
function generateTokens(user, config) {
  const accessSecret = config.JWT_ACCESS_SECRET || "default_access_secret_linpal_secure_2026";
  const refreshSecret = config.JWT_REFRESH_SECRET || "default_refresh_secret_linpal_secure_2026";

  const accessToken = jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    accessSecret,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user._id.toString() },
    refreshSecret,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
}

export function createAuthController({ userService, auditService }) {
  const config = getEnv();

  return {
    /**
     * Native Public Registration for Clients.
     */
    register: async (req, res) => {
      // 1. Detect if this is the legacy endpoint from older Firebase test suites
      const isLegacy = req.path.endsWith("/register-client-profile");
      if (isLegacy) {
        const { fullName, phone, role, status, firebaseUid, email: bodyEmail } = req.body;
        
        // Block administrative field injections as validated by security tests
        if (role || status || firebaseUid || bodyEmail) {
          throw new ApiError(400, ERROR_CODES.VALIDATION_FAILED, "Admin injection fields are forbidden.");
        }
        
        if (!fullName) {
          throw new ApiError(400, ERROR_CODES.VALIDATION_FAILED, "Full name is required.");
        }

        const legacyUid = req.auth.id || req.auth.uid;
        const legacyEmail = req.auth.email;

        // Is duplicate-safe for the same UID and email
        const existing = await userService.findByFirebaseUid(legacyUid);
        if (existing) {
          return successResponse(res, "Profile already exists.", { profile: sanitizeProfile(existing) }, 200);
        }

        // Reject emails owned by another UID
        const emailOwner = await userService.findByEmail(legacyEmail);
        if (emailOwner) {
          throw new ApiError(409, ERROR_CODES.PROFILE_DUPLICATE_EMAIL, "This email is registered under a different account.");
        }

        const result = await userService.registerClient({
          fullName,
          email: legacyEmail,
          phone: phone || "",
          firebaseUid: legacyUid,
          status: "pending"
        });

        await auditService.record({
          req,
          action: "client_profile_created",
          user: result.user,
          metadata: { role: "client", status: result.user.status }
        });

        return successResponse(res, "Profile created successfully.", { profile: sanitizeProfile(result.user) }, 201);
      }

      // 2. Modern Native JWT Flow
      const { fullName, email, phone, password } = req.body;
      if (!fullName || !email || !phone || !password) {
        throw new ApiError(400, ERROR_CODES.AUTH_INVALID_TOKEN, "Please provide all required fields.");
      }

      // Create native MongoDB profile
      const result = await userService.registerClient({ fullName, email, phone, password });

      // Generate Access and Refresh JWT pair
      const { accessToken, refreshToken } = generateTokens(result.user, config);

      // Save hashed refresh token on the user document
      const tokenHash = hashSecSecuredToken(refreshToken);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // Access selected fields since Model excludes refreshTokens array by default
      const userDoc = await userService.findById(result.user._id).select("+refreshTokens");
      userDoc.refreshTokens.push({ tokenHash, expiresAt });
      await userDoc.save();

      // Record Audit Log
      await auditService.record({
        req,
        action: "client_profile_created",
        user: result.user,
        metadata: { role: "client", status: result.user.status }
      });

      return successResponse(
        res,
        "Account created successfully.",
        {
          accessToken,
          refreshToken,
          profile: sanitizeProfile(result.user)
        },
        201
      );
    },

    /**
     * Native Login verifying email + password.
     */
    login: async (req, res) => {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new ApiError(400, ERROR_CODES.AUTH_INVALID_TOKEN, "Please enter email and password.");
      }

      // Check if user profile exists
      const user = await userService.findByEmail(email);
      if (!user) {
        throw new ApiError(401, ERROR_CODES.AUTH_INVALID_TOKEN, "Invalid email or password.");
      }

      // Check if account is active
      if (["disabled", "suspended"].includes(user.status)) {
        throw new ApiError(403, ERROR_CODES.ROLE_FORBIDDEN, `Your account is currently ${user.status}. Please contact support.`);
      }

      // Verify native password hash
      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        throw new ApiError(401, ERROR_CODES.AUTH_INVALID_TOKEN, "Invalid email or password.");
      }

      // Generate JWT pair
      const { accessToken, refreshToken } = generateTokens(user, config);

      // Save hashed refresh token
      const tokenHash = hashSecSecuredToken(refreshToken);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const userDoc = await userService.findById(user._id).select("+refreshTokens");
      userDoc.refreshTokens.push({ tokenHash, expiresAt });
      await userDoc.save();

      // Touch Login timestamp & Record audit
      await userService.touchLogin(user);
      await auditService.record({ req, action: "login_recorded", user });

      return successResponse(res, "Signed in successfully.", {
        accessToken,
        refreshToken,
        profile: sanitizeProfile(user)
      });
    },

    /**
     * Safe Current User Profile Retrieval.
     */
    me: async (req, res) => {
      await userService.touchLogin(req.userDocument);
      await auditService.record({ req, action: "profile_loaded", user: req.userDocument });
      return successResponse(res, "Profile loaded successfully.", {
        profile: sanitizeProfile(req.userDocument)
      });
    },

    /**
     * Token Refresh endpoint implementing Refresh Token Rotation & Replay Attack Protection.
     */
    refresh: async (req, res) => {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new ApiError(400, ERROR_CODES.AUTH_MISSING_TOKEN, "A refresh token is required.");
      }

      // 1. Verify Refresh Token Signature
      let decoded;
      try {
        decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET || "default_refresh_secret_linpal_secure_2026");
      } catch (err) {
        throw new ApiError(401, ERROR_CODES.AUTH_EXPIRED_TOKEN, "Session expired. Please sign in again.");
      }

      // 2. Fetch User along with their active refresh token list
      const user = await userService.findById(decoded.id).select("+refreshTokens");
      if (!user) {
        throw new ApiError(401, ERROR_CODES.AUTH_INVALID_TOKEN, "Session expired. Please sign in again.");
      }

      const incomingHash = hashSecSecuredToken(refreshToken);

      // 3. Find if the refresh token is in the user's active tokens database list
      const tokenIndex = user.refreshTokens.findIndex(t => t.tokenHash === incomingHash);

      // Replay Attack Protection: Token was rotated, used, or revoked. Clear ALL active sessions immediately.
      if (tokenIndex === -1) {
        user.refreshTokens = [];
        await user.save();
        await auditService.record({
          req,
          action: "security_alert",
          user,
          metadata: { alert: "refresh_token_replay_detected_sessions_cleared" }
        });
        throw new ApiError(401, ERROR_CODES.AUTH_INVALID_TOKEN, "Security alert: Replay detected. Please sign in again.");
      }

      // Ensure the token has not expired natively
      const tokenRecord = user.refreshTokens[tokenIndex];
      if (tokenRecord.expiresAt < new Date()) {
        user.refreshTokens.splice(tokenIndex, 1);
        await user.save();
        throw new ApiError(401, ERROR_CODES.AUTH_EXPIRED_TOKEN, "Session expired. Please sign in again.");
      }

      // 4. Perform Refresh Token Rotation (RTR)
      const tokens = generateTokens(user, config);
      const newHash = hashSecSecuredToken(tokens.refreshToken);
      const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // Remove the old token, add the rotated token
      user.refreshTokens.splice(tokenIndex, 1);
      user.refreshTokens.push({ tokenHash: newHash, expiresAt: newExpiresAt });
      await user.save();

      return successResponse(res, "Tokens rotated successfully.", {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      });
    },

    /**
     * Native Logout, revoking the active refresh token.
     */
    logout: async (req, res) => {
      const { refreshToken } = req.body;
      if (refreshToken) {
        const hash = hashSecSecuredToken(refreshToken);
        const user = await userService.findById(req.auth.id).select("+refreshTokens");
        if (user) {
          user.refreshTokens = user.refreshTokens.filter(t => t.tokenHash !== hash);
          await user.save();
        }
      }

      await auditService.record({ req, action: "logout_recorded", user: req.userDocument });
      return successResponse(res, "Logout successful.");
    },

    /**
     * Forgot Password workflow.
     */
    forgotPassword: async (req, res) => {
      const { email } = req.body;
      if (!email) {
        throw new ApiError(400, ERROR_CODES.AUTH_INVALID_TOKEN, "Email is required.");
      }

      const user = await userService.findByEmail(email);
      if (user) {
        // Generate random plain text token
        const rawToken = crypto.randomBytes(32).toString("hex");
        user.passwordResetTokenHash = hashSecSecuredToken(rawToken);
        user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1-hour expiry
        await user.save();

        // Under local testing/staging context: console log the link clearly
        console.log(`\n==================================================`);
        console.log(`[REQUIRES PRODUCTION CONFIGURATION] - PASSWORD RESET LINK`);
        console.log(`Email: ${email}`);
        console.log(`Token: ${rawToken}`);
        console.log(`Reset URL Matcher: http://localhost:3000/api/v1/auth/reset-password?token=${rawToken}`);
        console.log(`==================================================\n`);
      }

      return successResponse(res, "If that email exists, we have sent a reset instructions link.", {
        status: "REQUIRES PRODUCTION CONFIGURATION"
      });
    },

    /**
     * Reset Password workflow using verified crypto hash matching.
     */
    resetPassword: async (req, res) => {
      const { token, password } = req.body;
      if (!token || !password) {
        throw new ApiError(400, ERROR_CODES.AUTH_INVALID_TOKEN, "Token and password are required.");
      }

      const hash = hashSecSecuredToken(token);
      const user = await userService.findByEmail(req.body.email); // Locate user profile

      if (!user || user.passwordResetTokenHash !== hash || user.passwordResetExpiresAt < new Date()) {
        throw new ApiError(400, ERROR_CODES.AUTH_INVALID_TOKEN, "Invalid or expired reset token.");
      }

      // Update password hash, nullify token fields
      user.passwordHash = await hashPassword(password);
      user.passwordResetTokenHash = null;
      user.passwordResetExpiresAt = null;
      user.mustChangePassword = false;
      await user.save();

      await auditService.record({ req, action: "password_change_completed", user });

      return successResponse(res, "Password has been reset successfully. Please sign in.");
    },

    /**
     * Email verification token matching.
     */
    verifyEmail: async (req, res) => {
      const { token } = req.body;
      if (!token) {
        throw new ApiError(400, ERROR_CODES.AUTH_INVALID_TOKEN, "Verification token is required.");
      }

      const hash = hashSecSecuredToken(token);
      const user = await userService.findByEmail(req.body.email);

      if (!user || user.verificationTokenHash !== hash || user.verificationTokenExpiresAt < new Date()) {
        throw new ApiError(400, ERROR_CODES.AUTH_INVALID_TOKEN, "Invalid or expired verification token.");
      }

      // Mark email as verified natively, and unlock pending status
      user.emailVerified = true;
      user.verificationTokenHash = null;
      user.verificationTokenExpiresAt = null;
      if (user.status === "pending") {
        user.status = "active";
      }
      await user.save();

      await auditService.record({ req, action: "email_verification_synced", user, metadata: { status: user.status } });

      return successResponse(res, "Email address successfully verified.", {
        profile: sanitizeProfile(user)
      });
    },

    /**
     * Resend verification token console-mocking.
     */
    resendVerification: async (req, res) => {
      const user = req.userDocument;
      const rawToken = crypto.randomBytes(32).toString("hex");

      user.verificationTokenHash = hashSecSecuredToken(rawToken);
      user.verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24-hours
      await user.save();

      console.log(`\n==================================================`);
      console.log(`[REQUIRES PRODUCTION CONFIGURATION] - EMAIL VERIFICATION LINK`);
      console.log(`Email: ${user.email}`);
      console.log(`Token: ${rawToken}`);
      console.log(`Verification Matcher: http://localhost:3000/api/v1/auth/verify-email?token=${rawToken}`);
      console.log(`==================================================\n`);

      return successResponse(res, "Verification email sent.", {
        status: "REQUIRES PRODUCTION CONFIGURATION"
      });
    },

    /**
     * Profile Update.
     */
    updateOwnProfile: async (req, res) => {
      const user = await userService.updateOwnProfile(req.userDocument, req.validated.body);
      return successResponse(res, "Profile updated successfully.", { profile: sanitizeProfile(user) });
    },

    /**
     * Password change for invited users requiring temporary password modification.
     */
    completePasswordChange: async (req, res) => {
      const { password } = req.body;
      const result = await userService.completePasswordChange(req.userDocument, password);
      if (result.changed) {
        await auditService.record({ req, action: "password_change_completed", user: result.user, metadata: { changed: true } });
      }
      return successResponse(res, "Password change completed.", { profile: sanitizeProfile(result.user) });
    }
  };
}

/**
 * Clean wrapper because of the single spelling typo on register hashSecSecuredToken.
 */
function hashSecSecuredToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
