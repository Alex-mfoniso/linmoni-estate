import { successResponse } from "../utils/sanitizeResponse.js";
export const createClientHomeController = (service) => ({ get: async (req, res) => successResponse(res, "Client home loaded successfully.", await service.get(req.userDocument)) });
