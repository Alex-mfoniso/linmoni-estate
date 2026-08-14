import { queryOverviewSchema, updateStakeholderProfileSchema } from "../validators/stakeholderValidators.js";
import { sanitizeProfile } from "../utils/sanitizeResponse.js";

export function createStakeholderController({ stakeholderService, auditService }) {
  if (!stakeholderService) {
    throw new Error("createStakeholderController requires stakeholderService.");
  }

  return {
    async getDashboard(req, res, next) {
      try {
        const query = req.validated.query;
        const stakeholderId = req.userDocument._id;

        const result = await stakeholderService.getDashboard(stakeholderId, query);
        return res.status(200).json(result);
      } catch (err) {
        return next(err);
      }
    },

    async getPropertyAnalytics(req, res, next) {
      try {
        const result = await stakeholderService.getPropertyAnalytics(req.query);
        return res.status(200).json(result);
      } catch (err) {
        return next(err);
      }
    },

    async getRealtorAnalytics(req, res, next) {
      try {
        const result = await stakeholderService.getRealtorAnalytics(req.query);
        return res.status(200).json(result);
      } catch (err) {
        return next(err);
      }
    },

    async getStaffAnalytics(req, res, next) {
      try {
        const result = await stakeholderService.getStaffAnalytics();
        return res.status(200).json(result);
      } catch (err) {
        return next(err);
      }
    },

    async getActivityLogs(req, res, next) {
      try {
        const result = await stakeholderService.getActivityLogs(req.query);
        return res.status(200).json(result);
      } catch (err) {
        return next(err);
      }
    },

    async getProfile(req, res, next) {
      try {
        const stakeholderId = req.userDocument._id;
        const profile = await stakeholderService.getProfile(stakeholderId);
        
        // Log secure profile access
        if (auditService) {
          await auditService.log({
            actorUserId: stakeholderId,
            actorFirebaseUid: req.user.uid,
            action: "profile_loaded",
            targetType: "user",
            targetId: stakeholderId.toString(),
            metadata: { scope: "stakeholder_profile" },
            ipAddress: req.ip,
            userAgent: req.get("user-agent")
          });
        }

        return res.status(200).json({
          success: true,
          data: sanitizeProfile(profile)
        });
      } catch (err) {
        return next(err);
      }
    },

    async updateProfile(req, res, next) {
      try {
        const stakeholderId = req.userDocument._id;
        const validatedPayload = req.validated.body;

        const updatedProfile = await stakeholderService.updateProfile(stakeholderId, validatedPayload);

        return res.status(200).json({
          success: true,
          data: sanitizeProfile(updatedProfile)
        });
      } catch (err) {
        return next(err);
      }
    },

    async exportPropertiesReport(req, res, next) {
      try {
        const csv = await stakeholderService.generatePropertiesReport();
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=properties_report.csv");
        return res.status(200).send(csv);
      } catch (err) {
        return next(err);
      }
    },

    async exportPerformanceReport(req, res, next) {
      try {
        const csv = await stakeholderService.generatePerformanceReport();
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=performance_report.csv");
        return res.status(200).send(csv);
      } catch (err) {
        return next(err);
      }
    },

    async exportOperationsReport(req, res, next) {
      try {
        const csv = await stakeholderService.generateOperationsReport();
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=operations_report.csv");
        return res.status(200).send(csv);
      } catch (err) {
        return next(err);
      }
    }
  };
}
