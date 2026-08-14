import { z } from "zod";
import { mongoId, pagination } from "./propertyValidators.js";
export const favouriteListSchema = z.object({ body: z.object({}).strict(), params: z.object({}).passthrough(), query: z.object(pagination).strict() });
export const favouritePropertySchema = z.object({ body: z.object({}).strict(), params: z.object({ propertyId: mongoId }).strict(), query: z.object({}).passthrough() });
