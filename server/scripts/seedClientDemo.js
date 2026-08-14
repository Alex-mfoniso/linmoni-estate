import "dotenv/config";
import mongoose from "mongoose";
import { Property } from "../src/models/Property.js";
import { User } from "../src/models/User.js";
import { Booking } from "../src/models/Booking.js";
import { Conversation } from "../src/models/Conversation.js";
import { Message } from "../src/models/Message.js";
import { Notification } from "../src/models/Notification.js";
import bcrypt from "bcrypt";

if (process.env.NODE_ENV === "production" || process.env.ENABLE_DEMO_SEED !== "true") {
  throw new Error("Demo seed refused. Set ENABLE_DEMO_SEED=true in a non-production environment.");
}
if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.");

const image = (url, altText, isCover = false) => ({ url, altText, isCover, format: "jpg" });
const samples = [
  {
    slug: "phase-c-luxury-waterfront-apartments",
    title: "Luxury Waterfront Apartments",
    description: "Contemporary waterfront homes with generous living spaces, secure parking, and direct access to the Lekki lifestyle corridor.",
    propertyType: "apartment", listingType: "sale", price: 185000000, city: "Lekki", state: "Lagos",
    location: "Admiralty Way, Lekki Phase 1", bedrooms: 3, bathrooms: 4, toilets: 4, parkingSpaces: 2,
    amenities: ["Swimming pool", "24-hour security", "Gym", "Backup power"], featured: true,
    images: [image("https://images.unsplash.com/photo-1600607687939-ce8a6c25118c", "Waterfront apartment living room", true)],
  },
  {
    slug: "phase-c-contemporary-ikoyi-duplex",
    title: "Contemporary Ikoyi Duplex",
    description: "A quiet, light-filled duplex designed for modern family life, with landscaped outdoor space and premium finishes.",
    propertyType: "duplex", listingType: "rent", price: 24000000, city: "Ikoyi", state: "Lagos",
    location: "Banana Island Road, Ikoyi", bedrooms: 4, bathrooms: 5, toilets: 6, parkingSpaces: 3,
    amenities: ["Private garden", "Smart home", "Concierge", "Backup power"], featured: true,
    images: [image("https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3", "Contemporary duplex exterior", true)],
  },
  {
    slug: "phase-c-abuja-family-terrace",
    title: "Abuja Family Terrace",
    description: "An elegant terrace in a secure community close to schools, retail, and the central business district.",
    propertyType: "terrace", listingType: "sale", price: 125000000, city: "Abuja", state: "FCT",
    location: "Jabi, Abuja", bedrooms: 4, bathrooms: 4, toilets: 5, parkingSpaces: 2,
    amenities: ["Gated estate", "Play area", "Water treatment"], featured: false,
    images: [image("https://images.unsplash.com/photo-1600585154340-be6161a56a0c", "Family terrace exterior", true)],
  },
];

await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
try {
  // 1. Seed core user profiles in Mongoose if they don't exist
  const passwordHash = bcrypt.hashSync("password123", 12);
  const demoUsers = [
    { firebaseUid: "demo-realtor-uid", passwordHash, fullName: "Ifeanyi Okeke", email: "realtor1@linpal.demo", role: "realtor", status: "active", emailVerified: true },
    { firebaseUid: "demo-client-uid", passwordHash, fullName: "Jide Akinyemi", email: "client1@linpal.demo", role: "client", status: "active", emailVerified: true },
    { firebaseUid: "demo-admin-uid", passwordHash, fullName: "Amina Okafor", email: "admin@linpal.demo", role: "admin", status: "active", emailVerified: true },
    { firebaseUid: "demo-staff-uid", passwordHash, fullName: "Tunde Adebayo", email: "staff1@linpal.demo", role: "staff", status: "active", emailVerified: true },
    { firebaseUid: "demo-stakeholder-uid", passwordHash, fullName: "Chinwe Nwosu", email: "stakeholder@linpal.demo", role: "stakeholder", status: "active", emailVerified: true }
  ];

  const userDocuments = {};
  for (const user of demoUsers) {
    const doc = await User.findOneAndUpdate(
      { email: user.email },
      { $set: user },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    userDocuments[user.role] = doc;
  }

  const realtor = userDocuments.realtor;
  const client = userDocuments.client;

  // 2. Seed property samples
  for (const sample of samples) {
    const coverImage = sample.images[0];
    await Property.findOneAndUpdate(
      { slug: sample.slug },
      { $set: { ...sample, coverImage, status: "active", realtorId: realtor._id, createdBy: realtor._id, publishedAt: new Date() } },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
  }

  // 3. Seed client interactions
  if (client) {
    const property = await Property.findOne({ slug: samples[0].slug });
    const scheduledAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await Booking.findOneAndUpdate(
      { userId: client._id, propertyId: property._id, message: "[Phase C demo inspection]" },
      { $setOnInsert: { userId: client._id, propertyId: property._id, realtorId: realtor._id, scheduledAt, timezone: "Africa/Lagos", message: "[Phase C demo inspection]", status: "confirmed", confirmedAt: new Date() } },
      { upsert: true, setDefaultsOnInsert: true },
    );
    const conversation = await Conversation.findOneAndUpdate(
      { propertyId: property._id, clientId: client._id, realtorId: realtor._id },
      { $setOnInsert: { propertyId: property._id, clientId: client._id, realtorId: realtor._id }, $set: { lastMessageText: "Your demo inspection is confirmed.", lastMessageAt: new Date() } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    await Message.findOneAndUpdate(
      { conversationId: conversation._id, senderId: realtor._id, text: "Your demo inspection is confirmed." },
      { $setOnInsert: { conversationId: conversation._id, senderId: realtor._id, type: "text", text: "Your demo inspection is confirmed.", readBy: [{ userId: realtor._id, readAt: new Date() }] } },
      { upsert: true, setDefaultsOnInsert: true },
    );
    await Notification.findOneAndUpdate(
      { userId: client._id, relatedType: "property", relatedId: property._id, type: "general" },
      { $setOnInsert: { userId: client._id, type: "general", title: "Welcome to the Client demo", message: "Your seeded property journey is ready to explore.", relatedType: "property", relatedId: property._id } },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  console.log(`Seeded ${samples.length} idempotent properties, ${demoUsers.length} active user roles, a booking, conversation, message, and notification for the LINPAL demo.`);
} finally {
  await mongoose.disconnect();
}
