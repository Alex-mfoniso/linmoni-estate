const SAFE_FIELDS = [
  "id", "firebaseUid", "fullName", "email", "phone", "role", "status",
  "mustChangePassword", "emailVerified", "avatar", "bio", "agency",
  "specialties", "serviceAreas", "department", "position", "createdAt", "updatedAt"
];
export function sanitizeProfile(profile) { const value = profile?.toObject ? profile.toObject() : profile; if (!value) return null; const output = {}; for (const key of SAFE_FIELDS) { const source = key === "id" && value.id === undefined ? "_id" : key; if (value[source] !== undefined) output[key] = source === "_id" ? String(value[source]) : value[source]; } return output; }
export const successResponse = (res, message, data = {}, status = 200) => res.status(status).json({ success: true, message, data });
