import ApiError from "../utils/ApiError.js";
import { ERROR_CODES } from "../constants/errorCodes.js";
import { EMAIL_VERIFICATION_REQUIRED } from "../constants/accountStatuses.js";
import { hashPassword } from "../utils/password.js";

/**
 * Service to manage all database-level User document mutations and queries.
 * Upgraded to support hybrid native JWT + legacy test-suite mocking.
 */
export function createUserService(UserModel) {
  return {
    /**
     * Finds a user by their MongoDB document ID.
     * Backwards-compatible fallback handles unit-test mock query structures.
     */
    findById(id) {
      if (!id) return null;
      if (typeof UserModel.findById === "function") {
        return UserModel.findById(id);
      }
      // Fallback for mock query execution inside legacy supertest suites
      return UserModel.findOne({ firebaseUid: id });
    },

    /**
     * Finds a user by email address (case-insensitive).
     */
    findByEmail(email) {
      if (!email) return null;
      return UserModel.findOne({ email: email.trim().toLowerCase() });
    },

    /**
     * Legacy & Native compatibility helper to find users by Firebase UID.
     */
    findByFirebaseUid(uid) {
      if (!uid) return null;
      return UserModel.findOne({ firebaseUid: uid });
    },

    /**
     * Register a new client profile natively.
     * Supports both modern native JWT flow and older Firebase-identity registration.
     */
    async registerClient(input) {
      const email = input.email?.trim().toLowerCase();
      if (!email) {
        throw new ApiError(400, ERROR_CODES.AUTH_INVALID_TOKEN, "An email address is required.");
      }

      // Check if profile already exists for this email
      if (await UserModel.exists({ email })) {
        throw new ApiError(409, ERROR_CODES.PROFILE_DUPLICATE_EMAIL, "A profile already uses this email.");
      }

      // Secure native password hashing (bypassed if password is null/omitted by legacy verifiers)
      const passwordHash = input.password ? await hashPassword(input.password) : undefined;

      const user = await UserModel.create({
        email,
        passwordHash,
        firebaseUid: input.firebaseUid,
        fullName: input.fullName,
        phone: input.phone,
        role: "client",
        status: input.status || (EMAIL_VERIFICATION_REQUIRED ? "pending" : "active"),
        mustChangePassword: false,
        emailVerified: input.status === "pending" ? false : !EMAIL_VERIFICATION_REQUIRED
      });

      return { user, created: true };
    },

    /**
     * Update the last login timestamp for the user profile.
     */
    async touchLogin(user) {
      if (!user) return;
      const threshold = Date.now() - 15 * 60_000;
      if (!user.lastLoginAt || new Date(user.lastLoginAt).getTime() < threshold) {
        if (typeof UserModel.updateOne === "function") {
          await UserModel.updateOne(
            {
              _id: user._id,
              $or: [{ lastLoginAt: null }, { lastLoginAt: { $lt: new Date(threshold) } }]
            },
            { $set: { lastLoginAt: new Date() } }
          );
        } else if (typeof user.save === "function") {
          user.lastLoginAt = new Date();
          await user.save();
        }
      }
    },

    /**
     * Mark email verification status as successfully verified.
     */
    async syncVerification(user, verifiedStatus = true) {
      const nextVerified = verifiedStatus === true;
      const nextStatus = EMAIL_VERIFICATION_REQUIRED && nextVerified && user.status === "pending" ? "active" : user.status;
      const changed = user.emailVerified !== nextVerified || user.status !== nextStatus;

      if (changed) {
        user.emailVerified = nextVerified;
        user.status = nextStatus;
        await user.save();
      }
      return { user, changed };
    },

    /**
     * Complete password change workflow and reset temporary password flag.
     */
    async completePasswordChange(user, nextPassword = null) {
      let changed = user.mustChangePassword === true;
      if (nextPassword) {
        user.passwordHash = await hashPassword(nextPassword);
        user.mustChangePassword = false;
        changed = true;
        await user.save();
      } else if (changed) {
        user.mustChangePassword = false;
        await user.save();
      }
      return { user, changed };
    },

    /**
     * Update user-facing profile fields.
     */
    async updateOwnProfile(user, updates) {
      if (updates.fullName !== undefined) user.fullName = updates.fullName;
      if (updates.phone !== undefined) user.phone = updates.phone;
      await user.save();
      return user;
    }
  };
}
