import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";

const staffUser = {
  _id: "507f1f77bcf86cd799439011",
  firebaseUid: "firebase-staff",
  fullName: "Alice Staff",
  email: "alice@example.com",
  phone: "+2348011111111",
  role: "staff",
  status: "active",
  mustChangePassword: false,
  emailVerified: true,
  department: "Verification",
  position: "Verification Specialist",
  toObject() {
    const { toObject, ...value } = this;
    return value;
  }
};

const config = {
  NODE_ENV: "test",
  PORT: 3002,
  MONGODB_URI: "mongodb://mock",
  CLIENT_ORIGINS: ["http://localhost:8081"],
  FIREBASE_PROJECT_ID: "test",
  FIREBASE_CLIENT_EMAIL: "test@example.com",
  FIREBASE_PRIVATE_KEY: "mock",
  LOG_LEVEL: "silent"
};

const id = "507f1f77bcf86cd799439012";
const bearer = { Authorization: "Bearer valid" };

function fixture(overrides = {}) {
  const staffService = {
    getDashboard: vi.fn(async () => ({ summary: {}, priorities: [], upcomingInspections: [], pendingProperties: [], recentActivity: [] })),
    getTasks: vi.fn(async () => ({ items: [], pagination: {} })),
    getTaskDetail: vi.fn(async () => ({ _id: id, title: "Mock Task" })),
    updateTask: vi.fn(async () => ({ _id: id })),
    reassignTask: vi.fn(async () => ({ _id: id })),
    getPendingProperties: vi.fn(async () => ({ items: [], pagination: {} })),
    getPropertyReview: vi.fn(async () => ({ property: {}, history: [] })),
    verifyProperty: vi.fn(async () => ({ property: {} })),
    requestPropertyChanges: vi.fn(async () => ({ property: {} })),
    getInspections: vi.fn(async () => ({ items: [], pagination: {} })),
    getInspectionDetail: vi.fn(async () => ({ _id: id })),
    updateInspection: vi.fn(async () => ({ _id: id })),
    getIssues: vi.fn(async () => ({ items: [], pagination: {} })),
    getIssueDetail: vi.fn(async () => ({ _id: id })),
    createIssue: vi.fn(async () => ({ _id: id })),
    updateIssue: vi.fn(async () => ({ _id: id })),
    getProfile: vi.fn(async () => staffUser),
    updateProfile: vi.fn(async () => staffUser),
    ...overrides.staffService
  };

  const userService = {
    findByFirebaseUid: vi.fn(async () => overrides.user || staffUser),
    touchLogin: vi.fn(async () => {}),
    ...overrides.userService
  };

  const app = createApp({
    config,
    adminAuth: {
      verifyIdToken: vi.fn(async () => ({
        uid: "firebase-staff",
        email: "alice@example.com",
        email_verified: true
      }))
    },
    userService,
    staffService,
    auditService: { record: vi.fn(async () => {}) }
  });

  return { app, staffService };
}

