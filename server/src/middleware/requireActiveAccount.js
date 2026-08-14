import ApiError from "../utils/ApiError.js";
import { ERROR_CODES } from "../constants/errorCodes.js";
const blocked = {
  disabled: [403, ERROR_CODES.ACCOUNT_DISABLED, "This account is currently unavailable."],
  suspended: [403, ERROR_CODES.ACCOUNT_SUSPENDED, "This account is currently unavailable."],
  pending: [403, ERROR_CODES.ACCOUNT_PENDING, "Please verify your email before continuing."],
  invited: [403, ERROR_CODES.ACCOUNT_INVITED, "This invitation has not been completed."]
};
export function requireActiveAccount(req, _res, next) {
  const rule = blocked[req.user?.status];
  if (rule) return next(new ApiError(...rule));
  if (req.user?.status !== "active") return next(new ApiError(403, ERROR_CODES.ACCOUNT_PENDING, "This account is not ready for access."));
  next();
}
