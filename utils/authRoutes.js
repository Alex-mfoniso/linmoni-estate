import { ROLES } from "../constants/roles";
import { getTrustedRoleRoute, resolveAuthDestination } from "./authPolicy.mjs";
const DASHBOARD_ROUTES = { [ROLES.CLIENT]: getTrustedRoleRoute("client"), [ROLES.STAFF]: getTrustedRoleRoute("staff"), [ROLES.REALTOR]: getTrustedRoleRoute("realtor"), [ROLES.STAKEHOLDER]: getTrustedRoleRoute("stakeholder"), [ROLES.ADMIN]: getTrustedRoleRoute("admin") };
export const AUTH_ROUTES = { LOGIN: "/login", REGISTER: "/register", FORGOT_PASSWORD: "/forgot-password", ACCEPT_INVITATION: "/accept-invitation", CHANGE_TEMPORARY_PASSWORD: "/change-temporary-password", VERIFY_EMAIL: "/verify-email", ACCOUNT_STATUS: "/account-status", PROFILE_RECOVERY: "/profile-recovery", SERVICE_UNAVAILABLE: "/service-unavailable" };
export const getDashboardRouteForRole = (role) => DASHBOARD_ROUTES[role] ?? null;
export const getRoleRoute = getDashboardRouteForRole;
export const isValidRole = (role) => Boolean(DASHBOARD_ROUTES[role]);
export function getPostLoginRoute(profile) { if (!profile) return AUTH_ROUTES.PROFILE_RECOVERY; if (["disabled", "suspended", "invited"].includes(profile.status)) return AUTH_ROUTES.ACCOUNT_STATUS; if (profile.status === "pending" || !profile.emailVerified) return AUTH_ROUTES.VERIFY_EMAIL; if (profile.mustChangePassword) return AUTH_ROUTES.CHANGE_TEMPORARY_PASSWORD; return getDashboardRouteForRole(profile.role) ?? AUTH_ROUTES.ACCOUNT_STATUS; }
export const getAuthDestination = resolveAuthDestination;
