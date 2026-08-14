import mongoose from "mongoose";

const issueNoteSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true, trim: true, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, required: true, trim: true, maxlength: 3000 },
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", default: null },
  inspectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
  severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
  status: { type: String, enum: ["open", "investigating", "waiting", "resolved", "closed"], default: "open" },
  resolution: { type: String, trim: true, maxlength: 2000, default: "" },
  notes: { type: [issueNoteSchema], default: [] },
  resolvedAt: { type: Date, default: null }
}, { timestamps: true, versionKey: false });

schema.index({ assignedTo: 1, status: 1 });
schema.index({ reporterId: 1, createdAt: -1 });

export const Issue = mongoose.models.Issue || mongoose.model("Issue", schema);
