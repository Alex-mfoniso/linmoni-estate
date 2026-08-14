import ApiError from "../utils/ApiError.js";
import { ERROR_CODES } from "../constants/errorCodes.js";
export const validateRequest = (schema) => (req, _res, next) => { const result = schema.safeParse({ body: req.body ?? {}, params: req.params ?? {}, query: req.query ?? {} }); if (!result.success) { const errors = result.error.issues.map((issue) => ({ field: issue.path.slice(1).join("."), message: issue.message })); return next(new ApiError(400, ERROR_CODES.VALIDATION_FAILED, "Please check the submitted information.", errors)); } req.validated = result.data; next(); };
