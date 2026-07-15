import { ROLES } from "../constants/roles";

const DASHBOARD_ROUTES = {
  [ROLES.CLIENT]: "/(client)/dashboard",
  [ROLES.STAFF]: "/(staff)/dashboard",
  [ROLES.REALTOR]: "/(realtor)/dashboard",
  [ROLES.STAKEHOLDER]: "/(stakeholder)/dashboard",
  [ROLES.ADMIN]: "/(admin)/dashboard",
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
