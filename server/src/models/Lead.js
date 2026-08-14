import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  realtorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  source: { type: String, enum: ["inquiry", "favourite", "booking", "conversation", "other"], required: true },
  status: { type: String, enum: ["new", "contacted", "qualified", "inspection_scheduled", "negotiating", "converted", "lost"], default: "new" },
  notes: { type: String, trim: true, default: "" },
  lastContactedAt: { type: Date, default: null }
}, { timestamps: true, versionKey: false });

// Indices required by specification
leadSchema.index({ realtorId: 1, status: 1 });
leadSchema.index({ realtorId: 1, createdAt: -1 });
leadSchema.index({ clientId: 1 });

// Prevent duplication of the same client interested in the same property
leadSchema.index({ propertyId: 1, clientId: 1 }, { unique: true });

export const Lead = mongoose.models.Lead || mongoose.model("Lead", leadSchema);
