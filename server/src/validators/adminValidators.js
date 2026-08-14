import { z } from "zod";

const phoneSchema = z.string().trim().regex(/^\+?[0-9 ()-]{7,24}$/, "Enter a valid phone number.").optional();

export const adminUserFilterSchema = z.object({
  body: z.object({}).strict(),
  params: z.object({}).passthrough(),
  query: z.object({
    role: z.enum(["client", "realtor", "staff", "stakeholder", "admin"]).optional(),
    status: z.enum(["active", "suspended", "pending", "disabled"]).optional(),
    search: z.string().trim().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).default("1"),
    limit: z.string().regex(/^\d+$/).transform(Number).default("10")
  }).passthrough()
});

export const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(["active", "suspended", "pending", "disabled"]),
    reason: z.string().trim().min(5, "Reason must be at least 5 characters.")
  }).strict(),
  params: z.object({
    userId: z.string().min(1, "User ID is required.")
  }).passthrough(),
  query: z.object({}).passthrough()
});

export const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum(["client", "realtor", "staff", "stakeholder", "admin"]),
    reason: z.string().trim().min(5, "Reason must be at least 5 characters.")
  }).strict(),
  params: z.object({
    userId: z.string().min(1, "User ID is required.")
  }).passthrough(),
  query: z.object({}).passthrough()
});

export const adminPropertyFilterSchema = z.object({
  body: z.object({}).strict(),
  params: z.object({}).passthrough(),
  query: z.object({
    status: z.enum(["draft", "pending", "active", "reserved", "sold", "rented", "archived", "rejected"]).optional(),
    propertyType: z.string().trim().optional(),
    search: z.string().trim().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).default("1"),
    limit: z.string().regex(/^\d+$/).transform(Number).default("10")
  }).passthrough()
});

export const updatePropertyStatusSchema = z.object({
  body: z.object({
    status: z.enum(["draft", "pending", "active", "reserved", "sold", "rented", "archived", "rejected"]),
    reason: z.string().trim().min(5, "Reason must be at least 5 characters.").optional()
  }).strict(),
  params: z.object({
    propertyId: z.string().min(1, "Property ID is required.")
  }).passthrough(),
  query: z.object({}).passthrough()
});

export const updatePropertySchema = z.object({
  body: z.object({
    title: z.string().trim().min(3).max(140).optional(),
    description: z.string().trim().min(20).max(5000).optional(),
    price: z.number().min(0).optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional()
  }).strict(),
  params: z.object({
    propertyId: z.string().min(1, "Property ID is required.")
  }).passthrough(),
  query: z.object({}).passthrough()
});

export const createStakeholderSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email("Enter a valid email address."),
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters.").max(100),
    phone: phoneSchema,
    password: z.string().min(6, "Password must be at least 6 characters.")
  }).strict(),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough()
});

export const updatePlatformSettingsSchema = z.object({
  body: z.object({
    amenities: z.array(z.string().trim()).optional(),
    maintenanceMode: z.boolean().optional(),
    listingsApprovalRequired: z.boolean().optional()
  }).strict(),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough()
});

export const adminAuditLogsFilterSchema = z.object({
  body: z.object({}).strict(),
  params: z.object({}).passthrough(),
  query: z.object({
    search: z.string().trim().optional(),
    action: z.string().trim().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).default("1"),
    limit: z.string().regex(/^\d+$/).transform(Number).default("10")
  }).passthrough()
});
