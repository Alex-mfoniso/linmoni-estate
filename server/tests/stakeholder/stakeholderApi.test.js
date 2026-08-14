import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";

const stakeholderUser = {
  _id: "507f1f77bcf86cd799439099",
  firebaseUid: "firebase-stakeholder",
  fullName: "Alice Stakeholder",
  email: "alice_stakeholder@example.com",
  phone: "+2348099999999",
  role: "stakeholder",
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
  PORT: 3004,
  MONGODB_URI: "mongodb://mock",
  CLIENT_ORIGINS: ["http://localhost:8081"],
  FIREBASE_PROJECT_ID: "test",
  FIREBASE_CLIENT_EMAIL: "test@example.com",
  FIREBASE_PRIVATE_KEY: "mock",
  LOG_LEVEL: "silent"
};

const bearer = { Authorization: "Bearer valid" };

function fixture(overrides = {}) {
  const stakeholderService = {
    getDashboard: vi.fn(async () => ({ success: true, data: { summary: {}, trends: [], topProperties: [], realtorPerformance: [], operationalHealth: {} } })),
    getPropertyAnalytics: vi.fn(async () => ({ success: true, data: { statusBreakdown: {}, items: [] } })),
    getRealtorAnalytics: vi.fn(async () => ({ success: true, data: { items: [] } })),
    getStaffAnalytics: vi.fn(async () => ({ success: true, data: { activeStaffCount: 1 } })),
    getActivityLogs: vi.fn(async () => ({ success: true, data: { items: [] } })),
    getProfile: vi.fn(async () => stakeholderUser),
    updateProfile: vi.fn(async () => stakeholderUser),
    generatePropertiesReport: vi.fn(async () => "properties csv"),
    generatePerformanceReport: vi.fn(async () => "performance csv"),
    generateOperationsReport: vi.fn(async () => "operations csv"),
    ...overrides.stakeholderService
  };

  const userService = {
    findByFirebaseUid: vi.fn(async () => overrides.user || stakeholderUser),
    touchLogin: vi.fn(async () => {}),
    ...overrides.userService
  };

  const app = createApp({
    config,
    adminAuth: {
      verifyIdToken: vi.fn(async () => ({
        uid: "firebase-stakeholder",
        email: "alice_stakeholder@example.com",
        email_verified: true
      }))
    },
    userService,
    stakeholderService,
    auditService: { log: vi.fn(async () => {}) }
  });

  return { app, stakeholderService };
}

describe("Phase F Stakeholder Experience API Contracts", () => {
  beforeEach(() => vi.clearAllMocks());

  it("blocks non-stakeholder roles from loading the Stakeholder workspace", async () => {
    const f = fixture({ user: { ...stakeholderUser, role: "client" } });
    const res = await request(f.app).get("/api/v1/stakeholder/overview").set(bearer);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("ROLE_FORBIDDEN");
  });

  it("loads the Stakeholder dashboard overview aggregates", async () => {
    const f = fixture();
    const res = await request(f.app).get("/api/v1/stakeholder/overview?period=this_month").set(bearer);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(f.stakeholderService.getDashboard).toHaveBeenCalled();
  });

  it("loads the Property portfolio analytics", async () => {
    const f = fixture();
    const res = await request(f.app).get("/api/v1/stakeholder/analytics/properties?page=1&limit=10").set(bearer);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(f.stakeholderService.getPropertyAnalytics).toHaveBeenCalled();
  });

  it("loads the Realtors directories list", async () => {
    const f = fixture();
    const res = await request(f.app).get("/api/v1/stakeholder/analytics/realtors?sort=inspections").set(bearer);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(f.stakeholderService.getRealtorAnalytics).toHaveBeenCalled();
  });

  it("loads the Staff operational capacities summary", async () => {
    const f = fixture();
    const res = await request(f.app).get("/api/v1/stakeholder/analytics/staff").set(bearer);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(f.stakeholderService.getStaffAnalytics).toHaveBeenCalled();
  });

  it("lists activity audit logs with pagination", async () => {
    const f = fixture();
    const res = await request(f.app).get("/api/v1/stakeholder/activity?page=1&limit=15").set(bearer);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(f.stakeholderService.getActivityLogs).toHaveBeenCalled();
  });

  it("loads the Stakeholder profile", async () => {
    const f = fixture();
    const res = await request(f.app).get("/api/v1/stakeholder/profile").set(bearer);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(f.stakeholderService.getProfile).toHaveBeenCalled();
  });

  it("updates safe fields of Stakeholder profile", async () => {
    const f = fixture();
    const res = await request(f.app).patch("/api/v1/stakeholder/profile")
      .send({ fullName: "New Stakeholder Name", phone: "+2348011111111" })
      .set(bearer);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(f.stakeholderService.updateProfile).toHaveBeenCalledWith(
      stakeholderUser._id,
      expect.objectContaining({ fullName: "New Stakeholder Name", phone: "+2348011111111" })
    );
  });

  it("rejects unauthorized mass assignment profile update fields", async () => {
    const f = fixture();
    const res = await request(f.app).patch("/api/v1/stakeholder/profile")
      .send({ role: "admin", status: "active" })
      .set(bearer);
    expect(res.status).toBe(400); // Strict validator Schema error
  });

  it("generates lightweight properties reports", async () => {
    const f = fixture();
    const res = await request(f.app).get("/api/v1/stakeholder/reports/properties").set(bearer);
    expect(res.status).toBe(200);
    expect(res.text).toBe("properties csv");
    expect(f.stakeholderService.generatePropertiesReport).toHaveBeenCalled();
  });

  it("generates brokers performance reports", async () => {
    const f = fixture();
    const res = await request(f.app).get("/api/v1/stakeholder/reports/performance").set(bearer);
    expect(res.status).toBe(200);
    expect(res.text).toBe("performance csv");
    expect(f.stakeholderService.generatePerformanceReport).toHaveBeenCalled();
  });

  it("generates staff operations reports", async () => {
    const f = fixture();
    const res = await request(f.app).get("/api/v1/stakeholder/reports/operations").set(bearer);
    expect(res.status).toBe(200);
    expect(res.text).toBe("operations csv");
    expect(f.stakeholderService.generateOperationsReport).toHaveBeenCalled();
  });
});
