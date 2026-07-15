import { ROLES } from "../constants/roles";
import storage from "../utils/storage";
import { isStrongPassword } from "../utils/security";
import {
  createUserRecord,
  getUserByEmail,
  getUserById,
  getUsers,
  setUserPassword,
  updateUserRecord,
} from "./userService";
import { logAuditEntry } from "./auditService";

const INTERNAL_ROLES = [ROLES.STAFF, ROLES.REALTOR, ROLES.STAKEHOLDER, ROLES.ADMIN];

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function validateInternalUserPayload(payload = {}) {
  const errors = {};
  const fullName = String(payload.fullName || "").trim();
  const email = String(payload.email || "").trim().toLowerCase();
  const phone = String(payload.phone || "").trim();
  const role = String(payload.role || "").trim();
  const status = String(payload.status || "active").trim();
  const password = String(payload.password || "");

  if (fullName.length < 3) {
    errors.fullName = "Enter a valid full name.";
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (phone.length < 7) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!INTERNAL_ROLES.includes(role)) {
    errors.role = "Choose a valid internal role.";
  }

  if (!["active", "inactive"].includes(status)) {
    errors.status = "Choose a valid status.";
  }

  if (payload.method === "direct" && !isStrongPassword(password)) {
    errors.password = "Use at least 8 characters with upper, lower, and a number.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    payload: { fullName, email, phone, role, status, password },
  };
}

export async function createDirectInternalUser(payload, actorUid) {
  const validation = validateInternalUserPayload({ ...payload, method: "direct" });
  if (!validation.valid) {
    const message = Object.values(validation.errors)[0] || "Invalid user data.";
    throw new Error(message);
  }

  const { fullName, email, phone, role, status, password } = validation.payload;
  const existing = await getUserByEmail(email);
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const now = new Date().toISOString();
  const user = await createUserRecord({
    fullName,
    email,
    phone,
    role,
    status,
    password,
    mustChangePassword: true,
    creationMethod: "direct",
    createdBy: actorUid || "",
    createdAt: now,
    updatedAt: now,
    passwordChangedAt: null,
  });

  await logAuditEntry(
    "direct_account_created",
    { targetUserId: user.uid },
    actorUid,
    { role, status, creationMethod: "direct" }
  );

  return {
    user,
    method: "direct",
    temporaryPassword: null,
  };
}

export async function getInternalUsers() {
  const users = await getUsers();
  return users.filter((user) => user.role !== ROLES.CLIENT);
}

export async function updateInternalUser(uid, updates = {}, actorUid = null) {
  const current = await getUserById(uid);
  if (!current) {
    throw new Error("User not found.");
  }

  const next = await updateUserRecord(uid, {
    fullName: updates.fullName ?? current.fullName,
    phone: updates.phone ?? current.phone,
    role: updates.role ?? current.role,
    status: updates.status ?? current.status,
  });

  if (updates.role && updates.role !== current.role) {
    await logAuditEntry(
      "user_role_changed",
      { targetUserId: uid },
      actorUid,
      { from: current.role, to: updates.role }
    );
  }

  if (updates.status && updates.status !== current.status) {
    await logAuditEntry(
      "user_status_changed",
      { targetUserId: uid },
      actorUid,
      { from: current.status, to: updates.status }
    );
  }

  return next;
}

export async function deactivateInternalUser(uid, actorUid = null) {
  return updateInternalUser(uid, { status: "inactive" }, actorUid);
}

export async function reactivateInternalUser(uid, actorUid = null) {
  return updateInternalUser(uid, { status: "active" }, actorUid);
}

export async function changeTemporaryPassword(uid, currentPassword, nextPassword) {
  const user = await getUserById(uid);
  if (!user) {
    throw new Error("User not found.");
  }

  const rawUsers = await storage.getItem("linpal.users.v1");
  if (!rawUsers) {
    throw new Error("No stored users found.");
  }

  const users = safeParse(rawUsers);
  if (!Array.isArray(users)) {
    throw new Error("Unable to read stored users.");
  }

  const record = users.find((item) => item.uid === uid);
  if (!record || record.password !== currentPassword) {
    throw new Error("Current password is incorrect.");
  }

  if (!isStrongPassword(nextPassword)) {
    throw new Error("New password must be at least 8 characters and include upper, lower, and a number.");
  }

  await setUserPassword(uid, nextPassword, {
    mustChangePassword: false,
  });

  await logAuditEntry(
    "temporary_password_changed",
    { targetUserId: uid },
    uid,
    { changedByUser: uid }
  );

  return true;
}

export function getAllowedInternalRoles() {
  return [...INTERNAL_ROLES];
}
