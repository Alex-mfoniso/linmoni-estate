import mongoose from "mongoose";

const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, required: true, trim: true, maxlength: 3000 },
  type: { type: String, enum: ["verification", "inspection", "support", "issue", "operational"], required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  relatedProperty: { type: mongoose.Schema.Types.ObjectId, ref: "Property", default: null },
  relatedInspection: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
  relatedIssue: { type: mongoose.Schema.Types.ObjectId, ref: "Issue", default: null },
  priority: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
  status: { type: String, enum: ["pending", "in_progress", "blocked", "completed", "cancelled"], default: "pending" },
  dueAt: { type: Date, required: true },
  completedAt: { type: Date, default: null }
}, { timestamps: true, versionKey: false });

schema.index({ assignedTo: 1, status: 1 });
schema.index({ status: 1, dueAt: 1 });

export const Task = mongoose.models.Task || mongoose.model("Task", schema);
