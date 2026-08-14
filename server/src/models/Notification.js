import mongoose from "mongoose";
import { NOTIFICATION_TYPES } from "../constants/messageTypes.js";
const schema = new mongoose.Schema({ userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, type: { type: String, enum: NOTIFICATION_TYPES, default: "general" }, title: { type: String, required: true, trim: true, maxlength: 140 }, message: { type: String, required: true, trim: true, maxlength: 500 }, relatedType: { type: String, enum: ["property", "booking", "conversation", "general"], default: "general" }, relatedId: { type: mongoose.Schema.Types.ObjectId, default: null }, isRead: { type: Boolean, default: false }, readAt: { type: Date, default: null } }, { timestamps: true, versionKey: false });
schema.index({ userId: 1, createdAt: -1 }); schema.index({ userId: 1, isRead: 1 });
export const Notification = mongoose.models.Notification || mongoose.model("Notification", schema);
