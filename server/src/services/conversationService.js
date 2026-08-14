import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import { ERROR_CODES } from "../constants/errorCodes.js";
import { paginationMeta } from "../utils/pagination.js";
import { CLIENT_VISIBLE_PROPERTY_STATUSES } from "../constants/propertyStatuses.js";
import { conversationResponse, messageResponse } from "../utils/clientSerializers.js";
export function createConversationService({ ConversationModel, MessageModel, PropertyModel }) {
  async function ownConversation(userId, conversationId) { const item = await ConversationModel.findOne({ _id: conversationId, clientId: userId }); if (!item) throw new ApiError(404, ERROR_CODES.NOT_FOUND, "This conversation is unavailable."); return item; }
  return {
    async list(userId, { page, limit }) { const filter = { clientId: userId }; const [items, totalItems] = await Promise.all([ConversationModel.find(filter).populate("propertyId").populate("clientId", "fullName avatar").populate("realtorId", "fullName avatar").sort({ lastMessageAt: -1, updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), ConversationModel.countDocuments(filter)]); const output = await Promise.all(items.map(async (item) => conversationResponse(item, await MessageModel.countDocuments({ conversationId: item._id, senderId: { $ne: userId }, readBy: { $not: { $elemMatch: { userId } } } })))); return { items: output, pagination: paginationMeta(page, limit, totalItems) }; },
    async createForProperty(userId, propertyId) { const property = await PropertyModel.findOne({ _id: propertyId, status: { $in: CLIENT_VISIBLE_PROPERTY_STATUSES } }).lean(); if (!property?.realtorId) throw new ApiError(404, ERROR_CODES.NOT_FOUND, "This property's contact is unavailable."); const item = await ConversationModel.findOneAndUpdate({ propertyId, clientId: userId, realtorId: property.realtorId }, { $setOnInsert: { propertyId, clientId: userId, realtorId: property.realtorId } }, { upsert: true, new: true, setDefaultsOnInsert: true }).populate("propertyId").populate("clientId", "fullName avatar").populate("realtorId", "fullName avatar");
      if (mongoose.models.Lead) {
        await mongoose.models.Lead.findOneAndUpdate(
          { clientId: userId, propertyId },
          { $set: { realtorId: property.realtorId, source: "conversation", status: "new" } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
      return conversationResponse(item); },
    async messages(userId, conversationId, { page, limit }) { await ownConversation(userId, conversationId); const filter = { conversationId }; const [items, totalItems] = await Promise.all([MessageModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), MessageModel.countDocuments(filter)]); return { items: items.reverse().map(messageResponse), pagination: paginationMeta(page, limit, totalItems) }; },
    async send(userId, conversationId, text) { const conversation = await ownConversation(userId, conversationId); const message = await MessageModel.create({ conversationId, senderId: userId, text, type: "text", readBy: [{ userId, readAt: new Date() }] }); conversation.lastMessageText = text.slice(0, 300); conversation.lastMessageAt = message.createdAt; await conversation.save(); return messageResponse(message); },
    async markRead(userId, conversationId) { await ownConversation(userId, conversationId); await MessageModel.updateMany({ conversationId, senderId: { $ne: userId }, readBy: { $not: { $elemMatch: { userId } } } }, { $push: { readBy: { userId, readAt: new Date() } } }); },
    async unreadCount(userId) { const conversations = await ConversationModel.find({ clientId: userId }).select("_id").lean(); return MessageModel.countDocuments({ conversationId: { $in: conversations.map((item) => item._id) }, senderId: { $ne: userId }, readBy: { $not: { $elemMatch: { userId } } } }); }
  };
}
