import { sanitizeProfile } from "../utils/sanitizeResponse.js";

export function createAdminController({ adminService }) {
  if (!adminService) {
    throw new Error("createAdminController requires adminService.");
  }

  return {
    async getDashboard(req, res, next) {
      try {
        const result = await adminService.getOverview();
        return res.status(200).json(result);
      } catch (err) {
        return next(err);
      }
    },

    async getUsers(req, res, next) {
      try {
        const query = req.validated.query;
        const result = await adminService.getUsers(query);
        
        // Sanitize returned profiles
        result.data = result.data.map(u => sanitizeProfile(u));

        return res.status(200).json(result);
      } catch (err) {
        return next(err);
      }
    },

    async getUserDetail(req, res, next) {
      try {
        const { userId } = req.params;
        const result = await adminService.getUserDetail(userId);

        // Sanitize user detail profile
        result.data.profile = sanitizeProfile(result.data.profile);

        return res.status(200).json(result);
      } catch (err) {
        return next(err);
      }
    },

    async updateUserStatus(req, res, next) {
      try {
        const { userId } = req.params;
        const { status, reason } = req.validated.body;
        const actorUserId = req.userDocument._id;
        const actorFirebaseUid = req.user.uid;

        const result = await adminService.updateUserStatus(
          actorUserId,
          actorFirebaseUid,
          userId,
          status,
          reason,
          req.ip,
          req.get("user-agent")
        );

        result.data = sanitizeProfile(result.data);
        return res.status(200).json(result);
      } catch (err) {
        return next(err);
      }
    },

    async updateUserRole(req, res, next) {
      try {
        const { userId } = req.params;
        const { role, reason } = req.validated.body;
        const actorUserId = req.userDocument._id;
        const actorFirebaseUid = req.user.uid;

        const result = await adminService.updateUserRole(
          actorUserId,
          actorFirebaseUid,
          userId,
          role,
          reason,
          req.ip,
          req.get("user-agent")
        );

        result.data = sanitizeProfile(result.data);
        return res.status(200).json(result);
      } catch (err) {
        return next(err);
      }
    },

    async getProperties(req, res, next) {
      try {
        const query = req.validated.query;
        const result = await adminService.getProperties(query);
        return res.status(200).json(result);
      } catch (err) {
        return next(err);
      }
    },

    async getPropertyDetail(req, res, next) {
      try {
        const { propertyId } = req.params;
        const result = await adminService.getPropertyDetail(propertyId);
        return res.status(200).json(result);
      } catch (err) {
        return next(err);
      }
    },

    async updateProperty(req, res, next) {
      try {
        const { propertyId } = req.params;
        const fields = req.validated.body;
        const result = await adminService.updateProperty(propertyId, fields);
        return res.status(200).json(result);
      } catch (err) {
        return next(err);
      }
    },

    async updatePropertyStatus(req, res, next) {
      try {
        const { propertyId } = req.params;
        const { status, reason } = req.validated.body;
        const actorUserId = req.userDocument._id;
        const actorFirebaseUid = req.user.uid;

        const result = await adminService.updatePropertyStatus(
          actorUserId,
          actorFirebaseUid,
          propertyId,
          status,
          reason || "Admin property audit status transition.",
          req.ip,
          req.get("user-agent")
        );

        return res.status(200).json(result);
      } catch (err) {
        return next(err);
      }
    },

    async deleteProperty(req, res, next) {
      try {
        const { propertyId } = req.params;
        const { reason } = req.body;
        const actorUserId = req.userDocument._id;
        const actorFirebaseUid = req.user.uid;

        const result = await adminService.deleteProperty(
          actorUserId,
          actorFirebaseUid,
          propertyId,
          reason || "Administrative soft-deletion of property.",
          req.ip,
          req.get("user-agent")
        );

        return res.status(200).json(result);
      } catch (err) {
        return next(err);
      }
    },

    async createStakeholder(req, res, next) {
      try {
        const payload = req.validated.body;
        const actorUserId = req.userDocument._id;
        const actorFirebaseUid = req.user.uid;

        const result = await adminService.createStakeholder(
          actorUserId,
          req.user.id,
          payload,
          null,
          req.ip,
          req.get("user-agent")
        );

        result.data = sanitizeProfile(result.data);
        return res.status(201).json(result);
      } catch (err) {
        return next(err);
      }
    },

    async getPlatformSettings(req, res, next) {
      try {
        const result = await adminService.getPlatformSettings();
        return res.status(200).json(result);
      } catch (err) {
        return next(err);
      }
    },

    async updatePlatformSettings(req, res, next) {
      try {
        const payload = req.validated.body;
        const actorUserId = req.userDocument._id;
        const actorFirebaseUid = req.user.uid;

        const result = await adminService.updatePlatformSettings(
          actorUserId,
          actorFirebaseUid,
          payload,
          req.ip,
          req.get("user-agent")
        );

        return res.status(200).json(result);
      } catch (err) {
        return next(err);
      }
    },

    async getAuditLogs(req, res, next) {
      try {
        const query = req.validated.query;
        const result = await adminService.getAuditLogs(query);
        return res.status(200).json(result);
      } catch (err) {
        return next(err);
      }
    }
  };
}
