import AsyncStorage from "@react-native-async-storage/async-storage";
import { ROLES } from "../constants/roles";

const STORAGE_KEY = "linpal.favorites.v1";

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function buildId() {
  return `fav-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeFavorite(favorite) {
  return {
    id: favorite.id || buildId(),
    userId: String(favorite.userId || "").trim(),
    propertyId: String(favorite.propertyId || "").trim(),
    propertyTitle: String(favorite.propertyTitle || "").trim(),
    propertyImage: String(favorite.propertyImage || "").trim(),
    propertyPrice: Number(favorite.propertyPrice || 0),
    propertyAddress: String(favorite.propertyAddress || "").trim(),
    createdAt: favorite.createdAt || new Date().toISOString(),
  };
}

async function readFavorites() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const parsed = raw ? safeParse(raw) : [];

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.map(normalizeFavorite);
}

async function writeFavorites(favorites) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

function assertClientRole(userRole) {
  if (userRole && userRole !== ROLES.CLIENT) {
    throw new Error("Only clients can save properties.");
  }
}

export async function isPropertyFavorited(userId, propertyId) {
  if (!userId || !propertyId) {
    return false;
  }

  const favorites = await readFavorites();
  return favorites.some(
    (favorite) => favorite.userId === userId && favorite.propertyId === propertyId
  );
}

export async function getUserFavorites(userId) {
  if (!userId) {
    return [];
  }

  const favorites = await readFavorites();
  return favorites
    .filter((favorite) => favorite.userId === userId)
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
}

export async function getPropertyFavorites(propertyId) {
  if (!propertyId) {
    return [];
  }

  const favorites = await readFavorites();
  return favorites.filter((favorite) => favorite.propertyId === propertyId);
}

export async function addFavorite(favoriteData) {
  const { userId, userRole } = favoriteData || {};
  assertClientRole(userRole);

  if (!userId || !favoriteData?.propertyId) {
    throw new Error("Missing favorite details.");
  }

  const favorites = await readFavorites();
  const existing = favorites.find(
    (favorite) =>
      favorite.userId === userId && favorite.propertyId === favoriteData.propertyId
  );

  if (existing) {
    return existing;
  }

  const favorite = normalizeFavorite({
    ...favoriteData,
    createdAt: new Date().toISOString(),
  });

  const nextFavorites = [favorite, ...favorites];
  await writeFavorites(nextFavorites);
  return favorite;
}

export async function removeFavorite(userId, propertyId) {
  if (!userId || !propertyId) {
    throw new Error("Missing favorite details.");
  }

  const favorites = await readFavorites();
  const nextFavorites = favorites.filter(
    (favorite) =>
      !(favorite.userId === userId && favorite.propertyId === propertyId)
  );

  await writeFavorites(nextFavorites);
  return true;
}
