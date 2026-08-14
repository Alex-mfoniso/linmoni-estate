import { z } from "zod";
import { mongoId, pagination } from "./propertyValidators.js";

const phoneSchema = z.string().trim().regex(/^\+?[0-9 ()-]{7,24}$/, "Enter a valid phone number.").transform((value) => value.replace(/[ ()-]/g, ""));

export const staffPropertyListSchema = z.object({
  body: z.object({}).strict(),
  params: z.object({}).passthrough(),
  query: z.object({
    ...pagination,
    search: z.string().trim().max(100).optional(),
    status: z.string().trim().optional()
  }).strict()
});

export const staffTaskListSchema = z.object({
  body: z.object({}).strict(),
  params: z.object({}).passthrough(),
  query: z.object({
    ...pagination,
    search: z.string().trim().max(100).optional(),
    status: z.enum(["pending", "in_progress", "blocked", "completed", "cancelled"]).optional(),
    priority: z.enum(["low", "medium", "high", "critical"]).optional()
  }).strict()
});

export const updateStaffTaskSchema = z.object({
  body: z.object({
    status: z.enum(["pending", "in_progress", "blocked", "completed", "cancelled"]).optional(),
    priority: z.enum(["low", "medium", "high", "critical"]).optional(),
    description: z.string().trim().min(5).max(3000).optional(),
    dueAt: z.string().datetime().optional()
  }).strict(),
  params: z.object({ taskId: mongoId }).strict(),
  query: z.object({}).passthrough()
});

export const reassignStaffTaskSchema = z.object({
  body: z.object({
    assignedTo: mongoId
  }).strict(),
  params: z.object({ taskId: mongoId }).strict(),
  query: z.object({}).passthrough()
});

export const verifyPropertySchema = z.object({
  body: z.object({
    checklist: z.object({
      imagesAcceptable: z.boolean().default(true),
      locationComplete: z.boolean().default(true),
      pricingComplete: z.boolean().default(true),
      descriptionComplete: z.boolean().default(true),
      requiredInfoPresent: z.boolean().default(true)
    }).default({
      imagesAcceptable: true,
      locationComplete: true,
      pricingComplete: true,
      descriptionComplete: true,
      requiredInfoPresent: true
    })
  }).strict(),
  params: z.object({ propertyId: mongoId }).strict(),
  query: z.object({}).passthrough()
});

export const requestPropertyChangesSchema = z.object({
  body: z.object({
    reason: z.string().trim().min(5, "A reason of at least 5 characters is required.").max(1000),
    checklist: z.object({
      imagesAcceptable: z.boolean().default(false),
      locationComplete: z.boolean().default(false),
      pricingComplete: z.boolean().default(false),
      descriptionComplete: z.boolean().default(false),
      requiredInfoPresent: z.boolean().default(false)
    }).optional()
  }).strict(),
  params: z.object({ propertyId: mongoId }).strict(),
  query: z.object({}).passthrough()
});

export const staffInspectionListSchema = z.object({
  body: z.object({}).strict(),
  params: z.object({}).passthrough(),
  query: z.object({
    ...pagination,
    status: z.string().trim().optional(),
    propertyId: z.string().trim().optional()
  }).strict()
});

export const updateStaffInspectionSchema = z.object({
  body: z.object({
    status: z.enum(["pending", "confirmed", "reschedule_requested", "rescheduled", "in_progress", "completed", "cancelled", "rejected", "no_show"]).optional(),
    notes: z.string().trim().max(1000).optional()
  }).strict(),
  params: z.object({ inspectionId: mongoId }).strict(),
  query: z.object({}).passthrough()
});

export const staffIssueListSchema = z.object({
  body: z.object({}).strict(),
  params: z.object({}).passthrough(),
  query: z.object({
    ...pagination,
    search: z.string().trim().max(100).optional(),
    status: z.enum(["open", "investigating", "waiting", "resolved", "closed"]).optional(),
    severity: z.enum(["low", "medium", "high", "critical"]).optional()
  }).strict()
});

export const createStaffIssueSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3, "Title must be at least 3 characters.").max(150),
    description: z.string().trim().min(10, "Description must be at least 10 characters.").max(3000),
    severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
    propertyId: mongoId.optional().nullable(),
    inspectionId: mongoId.optional().nullable()
  }).strict(),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough()
});

export const updateStaffIssueSchema = z.object({
  body: z.object({
    status: z.enum(["open", "investigating", "waiting", "resolved", "closed"]).optional(),
    severity: z.enum(["low", "medium", "high", "critical"]).optional(),
    assignedTo: mongoId.optional().nullable(),
    resolution: z.string().trim().max(2000).optional(),
    noteText: z.string().trim().max(2000).optional()
  }).strict(),
  params: z.object({ issueId: mongoId }).strict(),
  query: z.object({}).passthrough()
});

export const updateStaffProfileSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2).max(100).optional(),
    phone: phoneSchema.optional(),
    avatar: z.object({
      url: z.string().url(),
      publicId: z.string().min(1)
    }).optional().nullable()
  }).strict(),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough()
});
