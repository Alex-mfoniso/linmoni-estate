import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import ApiError from "../../src/utils/ApiError.js";

const realtorUser = {
  _id: "507f1f77bcf86cd799439021",
  firebaseUid: "firebase-realtor",
  fullName: "John Realtor",
  email: "john@example.com",
  phone: "+2348098765432",
  role: "realtor",
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
  PORT: 3001,
  MONGODB_URI: "mongodb://mock",
  CLIENT_ORIGINS: ["http://localhost:8081"],
  FIREBASE_PROJECT_ID: "test",
  FIREBASE_CLIENT_EMAIL: "test@example.com",
  FIREBASE_PRIVATE_KEY: "mock",
  LOG_LEVEL: "silent"
};

const id = "507f1f77bcf86cd799439022";
const bearer = { Authorization: "Bearer valid" };

function fixture(overrides = {}) {
  const realtorService = {
    getDashboard: vi.fn(async () => ({ summary: {}, recentLeads: [], upcomingInspections: [], recentProperties: [] })),
    getProperties: vi.fn(async () => ({ items: [], pagination: {} })),
    getPropertyDetail: vi.fn(async () => ({ property: { id }, analytics: {} })),
    createProperty: vi.fn(async () => ({ id })),
    updateProperty: vi.fn(async () => ({ id })),
    archiveProperty: vi.fn(async () => ({ id })),
    getLeads: vi.fn(async () => ({ items: [], pagination: {} })),
    getLeadDetail: vi.fn(async () => ({ id })),
    updateLead: vi.fn(async () => ({ id })),
    getBookings: vi.fn(async () => ({ items: [], pagination: {} })),
    getBookingDetail: vi.fn(async () => ({ id })),
    confirmBooking: vi.fn(async () => ({ id })),
    rejectBooking: vi.fn(async () => ({ id })),
    rescheduleBooking: vi.fn(async () => ({ id })),
    completeBooking: vi.fn(async () => ({ id })),
    getConversations: vi.fn(async () => ({ items: [], pagination: {} })),
    getMessages: vi.fn(async () => ({ items: [], pagination: {} })),
    sendMessage: vi.fn(async () => ({ message: { id } })),
    markConversationAsRead: vi.fn(async () => ({ id })),
    updateProfile: vi.fn(async () => ({ _id: realtorUser._id })),
    ...overrides.realtorService
  };

  const userService = {
    findByFirebaseUid: vi.fn(async () => overrides.user || realtorUser),
    touchLogin: vi.fn(async () => {}),
    ...overrides.userService
  };

  const app = createApp({
    config,
    adminAuth: {
      verifyIdToken: vi.fn(async () => ({
        uid: "firebase-realtor",
        email: "john@example.com",
        email_verified: true
      }))
    },
    userService,
    realtorService,
    auditService: { record: vi.fn(async () => {}) }
  });

  return { app, realtorService };
}

