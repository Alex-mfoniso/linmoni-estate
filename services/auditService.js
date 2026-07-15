import storage from "../utils/storage";

const STORAGE_KEY = "linpal.audit.v1";

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function buildId() {
  return `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function readEntries() {
  const raw = await storage.getItem(STORAGE_KEY);
  const parsed = raw ? safeParse(raw) : [];
  return Array.isArray(parsed) ? parsed : [];
}

async function writeEntries(entries) {
  await storage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export async function logAuditEntry(action, target, performedBy, metadata = {}) {
  const entries = await readEntries();
  const entry = {
    id: buildId(),
    action,
    targetUserId: target?.targetUserId || null,
    invitationId: target?.invitationId || null,
    performedBy: performedBy || null,
    timestamp: new Date().toISOString(),
    metadata,
  };

  await writeEntries([entry, ...entries]);
  return entry;
}

export async function getAuditEntries() {
  return readEntries();
}

