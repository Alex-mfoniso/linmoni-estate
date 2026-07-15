import AsyncStorage from "@react-native-async-storage/async-storage";
import { ROLES } from "../constants/roles";
import { createNotification } from "./notificationService";

const STORAGE_KEY = "linpal.users.v1";

const DEMO_USERS = [
  {
    uid: "demo-client",
    fullName: "Demo Client",
    email: "client@linpal.com",
    phone: "+2348000000001",
    role: ROLES.CLIENT,
    status: "active",
    profilePhoto: "",
    password: "password123",
    createdAt: "2026-05-01T08:00:00.000Z",
    updatedAt: "2026-05-01T08:00:00.000Z",
  },
  {
    uid: "demo-staff",
    fullName: "Demo Staff",
    email: "staff@linpal.com",
    phone: "+2348000000002",
    role: ROLES.STAFF,
    status: "active",
    profilePhoto: "",
    password: "password123",
    createdAt: "2026-05-02T08:00:00.000Z",
    updatedAt: "2026-05-02T08:00:00.000Z",
  },
  {
    uid: "demo-realtor",
    fullName: "Demo Realtor",
    email: "realtor@linpal.com",
    phone: "+2348000000003",
    role: ROLES.REALTOR,
    status: "active",
    profilePhoto: "",
    password: "password123",
    createdAt: "2026-05-03T08:00:00.000Z",
    updatedAt: "2026-05-03T08:00:00.000Z",
  },
  {
    uid: "demo-stakeholder",
    fullName: "Demo Stakeholder",
    email: "stakeholder@linpal.com",
    phone: "+2348000000004",
    role: ROLES.STAKEHOLDER,
    status: "active",
    profilePhoto: "",
    password: "password123",
    createdAt: "2026-05-04T08:00:00.000Z",
    updatedAt: "2026-05-04T08:00:00.000Z",
  },
  {
    uid: "demo-admin",
    fullName: "Demo Admin",
    email: "admin@linpal.com",
    phone: "+2348000000005",
    role: ROLES.ADMIN,
    status: "active",
    profilePhoto: "",
    password: "password123",
    createdAt: "2026-05-05T08:00:00.000Z",
    updatedAt: "2026-05-05T08:00:00.000Z",
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
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeUser(user) {
  return {
    uid: String(user.uid || buildId()),
    fullName: String(user.fullName || "").trim(),
    email: String(user.email || "").trim().toLowerCase(),
    phone: String(user.phone || "").trim(),
    role: String(user.role || ROLES.CLIENT).trim(),
    status: String(user.status || "active").trim(),
    profilePhoto: String(user.profilePhoto || "").trim(),
    password: String(user.password || ""),
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: user.updatedAt || new Date().toISOString(),
  };
}

function stripSecret(user) {
  if (!user) {
    return null;
  }

  const { password, ...profile } = normalizeUser(user);
  return profile;
}

async function ensureSeeded() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);

  if (!raw) {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(DEMO_USERS.map(normalizeUser))
    );
  }
}

async function readUsers() {
  await ensureSeeded();
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const parsed = raw ? safeParse(raw) : [];

  if (!Array.isArray(parsed)) {
    return DEMO_USERS.map(normalizeUser);
  }

  return parsed.map(normalizeUser);
}

async function writeUsers(users) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

async function getUsers() {
  const users = await readUsers();
  return users.map(stripSecret);
}

async function getUserById(uid) {
  if (!uid) {
    return null;
  }

  const users = await readUsers();
  return stripSecret(users.find((user) => user.uid === uid) ?? null);
}

async function getUserByEmail(email) {
  if (!email) {
    return null;
  }

  const users = await readUsers();
  return users.find((user) => user.email === email.trim().toLowerCase()) ?? null;
}

async function authenticateUser(emailOrCredentials, passwordMaybe) {
  const email =
    typeof emailOrCredentials === "object" && emailOrCredentials !== null
      ? emailOrCredentials.email
      : emailOrCredentials;
  const password =
    typeof emailOrCredentials === "object" && emailOrCredentials !== null
      ? emailOrCredentials.password
      : passwordMaybe;

  const user = await getUserByEmail(email);

  if (!user || user.password !== password) {
    throw new Error("Invalid email or password.");
  }

  if (user.status !== "active") {
    throw new Error("Your account is inactive. Please contact support.");
  }

  return {
    user: {
      uid: user.uid,
      email: user.email,
      displayName: user.fullName,
    },
    profile: stripSecret(user),
  };
}

