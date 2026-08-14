import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";

const config = { NODE_ENV: "test", PORT: 3001, MONGODB_URI: "mongodb://mock", CLIENT_ORIGINS: ["http://localhost:8081"], FIREBASE_PROJECT_ID: "test", FIREBASE_CLIENT_EMAIL: "test@example.com", FIREBASE_PRIVATE_KEY: "mock", LOG_LEVEL: "silent" };
const profile = (overrides = {}) => ({
  _id: "507f1f77bcf86cd799439011", firebaseUid: "firebase-1", fullName: "Ada Client", email: "ada@example.com", phone: "+2348012345678",
  role: "client", status: "active", mustChangePassword: false, emailVerified: true, avatar: null, createdAt: new Date(), updatedAt: new Date(), lastLoginAt: null,
  save: vi.fn(async function save() { return this; }), toObject() { const { save, toObject, ...value } = this; return value; }, ...overrides
});

function fixture({ tokenError, existing = profile(), emailVerified = true } = {}) {
  const state = { existing };
  const adminAuth = { verifyIdToken: vi.fn(async () => { if (tokenError) throw tokenError; return { uid: "firebase-1", email: "ada@example.com", email_verified: emailVerified }; }) };
  const UserModel = {
    findOne: vi.fn(async (query) => query.firebaseUid ? (state.existing?.firebaseUid === query.firebaseUid ? state.existing : null) : (state.existing?.email === query.email ? state.existing : null)),
    exists: vi.fn(async (query) => state.existing?.email === query.email),
    create: vi.fn(async (input) => { state.existing = profile(input); return state.existing; }), updateOne: vi.fn(async () => ({ acknowledged: true }))
  };
  const AuditLogModel = { create: vi.fn(async () => ({})) };
  return { app: createApp({ config, adminAuth, UserModel, AuditLogModel }), adminAuth, UserModel, AuditLogModel, state };
}
const bearer = { Authorization: "Bearer valid-token" };

describe("Phase B auth API", () => {
  beforeEach(() => vi.clearAllMocks());
  it("reports process health without secrets", async () => { const { app } = fixture(); const res = await request(app).get("/api/health"); expect(res.status).toBe(200); expect(res.body.data.status).toBe("ok"); expect(JSON.stringify(res.body)).not.toContain("mongodb://"); });
  it("rejects a missing authorization header", async () => { const { app } = fixture(); const res = await request(app).get("/api/v1/auth/me"); expect(res.status).toBe(401); expect(res.body.code).toBe("AUTH_MISSING_TOKEN"); });
  it("rejects an invalid authorization scheme", async () => { const { app } = fixture(); const res = await request(app).get("/api/v1/auth/me").set("Authorization", "Basic value"); expect(res.status).toBe(401); expect(res.body.code).toBe("AUTH_INVALID_SCHEME"); });
  it("normalizes invalid and expired Firebase tokens", async () => { let f = fixture({ tokenError: { code: "auth/argument-error" } }); let res = await request(f.app).get("/api/v1/auth/me").set(bearer); expect(res.body.code).toBe("AUTH_INVALID_TOKEN"); f = fixture({ tokenError: { code: "auth/id-token-expired" } }); res = await request(f.app).get("/api/v1/auth/me").set(bearer); expect(res.body.code).toBe("AUTH_EXPIRED_TOKEN"); });
  it("returns the safe current profile for a valid token", async () => { const { app } = fixture(); const res = await request(app).get("/api/v1/auth/me").set(bearer); expect(res.status).toBe(200); expect(res.body.data.profile.role).toBe("client"); expect(res.body.data.profile.lastLoginAt).toBeUndefined(); });
  it("blocks a missing MongoDB profile", async () => { const { app } = fixture({ existing: null }); const res = await request(app).get("/api/v1/auth/me").set(bearer); expect(res.status).toBe(404); expect(res.body.code).toBe("PROFILE_MISSING"); });
  it.each([["disabled", "ACCOUNT_DISABLED"], ["suspended", "ACCOUNT_SUSPENDED"], ["pending", "ACCOUNT_PENDING"]])("blocks %s accounts", async (status, code) => { const { app } = fixture({ existing: profile({ status }) }); const res = await request(app).get("/api/v1/auth/me").set(bearer); expect(res.status).toBe(403); expect(res.body.code).toBe(code); });
  it("creates only a pending client profile from verified token identity", async () => { const { app, UserModel } = fixture({ existing: null, emailVerified: false }); const res = await request(app).post("/api/v1/auth/register-client-profile").set(bearer).send({ fullName: "Ada Client", phone: "+234 801 234 5678" }); expect(res.status).toBe(201); expect(UserModel.create).toHaveBeenCalledWith(expect.objectContaining({ firebaseUid: "firebase-1", email: "ada@example.com", role: "client", status: "pending" })); });
  it.each(["role", "status", "firebaseUid", "email"])("rejects %s injection", async (field) => { const { app } = fixture({ existing: null }); const res = await request(app).post("/api/v1/auth/register-client-profile").set(bearer).send({ fullName: "Ada Client", phone: "+2348012345678", [field]: "admin" }); expect(res.status).toBe(400); expect(res.body.code).toBe("VALIDATION_FAILED"); });
  it("is duplicate-safe for the same UID and email", async () => { const { app, UserModel } = fixture(); const res = await request(app).post("/api/v1/auth/register-client-profile").set(bearer).send({ fullName: "Ada Client" }); expect(res.status).toBe(200); expect(UserModel.create).not.toHaveBeenCalled(); });
  it("rejects an email owned by another UID", async () => { const { app } = fixture({ existing: profile({ firebaseUid: "other-uid" }) }); const res = await request(app).post("/api/v1/auth/register-client-profile").set(bearer).send({ fullName: "Ada Client" }); expect(res.status).toBe(409); expect(res.body.code).toBe("PROFILE_DUPLICATE_EMAIL"); });
  it("activates a pending account only from a verified token claim", async () => { const doc = profile({ status: "pending", emailVerified: false }); const { app } = fixture({ existing: doc, emailVerified: true }); const res = await request(app).patch("/api/v1/auth/sync-email-verification").set(bearer).send({}); expect(res.status).toBe(200); expect(doc.status).toBe("active"); expect(doc.emailVerified).toBe(true); });
  it("completes a forced password change without receiving a password", async () => { const doc = profile({ mustChangePassword: true }); const { app } = fixture({ existing: doc }); const res = await request(app).patch("/api/v1/auth/complete-password-change").set(bearer).send({}); expect(res.status).toBe(200); expect(doc.mustChangePassword).toBe(false); });
  it("always returns the normalized error contract", async () => { const { app } = fixture(); const res = await request(app).get("/missing"); expect(res.body).toMatchObject({ success: false, code: "NOT_FOUND", errors: [] }); });
});
