import { z } from "zod";
import { PROPERTY_TYPES, LISTING_TYPES } from "../constants/propertyStatuses.js";
import { mongoId, pagination } from "./propertyValidators.js";

const phoneSchema = z.string().trim().regex(/^\+?[0-9 ()-]{7,24}$/, "Enter a valid phone number.").transform((value) => value.replace(/[ ()-]/g, ""));

export const realtorPropertyListSchema = z.object({
  body: z.object({}).strict(),
  params: z.object({}).passthrough(),
  query: z.object({
    ...pagination,
    search: z.string().trim().max(100).optional(),
    status: z.string().trim().optional()
  }).strict()
});

export const createRealtorPropertySchema = z.object({
  body: z.object({
    title: z.string().trim().min(3, "Title must be at least 3 characters.").max(150),
    description: z.string().trim().min(10, "Description must be at least 10 characters.").max(5000),
    propertyType: z.enum(PROPERTY_TYPES, { message: "Invalid property type." }),
    listingType: z.enum(LISTING_TYPES, { message: "Invalid listing type." }),
    price: z.coerce.number().min(0, "Price must be a positive number."),
    address: z.object({
      street: z.string().trim().min(1, "Street is required."),
      city: z.string().trim().min(1, "City is required."),
      state: z.string().trim().min(1, "State is required."),
      country: z.string().trim().min(1, "Country is required."),
      postalCode: z.string().trim().optional().default("")
    }),
    details: z.object({
      bedrooms: z.coerce.number().int().min(0, "Bedrooms must be at least 0."),
      bathrooms: z.coerce.number().min(0, "Bathrooms must be at least 0."),
      areaSqFt: z.coerce.number().min(0, "Area must be at least 0."),
      yearBuilt: z.coerce.number().int().min(1800).max(new Date().getFullYear() + 5).optional()
    }),
    coverImage: z.object({
      url: z.string().url("Cover image must be a valid URL."),
      publicId: z.string().min(1, "Cover image public ID is required.")
    }).optional().nullable(),
    images: z.array(z.object({
      url: z.string().url("Image must be a valid URL."),
      publicId: z.string().min(1, "Image public ID is required.")
    })).optional().default([]),
    features: z.array(z.string().trim()).optional().default([]),
    submit: z.boolean().optional().default(false)
  }).strict(),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough()
});

export const updateRealtorPropertySchema = z.object({
  body: z.object({
    title: z.string().trim().min(3).max(150).optional(),
    description: z.string().trim().min(10).max(5000).optional(),
    propertyType: z.enum(PROPERTY_TYPES).optional(),
    listingType: z.enum(LISTING_TYPES).optional(),
    price: z.coerce.number().min(0).optional(),
    address: z.object({
      street: z.string().trim().min(1).optional(),
      city: z.string().trim().min(1).optional(),
      state: z.string().trim().min(1).optional(),
      country: z.string().trim().min(1).optional(),
      postalCode: z.string().trim().optional()
    }).optional(),
    details: z.object({
      bedrooms: z.coerce.number().int().min(0).optional(),
      bathrooms: z.coerce.number().min(0).optional(),
      areaSqFt: z.coerce.number().min(0).optional(),
      yearBuilt: z.coerce.number().int().min(1800).optional()
    }).optional(),
    coverImage: z.object({
      url: z.string().url(),
      publicId: z.string()
    }).optional().nullable(),
    images: z.array(z.object({
      url: z.string().url(),
      publicId: z.string()
    })).optional(),
    features: z.array(z.string().trim()).optional(),
    status: z.enum(["draft", "pending", "archived"]).optional(),
    submit: z.boolean().optional()
  }).strict(),
  params: z.object({ propertyId: mongoId }).strict(),
  query: z.object({}).passthrough()
});

export const updateRealtorLeadSchema = z.object({
  body: z.object({
    status: z.enum(["new", "contacted", "qualified", "inspection_scheduled", "negotiating", "converted", "lost"], { message: "Invalid lead status." }),
    notes: z.string().trim().max(2000).optional().default("")
  }).strict(),
  params: z.object({ leadId: mongoId }).strict(),
  query: z.object({}).passthrough()
});

export const rescheduleRealtorBookingSchema = z.object({
  body: z.object({
    scheduledAt: z.string().datetime({ message: "Invalid ISO date string." }),
    timezone: z.string().trim().min(3).max(64).default("Africa/Lagos")
  }).strict(),
  params: z.object({ bookingId: mongoId }).strict(),
  query: z.object({}).passthrough()
});

export const updateRealtorProfileSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2).max(100).optional(),
    phone: phoneSchema.optional(),
    bio: z.string().trim().max(2000).optional(),
    agency: z.string().trim().max(150).optional(),
    specialties: z.array(z.string().trim()).optional(),
    serviceAreas: z.array(z.string().trim()).optional()
  }).strict().refine((body) => Object.keys(body).length > 0, "Provide at least one field to update."),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough()
});
