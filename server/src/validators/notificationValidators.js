import { z } from "zod";
import { mongoId, pagination } from "./propertyValidators.js";
export const notificationListSchema = z.object({ body: z.object({}).strict(), params: z.object({}).passthrough(), query: z.object({ ...pagination, unreadOnly: z.string().transform((value) => value === "true").optional() }).strict() });
export const notificationActionSchema = z.object({ body: z.object({}).strict(), params: z.object({ notificationId: mongoId }).strict(), query: z.object({}).passthrough() });
