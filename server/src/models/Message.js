import mongoose from "mongoose";
import { MESSAGE_TYPES } from "../constants/messageTypes.js";
const schema = new mongoose.Schema({ conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true }, senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, type: { type: String, enum: MESSAGE_TYPES, default: "text" }, text: { type: String, required: true, trim: true, minlength: 1, maxlength: 2000 }, readBy: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, readAt: { type: Date, required: true } }] }, { timestamps: true, versionKey: false });
schema.index({ conversationId: 1, createdAt: -1 });
export const Message = mongoose.models.Message || mongoose.model("Message", schema);
