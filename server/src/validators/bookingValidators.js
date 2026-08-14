import { z } from "zod";
import { BOOKING_STATUSES } from "../constants/bookingStatuses.js";
import { mongoId, pagination } from "./propertyValidators.js";
export const bookingListSchema = z.object({ body: z.object({}).strict(), params: z.object({}).passthrough(), query: z.object({ ...pagination, status: z.enum(BOOKING_STATUSES).optional() }).strict() });
export const createBookingSchema = z.object({ body: z.object({ propertyId: mongoId, scheduledAt: z.iso.datetime({ offset: true }), timezone: z.string().trim().min(3).max(64).default("Africa/Lagos"), message: z.string().trim().max(1000).default("") }).strict(), params: z.object({}).passthrough(), query: z.object({}).passthrough() });
export const cancelBookingSchema = z.object({ body: z.object({ reason: z.string().trim().max(500).default("") }).strict(), params: z.object({ bookingId: mongoId }).strict(), query: z.object({}).passthrough() });
