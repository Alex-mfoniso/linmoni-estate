import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

/**
 * Hashes a plaintext password securely using bcrypt.
 * @param {string} password - The plaintext password to hash.
 * @returns {Promise<string>} The resulting secure hash.
 */
export async function hashPassword(password) {
  if (!password) {
    throw new Error("Password is required for hashing.");
  }
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Safely compares a plaintext candidate password against a secure hash.
 * @param {string} password - The candidate plaintext password.
 * @param {string} hash - The stored secure hash.
 * @returns {Promise<boolean>} True if the password matches, false otherwise.
 */
export async function verifyPassword(password, hash) {
  if (!password || !hash) {
    return false;
  }
  return bcrypt.compare(password, hash);
}
