import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import { ERROR_CODES } from "../constants/errorCodes.js";
import { CLIENT_VISIBLE_PROPERTY_STATUSES } from "../constants/propertyStatuses.js";
import { paginationMeta } from "../utils/pagination.js";
import { propertyResponse } from "../utils/clientSerializers.js";
export function createFavouriteService({ FavouriteModel, PropertyModel }) { return {
  async list(userId, { page, limit }) { const filter = { userId }; const [items, totalItems] = await Promise.all([FavouriteModel.find(filter).populate({ path: "propertyId", match: { status: { $in: CLIENT_VISIBLE_PROPERTY_STATUSES } }, populate: { path: "realtorId", select: "fullName avatar" } }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), FavouriteModel.countDocuments(filter)]); return { items: items.filter((item) => item.propertyId).map((item) => ({ id: String(item._id), property: propertyResponse(item.propertyId), createdAt: item.createdAt })), pagination: paginationMeta(page, limit, totalItems) }; },
  async add(userId, propertyId) { const property = await PropertyModel.findOne({ _id: propertyId, status: { $in: CLIENT_VISIBLE_PROPERTY_STATUSES } }).lean(); if (!property) throw new ApiError(404, ERROR_CODES.NOT_FOUND, "This property cannot be saved."); const favourite = await FavouriteModel.findOneAndUpdate({ userId, propertyId }, { $setOnInsert: { userId, propertyId } }, { upsert: true, new: true, setDefaultsOnInsert: true }).lean();
    if (mongoose.models.Lead) {
      await mongoose.models.Lead.findOneAndUpdate(
        { clientId: userId, propertyId },
        { $set: { realtorId: property.realtorId, source: "favourite", status: "new" } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    return { id: String(favourite._id), property: propertyResponse(property), createdAt: favourite.createdAt }; },
  async remove(userId, propertyId) { const result = await FavouriteModel.deleteOne({ userId, propertyId }); if (!result.deletedCount) throw new ApiError(404, ERROR_CODES.NOT_FOUND, "This saved property was not found."); },
  async ids(userId) { const items = await FavouriteModel.find({ userId }).select("propertyId").lean(); return items.map((item) => String(item.propertyId)); }
}; }
