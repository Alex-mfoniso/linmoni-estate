import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getDashboardRouteForRole } from "../utils/authRoutes";
import {
  authenticateUser,
  forgotPassword as forgotPasswordRequest,
  getCurrentUserProfile,
  registerClient,
  updateOwnProfile,
  logout as logoutRequest,
} from "../services/authService";

const AuthContext = createContext(null);

const MOCK_SESSION_KEY = "linpal.mockAuthSession";

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function readStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(MOCK_SESSION_KEY);
  return raw ? safeParse(raw) : null;
}

function writeStoredSession(session) {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(MOCK_SESSION_KEY);
    return;
  }

  window.localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = readStoredSession();

    if (session) {
      setCurrentUser(session.currentUser ?? null);
      setUserProfile(session.userProfile ?? null);
    }

    setLoading(false);
  }, []);

  function persistSession(nextCurrentUser, nextUserProfile) {
    setCurrentUser(nextCurrentUser);
    setUserProfile(nextUserProfile);
    writeStoredSession({
      currentUser: nextCurrentUser,
      userProfile: nextUserProfile,
    });
  }

  async function login(credentials) {
    const result = await authenticateUser(credentials);
    persistSession(result.user, result.profile);
    return result;
  }

  async function register(credentials) {
    const result = await registerClient(credentials);
    persistSession(result.user, result.profile);
    return result;
  }

  async function logout() {
    await logoutRequest();
    persistSession(null, null);
  }

  async function forgotPassword(email) {
    return forgotPasswordRequest(email);
  }

  async function refreshUser() {
    return refreshUserFromStore();
  }

  async function updateProfile(updates) {
    if (!currentUser?.uid) {
      throw new Error("No authenticated user.");
    }

    const profile = await updateOwnProfile(currentUser.uid, updates);
    const nextUser = {
      uid: currentUser.uid,
      email: profile.email,
      displayName: profile.fullName,
    };

    persistSession(nextUser, profile);
    return { user: nextUser, profile };
  }

  async function refreshUserFromStore() {
    if (!currentUser?.uid) {
      return null;
    }

    const profile = await getCurrentUserProfile(currentUser.uid);

    if (!profile) {
      persistSession(null, null);
      return null;
    }

    const nextUser = {
      uid: profile.uid,
      email: profile.email,
      displayName: profile.fullName,
    };

    persistSession(nextUser, profile);
    return { user: nextUser, profile };
  }

  const dashboardRoute = useMemo(
    () => getDashboardRouteForRole(userProfile?.role),
    [userProfile]
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        login,
        register,
        logout,
        forgotPassword,
        refreshUser,
        refreshUserFromStore,
        updateProfile,
        dashboardRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
