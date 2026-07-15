import AsyncStorage from "@react-native-async-storage/async-storage";
import { normalizeCloudinaryImage } from "../utils/propertyMedia";
import { createNotification } from "./notificationService";
import { getUsers } from "./userService";
import { ROLES } from "../constants/roles";
import { getPropertyFavorites } from "./favoriteService";

const STORAGE_KEY = "linpal.properties.v2";

const DEFAULT_PROPERTIES = [
  {
    id: "prop-spring-meadows",
    title: "Spring Meadows Residence",
    description:
      "A bright family home with a generous living area, private parking, and a calm community setting.",
    price: 85000000,
    address: "Lekki Phase 1, Lagos",
    propertyType: "Duplex",
    bedrooms: 4,
    bathrooms: 5,
    status: "available",
    coverImage: {
      publicId: "",
      secureUrl: "",
    },
    images: [],
    createdBy: "demo-realtor",
    createdAt: "2026-06-10T09:30:00.000Z",
    updatedAt: "2026-06-20T12:45:00.000Z",
  },
  {
    id: "prop-azure-court",
    title: "Azure Court Apartments",
    description:
      "Modern serviced apartments with easy access to transport, retail, and neighborhood amenities.",
    price: 42000000,
    address: "Victoria Island, Lagos",
    propertyType: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    status: "rented",
    coverImage: {
      publicId: "",
      secureUrl: "",
    },
    images: [],
    createdBy: "demo-realtor",
    createdAt: "2026-05-05T11:00:00.000Z",
    updatedAt: "2026-06-15T08:10:00.000Z",
  },
  {
    id: "prop-harbor-view",
    title: "Harbor View Homes",
    description:
      "A premium coastal home with wide balconies, elegant finishes, and an open-plan layout.",
    price: 125000000,
    address: "Ikoyi, Lagos",
    propertyType: "Terrace",
    bedrooms: 5,
    bathrooms: 6,
    status: "available",
    coverImage: {
      publicId: "",
      secureUrl: "",
    },
    images: [],
    createdBy: "demo-admin",
    createdAt: "2026-06-01T15:20:00.000Z",
    updatedAt: "2026-06-18T10:05:00.000Z",
  },
  {
    id: "prop-olive-hills",
    title: "Olive Hills Estate Plot",
    description:
      "A spacious land parcel ready for a custom build in a fast-growing residential corridor.",
    price: 28000000,
    address: "Ajah, Lagos",
    propertyType: "Land",
    bedrooms: 0,
    bathrooms: 0,
    status: "draft",
    coverImage: {
      publicId: "",
      secureUrl: "",
    },
    images: [],
    createdBy: "demo-admin",
    createdAt: "2026-04-22T07:40:00.000Z",
    updatedAt: "2026-06-02T09:25:00.000Z",
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
  return `prop-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeImageEntry(image) {
  const normalized = normalizeCloudinaryImage(image);

  if (!normalized) {
    return {
      publicId: "",
      secureUrl: "",
      width: null,
      height: null,
      format: "",
      bytes: 0,
    };
  }

  return normalized;
}

function normalizeProperty(property) {
  const coverImage = normalizeImageEntry(
    property.coverImage || property.imageUrl || property.propertyImage
  );
  const images = Array.isArray(property.images)
    ? property.images.map(normalizeImageEntry).filter(Boolean)
    : [];
  const hasCover = images.some(
    (image) => image.publicId === coverImage.publicId && image.secureUrl === coverImage.secureUrl
  );

  return {
    id: property.id || buildId(),
    title: String(property.title || "").trim(),
    description: String(property.description || "").trim(),
    price: Number(property.price || 0),
    address: String(property.address || "").trim(),
    propertyType: String(property.propertyType || "").trim(),
    bedrooms: Number(property.bedrooms || 0),
    bathrooms: Number(property.bathrooms || 0),
    status: String(property.status || "available").trim(),
    coverImage:
      coverImage.publicId || coverImage.secureUrl
        ? coverImage
        : {
            publicId: "",
            secureUrl: "",
            width: null,
            height: null,
            format: "",
            bytes: 0,
          },
    images: hasCover || !coverImage.secureUrl ? images : [coverImage, ...images],
    createdBy: String(property.createdBy || "").trim(),
    createdAt: property.createdAt || new Date().toISOString(),
    updatedAt: property.updatedAt || new Date().toISOString(),
  };
}

async function ensureSeeded() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);

  if (!raw) {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(DEFAULT_PROPERTIES.map(normalizeProperty))
    );
  }
}

async function readProperties() {
  await ensureSeeded();
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const parsed = raw ? safeParse(raw) : [];

  if (!Array.isArray(parsed)) {
    return DEFAULT_PROPERTIES.map(normalizeProperty);
  }

  return parsed.map(normalizeProperty);
}

async function writeProperties(properties) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
}

function matchesSearch(property, searchText) {
  if (!searchText) {
    return true;
  }

  const haystack = [
    property.title,
    property.address,
    property.propertyType,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(searchText.toLowerCase());
}

function matchesRange(value, min, max) {
  const numericValue = Number(value || 0);
  if (Number.isFinite(min) && numericValue < min) {
    return false;
  }

  if (Number.isFinite(max) && numericValue > max) {
    return false;
  }

  return true;
}

function matchesCount(value, expected) {
  if (!Number.isFinite(expected) || expected <= 0) {
    return true;
  }

  return Number(value || 0) === expected;
}

function compareProperties(left, right, sortBy) {
  switch (sortBy) {
    case "oldest":
      return new Date(left.createdAt) - new Date(right.createdAt);
    case "price-asc":
      return Number(left.price || 0) - Number(right.price || 0);
    case "price-desc":
      return Number(right.price || 0) - Number(left.price || 0);
    case "title-asc":
      return String(left.title || "").localeCompare(String(right.title || ""));
    case "title-desc":
      return String(right.title || "").localeCompare(String(left.title || ""));
    case "newest":
    default:
      return new Date(right.updatedAt) - new Date(left.updatedAt);
  }
}

export async function createProperty(propertyData) {
  const now = new Date().toISOString();
  const property = normalizeProperty({
    ...propertyData,
    id: buildId(),
    createdAt: now,
    updatedAt: now,
  });

  const properties = await readProperties();
  const nextProperties = [property, ...properties];

  await writeProperties(nextProperties);
  const users = await getUsers();
  await Promise.all(
    users
      .filter((user) => [ROLES.ADMIN, ROLES.STAKEHOLDER].includes(user.role))
      .map((user) =>
        createNotification({
          userId: user.uid,
          title: "Property created",
          message: `${property.title} has been added to the catalog.`,
          type: "property_created",
          relatedId: property.id,
          relatedType: "property",
          deduplicationKey: `property_created:${property.id}:${user.uid}`,
        })
      )
  );
  return property;
}

export async function getProperties(options = {}) {
  const {
    search = "",
    status = "all",
    createdBy = null,
    minPrice = null,
    maxPrice = null,
    bedrooms = null,
    bathrooms = null,
    propertyType = "all",
    sortBy = "newest",
  } = options;

  const filters = {
    minPrice:
      minPrice === "" || minPrice === null || typeof minPrice === "undefined"
        ? null
        : Number(minPrice),
    maxPrice:
      maxPrice === "" || maxPrice === null || typeof maxPrice === "undefined"
        ? null
        : Number(maxPrice),
    bedrooms:
      bedrooms === "" || bedrooms === null || typeof bedrooms === "undefined"
        ? null
        : Number(bedrooms),
    bathrooms:
      bathrooms === "" || bathrooms === null || typeof bathrooms === "undefined"
        ? null
        : Number(bathrooms),
  };

  const properties = await readProperties();

  return properties
    .filter((property) => {
      if (createdBy && property.createdBy !== createdBy) {
        return false;
      }

      if (status && status !== "all" && property.status !== status) {
        return false;
      }

      if (propertyType && propertyType !== "all" && property.propertyType !== propertyType) {
        return false;
      }

      if (!matchesRange(property.price, filters.minPrice, filters.maxPrice)) {
        return false;
      }

      if (!matchesCount(property.bedrooms, filters.bedrooms)) {
        return false;
      }

      if (!matchesCount(property.bathrooms, filters.bathrooms)) {
        return false;
      }

      return matchesSearch(property, search);
    })
    .sort((left, right) => compareProperties(left, right, sortBy));
}

export async function getPropertyById(id) {
  if (!id) {
    return null;
  }

  const properties = await readProperties();
  return properties.find((property) => property.id === id) ?? null;
}

export async function updateProperty(id, updates) {
  const properties = await readProperties();
  const index = properties.findIndex((property) => property.id === id);

  if (index < 0) {
    throw new Error("Property not found.");
  }

  const nextProperty = normalizeProperty({
    ...properties[index],
    ...updates,
    id,
    createdAt: properties[index].createdAt,
    updatedAt: new Date().toISOString(),
  });

  const nextProperties = [...properties];
  nextProperties[index] = nextProperty;

  await writeProperties(nextProperties);
  const statusChanged =
    String(nextProperty.status || "").toLowerCase() !== String(properties[index].status || "").toLowerCase();
  const savedFavorites = statusChanged ? await getPropertyFavorites(nextProperty.id) : [];
  const users = await getUsers();
  const notificationType = statusChanged ? "property_status_changed" : "property_updated";
  const notificationTitle = statusChanged ? "Property status changed" : "Property updated";
  const notificationMessage = statusChanged
    ? `${nextProperty.title} is now ${nextProperty.status}.`
    : `${nextProperty.title} has been updated.`;
  await Promise.all(
    users
      .filter((user) => [ROLES.ADMIN, ROLES.STAKEHOLDER].includes(user.role))
      .map((user) =>
        createNotification({
          userId: user.uid,
          title: notificationTitle,
          message: notificationMessage,
          type: notificationType,
          relatedId: nextProperty.id,
          relatedType: "property",
          deduplicationKey: `${notificationType}:${nextProperty.id}:${user.uid}`,
        })
      )
  );
  if (statusChanged && savedFavorites.length > 0) {
    await Promise.all(
      savedFavorites.map((favorite) =>
        createNotification({
          userId: favorite.userId,
          title: "Saved property updated",
          message: `${nextProperty.title} is now ${nextProperty.status}.`,
          type: "property_status_changed",
          relatedId: nextProperty.id,
          relatedType: "property",
          deduplicationKey: `saved_property_status:${nextProperty.id}:${favorite.userId}:${nextProperty.status}`,
        })
      )
    );
  }
  return nextProperty;
}

export async function deleteProperty(id) {
  const properties = await readProperties();
  const deletedProperty = properties.find((property) => property.id === id);
  const nextProperties = properties.filter((property) => property.id !== id);

  await writeProperties(nextProperties);
  if (deletedProperty) {
    const users = await getUsers();
    await Promise.all(
      users
        .filter((user) => [ROLES.ADMIN, ROLES.STAKEHOLDER].includes(user.role))
        .map((user) =>
          createNotification({
            userId: user.uid,
            title: "Property removed",
            message: `${deletedProperty.title} was removed from the catalogue.`,
            type: "property_updated",
            relatedId: deletedProperty.id,
            relatedType: "property",
            deduplicationKey: `property_deleted:${deletedProperty.id}:${user.uid}`,
          })
        )
    );
  }
  return true;
}
