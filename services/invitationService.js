import storage from "../utils/storage";
import { ROLES } from "../constants/roles";
import { createUserRecord, getUserByEmail } from "./userService";
import { isStrongPassword, generateRandomToken, hashToken } from "../utils/security";
import { logAuditEntry } from "./auditService";

const STORAGE_KEY = "linpal.invitations.v1";
const INVITE_BASE_URL = "linpal://accept-invitation";
const INTERNAL_ROLES = [ROLES.STAFF, ROLES.REALTOR, ROLES.STAKEHOLDER, ROLES.ADMIN];

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function buildId() {
  return `invite-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeInvitation(invitation) {
  return {
    id: String(invitation?.id || buildId()),
    email: String(invitation?.email || "").trim().toLowerCase(),
    fullName: String(invitation?.fullName || "").trim(),
    phone: String(invitation?.phone || "").trim(),
    role: String(invitation?.role || ROLES.STAFF).trim(),
    status: String(invitation?.status || "pending").trim(),
    accountStatus: String(invitation?.accountStatus || "active").trim(),
    tokenHash: String(invitation?.tokenHash || "").trim(),
    createdBy: String(invitation?.createdBy || "").trim(),
    createdAt: invitation?.createdAt || new Date().toISOString(),
    expiresAt: invitation?.expiresAt || new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    acceptedAt: invitation?.acceptedAt ?? null,
    acceptedByUid: invitation?.acceptedByUid ?? null,
    revokedAt: invitation?.revokedAt ?? null,
    resendCount: Number(invitation?.resendCount || 0),
    updatedAt: invitation?.updatedAt || new Date().toISOString(),
  };
}

async function readInvitations() {
  const raw = await storage.getItem(STORAGE_KEY);
  const parsed = raw ? safeParse(raw) : [];
  if (!Array.isArray(parsed)) {
    return [];
  }
  return parsed.map(normalizeInvitation);
}

async function writeInvitations(invitations) {
  await storage.setItem(STORAGE_KEY, JSON.stringify(invitations));
}

function makeInvitationLink(token) {
  return `${INVITE_BASE_URL}?token=${encodeURIComponent(token)}`;
}

async function assertEligibleEmail(email) {
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  const invitations = await readInvitations();
  const pending = invitations.find(
    (item) =>
      item.email === email &&
      ["pending"].includes(item.status)
  );

  if (pending) {
    throw new Error("This email already has a pending invitation.");
  }
}

export async function createInvitation(payload, actorUid) {
  const fullName = String(payload?.fullName || "").trim();
  const email = String(payload?.email || "").trim().toLowerCase();
  const phone = String(payload?.phone || "").trim();
  const role = String(payload?.role || "").trim();
  const status = String(payload?.status || "active").trim();
  const expiryDays = Number(payload?.expiryDays || 7);

  if (fullName.length < 3) throw new Error("Enter a valid full name.");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Enter a valid email address.");
  if (phone.length < 7) throw new Error("Enter a valid phone number.");
  if (!INTERNAL_ROLES.includes(role)) throw new Error("Choose a valid internal role.");
  if (!["active", "inactive"].includes(status)) throw new Error("Choose a valid status.");
  if (!Number.isFinite(expiryDays) || expiryDays < 1 || expiryDays > 30) {
    throw new Error("Choose an invitation expiry between 1 and 30 days.");
  }

  await assertEligibleEmail(email);

  const token = generateRandomToken(48);
  const tokenHash = await hashToken(token);
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString();
  const invitation = normalizeInvitation({
    id: buildId(),
    email,
    fullName,
    phone,
    role,
    status: "pending",
    accountStatus: status,
    tokenHash,
    createdBy: actorUid || "",
    createdAt: now,
    expiresAt,
    acceptedAt: null,
    acceptedByUid: null,
    revokedAt: null,
    resendCount: 0,
    updatedAt: now,
  });

  const invitations = await readInvitations();
  await writeInvitations([invitation, ...invitations]);

  await logAuditEntry(
    "invitation_created",
    { invitationId: invitation.id },
    actorUid,
    { email, role, status: invitation.status, accountStatus: invitation.accountStatus, expiresAt }
  );

  return {
    invitation,
    token,
    invitationUrl: makeInvitationLink(token),
  };
}

export async function getInvitations(filters = {}) {
  const invitations = await readInvitations();
  const query = String(filters.search || "").trim().toLowerCase();
  const status = String(filters.status || "all").trim().toLowerCase();

  return invitations.filter((invitation) => {
    const matchesStatus = status === "all" || invitation.status === status;
    const haystack = [
      invitation.fullName,
      invitation.email,
      invitation.phone,
      invitation.role,
      invitation.status,
      invitation.accountStatus,
    ]
      .join(" ")
      .toLowerCase();
    const matchesSearch = !query || haystack.includes(query);
    return matchesStatus && matchesSearch;
  });
}

export async function getInvitationById(id) {
  if (!id) {
    return null;
  }

  const invitations = await readInvitations();
  return invitations.find((invitation) => invitation.id === id) ?? null;
}

export async function validateInvitationToken(token) {
  if (!token) {
    return { valid: false, reason: "invalid" };
  }

  const tokenHash = await hashToken(token);
  const invitations = await readInvitations();
  const invitation = invitations.find((item) => item.tokenHash === tokenHash);

  if (!invitation) {
    return { valid: false, reason: "invalid" };
  }

  if (invitation.status === "revoked") {
    return { valid: false, reason: "revoked", invitation };
  }

  if (invitation.status === "accepted") {
    return { valid: false, reason: "accepted", invitation };
  }

  if (new Date(invitation.expiresAt).getTime() < Date.now()) {
    const expired = normalizeInvitation({
      ...invitation,
      status: "expired",
      updatedAt: new Date().toISOString(),
    });
    const nextInvitations = invitations.map((item) =>
      item.id === invitation.id ? expired : item
    );
    await writeInvitations(nextInvitations);
    return { valid: false, reason: "expired", invitation: expired };
  }

  return { valid: true, invitation };
}

export async function acceptInvitation(token, password) {
  if (!isStrongPassword(password)) {
    throw new Error("Choose a strong password with at least 8 characters, upper and lower case letters, and a number.");
  }

  const validation = await validateInvitationToken(token);
  if (!validation.valid) {
    throw new Error(`Invitation is ${validation.reason}.`);
  }

  const invitation = validation.invitation;
  await assertEligibleEmail(invitation.email);

  const user = await createUserRecord({
    fullName: invitation.fullName,
    email: invitation.email,
    phone: invitation.phone,
    role: invitation.role,
    status: invitation.accountStatus === "inactive" ? "inactive" : "active",
    password,
    mustChangePassword: false,
    creationMethod: "invitation",
    createdBy: invitation.createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    passwordChangedAt: new Date().toISOString(),
  });

  const invitations = await readInvitations();
  const accepted = normalizeInvitation({
    ...invitation,
    status: "accepted",
    acceptedAt: new Date().toISOString(),
    acceptedByUid: user.uid,
    revokedAt: null,
    updatedAt: new Date().toISOString(),
  });

  await writeInvitations(
    invitations.map((item) => (item.id === invitation.id ? accepted : item))
  );

  await logAuditEntry(
    "invitation_accepted",
    { invitationId: invitation.id, targetUserId: user.uid },
    user.uid,
    { email: invitation.email, role: invitation.role }
  );

  return { user, invitation: accepted };
}

export async function resendInvitation(invitationId, actorUid) {
  const invitations = await readInvitations();
  const invitation = invitations.find((item) => item.id === invitationId);
  if (!invitation) {
    throw new Error("Invitation not found.");
  }

  if (invitation.status === "accepted") {
    throw new Error("Accepted invitations cannot be resent.");
  }

  const token = generateRandomToken(48);
  const updated = normalizeInvitation({
    ...invitation,
    tokenHash: await hashToken(token),
    status: "pending",
    resendCount: invitation.resendCount + 1,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  });

  await writeInvitations(
    invitations.map((item) => (item.id === invitationId ? updated : item))
  );

  await logAuditEntry(
    "invitation_resent",
    { invitationId },
    actorUid,
    { email: invitation.email, role: invitation.role, resendCount: updated.resendCount }
  );

  return { invitation: updated, token, invitationUrl: makeInvitationLink(token) };
}

export async function revokeInvitation(invitationId, actorUid) {
  const invitations = await readInvitations();
  const invitation = invitations.find((item) => item.id === invitationId);
  if (!invitation) {
    throw new Error("Invitation not found.");
  }

  const updated = normalizeInvitation({
    ...invitation,
    status: "revoked",
    revokedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  await writeInvitations(
    invitations.map((item) => (item.id === invitationId ? updated : item))
  );

  await logAuditEntry(
    "invitation_revoked",
    { invitationId },
    actorUid,
    { email: invitation.email, role: invitation.role }
  );

  return updated;
}
