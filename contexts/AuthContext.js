import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getDashboardRouteForRole } from "../utils/authRoutes";
import { cancelAuthenticatedRequests } from "../services/apiClient";
import {
  login as nativeLogin,
  registerClient as nativeRegisterClient,
  getCurrentUserProfile,
  updateOwnProfile,
  forgotPassword,
  resendVerification,
  changePassword,
  logout as nativeLogout,
} from "../services/authService";
import { getAccessToken } from "../services/authStorage";

const AuthContext = createContext(null);

const RESOLUTION_BY_CODE = {
  PROFILE_MISSING: "missing_profile",
  ACCOUNT_DISABLED: "disabled",
  ACCOUNT_SUSPENDED: "suspended",
  ACCOUNT_PENDING: "pending",
  ACCOUNT_INVITED: "invited",
  AUTH_EXPIRED_TOKEN: "session_expired",
  SESSION_EXPIRED: "session_expired",
  NETWORK_UNAVAILABLE: "offline",
  REQUEST_TIMEOUT: "service_unavailable",
  SERVICE_UNAVAILABLE: "service_unavailable",
  INTERNAL_ERROR: "service_unavailable",
};

/**
 * Fallback profile structure for recovering pending registration state.
 */
function syntheticProfile(user, resolution) {
  const status = { disabled: "disabled", suspended: "suspended", pending: "pending", invited: "invited" }[resolution];
  return status
    ? {
        id: user.uid,
        email: user.email,
        fullName: user.displayName || "",
        status,
        role: null,
        emailVerified: user.emailVerified
      }
    : null;
}

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null); // Backwards-compatible alias for the active session
  const [profile, setProfile] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authResolution, setAuthResolution] = useState("initializing");
  const recoveryValues = useRef(null);
  const requestVersion = useRef(0);

  /**
   * Applies the user profile and updates navigation resolution states.
   */
  const applyProfile = useCallback((nextProfile) => {
    setProfile(nextProfile);
    if (!nextProfile) return setAuthResolution("missing_profile");
    if (["disabled", "suspended", "pending", "invited"].includes(nextProfile.status)) return setAuthResolution(nextProfile.status);
    if (nextProfile.mustChangePassword) return setAuthResolution("must_change_password");
    if (!nextProfile.emailVerified) return setAuthResolution("pending");
    if (!getDashboardRouteForRole(nextProfile.role)) return setAuthResolution("unknown_role");
    setAuthResolution("ready");
  }, []);

  /**
   * Fetches the current user profile from Express.
   */
  const loadProfile = useCallback(async (user) => {
    if (!user) {
      setProfile(null);
      setAuthResolution("signed_out");
      return null;
    }
    const version = ++requestVersion.current;
    setIsLoadingProfile(true);
    setAuthError(null);
    try {
      const data = await getCurrentUserProfile();
      if (version !== requestVersion.current) return null;
      applyProfile(data.profile);
      return data.profile;
    } catch (error) {
      if (version !== requestVersion.current) return null;
      const resolution = RESOLUTION_BY_CODE[error.code] || "service_unavailable";
      setProfile(syntheticProfile(user, resolution));
      setAuthResolution(resolution);
      setAuthError(error);
      throw error;
    } finally {
      if (version === requestVersion.current) {
        setIsLoadingProfile(false);
      }
    }
  }, [applyProfile]);

  /**
   * Safe Session Startup and Token validation.
   */
  useEffect(() => {
    let mounted = true;
    async function bootSession() {
      try {
        const accessToken = await getAccessToken();
        if (accessToken && mounted) {
          const data = await getCurrentUserProfile();
          if (mounted && data?.profile) {
            const u = {
              uid: data.profile.id || data.profile._id,
              email: data.profile.email,
              displayName: data.profile.fullName,
              emailVerified: data.profile.emailVerified === true
            };
            setFirebaseUser(u);
            applyProfile(data.profile);
          }
        } else if (mounted) {
          setFirebaseUser(null);
          setProfile(null);
          setAuthResolution("signed_out");
        }
      } catch (error) {
        console.warn("Failed loading active credentials on boot:", error);
        if (mounted) {
          setFirebaseUser(null);
          setProfile(null);
          setAuthResolution("signed_out");
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    }
    bootSession();
    return () => {
      mounted = false;
    };
  }, [applyProfile]);

  /**
   * User login.
   */
  async function login(credentials) {
    setAuthError(null);
    const profileData = await nativeLogin(credentials);
    const user = {
      uid: profileData.id || profileData._id,
      email: profileData.email,
      displayName: profileData.fullName,
      emailVerified: profileData.emailVerified === true
    };
    setFirebaseUser(user);
    applyProfile(profileData);
    return { user, profile: profileData };
  }

  /**
   * Public registration.
   */
  async function registerClient(credentials) {
    recoveryValues.current = { fullName: credentials.fullName.trim(), phone: credentials.phone.trim() };
    setAuthError(null);
    const profileData = await nativeRegisterClient(credentials);
    const user = {
      uid: profileData.id || profileData._id,
      email: profileData.email,
      displayName: profileData.fullName,
      emailVerified: profileData.emailVerified === true
    };
    setFirebaseUser(user);
    applyProfile(profileData);
    recoveryValues.current = null;
    return { user, profile: profileData };
  }

  async function retryProfileCreation() {
    throw new Error("Registration details are no longer available. Please contact support or sign out.");
  }

  /**
   * Safe logout clearing all SecureStore sessions.
   */
  async function logout() {
    cancelAuthenticatedRequests();
    requestVersion.current += 1;
    recoveryValues.current = null;
    try {
      await nativeLogout();
    } finally {
      setFirebaseUser(null);
      setProfile(null);
      setAuthError(null);
      setAuthResolution("signed_out");
    }
  }

  async function sendPasswordReset(email) {
    return forgotPassword(email);
  }

  async function resendVerificationEmail() {
    return resendVerification();
  }

  async function refreshVerificationStatus() {
    const data = await getCurrentUserProfile();
    applyProfile(data.profile);
    return data.profile;
  }

  async function refreshProfile() {
    return loadProfile(firebaseUser);
  }

  async function updatePassword(newPassword) {
    const data = await changePassword(newPassword);
    applyProfile(data.profile);
    return data.profile;
  }

  async function updateProfile(updates) {
    const data = await updateOwnProfile(updates);
    applyProfile(data.profile);
    return { user: firebaseUser, profile: data.profile };
  }

  function clearAuthError() {
    setAuthError(null);
  }

  const dashboardRoute = useMemo(() => getDashboardRouteForRole(profile?.role), [profile]);

  const value = {
    firebaseUser,
    profile,
    role: profile?.role || null,
    status: profile?.status || null,
    isAuthenticated: Boolean(firebaseUser),
    isInitializing,
    isLoadingProfile,
    authError,
    authResolution,
    login,
    registerClient,
    logout,
    sendPasswordReset,
    resendVerificationEmail,
    refreshVerificationStatus,
    refreshProfile,
    retryProfileCreation,
    updatePassword,
    clearAuthError,
    updateProfile,
    dashboardRoute,
    currentUser: firebaseUser,
    userProfile: profile,
    loading: isInitializing || isLoadingProfile,
    register: registerClient,
    forgotPassword: sendPasswordReset,
    refreshUser: refreshProfile,
    refreshUserFromStore: refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
