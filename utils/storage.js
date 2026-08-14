import AsyncStorage from "@react-native-async-storage/async-storage";

const MEMORY_STORAGE = new Map();
let primaryStorage = AsyncStorage;
let useMemoryOnly = false;

function getMemoryItem(key) {
  return MEMORY_STORAGE.has(key) ? MEMORY_STORAGE.get(key) : null;
}

function setMemoryItem(key, value) {
  MEMORY_STORAGE.set(key, String(value));
}

function removeMemoryItem(key) {
  MEMORY_STORAGE.delete(key);
}

function clearMemory() {
  MEMORY_STORAGE.clear();
}

async function readThroughStorage(readFn, fallbackFn) {
  if (!primaryStorage || useMemoryOnly) {
    return fallbackFn();
  }

  try {
    return await readFn();
  } catch {
    useMemoryOnly = true;
    return fallbackFn();
  }
}

async function writeThroughStorage(writeFn, fallbackFn) {
  if (!primaryStorage || useMemoryOnly) {
    return fallbackFn();
  }

  try {
    return await writeFn();
  } catch {
    useMemoryOnly = true;
    return fallbackFn();
  }
}

const storage = {
  getItem(key) {
    return readThroughStorage(
      () => primaryStorage.getItem(key),
      () => Promise.resolve(getMemoryItem(key))
    );
  },
  setItem(key, value) {
    return writeThroughStorage(
      () => primaryStorage.setItem(key, value),
      () => {
        setMemoryItem(key, value);
        return Promise.resolve();
      }
    );
  },
  removeItem(key) {
    return writeThroughStorage(
      () => primaryStorage.removeItem(key),
      () => {
        removeMemoryItem(key);
        return Promise.resolve();
      }
    );
  },
  clear() {
    return writeThroughStorage(
      () => primaryStorage.clear(),
      () => {
        clearMemory();
        return Promise.resolve();
      }
    );
  },
};

export default storage;
