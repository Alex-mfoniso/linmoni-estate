import mongoose from "mongoose";
const schema = new mongoose.Schema({ propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true }, clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, realtorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, lastMessageText: { type: String, trim: true, maxlength: 300, default: "" }, lastMessageAt: { type: Date, default: null } }, { timestamps: true, versionKey: false });
schema.index({ propertyId: 1, clientId: 1, realtorId: 1 }, { unique: true }); schema.index({ clientId: 1, lastMessageAt: -1 });
schema.index({ realtorId: 1, lastMessageAt: -1 });
export const Conversation = mongoose.models.Conversation || mongoose.model("Conversation", schema);
