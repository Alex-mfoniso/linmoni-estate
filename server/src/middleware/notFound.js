import ApiError from "../utils/ApiError.js";
import { ERROR_CODES } from "../constants/errorCodes.js";
export const notFound = (_req, _res, next) => next(new ApiError(404, ERROR_CODES.NOT_FOUND, "The requested resource was not found."));
