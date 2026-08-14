import { z } from "zod";

const periodSchema = z.enum([
  "today",
  "this_week",
  "this_month",
  "last_month",
  "this_quarter",
  "this_year",
  "custom"
]).default("this_month");

export const queryOverviewSchema = z.object({
  body: z.object({}).strict(),
  params: z.object({}).passthrough(),
  query: z.object({
    period: periodSchema.optional(),
    startDate: z.string().datetime({ message: "Start date must be an ISO date string." }).optional(),
    endDate: z.string().datetime({ message: "End date must be an ISO date string." }).optional()
  }).refine((data) => {
    if (data.period === "custom") {
      return !!data.startDate && !!data.endDate;
    }
    return true;
  }, {
    message: "startDate and endDate are required when period is custom.",
    path: ["startDate"]
  })
});

export const updateStakeholderProfileSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters.").max(100).optional(),
    phone: z.string().trim().regex(/^\+?[0-9 ()-]{7,24}$/, "Enter a valid phone number.").optional(),
    avatar: z.object({
      url: z.string().url("Enter a valid URL."),
      publicId: z.string().trim().optional()
    }).nullable().optional(),
    notificationPreferences: z.object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      sms: z.boolean().optional()
    }).optional()
  }).strict(),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough()
});
