import { getUsers } from "./userService";
import { getProperties } from "./propertyService";
import { getBookings } from "./bookingService";
import { ROLES } from "../constants/roles";

function inRange(dateString, range) {
  if (!range || range === "all") {
    return true;
  }

  const now = new Date();
  const date = new Date(dateString);
  const diffDays = Math.floor((now - date) / 86400000);

  if (range === "7d") {
    return diffDays <= 7;
  }

  if (range === "30d") {
    return diffDays <= 30;
  }

  if (range === "90d") {
    return diffDays <= 90;
  }

  return true;
}

function countBy(items, predicate) {
  return items.reduce((total, item) => total + (predicate(item) ? 1 : 0), 0);
}

function normalizePropertyStatus(status) {
  const value = String(status || "").toLowerCase();
  if (value === "rented") return "reserved";
  return value;
}

function buildRecentActivity(users, properties, bookings) {
  const items = [
    ...users.map((item) => ({
      id: item.uid,
      type: "user",
      title: item.fullName,
      description: `User account created`,
      createdAt: item.createdAt,
    })),
    ...properties.map((item) => ({
      id: item.id,
      type: "property",
      title: item.title,
      description: `Property listing updated`,
      createdAt: item.updatedAt || item.createdAt,
    })),
    ...bookings.map((item) => ({
      id: item.id,
      type: "booking",
      title: item.propertyTitle,
      description: `Booking ${item.status}`,
      createdAt: item.updatedAt || item.createdAt,
    })),
  ];

  return items.sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
}

export async function getAdminAnalytics(range = "30d") {
  const [users, properties, bookings] = await Promise.all([
    getUsers(),
    getProperties(),
    getBookings(),
  ]);

  const filteredUsers = users.filter((item) => inRange(item.createdAt, range));
  const filteredProperties = properties.filter((item) => inRange(item.createdAt, range));
  const filteredBookings = bookings.filter((item) => inRange(item.createdAt, range));

  return {
    stats: [
      { label: "Total users", value: users.length },
      { label: "Clients", value: countBy(users, (item) => item.role === ROLES.CLIENT) },
      { label: "Realtors", value: countBy(users, (item) => item.role === ROLES.REALTOR) },
      { label: "Staff", value: countBy(users, (item) => item.role === ROLES.STAFF) },
      { label: "Stakeholders", value: countBy(users, (item) => item.role === ROLES.STAKEHOLDER) },
      { label: "Active users", value: countBy(users, (item) => item.status === "active") },
      { label: "Inactive users", value: countBy(users, (item) => item.status !== "active") },
      { label: "Total properties", value: properties.length },
      { label: "Available", value: countBy(properties, (item) => normalizePropertyStatus(item.status) === "available") },
      { label: "Reserved", value: countBy(properties, (item) => normalizePropertyStatus(item.status) === "reserved") },
      { label: "Sold", value: countBy(properties, (item) => normalizePropertyStatus(item.status) === "sold") },
      { label: "Total bookings", value: bookings.length },
      { label: "Pending bookings", value: countBy(bookings, (item) => item.status === "pending") },
      { label: "Approved bookings", value: countBy(bookings, (item) => item.status === "approved") },
      { label: "Completed bookings", value: countBy(bookings, (item) => item.status === "completed") },
      { label: "Cancelled/rejected", value: countBy(bookings, (item) => ["cancelled", "rejected"].includes(item.status)) },
      { label: "New users", value: filteredUsers.length },
      { label: "New properties", value: filteredProperties.length },
      { label: "New bookings", value: filteredBookings.length },
    ],
    recentActivity: buildRecentActivity(users, properties, bookings).slice(0, 8),
  };
}

export async function getStakeholderAnalytics(range = "30d") {
  const [properties, bookings] = await Promise.all([
    getProperties(),
    getBookings(),
  ]);

  const filteredProperties = properties.filter((item) => inRange(item.createdAt, range));
  const filteredBookings = bookings.filter((item) => inRange(item.createdAt, range));

  return {
    stats: [
      { label: "Total properties", value: properties.length },
      { label: "Available", value: countBy(properties, (item) => normalizePropertyStatus(item.status) === "available") },
      { label: "Reserved", value: countBy(properties, (item) => normalizePropertyStatus(item.status) === "reserved") },
      { label: "Sold", value: countBy(properties, (item) => normalizePropertyStatus(item.status) === "sold") },
      { label: "Total bookings", value: bookings.length },
      { label: "Completed inspections", value: countBy(bookings, (item) => item.status === "completed") },
      { label: "New properties", value: filteredProperties.length },
      { label: "New bookings", value: filteredBookings.length },
    ],
    propertyStatusDistribution: {
      available: countBy(properties, (item) => normalizePropertyStatus(item.status) === "available"),
      reserved: countBy(properties, (item) => normalizePropertyStatus(item.status) === "reserved"),
      sold: countBy(properties, (item) => normalizePropertyStatus(item.status) === "sold"),
    },
    bookingStatusDistribution: {
      pending: countBy(bookings, (item) => item.status === "pending"),
      approved: countBy(bookings, (item) => item.status === "approved"),
      completed: countBy(bookings, (item) => item.status === "completed"),
      cancelled: countBy(bookings, (item) => item.status === "cancelled"),
      rejected: countBy(bookings, (item) => item.status === "rejected"),
    },
    recentActivity: properties
      .slice()
      .sort((left, right) => new Date(right.updatedAt || right.createdAt) - new Date(left.updatedAt || left.createdAt))
      .slice(0, 8)
      .map((item) => ({
        id: item.id,
        title: item.title,
        description: `Status: ${item.status}`,
        createdAt: item.updatedAt || item.createdAt,
      })),
  };
}
