import ApiError from "../utils/ApiError.js";
import { ROLES } from "../constants/roles.js";
import { ERROR_CODES } from "../constants/errorCodes.js";
export const authorizeRoles = (...allowed) => (req, _res, next) => { if (!ROLES.includes(req.user?.role)) return next(new ApiError(403, ERROR_CODES.ROLE_UNKNOWN, "This account has no recognized role.")); if (!allowed.includes(req.user.role)) return next(new ApiError(403, ERROR_CODES.ROLE_FORBIDDEN, "You do not have access to this resource.")); next(); };
