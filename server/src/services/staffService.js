import ApiError from "../utils/ApiError.js";

export function createStaffService({
  UserModel,
  PropertyModel,
  BookingModel,
  TaskModel,
  IssueModel,
  ReviewModel,
  NotificationModel,
  AuditLogModel,
  logger
}) {
  return {
    async getDashboard(staffId) {
      try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const [
          pendingReviews,
          todayInspections,
          openTasks,
          openIssues
        ] = await Promise.all([
          PropertyModel.countDocuments({ status: "pending" }),
          BookingModel.countDocuments({ scheduledAt: { $gte: startOfDay, $lte: endOfDay } }),
          TaskModel.countDocuments({ assignedTo: staffId, status: { $ne: "completed" } }),
          IssueModel.countDocuments({ status: { $nin: ["resolved", "closed"] } })
        ]);

        // Get Priorities: Open critical tasks, high/critical issues, or immediate reviews
        const [priorityTasks, urgentIssues] = await Promise.all([
          TaskModel.find({ assignedTo: staffId, status: { $in: ["pending", "in_progress"] } })
            .sort({ priority: -1, dueAt: 1 })
            .limit(3),
          IssueModel.find({ status: { $nin: ["resolved", "closed"] }, severity: { $in: ["critical", "high"] } })
            .sort({ createdAt: 1 })
            .limit(3)
        ]);

        const priorities = [
          ...priorityTasks.map(t => ({ id: t._id, title: t.title, type: "task", detail: `Due: ${t.dueAt.toDateString()}`, priority: t.priority })),
          ...urgentIssues.map(i => ({ id: i._id, title: i.title, type: "issue", detail: `Severity: ${i.severity}`, priority: i.severity }))
        ];

        // Today's & Upcoming inspections
        const upcomingInspections = await BookingModel.find({
          scheduledAt: { $gte: startOfDay }
        })
          .populate("userId", "fullName email phone")
          .populate("realtorId", "fullName email phone")
          .populate("propertyId", "title address coverImage")
          .sort({ scheduledAt: 1 })
          .limit(5);

        // Pending property reviews
        const pendingProperties = await PropertyModel.find({ status: "pending" })
          .populate("realtorId", "fullName email phone")
          .sort({ createdAt: 1 })
          .limit(5);

        // Recent operational activities (Audit logs)
        const recentActivity = await AuditLogModel.find({
          action: { $in: ["property_verified", "property_changes_requested", "task_completed", "issue_resolved"] }
        })
          .populate("actorUserId", "fullName role")
          .sort({ createdAt: -1 })
          .limit(5);

        return {
          summary: { pendingReviews, todayInspections, openTasks, openIssues },
          priorities,
          upcomingInspections,
          pendingProperties,
          recentActivity
        };
      } catch (err) {
        logger.error({ err, staffId }, "Failed to compile Staff dashboard stats.");
        throw err;
      }
    },

    async getTasks(staffId, { page = 1, limit = 10, status, priority, search }) {
      const skip = (page - 1) * limit;
      const query = { assignedTo: staffId };

      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } }
        ];
      }

      const [items, total] = await Promise.all([
        TaskModel.find(query)
          .populate("relatedProperty", "title address coverImage")
          .populate("relatedInspection", "scheduledAt status")
          .populate("relatedIssue", "title severity status")
          .sort({ dueAt: 1 })
          .skip(skip)
          .limit(limit),
        TaskModel.countDocuments(query)
      ]);

      return {
        items,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    },

    async getTaskDetail(staffId, taskId) {
      const task = await TaskModel.findOne({ _id: taskId, assignedTo: staffId })
        .populate("relatedProperty", "title address coverImage price propertyType features description")
        .populate({
          path: "relatedInspection",
          populate: [
            { path: "userId", select: "fullName email phone" },
            { path: "realtorId", select: "fullName email phone" }
          ]
        })
        .populate("relatedIssue", "title description severity status notes");

      if (!task) {
        throw new ApiError(404, "TASK_NOT_FOUND", "Task not found or is not assigned to you.");
      }
      return task;
    },

    async updateTask(staffId, taskId, body) {
      const task = await TaskModel.findOne({ _id: taskId, assignedTo: staffId });
      if (!task) {
        throw new ApiError(404, "TASK_NOT_FOUND", "Task not found or is not assigned to you.");
      }

      if (["completed", "cancelled"].includes(task.status)) {
        throw new ApiError(400, "TASK_TERMINAL", "Closed or completed tasks cannot be updated.");
      }

      if (body.status && body.status !== task.status) {
        const allowedTransitions = {
          pending: ["in_progress", "cancelled"],
          in_progress: ["blocked", "completed", "cancelled"],
          blocked: ["in_progress", "cancelled"]
        };

        if (!allowedTransitions[task.status]?.includes(body.status)) {
          throw new ApiError(400, "INVALID_TRANSITION", `Cannot transition task from ${task.status} to ${body.status}`);
        }

        task.status = body.status;
        if (body.status === "completed") {
          task.completedAt = new Date();
        }
      }

      if (body.priority) task.priority = body.priority;
      if (body.description) task.description = body.description;
      if (body.dueAt) task.dueAt = new Date(body.dueAt);

      await task.save();
      return task;
    },

    async reassignTask(staffId, taskId, assignedTo) {
      const task = await TaskModel.findOne({ _id: taskId, assignedTo: staffId });
      if (!task) {
        throw new ApiError(404, "TASK_NOT_FOUND", "Task not found or is not assigned to you.");
      }

      const newUser = await UserModel.findOne({ _id: assignedTo, role: "staff", status: "active" });
      if (!newUser) {
        throw new ApiError(400, "STAFF_NOT_FOUND", "The target reassignment user is not an active staff member.");
      }

      task.assignedTo = assignedTo;
      task.status = "pending"; // Reset to pending state on reassignment
      await task.save();

      // Create a notification for the newly assigned staff
      await NotificationModel.create({
        userId: assignedTo,
        title: "Task Reassigned",
        message: `Task "${task.title}" has been assigned to you.`,
        type: "task_reassigned",
        relatedId: task._id
      });

      return task;
    },

    async getPendingProperties({ page = 1, limit = 10, search }) {
      const skip = (page - 1) * limit;
      const query = { status: "pending" };

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { "address.street": { $regex: search, $options: "i" } },
          { "address.city": { $regex: search, $options: "i" } }
        ];
      }

      const [items, total] = await Promise.all([
        PropertyModel.find(query)
          .populate("realtorId", "fullName email phone agency")
          .sort({ createdAt: 1 })
          .skip(skip)
          .limit(limit),
        PropertyModel.countDocuments(query)
      ]);

      return {
        items,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      };
    },

    async getPropertyReview(propertyId) {
      const property = await PropertyModel.findById(propertyId)
        .populate("realtorId", "fullName email phone agency specialties serviceAreas");

      if (!property) {
        throw new ApiError(404, "PROPERTY_NOT_FOUND", "Property not found.");
      }

      const reviews = await ReviewModel.find({ propertyId })
        .populate("reviewerId", "fullName email department position")
        .sort({ createdAt: -1 });

      return {
        property,
        history: reviews
      };
    },

    async verifyProperty(staffId, propertyId, checklist = {}) {
      const property = await PropertyModel.findOne({ _id: propertyId, status: "pending" });
      if (!property) {
        throw new ApiError(404, "PROPERTY_PENDING_NOT_FOUND", "Property not found or is not in pending verification status.");
      }

      // Create positive review history item
      const review = await ReviewModel.create({
        propertyId,
        reviewerId: staffId,
        action: "verified",
        reason: "Property details, pricing, and images verified successfully.",
        checklist
      });

      // Update property state to active (live on index)
      property.status = "active";
      await property.save();

      // Create notification for Realtor
      await NotificationModel.create({
        userId: property.realtorId,
        title: "Listing Approved & Published",
        message: `Your property listing "${property.title}" has been verified and is now active!`,
        type: "property_approved",
        relatedId: property._id
      });

      return { property, review };
    },

    async requestPropertyChanges(staffId, propertyId, reason, checklist = {}) {
      const property = await PropertyModel.findOne({ _id: propertyId, status: "pending" });
      if (!property) {
        throw new ApiError(404, "PROPERTY_PENDING_NOT_FOUND", "Property not found or is not in pending verification status.");
      }

      // Save change requested item
      const review = await ReviewModel.create({
        propertyId,
        reviewerId: staffId,
        action: "changes_requested",
        reason,
        checklist
      });

      // Set property status to back to a draft / changes state.
      // Wait, let's mark it as changes_requested or draft. Standard flows support changes_requested or draft.
      // Since Property model has status enum: draft, pending, active, archived, let's set status back to draft,
      // but toggle a flag or we can safely set property.status = "draft" so realtor can edit.
      property.status = "draft";
      await property.save();

      // Create notification for Realtor
      await NotificationModel.create({
        userId: property.realtorId,
        title: "Changes Requested on Listing",
        message: `Review required on "${property.title}". Reason: ${reason}`,
        type: "property_changes_requested",
        relatedId: property._id
      });

      return { property, review };
    },

    async getInspections({ page = 1, limit = 10, status, propertyId }) {
      const skip = (page - 1) * limit;
      const query = {};

      if (status) query.status = status;
      if (propertyId) query.propertyId = propertyId;

      const [items, total] = await Promise.all([
        BookingModel.find(query)
          .populate("userId", "fullName email phone")
          .populate("realtorId", "fullName email phone")
          .populate("propertyId", "title address coverImage")
          .sort({ scheduledAt: -1 })
          .skip(skip)
          .limit(limit),
        BookingModel.countDocuments(query)
      ]);

      return {
        items,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      };
    },

    async getInspectionDetail(inspectionId) {
      const booking = await BookingModel.findById(inspectionId)
        .populate("userId", "fullName email phone avatar")
        .populate("realtorId", "fullName email phone avatar agency")
        .populate("propertyId", "title address coverImage price propertyType details description");

      if (!booking) {
        throw new ApiError(404, "INSPECTION_NOT_FOUND", "Inspection booking not found.");
      }
      return booking;
    },

    async updateInspection(staffId, inspectionId, { status, notes }) {
      const booking = await BookingModel.findById(inspectionId);
      if (!booking) {
        throw new ApiError(404, "INSPECTION_NOT_FOUND", "Inspection booking not found.");
      }

      if (["completed", "cancelled", "rejected"].includes(booking.status)) {
        throw new ApiError(400, "INSPECTION_TERMINAL", "Closed or completed inspections cannot be updated.");
      }

      if (status && status !== booking.status) {
        booking.status = status;
        if (status === "cancelled") {
          booking.cancelledAt = new Date();
        }
        if (status === "confirmed") {
          booking.confirmedAt = new Date();
        }
      }

      if (notes) {
        booking.message = notes;
      }

      await booking.save();
      return booking;
    },

    async getIssues({ page = 1, limit = 10, status, severity, search }) {
      const skip = (page - 1) * limit;
      const query = {};

      if (status) query.status = status;
      if (severity) query.severity = severity;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } }
        ];
      }

      const [items, total] = await Promise.all([
        IssueModel.find(query)
          .populate("reporterId", "fullName email role")
          .populate("assignedTo", "fullName email department")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        IssueModel.countDocuments(query)
      ]);

      return {
        items,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      };
    },

    async getIssueDetail(issueId) {
      const issue = await IssueModel.findById(issueId)
        .populate("reporterId", "fullName email role phone avatar")
        .populate("assignedTo", "fullName email department position phone avatar")
        .populate("propertyId", "title address coverImage price")
        .populate("inspectionId", "scheduledAt status");

      if (!issue) {
        throw new ApiError(404, "ISSUE_NOT_FOUND", "Reported issue not found.");
      }
      return issue;
    },

    async createIssue(staffId, { title, description, severity, propertyId, inspectionId }) {
      const issue = await IssueModel.create({
        title,
        description,
        reporterId: staffId,
        severity,
        propertyId: propertyId || null,
        inspectionId: inspectionId || null,
        status: "open"
      });

      return issue;
    },

    async updateIssue(staffId, issueId, { status, severity, assignedTo, resolution, noteText }) {
      const issue = await IssueModel.findById(issueId);
      if (!issue) {
        throw new ApiError(404, "ISSUE_NOT_FOUND", "Reported issue not found.");
      }

      if (issue.status === "closed") {
        throw new ApiError(400, "ISSUE_CLOSED", "Closed issues cannot be updated.");
      }

      if (status) {
        issue.status = status;
        if (["resolved", "closed"].includes(status)) {
          issue.resolvedAt = new Date();
        }
      }

      if (severity) {
        issue.severity = severity;
      }

      if (typeof assignedTo !== "undefined") {
        if (assignedTo === null) {
          issue.assignedTo = null;
        } else {
          const targetStaff = await UserModel.findOne({ _id: assignedTo, role: "staff", status: "active" });
          if (!targetStaff) {
            throw new ApiError(400, "STAFF_NOT_FOUND", "Target assignee must be an active staff member.");
          }
          issue.assignedTo = assignedTo;
        }
      }

      if (resolution) {
        issue.resolution = resolution;
      }

      if (noteText) {
        issue.notes.push({
          authorId: staffId,
          text: noteText,
          createdAt: new Date()
        });
      }

      await issue.save();
      return issue;
    },

    async getProfile(staffId) {
      const user = await UserModel.findById(staffId);
      if (!user) {
        throw new ApiError(404, "USER_NOT_FOUND", "Staff profile not found.");
      }
      return user;
    },

    async updateProfile(staffId, { fullName, phone, avatar }) {
      const user = await UserModel.findById(staffId);
      if (!user) {
        throw new ApiError(404, "USER_NOT_FOUND", "Staff profile not found.");
      }

      if (fullName) user.fullName = fullName;
      if (phone) user.phone = phone;
      if (typeof avatar !== "undefined") user.avatar = avatar;

      await user.save();
      return user;
    }
  };
}
