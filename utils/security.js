function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function generateRandomToken(length = 32) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(length);

  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

async function sha256WithSubtle(value) {
  const encoder = new TextEncoder();
  const data = encoder.encode(String(value));

  if (globalThis.crypto?.subtle?.digest) {
    const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
    return toHex(digest);
  }

  return null;
}

function fallbackHash(value) {
  const input = String(value);
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `fallback-${(hash >>> 0).toString(16)}`;
}

export async function hashToken(token) {
  const hashed = await sha256WithSubtle(token);
  return hashed || fallbackHash(token);
}

export async function matchesToken(token, tokenHash) {
  return (await hashToken(token)) === tokenHash;
}

export function isStrongPassword(password) {
  const value = String(password || "");
  return (
    value.length >= 8 &&
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /\d/.test(value)
  );
}

