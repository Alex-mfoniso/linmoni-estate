export const ACCOUNT_STATUSES = Object.freeze(["active", "disabled", "suspended", "invited", "pending"]);
export const ACCOUNT_STATUS = Object.freeze(Object.fromEntries(ACCOUNT_STATUSES.map((status) => [status.toUpperCase(), status])));
export const EMAIL_VERIFICATION_REQUIRED = true;
