import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import { ERROR_CODES } from "../constants/errorCodes.js";
import { BOOKABLE_PROPERTY_STATUSES } from "../constants/propertyStatuses.js";
import { CLIENT_CANCELLABLE_BOOKING_STATUSES } from "../constants/bookingStatuses.js";
import { paginationMeta } from "../utils/pagination.js";
import { bookingResponse } from "../utils/clientSerializers.js";
const CANCELLATION_CUTOFF_MS = 12 * 60 * 60 * 1000;
export function createBookingService({ BookingModel, PropertyModel }) { return {
  async list(userId, { page, limit, status }) { const filter = { userId, ...(status ? { status } : {}) }; const [items, totalItems] = await Promise.all([BookingModel.find(filter).populate({ path: "propertyId", populate: { path: "realtorId", select: "fullName avatar" } }).sort({ scheduledAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), BookingModel.countDocuments(filter)]); return { items: items.map(bookingResponse), pagination: paginationMeta(page, limit, totalItems) }; },
  async create(userId, { propertyId, scheduledAt, timezone, message }) { const date = new Date(scheduledAt); if (!Number.isFinite(date.getTime()) || date <= new Date()) throw new ApiError(400, "BOOKING_PAST_DATE", "Choose a future inspection time."); const property = await PropertyModel.findOne({ _id: propertyId, status: { $in: BOOKABLE_PROPERTY_STATUSES } }).lean(); if (!property) throw new ApiError(409, "PROPERTY_UNAVAILABLE", "This property is not accepting inspections."); const conflict = await BookingModel.exists({ userId, propertyId, scheduledAt: date, status: { $in: ["pending", "confirmed", "reschedule_requested"] } }); if (conflict) throw new ApiError(409, "BOOKING_CONFLICT", "You already have an inspection request for this time."); const booking = await BookingModel.create({ userId, propertyId, realtorId: property.realtorId, scheduledAt: date, timezone, message, status: "pending" });
    if (mongoose.models.Lead) {
      await mongoose.models.Lead.findOneAndUpdate(
        { clientId: userId, propertyId },
        { $set: { realtorId: property.realtorId, source: "booking", status: "inspection_scheduled" } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    await booking.populate({ path: "propertyId", populate: { path: "realtorId", select: "fullName avatar" } }); return bookingResponse(booking); },
  async cancel(userId, bookingId, reason = "") { const booking = await BookingModel.findOne({ _id: bookingId, userId }); if (!booking) throw new ApiError(404, ERROR_CODES.NOT_FOUND, "This booking was not found."); if (!CLIENT_CANCELLABLE_BOOKING_STATUSES.includes(booking.status)) throw new ApiError(409, "BOOKING_NOT_CANCELLABLE", "This booking can no longer be cancelled."); if (new Date(booking.scheduledAt).getTime() - Date.now() < CANCELLATION_CUTOFF_MS) throw new ApiError(409, "BOOKING_CUTOFF", "Bookings cannot be cancelled within 12 hours of the inspection."); booking.status = "cancelled"; booking.cancelledAt = new Date(); booking.cancellationReason = reason; await booking.save(); await booking.populate({ path: "propertyId", populate: { path: "realtorId", select: "fullName avatar" } }); return bookingResponse(booking); }
}; }
