import { createNotification } from "./notificationService";
import { ROLES } from "../constants/roles";
import { getUsers } from "./userService";
import storage from "../utils/storage";

const STORAGE_KEY = "linpal.bookings.v1";

const DEFAULT_BOOKINGS = [
  {
    id: "booking-demo-1",
    propertyId: "prop-spring-meadows",
    propertyTitle: "Spring Meadows Residence",
    clientId: "demo-client",
    clientName: "Demo Client",
    clientEmail: "client@linpal.com",
    realtorId: "demo-realtor",
    preferredDate: "2026-07-15",
    preferredTime: "10:00",
    message: "We would like to view the property with one family member.",
    status: "pending",
    createdAt: "2026-07-01T10:00:00.000Z",
    updatedAt: "2026-07-01T10:00:00.000Z",
  },
  {
    id: "booking-demo-2",
    propertyId: "prop-azure-court",
    propertyTitle: "Azure Court Apartments",
    clientId: "demo-client",
    clientName: "Demo Client",
    clientEmail: "client@linpal.com",
    realtorId: "demo-realtor",
    preferredDate: "2026-07-12",
    preferredTime: "14:30",
    message: "Please confirm access for the afternoon inspection.",
    status: "approved",
    createdAt: "2026-07-02T11:30:00.000Z",
    updatedAt: "2026-07-03T09:20:00.000Z",
  },
];

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function buildId() {
  return `booking-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeBooking(booking) {
  return {
    id: booking.id || buildId(),
    propertyId: String(booking.propertyId || "").trim(),
    propertyTitle: String(booking.propertyTitle || "").trim(),
    clientId: String(booking.clientId || "").trim(),
    clientName: String(booking.clientName || "").trim(),
    clientEmail: String(booking.clientEmail || "").trim(),
    realtorId: String(booking.realtorId || "").trim(),
    preferredDate: String(booking.preferredDate || "").trim(),
    preferredTime: String(booking.preferredTime || "").trim(),
    message: String(booking.message || "").trim(),
    status: String(booking.status || "pending").trim(),
    createdAt: booking.createdAt || new Date().toISOString(),
    updatedAt: booking.updatedAt || new Date().toISOString(),
  };
}

async function ensureSeeded() {
  const raw = await storage.getItem(STORAGE_KEY);

  if (!raw) {
    await storage.setItem(
      STORAGE_KEY,
      JSON.stringify(DEFAULT_BOOKINGS.map(normalizeBooking))
    );
  }
}

async function readBookings() {
  await ensureSeeded();
  const raw = await storage.getItem(STORAGE_KEY);
  const parsed = raw ? safeParse(raw) : [];

  if (!Array.isArray(parsed)) {
    return DEFAULT_BOOKINGS.map(normalizeBooking);
  }

  return parsed.map(normalizeBooking);
}

async function writeBookings(bookings) {
  await storage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

function matchesSearch(booking, searchText) {
  if (!searchText) {
    return true;
  }

  const haystack = [
    booking.propertyTitle,
    booking.clientName,
    booking.clientEmail,
    booking.preferredDate,
    booking.preferredTime,
    booking.message,
    booking.status,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(searchText.toLowerCase());
}

export async function createBooking(bookingData) {
  const now = new Date().toISOString();
  const booking = normalizeBooking({
    ...bookingData,
    id: buildId(),
    status: "pending",
    createdAt: now,
    updatedAt: now,
  });

  const bookings = await readBookings();
  const nextBookings = [booking, ...bookings];

  await writeBookings(nextBookings);
  const users = await getUsers();
  await Promise.all(
    users
      .filter((user) => [ROLES.REALTOR, ROLES.STAFF, ROLES.ADMIN].includes(user.role))
      .map((user) =>
        createNotification({
          userId: user.uid,
          title: "New inspection booking",
          message: `${booking.clientName} booked ${booking.propertyTitle}.`,
          type: "booking_created",
          relatedId: booking.id,
          relatedType: "booking",
          deduplicationKey: `booking_created:${booking.id}:${user.uid}`,
        })
      )
  );
  return booking;
}

export async function getBookings(options = {}) {
  const {
    search = "",
    status = "all",
    clientId = null,
    realtorId = null,
  } = options;
  const bookings = await readBookings();

  return bookings
    .filter((booking) => {
      if (clientId && booking.clientId !== clientId) {
        return false;
      }

      if (realtorId && booking.realtorId !== realtorId) {
        return false;
      }

      if (status && status !== "all" && booking.status !== status) {
        return false;
      }

      return matchesSearch(booking, search);
    })
    .sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt));
}

export async function getBookingById(id) {
  if (!id) {
    return null;
  }

  const bookings = await readBookings();
  return bookings.find((booking) => booking.id === id) ?? null;
}

export async function updateBooking(id, updates) {
  const bookings = await readBookings();
  const index = bookings.findIndex((booking) => booking.id === id);

  if (index < 0) {
    throw new Error("Booking not found.");
  }

  const nextBooking = normalizeBooking({
    ...bookings[index],
    ...updates,
    id,
    createdAt: bookings[index].createdAt,
    updatedAt: new Date().toISOString(),
  });

  const nextBookings = [...bookings];
  nextBookings[index] = nextBooking;

  await writeBookings(nextBookings);
  if (nextBooking.status !== bookings[index].status) {
    const users = await getUsers();
    const notificationTypeMap = {
      approved: "booking_approved",
      rejected: "booking_rejected",
      completed: "booking_completed",
      cancelled: "booking_cancelled",
    };
    const type = notificationTypeMap[nextBooking.status];
    if (type) {
      await Promise.all(
        users
          .filter((user) => user.uid === nextBooking.clientId || [ROLES.REALTOR, ROLES.STAFF, ROLES.ADMIN].includes(user.role))
          .map((user) =>
            createNotification({
              userId: user.uid,
              title: "Booking updated",
              message: `${nextBooking.propertyTitle} is now ${nextBooking.status}.`,
              type,
              relatedId: nextBooking.id,
              relatedType: "booking",
              deduplicationKey: `${type}:${nextBooking.id}:${user.uid}`,
            })
          )
      );
    }
  }
  return nextBooking;
}

export async function deleteBooking(id) {
  const bookings = await readBookings();
  const nextBookings = bookings.filter((booking) => booking.id !== id);
  await writeBookings(nextBookings);
  return true;
}
