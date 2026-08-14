import mongoose from "mongoose";
const schema = new mongoose.Schema({ userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true } }, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });
schema.index({ userId: 1, propertyId: 1 }, { unique: true }); schema.index({ userId: 1, createdAt: -1 });
export const Favourite = mongoose.models.Favourite || mongoose.model("Favourite", schema);
