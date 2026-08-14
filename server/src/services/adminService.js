import ApiError from "../utils/ApiError.js";
import { ERROR_CODES } from "../constants/errorCodes.js";
import mongoose from "mongoose";
import { hashPassword } from "../utils/password.js";

export function createAdminService({
  UserModel,
  PropertyModel,
  BookingModel,
  IssueModel,
  AuditLogModel,
  PlatformSettingModel
}) {
  return {
    async getOverview() {
      // 1. Platform counts
      const totalUsers = await UserModel.countDocuments();
      const activeUsers = await UserModel.countDocuments({ status: "active" });
      const totalProperties = await PropertyModel.countDocuments();
      const activeListings = await PropertyModel.countDocuments({ status: "active" });
      const pendingReviews = await PropertyModel.countDocuments({ status: "pending" });
      const openIssues = await IssueModel.countDocuments({ status: { $in: ["open", "investigating", "waiting"] } });

      // 2. User breakdowns
      const userRoleCounts = await UserModel.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } }
      ]);
      const users = {
        total: totalUsers,
        active: activeUsers,
        breakdown: {
          client: 0,
          realtor: 0,
          staff: 0,
          stakeholder: 0,
          admin: 0
        }
      };
      userRoleCounts.forEach(item => {
        if (users.breakdown[item._id] !== undefined) {
          users.breakdown[item._id] = item.count;
        }
      });

      // 3. Operational Health
      const pendingInspections = await BookingModel.countDocuments({ status: { $in: ["pending", "confirmed"] } });
      const securityEventsCount = await AuditLogModel.countDocuments({
        action: { $in: ["account_access_blocked", "user_suspended"] }
      });

      // 4. Recent Admin Activity
      const recentActivity = await AuditLogModel.find({
        action: { $in: ["role_changed", "user_suspended", "user_restored", "property_archived", "property_deleted", "platform_setting_changed"] }
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("actorUserId", "fullName email avatar");

      return {
        success: true,
        data: {
          users,
          properties: {
            total: totalProperties,
            activeListings,
            pendingReviews,
            archived: await PropertyModel.countDocuments({ status: "archived" })
          },
          operations: {
            pendingPropertyReviews: pendingReviews,
            openIssues,
            pendingInspections,
            failedOperations: 0 // Placeholder / Deferred if no failed queue exists
          },
          security: {
            suspiciousActivityDetected: false,
            lockouts: securityEventsCount,
            recentSecurityEvents: securityEventsCount
          },
          recentActivity
        }
      };
    },

    async getUsers({ role, status, search, page, limit }) {
      const filter = {};
      if (role) filter.role = role;
      if (status) filter.status = status;
      if (search) {
        filter.$or = [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ];
      }

      const skip = (page - 1) * limit;
      const [users, total] = await Promise.all([
        UserModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        UserModel.countDocuments(filter)
      ]);

      return {
        success: true,
        data: users,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    },

    async getUserDetail(userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, ERROR_CODES.VALIDATION_FAILED, "Invalid User ID.");
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        throw new ApiError(404, ERROR_CODES.NOT_FOUND, "User profile not found.");
      }

      // Compile related records count
      const relatedPropertiesCount = await PropertyModel.countDocuments({ realtorId: userId });
      const relatedInspectionsCount = await BookingModel.countDocuments({
        $or: [{ clientId: userId }, { realtorId: userId }]
      });

      // Fetch audit logs as actor or target
      const auditLogs = await AuditLogModel.find({
        $or: [
          { actorUserId: userId },
          { targetId: userId.toString() }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(10);

      return {
        success: true,
        data: {
          profile: user,
          propertiesCount: relatedPropertiesCount,
          inspectionsCount: relatedInspectionsCount,
          auditHistory: auditLogs
        }
      };
    },

    async updateUserStatus(actorUserId, actorFirebaseUid, targetUserId, status, reason, ipAddress, userAgent) {
      if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
        throw new ApiError(400, ERROR_CODES.VALIDATION_FAILED, "Invalid User ID.");
      }

      // Self-Protection Guard
      if (actorUserId.toString() === targetUserId.toString()) {
        throw new ApiError(400, ERROR_CODES.VALIDATION_FAILED, "Admins cannot modify their own account status.");
      }

      const targetUser = await UserModel.findById(targetUserId);
      if (!targetUser) {
        throw new ApiError(404, ERROR_CODES.NOT_FOUND, "User not found.");
      }

      // Verify final Admin protection
      if (targetUser.role === "admin" && status !== "active") {
        const activeAdminCount = await UserModel.countDocuments({ role: "admin", status: "active" });
        if (activeAdminCount <= 1) {
          throw new ApiError(400, ERROR_CODES.VALIDATION_FAILED, "Cannot suspend or disable the last active Admin account.");
        }
      }

      targetUser.status = status;
      await targetUser.save();

      // Log secure audit log
      const actionTag = status === "suspended" ? "user_suspended" : "user_restored";
      await AuditLogModel.create({
        actorUserId,
        actorFirebaseUid,
        action: actionTag,
        targetType: "user",
        targetId: targetUserId.toString(),
        metadata: { reason, previousStatus: targetUser.status, newStatus: status },
        ipAddress,
        userAgent
      });

      return { success: true, message: `User status changed to ${status}.`, data: targetUser };
    },

    async updateUserRole(actorUserId, actorFirebaseUid, targetUserId, role, reason, ipAddress, userAgent) {
      if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
        throw new ApiError(400, ERROR_CODES.VALIDATION_FAILED, "Invalid User ID.");
      }

      // Self-Protection Guard: Cannot demote yourself
      if (actorUserId.toString() === targetUserId.toString()) {
        throw new ApiError(400, ERROR_CODES.VALIDATION_FAILED, "Admins cannot alter their own account role.");
      }

      const targetUser = await UserModel.findById(targetUserId);
      if (!targetUser) {
        throw new ApiError(404, ERROR_CODES.NOT_FOUND, "User not found.");
      }

      // Verify last active Admin safety
      if (targetUser.role === "admin" && role !== "admin") {
        const activeAdminCount = await UserModel.countDocuments({ role: "admin", status: "active" });
        if (activeAdminCount <= 1) {
          throw new ApiError(400, ERROR_CODES.VALIDATION_FAILED, "Cannot demote the last remaining Admin account.");
        }
      }

      const previousRole = targetUser.role;
      targetUser.role = role;
      await targetUser.save();

      // Log Role audit log
      await AuditLogModel.create({
        actorUserId,
        actorFirebaseUid,
        action: "role_changed",
        targetType: "user",
        targetId: targetUserId.toString(),
        metadata: { reason, previousRole, newRole: role },
        ipAddress,
        userAgent
      });

      return { success: true, message: `User role transitioned to ${role}.`, data: targetUser };
    },

    async getProperties({ status, propertyType, search, page, limit }) {
      const filter = {};
      if (status) filter.status = status;
      if (propertyType) filter.propertyType = propertyType;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } }
        ];
      }

      const skip = (page - 1) * limit;
      const [properties, total] = await Promise.all([
        PropertyModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("realtorId", "fullName email"),
        PropertyModel.countDocuments(filter)
      ]);

      return {
        success: true,
        data: properties,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    },

    async getPropertyDetail(propertyId) {
      if (!mongoose.Types.ObjectId.isValid(propertyId)) {
        throw new ApiError(400, ERROR_CODES.VALIDATION_FAILED, "Invalid Property ID.");
      }

      const property = await PropertyModel.findById(propertyId).populate("realtorId", "fullName email phone agency");
      if (!property) {
        throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Property listing not found.");
      }

      return { success: true, data: property };
    },

    async updateProperty(propertyId, payload) {
      if (!mongoose.Types.ObjectId.isValid(propertyId)) {
        throw new ApiError(400, ERROR_CODES.VALIDATION_FAILED, "Invalid Property ID.");
      }

      const property = await PropertyModel.findByIdAndUpdate(propertyId, { $set: payload }, { new: true });
      if (!property) {
        throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Property not found.");
      }

      return { success: true, data: property };
    },

    async updatePropertyStatus(actorUserId, actorFirebaseUid, propertyId, status, reason, ipAddress, userAgent) {
      if (!mongoose.Types.ObjectId.isValid(propertyId)) {
        throw new ApiError(400, ERROR_CODES.VALIDATION_FAILED, "Invalid Property ID.");
      }

      const property = await PropertyModel.findById(propertyId);
      if (!property) {
        throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Property not found.");
      }

      const previousStatus = property.status;
      property.status = status;
      await property.save();

      // Log Admin property transition
      await AuditLogModel.create({
        actorUserId,
        actorFirebaseUid,
        action: status === "archived" ? "property_archived" : "property_verified",
        targetType: "property",
        targetId: propertyId.toString(),
        metadata: { reason, previousStatus, newStatus: status },
        ipAddress,
        userAgent
      });

      return { success: true, message: `Property status changed to ${status}.`, data: property };
    },

    async deleteProperty(actorUserId, actorFirebaseUid, propertyId, reason, ipAddress, userAgent) {
      if (!mongoose.Types.ObjectId.isValid(propertyId)) {
        throw new ApiError(400, ERROR_CODES.VALIDATION_FAILED, "Invalid Property ID.");
      }

      const property = await PropertyModel.findById(propertyId);
      if (!property) {
        throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Property listing not found.");
      }

      // Perform soft-deletion (archive) as requested by extreme safety rules
      property.status = "archived";
      await property.save();

      await AuditLogModel.create({
        actorUserId,
        actorFirebaseUid,
        action: "property_archived",
        targetType: "property",
        targetId: propertyId.toString(),
        metadata: { reason, note: "Soft deletion completed via Admin console." },
        ipAddress,
        userAgent
      });

      return { success: true, message: "Property archived successfully." };
    },

    async createStakeholder(actorUserId, actorFirebaseUid, payload, firebaseAuth, ipAddress, userAgent) {
      const email = payload.email.trim().toLowerCase();

      // Ensure email does not exist in DB
      if (await UserModel.exists({ email })) {
        throw new ApiError(409, ERROR_CODES.PROFILE_DUPLICATE_EMAIL, "A profile already uses this email.");
      }

      // Hash password securely
      const passwordHash = await hashPassword(payload.password);

      // Create MongoDB Profile
      const stakeholder = await UserModel.create({
        passwordHash,
        email,
        fullName: payload.fullName,
        phone: payload.phone || "",
        role: "stakeholder",
        status: "active",
        mustChangePassword: true,
        emailVerified: true
      });

      // Audit Create Stakeholder
      await AuditLogModel.create({
        actorUserId,
        actorFirebaseUid,
        action: "stakeholder_created",
        targetType: "user",
        targetId: stakeholder._id.toString(),
        metadata: { createdBy: actorUserId.toString() },
        ipAddress,
        userAgent
      });

      return { success: true, message: "Stakeholder account successfully created.", data: stakeholder };
    },

    async getPlatformSettings() {
      let settings = await PlatformSettingModel.findOne();
      if (!settings) {
        settings = await PlatformSettingModel.create({});
      }
      return { success: true, data: settings };
    },

    async updatePlatformSettings(actorUserId, actorFirebaseUid, payload, ipAddress, userAgent) {
      let settings = await PlatformSettingModel.findOne();
      if (!settings) {
        settings = await PlatformSettingModel.create({});
      }

      const previousSettings = settings.toObject();
      Object.assign(settings, payload);
      await settings.save();

      // Log Settings Modification
      await AuditLogModel.create({
        actorUserId,
        actorFirebaseUid,
        action: "platform_setting_changed",
        targetType: "platform_settings",
        targetId: settings._id.toString(),
        metadata: { previousSettings, newSettings: settings.toObject() },
        ipAddress,
        userAgent
      });

      return { success: true, message: "Platform settings updated successfully.", data: settings };
    },

    async getAuditLogs({ search, action, page, limit }) {
      const filter = {};
      if (action) filter.action = action;
      if (search) {
        filter.$or = [
          { targetId: { $regex: search, $options: "i" } },
          { action: { $regex: search, $options: "i" } }
        ];
      }

      const skip = (page - 1) * limit;
      const [logs, total] = await Promise.all([
        AuditLogModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("actorUserId", "fullName email role"),
        AuditLogModel.countDocuments(filter)
      ]);

      return {
        success: true,
        data: logs,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    }
  };
}
