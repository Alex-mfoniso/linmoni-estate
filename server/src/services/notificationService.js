import ApiError from "../utils/ApiError.js";
import { ERROR_CODES } from "../constants/errorCodes.js";
import { paginationMeta } from "../utils/pagination.js";
import { notificationResponse } from "../utils/clientSerializers.js";
export function createNotificationService(NotificationModel) { return {
  async list(userId, { page, limit, unreadOnly }) { const filter = { userId, ...(unreadOnly ? { isRead: false } : {}) }; const [items, totalItems] = await Promise.all([NotificationModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), NotificationModel.countDocuments(filter)]); return { items: items.map(notificationResponse), pagination: paginationMeta(page, limit, totalItems) }; },
  unreadCount(userId) { return NotificationModel.countDocuments({ userId, isRead: false }); },
  async markRead(userId, notificationId) { const item = await NotificationModel.findOneAndUpdate({ _id: notificationId, userId }, { $set: { isRead: true, readAt: new Date() } }, { new: true }).lean(); if (!item) throw new ApiError(404, ERROR_CODES.NOT_FOUND, "This notification was not found."); return notificationResponse(item); },
  async markAllRead(userId) { await NotificationModel.updateMany({ userId, isRead: false }, { $set: { isRead: true, readAt: new Date() } }); },
  async remove(userId, notificationId) { const result = await NotificationModel.deleteOne({ _id: notificationId, userId }); if (!result.deletedCount) throw new ApiError(404, ERROR_CODES.NOT_FOUND, "This notification was not found."); }
}; }
