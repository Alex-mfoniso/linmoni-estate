const fs = require("fs");
const path = require("path");

const outputDir = path.join(__dirname, "..", "demo");
const outputFile = path.join(outputDir, "generated-demo-data.json");

function id(prefix, index) {
  return `${prefix}-${String(index).padStart(3, "0")}`;
}

function nowMinus(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function nowPlus(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

function buildUsers() {
  return [
    { uid: "admin-001", fullName: "Amina Okafor", email: "admin@linpal.demo", role: "admin", status: "active" },
    { uid: "staff-001", fullName: "Tunde Adebayo", email: "staff1@linpal.demo", role: "staff", status: "active" },
    { uid: "staff-002", fullName: "Chinwe Nwosu", email: "staff2@linpal.demo", role: "staff", status: "active" },
    { uid: "realtor-001", fullName: "Ifeanyi Okeke", email: "realtor1@linpal.demo", role: "realtor", status: "active" },
    { uid: "realtor-002", fullName: "Bola Hassan", email: "realtor2@linpal.demo", role: "realtor", status: "active" },
    { uid: "realtor-003", fullName: "Seyi Martins", email: "realtor3@linpal.demo", role: "realtor", status: "active" },
    { uid: "realtor-004", fullName: "Adaeze Umeh", email: "realtor4@linpal.demo", role: "realtor", status: "active" },
    { uid: "client-001", fullName: "Jide Akinyemi", email: "client1@linpal.demo", role: "client", status: "active" },
    { uid: "client-002", fullName: "Maryam Bello", email: "client2@linpal.demo", role: "client", status: "active" },
    { uid: "client-003", fullName: "Emeka Chukwu", email: "client3@linpal.demo", role: "client", status: "active" },
    { uid: "client-004", fullName: "Ngozi Eze", email: "client4@linpal.demo", role: "client", status: "active" },
    { uid: "client-005", fullName: "David Ojo", email: "client5@linpal.demo", role: "client", status: "active" },
    { uid: "client-006", fullName: "Halima Sani", email: "client6@linpal.demo", role: "client", status: "active" },
    { uid: "client-007", fullName: "Kenechi Obi", email: "client7@linpal.demo", role: "client", status: "active" },
    { uid: "client-008", fullName: "Fatima Yusuf", email: "client8@linpal.demo", role: "client", status: "active" },
  ];
}

function buildProperties() {
  const titles = [
    "Ikoyi Modern Duplex",
    "Lekki Luxury Terrace",
    "Abuja Executive Apartment",
    "Victoria Island Penthouse",
    "Yaba Studio Apartment",
    "Port Harcourt Family Home",
    "Maitama Premium Villa",
    "Ajah Waterfront Flat",
    "Surulere 3-Bedroom Flat",
    "Gwarinpa Estate Duplex",
    "Magodo Smart Home",
    "Oniru Garden Apartment",
    "Asokoro Mansion",
    "Gbagada Rental Unit",
    "Ibeju Lekki Land Plot",
  ];

  return titles.map((title, index) => ({
    id: id("prop", index + 1),
    title,
    description: `${title} prepared for demo walkthroughs and role-based review.`,
    price: 45000000 + index * 2500000,
    address: `${index + 12} Example Street, Lagos, Nigeria`,
    propertyType: index % 2 === 0 ? "house" : "apartment",
    bedrooms: 2 + (index % 4),
    bathrooms: 2 + (index % 3),
    status: index % 3 === 0 ? "available" : index % 3 === 1 ? "reserved" : "sold",
    imageUrl: `https://res.cloudinary.com/demo/image/upload/sample.jpg`,
    createdBy: "realtor-001",
    createdAt: nowMinus(30 - index),
    updatedAt: nowMinus(10 - index),
  }));
}

function buildBookings(properties, clients, realtors) {
  return properties.slice(0, 8).map((property, index) => ({
    id: id("book", index + 1),
    propertyId: property.id,
    propertyTitle: property.title,
    clientId: clients[index % clients.length].uid,
    clientName: clients[index % clients.length].fullName,
    clientEmail: clients[index % clients.length].email,
    realtorId: realtors[index % realtors.length].uid,
    preferredDate: nowPlus(index + 2).slice(0, 10),
    preferredTime: `${9 + (index % 5)}:00`,
    message: "Please confirm the inspection time.",
    status: index % 4 === 0 ? "pending" : index % 4 === 1 ? "approved" : index % 4 === 2 ? "completed" : "rejected",
    createdAt: nowMinus(index + 1),
    updatedAt: nowMinus(index),
  }));
}

function buildInvitations() {
  return [
    {
      id: "invite-001",
      email: "staff.invite@linpal.demo",
      fullName: "New Staff Demo",
      phone: "+234 801 111 1111",
      role: "staff",
      status: "pending",
      accountStatus: "active",
      createdBy: "admin-001",
      createdAt: nowMinus(2),
      expiresAt: nowPlus(5),
      acceptedAt: null,
      acceptedByUid: null,
      revokedAt: null,
      resendCount: 0,
      updatedAt: nowMinus(2),
    },
  ];
}

function buildFavorites(properties, clients) {
  return properties.slice(0, 4).map((property, index) => ({
    id: id("fav", index + 1),
    userId: clients[index].uid,
    propertyId: property.id,
    propertyTitle: property.title,
    propertyImage: property.imageUrl,
    propertyPrice: property.price,
    propertyAddress: property.address,
    createdAt: nowMinus(index + 1),
  }));
}

function buildNotifications(users) {
  return users.slice(0, 6).map((user, index) => ({
    id: id("note", index + 1),
    userId: user.uid,
    title: "Demo notification",
    message: `${user.fullName} has a sample platform update for the demo.`,
    type: "general",
    createdAt: nowMinus(index),
    readAt: index % 2 === 0 ? null : nowMinus(index - 1),
  }));
}

function buildAuditLogs() {
  return [
    { id: "audit-001", action: "direct_account_created", actorUid: "admin-001", createdAt: nowMinus(12) },
    { id: "audit-002", action: "invitation_created", actorUid: "admin-001", createdAt: nowMinus(11) },
    { id: "audit-003", action: "property_created", actorUid: "realtor-001", createdAt: nowMinus(9) },
  ];
}

function buildMessages() {
  return [
    {
      id: "msg-001",
      conversationId: "conv-001",
      senderId: "client-001",
      body: "Hello, I would like to book a viewing.",
      createdAt: nowMinus(1),
    },
  ];
}

function buildConversations() {
  return [
    {
      id: "conv-001",
      participantIds: ["client-001", "realtor-001"],
      propertyId: "prop-001",
      updatedAt: nowMinus(1),
    },
  ];
}

function main() {
  const users = buildUsers();
  const clients = users.filter((user) => user.role === "client");
  const realtors = users.filter((user) => user.role === "realtor");
  const properties = buildProperties();
  const demoData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      environment: "demo",
      demo: true,
    },
    users,
    properties,
    bookings: buildBookings(properties, clients, realtors),
    invitations: buildInvitations(),
    favorites: buildFavorites(properties, clients),
    notifications: buildNotifications(users),
    conversations: buildConversations(),
    messages: buildMessages(),
    auditLogs: buildAuditLogs(),
  };

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(demoData, null, 2));
  console.log(`Demo data written to ${outputFile}`);
}

main();
