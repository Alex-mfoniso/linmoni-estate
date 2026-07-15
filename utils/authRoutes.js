import { ROLES } from "../constants/roles";

const DASHBOARD_ROUTES = {
  [ROLES.CLIENT]: "/(client)/dashboard",
  [ROLES.STAFF]: "/(staff)/dashboard",
  [ROLES.REALTOR]: "/(realtor)/dashboard",
  [ROLES.STAKEHOLDER]: "/(stakeholder)/dashboard",
  [ROLES.ADMIN]: "/(admin)/dashboard",
};

export const AUTH_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  ACCEPT_INVITATION: "/accept-invitation",
  CHANGE_TEMPORARY_PASSWORD: "/change-temporary-password",
};

export function getDashboardRouteForRole(role) {
  return DASHBOARD_ROUTES[role] ?? null;
}

export function getRoleRoute(role) {
  return getDashboardRouteForRole(role);
}

export function isValidRole(role) {
  return Boolean(DASHBOARD_ROUTES[role]);
}

export function getPostLoginRoute(profile) {
  if (!profile) {
    return AUTH_ROUTES.LOGIN;
  }

  if (profile.mustChangePassword) {
    return AUTH_ROUTES.CHANGE_TEMPORARY_PASSWORD;
  }

  return getDashboardRouteForRole(profile.role) ?? AUTH_ROUTES.LOGIN;
}
