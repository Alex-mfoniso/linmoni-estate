export const ROLES = Object.freeze(["client", "realtor", "staff", "stakeholder", "admin"]);
export const ROLE = Object.freeze(Object.fromEntries(ROLES.map((role) => [role.toUpperCase(), role])));
