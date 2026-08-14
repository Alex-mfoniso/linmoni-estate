import { successResponse, sanitizeProfile } from "../utils/sanitizeResponse.js";

export function createStaffController({ staffService, auditService }) {
  return {
    async getDashboard(req, res, next) {
      try {
        const staffId = req.userDocument._id;
        const data = await staffService.getDashboard(staffId);
        return successResponse(res, "Staff dashboard retrieved.", data);
      } catch (err) {
        next(err);
      }
    },

    async getTasks(req, res, next) {
      try {
        const staffId = req.userDocument._id;
        const { page, limit, status, priority, search } = req.validated.query;
        const pageNum = parseInt(page || "1", 10);
        const limitNum = parseInt(limit || "10", 10);

        const data = await staffService.getTasks(staffId, {
          page: pageNum,
          limit: limitNum,
          status,
          priority,
          search
        });
        return successResponse(res, "Assigned tasks list retrieved.", data);
      } catch (err) {
        next(err);
      }
    },

    async getTaskDetail(req, res, next) {
      try {
        const staffId = req.userDocument._id;
        const { taskId } = req.params;
        const data = await staffService.getTaskDetail(staffId, taskId);
        return successResponse(res, "Task details retrieved.", data);
      } catch (err) {
        next(err);
      }
    },

    async updateTask(req, res, next) {
      try {
        const staffId = req.userDocument._id;
        const { taskId } = req.validated.params;
        const data = await staffService.updateTask(staffId, taskId, req.validated.body);

        if (req.validated.body.status === "completed") {
          await auditService.record({
            req,
            action: "task_completed",
            user: req.userDocument,
            metadata: { id: String(taskId), status: "completed" }
          });
        }

        return successResponse(res, "Task updated successfully.", data);
      } catch (err) {
        next(err);
      }
    },

    async reassignTask(req, res, next) {
      try {
        const staffId = req.userDocument._id;
        const { taskId } = req.validated.params;
        const { assignedTo } = req.validated.body;

        const data = await staffService.reassignTask(staffId, taskId, assignedTo);

        await auditService.record({
          req,
          action: "task_assigned",
          user: req.userDocument,
          metadata: { id: String(taskId), assignedTo: String(assignedTo) }
        });

        return successResponse(res, "Task successfully reassigned.", data);
      } catch (err) {
        next(err);
      }
    },

    async getPendingProperties(req, res, next) {
      try {
        const { page, limit, search } = req.validated.query;
        const pageNum = parseInt(page || "1", 10);
        const limitNum = parseInt(limit || "10", 10);

        const data = await staffService.getPendingProperties({ page: pageNum, limit: limitNum, search });
        return successResponse(res, "Pending properties retrieved.", data);
      } catch (err) {
        next(err);
      }
    },

    async getPropertyReview(req, res, next) {
      try {
        const { propertyId } = req.params;
        const data = await staffService.getPropertyReview(propertyId);
        return successResponse(res, "Property review detail retrieved.", data);
      } catch (err) {
        next(err);
      }
    },

    async verifyProperty(req, res, next) {
      try {
        const staffId = req.userDocument._id;
        const { propertyId } = req.validated.params;
        const { checklist } = req.validated.body;

        const data = await staffService.verifyProperty(staffId, propertyId, checklist);

        await auditService.record({
          req,
          action: "property_verified",
          user: req.userDocument,
          metadata: { id: String(propertyId) }
        });

        return successResponse(res, "Property successfully approved and verified.", data);
      } catch (err) {
        next(err);
      }
    },

    async requestPropertyChanges(req, res, next) {
      try {
        const staffId = req.userDocument._id;
        const { propertyId } = req.validated.params;
        const { reason, checklist } = req.validated.body;

        const data = await staffService.requestPropertyChanges(staffId, propertyId, reason, checklist);

        await auditService.record({
          req,
          action: "property_changes_requested",
          user: req.userDocument,
          metadata: { id: String(propertyId), status: "changes_requested" }
        });

        return successResponse(res, "Property changes request submitted.", data);
      } catch (err) {
        next(err);
      }
    },

    async getInspections(req, res, next) {
      try {
        const { page, limit, status, propertyId } = req.validated.query;
        const pageNum = parseInt(page || "1", 10);
        const limitNum = parseInt(limit || "10", 10);

        const data = await staffService.getInspections({ page: pageNum, limit: limitNum, status, propertyId });
        return successResponse(res, "Inspections list retrieved.", data);
      } catch (err) {
        next(err);
      }
    },

    async getInspectionDetail(req, res, next) {
      try {
        const { inspectionId } = req.params;
        const data = await staffService.getInspectionDetail(inspectionId);
        return successResponse(res, "Inspection details retrieved.", data);
      } catch (err) {
        next(err);
      }
    },

    async updateInspection(req, res, next) {
      try {
        const staffId = req.userDocument._id;
        const { inspectionId } = req.validated.params;
        const data = await staffService.updateInspection(staffId, inspectionId, req.validated.body);

        await auditService.record({
          req,
          action: "inspection_updated",
          user: req.userDocument,
          metadata: { id: String(inspectionId), status: req.validated.body.status }
        });

        return successResponse(res, "Inspection updated successfully.", data);
      } catch (err) {
        next(err);
      }
    },

    async getIssues(req, res, next) {
      try {
        const { page, limit, status, severity, search } = req.validated.query;
        const pageNum = parseInt(page || "1", 10);
        const limitNum = parseInt(limit || "10", 10);

        const data = await staffService.getIssues({
          page: pageNum,
          limit: limitNum,
          status,
          severity,
          search
        });
        return successResponse(res, "Issues list retrieved.", data);
      } catch (err) {
        next(err);
      }
    },

    async getIssueDetail(req, res, next) {
      try {
        const { issueId } = req.params;
        const data = await staffService.getIssueDetail(issueId);
        return successResponse(res, "Issue details retrieved.", data);
      } catch (err) {
        next(err);
      }
    },

    async createIssue(req, res, next) {
      try {
        const staffId = req.userDocument._id;
        const data = await staffService.createIssue(staffId, req.validated.body);
        return successResponse(res, "Operational issue reported successfully.", data, 201);
      } catch (err) {
        next(err);
      }
    },

    async updateIssue(req, res, next) {
      try {
        const staffId = req.userDocument._id;
        const { issueId } = req.validated.params;
        const data = await staffService.updateIssue(staffId, issueId, req.validated.body);

        const isResolved = ["resolved", "closed"].includes(req.validated.body.status);
        await auditService.record({
          req,
          action: isResolved ? "issue_resolved" : "issue_updated",
          user: req.userDocument,
          metadata: { id: String(issueId), status: req.validated.body.status }
        });

        return successResponse(res, "Reported issue updated successfully.", data);
      } catch (err) {
        next(err);
      }
    },

    async getProfile(req, res, next) {
      try {
        const staffId = req.userDocument._id;
        const data = await staffService.getProfile(staffId);
        return successResponse(res, "Staff profile retrieved.", sanitizeProfile(data));
      } catch (err) {
        next(err);
      }
    },

    async updateProfile(req, res, next) {
      try {
        const staffId = req.userDocument._id;
        const data = await staffService.updateProfile(staffId, req.validated.body);
        return successResponse(res, "Staff profile updated successfully.", sanitizeProfile(data));
      } catch (err) {
        next(err);
      }
    }
  };
}