describe("Phase E Staff Experience API Contracts", () => {
  beforeEach(() => vi.clearAllMocks());

  it("blocks non-staff roles from loading the Staff workspace", async () => {
    const f = fixture({ user: { ...staffUser, role: "client" } });
    const res = await request(f.app).get("/api/v1/staff/dashboard").set(bearer);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("ROLE_FORBIDDEN");
  });

  it("loads the Staff dashboard aggregates and summaries", async () => {
    const f = fixture();
    const res = await request(f.app).get("/api/v1/staff/dashboard").set(bearer);
    expect(res.status).toBe(200);
    expect(f.staffService.getDashboard).toHaveBeenCalledWith(staffUser._id);
  });

  it("lists assigned tasks with search and priority parameters", async () => {
    const f = fixture();
    const res = await request(f.app)
      .get("/api/v1/staff/tasks?page=1&limit=5&priority=high&status=in_progress")
      .set(bearer);
    expect(res.status).toBe(200);
    expect(f.staffService.getTasks).toHaveBeenCalledWith(
      staffUser._id,
      expect.objectContaining({ page: 1, limit: 5, priority: "high", status: "in_progress" })
    );
  });

  it("resolves specific task details", async () => {
    const f = fixture();
    const res = await request(f.app).get(`/api/v1/staff/tasks/${id}`).set(bearer);
    expect(res.status).toBe(200);
    expect(f.staffService.getTaskDetail).toHaveBeenCalledWith(staffUser._id, id);
  });

  it("performs task status updates successfully", async () => {
    const f = fixture();
    const res = await request(f.app)
      .patch(`/api/v1/staff/tasks/${id}`)
      .set(bearer)
      .send({ status: "completed" });
    expect(res.status).toBe(200);
    expect(f.staffService.updateTask).toHaveBeenCalledWith(staffUser._id, id, { status: "completed" });
  });

  it("performs task reassignment successfully", async () => {
    const f = fixture();
    const targetStaff = "507f1f77bcf86cd799439013";
    const res = await request(f.app)
      .patch(`/api/v1/staff/tasks/${id}/reassign`)
      .set(bearer)
      .send({ assignedTo: targetStaff });
    expect(res.status).toBe(200);
    expect(f.staffService.reassignTask).toHaveBeenCalledWith(staffUser._id, id, targetStaff);
  });

  it("loads pending property verifications", async () => {
    const f = fixture();
    const res = await request(f.app).get("/api/v1/staff/properties/pending?page=1&limit=10").set(bearer);
    expect(res.status).toBe(200);
    expect(f.staffService.getPendingProperties).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 10 }));
  });

  it("loads historical verification reviews of a property", async () => {
    const f = fixture();
    const res = await request(f.app).get(`/api/v1/staff/properties/${id}/review`).set(bearer);
    expect(res.status).toBe(200);
    expect(f.staffService.getPropertyReview).toHaveBeenCalledWith(id);
  });

  it("verifies and approves a property listing successfully", async () => {
    const f = fixture();
    const res = await request(f.app)
      .post(`/api/v1/staff/properties/${id}/verify`)
      .set(bearer)
      .send({
        checklist: {
          imagesAcceptable: true,
          locationComplete: true,
          pricingComplete: true,
          descriptionComplete: true,
          requiredInfoPresent: true
        }
      });
    expect(res.status).toBe(200);
    expect(f.staffService.verifyProperty).toHaveBeenCalledWith(
      staffUser._id,
      id,
      expect.objectContaining({ imagesAcceptable: true })
    );
  });

  it("requests property changes and rejects missing reasons", async () => {
    const f = fixture();
    const res1 = await request(f.app)
      .post(`/api/v1/staff/properties/${id}/request-changes`)
      .set(bearer)
      .send({});
    expect(res1.status).toBe(400); // Reason is missing

    const res2 = await request(f.app)
      .post(`/api/v1/staff/properties/${id}/request-changes`)
      .set(bearer)
      .send({ reason: "Images are blurry." });
    expect(res2.status).toBe(200);
    expect(f.staffService.requestPropertyChanges).toHaveBeenCalledWith(
      staffUser._id,
      id,
      "Images are blurry.",
      undefined
    );
  });

  it("lists, reviews, and modifies inspection bookings", async () => {
    const f = fixture();
    const res = await request(f.app).get("/api/v1/staff/inspections?page=1&limit=10&status=confirmed").set(bearer);
    expect(res.status).toBe(200);
    expect(f.staffService.getInspections).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 10, status: "confirmed" }));

    const detailRes = await request(f.app).get(`/api/v1/staff/inspections/${id}`).set(bearer);
    expect(detailRes.status).toBe(200);
    expect(f.staffService.getInspectionDetail).toHaveBeenCalledWith(id);

    const patchRes = await request(f.app)
      .patch(`/api/v1/staff/inspections/${id}`)
      .set(bearer)
      .send({ status: "completed", notes: "Arrival recorded and inspection complete." });
    expect(patchRes.status).toBe(200);
    expect(f.staffService.updateInspection).toHaveBeenCalledWith(
      staffUser._id,
      id,
      { status: "completed", notes: "Arrival recorded and inspection complete." }
    );
  });

  it("handles creating, filtering, and updating operational issues", async () => {
    const f = fixture();
    const res = await request(f.app).get("/api/v1/staff/issues?page=1&limit=5&severity=high").set(bearer);
    expect(res.status).toBe(200);
    expect(f.staffService.getIssues).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 5, severity: "high" }));

    const createRes = await request(f.app)
      .post("/api/v1/staff/issues")
      .set(bearer)
      .send({
        title: "Database Lock on Booking",
        description: "Transaction locked up during high volume realtor test bookings.",
        severity: "critical",
        propertyId: id
      });
    expect(createRes.status).toBe(201);
    expect(f.staffService.createIssue).toHaveBeenCalledWith(
      staffUser._id,
      expect.objectContaining({ title: "Database Lock on Booking", severity: "critical" })
    );

    const updateRes = await request(f.app)
      .patch(`/api/v1/staff/issues/${id}`)
      .set(bearer)
      .send({ status: "resolved", resolution: "Lock query optimized." });
    expect(updateRes.status).toBe(200);
    expect(f.staffService.updateIssue).toHaveBeenCalledWith(
      staffUser._id,
      id,
      { status: "resolved", resolution: "Lock query optimized." }
    );
  });

  it("handles fetching and patching Staff profile fields", async () => {
    const f = fixture();
    const res = await request(f.app).get("/api/v1/staff/profile").set(bearer);
    expect(res.status).toBe(200);
    expect(f.staffService.getProfile).toHaveBeenCalledWith(staffUser._id);

    const patchRes = await request(f.app)
      .patch("/api/v1/staff/profile")
      .set(bearer)
      .send({ fullName: "Alice Updated", phone: "+2348022222222" });
    expect(patchRes.status).toBe(200);
    expect(f.staffService.updateProfile).toHaveBeenCalledWith(staffUser._id, { fullName: "Alice Updated", phone: "+2348022222222" });
  });
});
