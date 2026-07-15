import {
  createDirectInternalUser,
  getInternalUsers,
  updateInternalUser,
  deactivateInternalUser,
  reactivateInternalUser,
  changeTemporaryPassword,
} from "./internalUserService";
import {
  acceptInvitation,
  createInvitation,
  getInvitationById,
  getInvitations,
  resendInvitation,
  revokeInvitation,
  validateInvitationToken,
} from "./invitationService";

const MOCK_MODE = true;

function notConfigured(action) {
  throw new Error(
    `Admin backend is not configured for ${action}. The current app is using a local mock contract.`
  );
}

export async function createInternalUserDirect(payload, actorUid) {
  if (!MOCK_MODE) return notConfigured("createInternalUserDirect");
  return createDirectInternalUser(payload, actorUid);
}

export async function createInvitationRequest(payload, actorUid) {
  if (!MOCK_MODE) return notConfigured("createInvitationRequest");
  return createInvitation(payload, actorUid);
}

export async function getInternalUserList() {
  if (!MOCK_MODE) return notConfigured("getInternalUserList");
  return getInternalUsers();
}

export async function updateInternalUserRequest(uid, updates, actorUid) {
  if (!MOCK_MODE) return notConfigured("updateInternalUserRequest");
  return updateInternalUser(uid, updates, actorUid);
}

export async function deactivateInternalUserRequest(uid, actorUid) {
  if (!MOCK_MODE) return notConfigured("deactivateInternalUserRequest");
  return deactivateInternalUser(uid, actorUid);
}

export async function reactivateInternalUserRequest(uid, actorUid) {
  if (!MOCK_MODE) return notConfigured("reactivateInternalUserRequest");
  return reactivateInternalUser(uid, actorUid);
}

export async function changeTemporaryPasswordRequest(uid, currentPassword, nextPassword) {
  if (!MOCK_MODE) return notConfigured("changeTemporaryPasswordRequest");
  return changeTemporaryPassword(uid, currentPassword, nextPassword);
}

export async function getInvitationList(filters) {
  if (!MOCK_MODE) return notConfigured("getInvitationList");
  return getInvitations(filters);
}

export async function getInvitationRequestById(id) {
  if (!MOCK_MODE) return notConfigured("getInvitationRequestById");
  return getInvitationById(id);
}

export async function validateInvitationRequestToken(token) {
  if (!MOCK_MODE) return notConfigured("validateInvitationRequestToken");
  return validateInvitationToken(token);
}

export async function acceptInvitationRequest(token, password) {
  if (!MOCK_MODE) return notConfigured("acceptInvitationRequest");
  return acceptInvitation(token, password);
}

export async function resendInvitationRequest(invitationId, actorUid) {
  if (!MOCK_MODE) return notConfigured("resendInvitationRequest");
  return resendInvitation(invitationId, actorUid);
}

export async function revokeInvitationRequest(invitationId, actorUid) {
  if (!MOCK_MODE) return notConfigured("revokeInvitationRequest");
  return revokeInvitation(invitationId, actorUid);
}

