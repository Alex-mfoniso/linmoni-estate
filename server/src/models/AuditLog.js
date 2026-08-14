import mongoose from "mongoose";
export const AUDIT_ACTIONS = [
  "client_profile_created", "profile_loaded", "login_completed", "account_access_blocked",
  "email_verification_synced", "password_change_completed", "logout_recorded", "profile_creation_failed",
  "property_verified", "property_changes_requested", "task_assigned", "task_completed",
  "inspection_updated", "issue_updated", "issue_resolved",
  "role_changed", "user_suspended", "user_restored", "property_archived", "property_deleted", "platform_setting_changed"
];
const schema = new mongoose.Schema({ actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, actorFirebaseUid: { type: String, trim: true, default: null }, action: { type: String, enum: AUDIT_ACTIONS, required: true }, targetType: { type: String, trim: true, maxlength: 50, default: "user" }, targetId: { type: String, trim: true, maxlength: 100, default: null }, metadata: { type: mongoose.Schema.Types.Mixed, default: {} }, ipAddress: { type: String, trim: true, maxlength: 64, default: null }, userAgent: { type: String, trim: true, maxlength: 256, default: null } }, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });
schema.index({ actorFirebaseUid: 1, createdAt: -1 });
export const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", schema);
