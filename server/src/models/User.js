import mongoose from "mongoose";
import { ROLES } from "../constants/roles.js";
import { ACCOUNT_STATUSES } from "../constants/accountStatuses.js";
const avatarSchema = new mongoose.Schema({ url: { type: String, trim: true }, publicId: { type: String, trim: true } }, { _id: false });
const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, unique: true, sparse: true, trim: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true, maxlength: 24, default: "" },
  role: { type: String, required: true, enum: ROLES }, status: { type: String, required: true, enum: ACCOUNT_STATUSES },
  mustChangePassword: { type: Boolean, default: false }, emailVerified: { type: Boolean, default: false },
  verificationTokenHash: { type: String, default: null, select: false },
  verificationTokenExpiresAt: { type: Date, default: null, select: false },
  passwordResetTokenHash: { type: String, default: null, select: false },
  passwordResetExpiresAt: { type: Date, default: null, select: false },
  refreshTokens: {
    type: [{
      tokenHash: { type: String, required: true },
      expiresAt: { type: Date, required: true }
    }],
    default: [],
    select: false
  },
  avatar: { type: avatarSchema, default: null }, createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, select: false },
  lastLoginAt: { type: Date, default: null, select: false },
  bio: { type: String, trim: true, default: "", maxlength: 2000 },
  agency: { type: String, trim: true, default: "", maxlength: 150 },
  specialties: [{ type: String, trim: true, maxlength: 80 }],
  serviceAreas: [{ type: String, trim: true, maxlength: 80 }],
  department: { type: String, trim: true, default: "", maxlength: 100 },
  position: { type: String, trim: true, default: "", maxlength: 100 }
}, { timestamps: true, versionKey: false });
export const User = mongoose.models.User || mongoose.model("User", userSchema);
