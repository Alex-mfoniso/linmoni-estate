import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";

const adminUser = {
  _id: "507f1f77bcf86cd799439001",
  firebaseUid: "firebase-admin",
  fullName: "Aliko Admin",
  email: "admin@example.com",
  phone: "+2348030000001",
  role: "admin",
  status: "active",
  mustChangePassword: false,
  emailVerified: true,
  toObject() {
    const { toObject, ...value } = this;
    return value;
  }
};

const config = {
  NODE_ENV: "test",
  PORT: 3005,
  MONGODB_URI: "mongodb://mock",
  CLIENT_ORIGINS: ["http://localhost:8081"],
  FIREBASE_PROJECT_ID: "test",
  FIREBASE_CLIENT_EMAIL: "test@example.com",
  FIREBASE_PRIVATE_KEY: "mock",
  LOG_LEVEL: "silent"
};

const bearer = { Authorization: "Bearer valid" };

function fixture(overrides = {}) {
  const adminService = {
    getOverview: vi.fn(async () => ({ success: true, data: { users: {}, properties: {}, operations: {}, security: {}, recentActivity: [] } })),
    getUsers: vi.fn(async () => ({ success: true, data: [adminUser], pagination: { total: 1, page: 1, limit: 10, pages: 1 } })),
    getUserDetail: vi.fn(async () => ({ success: true, data: { profile: adminUser, propertiesCount: 0, inspectionsCount: 0, auditHistory: [] } })),
    updateUserStatus: vi.fn(async () => ({ success: true, message: "User status changed to suspended.", data: adminUser })),
    updateUserRole: vi.fn(async () => ({ success: true, message: "User role transitioned to staff.", data: adminUser })),
    getProperties: vi.fn(async () => ({ success: true, data: [] })),
    getPropertyDetail: vi.fn(async () => ({ success: true, data: {} })),
    updateProperty: vi.fn(async () => ({ success: true, data: {} })),
    updatePropertyStatus: vi.fn(async () => ({ success: true, message: "Property status updated.", data: {} })),
    deleteProperty: vi.fn(async () => ({ success: true, message: "Property archived successfully." })),
    createStakeholder: vi.fn(async () => ({ success: true, message: "Stakeholder account successfully created.", data: adminUser })),
    getPlatformSettings: vi.fn(async () => ({ success: true, data: { amenities: [], maintenanceMode: false, listingsApprovalRequired: true } })),
    updatePlatformSettings: vi.fn(async () => ({ success: true, message: "Platform settings updated successfully.", data: {} })),
    getAuditLogs: vi.fn(async () => ({ success: true, data: [] })),
    ...overrides.adminService
  };

  const userService = {
    findByFirebaseUid: vi.fn(async () => overrides.user || adminUser),
    touchLogin: vi.fn(async () => {}),
    ...overrides.userService
  };

  const app = createApp({
    config,
    adminAuth: {
      verifyIdToken: vi.fn(async () => ({
        uid: "firebase-admin",
        email: "admin@example.com",
        email_verified: true
      })),
      createUser: vi.fn(async () => ({
        uid: "firebase-new-stakeholder"
      }))
    },
    userService,
    adminService,
    auditService: { record: vi.fn(async () => {}) }
  });

  return { app, adminService };
}

describe("Phase G Admin Experience API Contracts Suite", () => {
  beforeEach(() => vi.clearAllMocks());

  it("blocks non-admin roles from loading administrative endpoints", async () => {
    const f = fixture({ user: { ...adminUser, role: "client" } });
    const res = await request(f.app).get("/api/v1/admin/overview").set(bearer);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("ROLE_FORBIDDEN");
  });

  it("permits active admins to fetch dashboard analytics aggregates", async () => {
    const f = fixture();
    const res = await request(f.app).get("/api/v1/admin/overview").set(bearer);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(f.adminService.getOverview).toHaveBeenCalled();
  });

  it("lists all user profiles with search and pagination parameters", async () => {
    const f = fixture();
    const res = await request(f.app).get("/api/v1/admin/users?role=realtor&page=1&limit=10").set(bearer);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(f.adminService.getUsers).toHaveBeenCalled();
  });

  it("updates user status and enforces reasons checks", async () => {
    const f = fixture();
    const res = await request(f.app)
      .patch("/api/v1/admin/users/507f1f77bcf86cd799439002/status")
      .set(bearer)
      .send({ status: "suspended", reason: "Repeated contract violation events." });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(f.adminService.updateUserStatus).toHaveBeenCalled();
  });

  it("rejects status updates missing reasons or reasons too short", async () => {
    const f = fixture();
    const res = await request(f.app)
      .patch("/api/v1/admin/users/507f1f77bcf86cd799439002/status")
      .set(bearer)
      .send({ status: "suspended", reason: "" });
    expect(res.status).toBe(400);
  });

  it("transitions user accounts roles safely", async () => {
    const f = fixture();
    const res = await request(f.app)
      .patch("/api/v1/admin/users/507f1f77bcf86cd799439002/role")
      .set(bearer)
      .send({ role: "staff", reason: "Administrative transfer to operational staff duties." });
    expect(res.status).toBe(200);
    expect(f.adminService.updateUserRole).toHaveBeenCalled();
  });

  it("provisions a stakeholder profile linked with Firebase Identity", async () => {
    const f = fixture();
    const res = await request(f.app)
      .post("/api/v1/admin/stakeholders")
      .set(bearer)
      .send({
        email: "investor@example.com",
        fullName: "Aliko Investor",
        phone: "+2348039999901",
        password: "securePassword123"
      });
    expect(res.status).toBe(201);
    expect(f.adminService.createStakeholder).toHaveBeenCalled();
  });

  it("reads global platform settings parameters", async () => {
    const f = fixture();
    const res = await request(f.app).get("/api/v1/admin/settings").set(bearer);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(f.adminService.getPlatformSettings).toHaveBeenCalled();
  });

  it("updates global platform settings", async () => {
    const f = fixture();
    const res = await request(f.app)
      .patch("/api/v1/admin/settings")
      .set(bearer)
      .send({ maintenanceMode: true, listingsApprovalRequired: false });
    expect(res.status).toBe(200);
    expect(f.adminService.updatePlatformSettings).toHaveBeenCalled();
  });

  it("retrieves immutable administrative audit trails feed logs", async () => {
    const f = fixture();
    const res = await request(f.app).get("/api/v1/admin/audit-logs").set(bearer);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(f.adminService.getAuditLogs).toHaveBeenCalled();
  });
});
