import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
export function createClientHomeRouter({ guards, controller }) { const router = Router(); router.use(...guards); router.get("/", asyncHandler(controller.get)); return router; }
