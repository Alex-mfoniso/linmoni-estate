import { getPeriodDates } from "../utils/dateUtils.js";

export function createStakeholderService({
  UserModel,
  PropertyModel,
  BookingModel,
  LeadModel,
  AuditLogModel,
  IssueModel,
  ReviewModel,
  logger
}) {
  if (!UserModel || !PropertyModel || !BookingModel || !AuditLogModel) {
    throw new Error("createStakeholderService requires UserModel, PropertyModel, BookingModel, and AuditLogModel.");
  }

  return {
    async getDashboard(stakeholderId, query) {
      const { period, startDate, endDate } = query || {};
      const { start, end } = getPeriodDates(period, startDate, endDate);

      try {
        // 1. Gather Summary Statistics
        const [activeProperties, newClients, activeRealtors, completedInspections] = await Promise.all([
          PropertyModel.countDocuments({ status: "active" }),
          UserModel.countDocuments({ role: "client", createdAt: { $gte: start, $lte: end } }),
          UserModel.countDocuments({ role: "realtor", status: "active" }),
          BookingModel.countDocuments({ status: "completed", scheduledAt: { $gte: start, $lte: end } })
        ]);

        // 2. Fetch Top Properties (Read-only properties populated with Realtor details)
        const topProperties = await PropertyModel.find({ status: "active" })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate("realtorId", "fullName email phone agency");

        // 3. Compile Realtor Performance metrics
        const realtorPerformance = await UserModel.aggregate([
          { $match: { role: "realtor", status: "active" } },
          {
            $lookup: {
              from: "properties",
              localField: "_id",
              foreignField: "realtorId",
              as: "properties"
            }
          },
          {
            $lookup: {
              from: "bookings",
              localField: "_id",
              foreignField: "realtorId",
              as: "bookings"
            }
          },
          {
            $project: {
              fullName: 1,
              email: 1,
              agency: 1,
              activeListingsCount: {
                $size: {
                  $filter: {
                    input: "$properties",
                    as: "p",
                    cond: { $eq: ["$$p.status", "active"] }
                  }
                }
              },
              completedInspectionsCount: {
                $size: {
                  $filter: {
                    input: "$bookings",
                    as: "b",
                    cond: { $eq: ["$$b.status", "completed"] }
                  }
                }
              },
              pendingInspectionsCount: {
                $size: {
                  $filter: {
                    input: "$bookings",
                    as: "b",
                    cond: { $in: ["$$b.status", ["pending", "confirmed"]] }
                  }
                }
              }
            }
          },
          { $limit: 10 }
        ]);

        // 4. Retrieve Operational Health metrics
        const [pendingReviews, openIssues, upcomingInspections] = await Promise.all([
          PropertyModel.countDocuments({ status: "pending" }),
          IssueModel ? IssueModel.countDocuments({ status: { $ne: "resolved" } }) : Promise.resolve(0),
          BookingModel.countDocuments({ status: { $in: ["pending", "confirmed"] }, scheduledAt: { $gte: new Date() } })
        ]);

        return {
          success: true,
          data: {
            period: { start, end },
            summary: {
              activeProperties,
              newClients,
              activeRealtors,
              completedInspections,
              transactions: 0,
              revenue: null // financial placeholder indicator as transaction module is not yet present
            },
            trends: [
              { label: "Active Listings", count: activeProperties },
              { label: "New Signups", count: newClients },
              { label: "Active Realtors", count: activeRealtors },
              { label: "Inspections Completed", count: completedInspections }
            ],
            topProperties,
            realtorPerformance,
            operationalHealth: {
              pendingReviews,
              openIssues,
              upcomingInspections
            }
          }
        };
      } catch (err) {
        logger?.error({ err }, "Error generating stakeholder overview stats.");
        throw err;
      }
    },

    async getPropertyAnalytics(query) {
      const { page = 1, limit = 20 } = query || {};
      const skip = (page - 1) * limit;

      try {
        const [statusStats, typeStats, items, total] = await Promise.all([
          PropertyModel.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
          ]),
          PropertyModel.aggregate([
            { $group: { _id: "$propertyType", count: { $sum: 1 } } }
          ]),
          PropertyModel.find({})
            .skip(skip)
            .limit(limit)
            .populate("realtorId", "fullName email agency")
            .sort({ createdAt: -1 }),
          PropertyModel.countDocuments({})
        ]);

        return {
          success: true,
          data: {
            statusBreakdown: statusStats.reduce((acc, curr) => {
              acc[curr._id] = curr.count;
              return acc;
            }, {}),
            typeBreakdown: typeStats.reduce((acc, curr) => {
              acc[curr._id] = curr.count;
              return acc;
            }, {}),
            items,
            pagination: {
              total,
              page: Number(page),
              limit: Number(limit),
              pages: Math.ceil(total / limit)
            }
          }
        };
      } catch (err) {
        logger?.error({ err }, "Error loading property portfolio analytics.");
        throw err;
      }
    },

    async getRealtorAnalytics(query) {
      const { page = 1, limit = 20, sort = "listings" } = query || {};
      const skip = (page - 1) * limit;

      try {
        const items = await UserModel.aggregate([
          { $match: { role: "realtor", status: "active" } },
          {
            $lookup: {
              from: "properties",
              localField: "_id",
              foreignField: "realtorId",
              as: "properties"
            }
          },
          {
            $lookup: {
              from: "bookings",
              localField: "_id",
              foreignField: "realtorId",
              as: "bookings"
            }
          },
          {
            $project: {
              fullName: 1,
              email: 1,
              phone: 1,
              agency: 1,
              activeListings: {
                $size: {
                  $filter: {
                    input: "$properties",
                    as: "p",
                    cond: { $eq: ["$$p.status", "active"] }
                  }
                }
              },
              totalListings: { $size: "$properties" },
              completedInspections: {
                $size: {
                  $filter: {
                    input: "$bookings",
                    as: "b",
                    cond: { $eq: ["$$b.status", "completed"] }
                  }
                }
              },
              scheduledInspections: {
                $size: {
                  $filter: {
                    input: "$bookings",
                    as: "b",
                    cond: { $in: ["$$b.status", ["pending", "confirmed"]] }
                  }
                }
              }
            }
          },
          { $skip: skip },
          { $limit: limit }
        ]);

        // In-memory sorting based on criteria
        if (sort === "inspections") {
          items.sort((a, b) => b.completedInspections - a.completedInspections);
        } else {
          items.sort((a, b) => b.activeListings - a.activeListings);
        }

        const total = await UserModel.countDocuments({ role: "realtor", status: "active" });

        return {
          success: true,
          data: {
            items,
            pagination: {
              total,
              page: Number(page),
              limit: Number(limit),
              pages: Math.ceil(total / limit)
            }
          }
        };
      } catch (err) {
        logger?.error({ err }, "Error loading realtor performance analytics.");
        throw err;
      }
    },

    async getStaffAnalytics() {
      try {
        const [tasksCompleted, reviewsProcessed, issuesResolved] = await Promise.all([
          UserModel.countDocuments({ role: "staff", status: "active" }), // Placeholder representing staff count
          ReviewModel ? ReviewModel.countDocuments({}) : Promise.resolve(0),
          IssueModel ? IssueModel.countDocuments({ status: "resolved" }) : Promise.resolve(0)
        ]);

        return {
          success: true,
          data: {
            activeStaffCount: tasksCompleted,
            reviewsProcessed,
            issuesResolved
          }
        };
      } catch (err) {
        logger?.error({ err }, "Error loading staff performance metrics.");
        throw err;
      }
    },

    async getActivityLogs(query) {
      const { page = 1, limit = 30, action } = query || {};
      const skip = (page - 1) * limit;

      try {
        const filter = {};
        if (action) {
          filter.action = action;
        }

        const [items, total] = await Promise.all([
          AuditLogModel.find(filter)
            .skip(skip)
            .limit(limit)
            .populate("actorUserId", "fullName email role")
            .sort({ createdAt: -1 }),
          AuditLogModel.countDocuments(filter)
        ]);

        return {
          success: true,
          data: {
            items,
            pagination: {
              total,
              page: Number(page),
              limit: Number(limit),
              pages: Math.ceil(total / limit)
            }
          }
        };
      } catch (err) {
        logger?.error({ err }, "Error listing audit log activity.");
        throw err;
      }
    },

    async generatePropertiesReport() {
      try {
        const properties = await PropertyModel.find({}).populate("realtorId", "fullName email");
        let csv = "ID,Title,Price,Status,PropertyType,ListingType,Realtor,City,State\n";
        
        properties.forEach((p) => {
          csv += `"${p._id}","${p.title?.replace(/"/g, '""')}",${p.price},"${p.status}","${p.propertyType}","${p.listingType}","${p.realtorId?.fullName || "N/A"}","${p.city}","${p.state}"\n`;
        });

        return csv;
      } catch (err) {
        logger?.error({ err }, "Error exporting properties spreadsheet report.");
        throw err;
      }
    },

    async generatePerformanceReport() {
      try {
        const realtors = await UserModel.find({ role: "realtor" });
        let csv = "ID,Name,Email,Agency,Status\n";

        realtors.forEach((r) => {
          csv += `"${r._id}","${r.fullName?.replace(/"/g, '""')}","${r.email}","${r.agency || ""}","${r.status}"\n`;
        });

        return csv;
      } catch (err) {
        logger?.error({ err }, "Error exporting performance spreadsheet report.");
        throw err;
      }
    },

    async generateOperationsReport() {
      try {
        const [pendingProperties, openIssues, resolvedIssues] = await Promise.all([
          PropertyModel.countDocuments({ status: "pending" }),
          IssueModel ? IssueModel.countDocuments({ status: { $ne: "resolved" } }) : Promise.resolve(0),
          IssueModel ? IssueModel.countDocuments({ status: "resolved" }) : Promise.resolve(0)
        ]);

        let csv = "Metric,Value\n";
        csv += `Pending Verifications Reviews,${pendingProperties}\n`;
        csv += `Active Open Incidents Issues,${openIssues}\n`;
        csv += `Resolved Issues Logs,${resolvedIssues}\n`;

        return csv;
      } catch (err) {
        logger?.error({ err }, "Error exporting operations spreadsheet report.");
        throw err;
      }
    },

    async getProfile(stakeholderId) {
      try {
        const user = await UserModel.findById(stakeholderId);
        if (!user) {
          throw new Error("Stakeholder account not found.");
        }
        return user;
      } catch (err) {
        logger?.error({ err }, "Error loading stakeholder profile.");
        throw err;
      }
    },

    async updateProfile(stakeholderId, updates) {
      try {
        // Enforce strict mass assignment guards
        const safeUpdates = {};
        if (updates.fullName !== undefined) safeUpdates.fullName = updates.fullName;
        if (updates.phone !== undefined) safeUpdates.phone = updates.phone;
        if (updates.avatar !== undefined) safeUpdates.avatar = updates.avatar;

        const user = await UserModel.findByIdAndUpdate(stakeholderId, { $set: safeUpdates }, { new: true });
        if (!user) {
          throw new Error("Stakeholder account not found.");
        }
        return user;
      } catch (err) {
        logger?.error({ err }, "Error patching stakeholder profile.");
        throw err;
      }
    }
  };
}