describe("Phase D Realtor experience API contracts", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads the Realtor dashboard detail and summary statistics", async () => {
    const f = fixture();
    const res = await request(f.app).get("/api/v1/realtor/dashboard").set(bearer);
    expect(res.status).toBe(200);
    expect(f.realtorService.getDashboard).toHaveBeenCalledWith(realtorUser._id);
  });

  it("lists properties created by the caller", async () => {
    const f = fixture();
    const res = await request(f.app).get("/api/v1/realtor/properties?page=1&limit=10&status=draft").set(bearer);
    expect(res.status).toBe(200);
    expect(f.realtorService.getProperties).toHaveBeenCalledWith(realtorUser._id, expect.objectContaining({ page: 1, limit: 10, status: "draft" }));
  });

  it("blocks non-realtor roles from loading Realtor workspace", async () => {
    const res = await request(fixture({ user: { ...realtorUser, role: "client" } }).app)
      .get("/api/v1/realtor/dashboard")
      .set(bearer);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("ROLE_FORBIDDEN");
  });

  it("creates property and forces strict ownership injection block", async () => {
    const f = fixture();
    const body = {
      title: "Harbor Terrace",
      description: "Sea side living",
      propertyType: "apartment",
      listingType: "sale",
      price: 120000000,
      address: { street: "12 Admiralty", city: "Lagos", state: "Lagos", country: "Nigeria", postalCode: "" },
      details: { bedrooms: 3, bathrooms: 4, areaSqFt: 1800 },
      coverImage: { url: "https://cloudinary.com/test.jpg", publicId: "test_img" },
      images: [],
      features: ["Pool"],
      submit: true
    };

    const res = await request(f.app).post("/api/v1/realtor/properties").set(bearer).send(body);
    expect(res.status).toBe(201);
    expect(f.realtorService.createProperty).toHaveBeenCalledWith(realtorUser._id, expect.objectContaining({ title: "Harbor Terrace", submit: true }));

    // Injecting attacker realtorId into body
    const injected = await request(f.app).post("/api/v1/realtor/properties").set(bearer).send({ ...body, realtorId: "attacker" });
    expect(injected.status).toBe(400); // Fails validator since realtorId is not allowed in schema
  });

  it("updates and archives properties with ownership validations", async () => {
    const f = fixture();
    const updateBody = {
      title: "Harbor Terrace Updated",
      description: "Sea side living, fully upgraded",
      propertyType: "apartment",
      listingType: "sale",
      price: 125000000,
      address: { street: "12 Admiralty", city: "Lagos", state: "Lagos", country: "Nigeria", postalCode: "" },
      details: { bedrooms: 3, bathrooms: 4, areaSqFt: 1800 },
      coverImage: { url: "https://cloudinary.com/test.jpg", publicId: "test_img" },
      images: [],
      features: ["Pool", "Gym"],
      submit: false
    };

    let res = await request(f.app).patch(`/api/v1/realtor/properties/${id}`).set(bearer).send(updateBody);
    expect(res.status).toBe(200);
    expect(f.realtorService.updateProperty).toHaveBeenCalledWith(realtorUser._id, id, expect.objectContaining({ title: "Harbor Terrace Updated" }));

    res = await request(f.app).patch(`/api/v1/realtor/properties/${id}/archive`).set(bearer);
    expect(res.status).toBe(200);
    expect(f.realtorService.archiveProperty).toHaveBeenCalledWith(realtorUser._id, id);
  });

  it("manages and modifies Client Leads details", async () => {
    const f = fixture();
    let res = await request(f.app).get("/api/v1/realtor/leads?status=new_lead").set(bearer);
    expect(res.status).toBe(200);
    expect(f.realtorService.getLeads).toHaveBeenCalledWith(realtorUser._id, expect.objectContaining({ status: "new_lead" }));

    res = await request(f.app).patch(`/api/v1/realtor/leads/${id}`).set(bearer).send({ status: "contacted", notes: "Called today" });
    expect(res.status).toBe(200);
    expect(f.realtorService.updateLead).toHaveBeenCalledWith(realtorUser._id, id, expect.objectContaining({ status: "contacted", notes: "Called today" }));
  });

  it("transitions bookings through confirms, rejects, and reschedule auditing", async () => {
    const f = fixture();
    let res = await request(f.app).patch(`/api/v1/realtor/bookings/${id}/confirm`).set(bearer);
    expect(res.status).toBe(200);
    expect(f.realtorService.confirmBooking).toHaveBeenCalledWith(realtorUser._id, id);

    res = await request(f.app).patch(`/api/v1/realtor/bookings/${id}/reject`).set(bearer);
    expect(res.status).toBe(200);
    expect(f.realtorService.rejectBooking).toHaveBeenCalledWith(realtorUser._id, id);

    res = await request(f.app).patch(`/api/v1/realtor/bookings/${id}/complete`).set(bearer);
    expect(res.status).toBe(200);
    expect(f.realtorService.completeBooking).toHaveBeenCalledWith(realtorUser._id, id);

    // Reschedule audit payload test
    const rescheduleTime = "2027-08-01T14:00:00.000Z";
    res = await request(f.app).patch(`/api/v1/realtor/bookings/${id}/reschedule`).set(bearer).send({ scheduledAt: rescheduleTime, timezone: "Africa/Lagos" });
    expect(res.status).toBe(200);
    expect(f.realtorService.rescheduleBooking).toHaveBeenCalledWith(realtorUser._id, id, expect.objectContaining({ scheduledAt: rescheduleTime }));
  });

  it("lists messages and sends conversation text", async () => {
    const f = fixture();
    let res = await request(f.app).get("/api/v1/realtor/conversations?page=1").set(bearer);
    expect(res.status).toBe(200);
    expect(f.realtorService.getConversations).toHaveBeenCalledWith(realtorUser._id, expect.objectContaining({ page: 1 }));

    res = await request(f.app).post(`/api/v1/realtor/conversations/${id}/messages`).set(bearer).send({ text: "Hello from Realtor Office!" });
    expect(res.status).toBe(201);
    expect(f.realtorService.sendMessage).toHaveBeenCalledWith(realtorUser._id, id, "Hello from Realtor Office!");
  });

  it("updates Realtor credentials blocking illegal field injections", async () => {
    const f = fixture();
    const profilePayload = {
      fullName: "John Realtor Updated",
      phone: "+2348000000000",
      bio: "Top class agent",
      agency: "LINPAL Elite",
      specialties: ["Luxury Sales"],
      serviceAreas: ["Ikoyi"]
    };

    let res = await request(f.app).patch("/api/v1/realtor/profile").set(bearer).send(profilePayload);
    expect(res.status).toBe(200);
    expect(f.realtorService.updateProfile).toHaveBeenCalledWith(realtorUser._id, expect.objectContaining({ bio: "Top class agent" }));

    // Illegal field injection block
    res = await request(f.app).patch("/api/v1/realtor/profile").set(bearer).send({ ...profilePayload, role: "admin" });
    expect(res.status).toBe(400); // Blocks write to restricted system fields
  });
});
