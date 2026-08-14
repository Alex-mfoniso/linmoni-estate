import mongoose from "mongoose";

const schema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, enum: ["verified", "changes_requested"], required: true },
  reason: { type: String, required: true, trim: true, maxlength: 1000 },
  checklist: {
    imagesAcceptable: { type: Boolean, default: false },
    locationComplete: { type: Boolean, default: false },
    pricingComplete: { type: Boolean, default: false },
    descriptionComplete: { type: Boolean, default: false },
    requiredInfoPresent: { type: Boolean, default: false }
  }
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });

schema.index({ propertyId: 1, createdAt: -1 });

export const Review = mongoose.models.Review || mongoose.model("Review", schema);