async function registerClient(fullNameOrPayload, emailMaybe, phoneMaybe, passwordMaybe) {
  const payload =
    typeof fullNameOrPayload === "object" && fullNameOrPayload !== null
      ? fullNameOrPayload
      : {
          fullName: fullNameOrPayload,
          email: emailMaybe,
          phone: phoneMaybe,
          password: passwordMaybe,
        };

  const users = await readUsers();
  const normalizedEmail = String(payload.email || "").trim().toLowerCase();

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error("An account with this email already exists.");
  }

  const now = new Date().toISOString();
  const user = normalizeUser({
    uid: buildId(),
    fullName: payload.fullName,
    email: normalizedEmail,
    phone: payload.phone,
    role: ROLES.CLIENT,
    status: "active",
    profilePhoto: "",
    password: payload.password,
    createdAt: now,
    updatedAt: now,
  });

  await writeUsers([user, ...users]);
  await Promise.all(
    users
      .filter((existingUser) => existingUser.role === ROLES.ADMIN)
      .map((existingUser) =>
        createNotification({
          userId: existingUser.uid,
          title: "New client registration",
          message: `${user.fullName} created a client account.`,
          type: "general",
          relatedId: user.uid,
          relatedType: "user",
          deduplicationKey: `new_client:${user.uid}:${existingUser.uid}`,
        })
      )
  );

  return {
    user: {
      uid: user.uid,
      email: user.email,
      displayName: user.fullName,
    },
    profile: stripSecret(user),
  };
}

async function updateOwnProfile(uid, updates = {}) {
  const users = await readUsers();
  const index = users.findIndex((user) => user.uid === uid);

  if (index < 0) {
    throw new Error("User not found.");
  }

  const nextUser = normalizeUser({
    ...users[index],
    fullName: updates.fullName ?? users[index].fullName,
    phone: updates.phone ?? users[index].phone,
    updatedAt: new Date().toISOString(),
  });

  const nextUsers = [...users];
  nextUsers[index] = nextUser;
  await writeUsers(nextUsers);

  return stripSecret(nextUser);
}

async function updateUser(uid, updates = {}, options = {}) {
  const users = await readUsers();
  const index = users.findIndex((user) => user.uid === uid);

  if (index < 0) {
    throw new Error("User not found.");
  }

  const { allowRoleStatus = true, actorUid = null } = options;
  const canChangeRoleStatus = allowRoleStatus && actorUid !== uid;

  const nextUser = normalizeUser({
    ...users[index],
    fullName: updates.fullName ?? users[index].fullName,
    phone: updates.phone ?? users[index].phone,
    role: canChangeRoleStatus ? updates.role ?? users[index].role : users[index].role,
    status: canChangeRoleStatus
      ? updates.status ?? users[index].status
      : users[index].status,
    updatedAt: new Date().toISOString(),
  });

  const nextUsers = [...users];
  nextUsers[index] = nextUser;
  await writeUsers(nextUsers);

  if (nextUser.status !== users[index].status) {
    await createNotification({
      userId: nextUser.uid,
      title: "Account status changed",
      message: `Your account is now ${nextUser.status}.`,
      type: "account_status_changed",
      relatedId: nextUser.uid,
      relatedType: "user",
      deduplicationKey: `account_status:${nextUser.uid}:${nextUser.status}`,
    });
  }

  return stripSecret(nextUser);
}

async function deleteUser(uid) {
  const users = await readUsers();
  await writeUsers(users.filter((user) => user.uid !== uid));
  return true;
}

async function getCurrentUserProfile(uid) {
  return getUserById(uid);
}

async function logout() {
  return true;
}

async function forgotPassword() {
  return true;
}

export {
  getUsers,
  getUserById,
  getUserByEmail,
  authenticateUser,
  registerClient,
  updateOwnProfile,
  updateUser,
  deleteUser,
  getCurrentUserProfile,
  logout,
  forgotPassword,
};
