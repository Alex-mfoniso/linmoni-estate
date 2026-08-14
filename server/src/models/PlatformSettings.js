import mongoose from "mongoose";

const schema = new mongoose.Schema({
  amenities: {
    type: [String],
    default: ["Water", "Electricity", "Security", "Gym", "Pool", "Parking"]
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  listingsApprovalRequired: {
    type: Boolean,
    default: true
  }
}, { timestamps: true, versionKey: false });

export const PlatformSetting = mongoose.models.PlatformSetting || mongoose.model("PlatformSetting", schema);
