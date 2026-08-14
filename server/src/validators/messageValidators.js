import { z } from "zod";
import { mongoId, pagination } from "./propertyValidators.js";
export const conversationListSchema = z.object({ body: z.object({}).strict(), params: z.object({}).passthrough(), query: z.object(pagination).strict() });
export const createConversationSchema = z.object({ body: z.object({ propertyId: mongoId }).strict(), params: z.object({}).passthrough(), query: z.object({}).passthrough() });
export const conversationMessagesSchema = z.object({ body: z.object({}).strict(), params: z.object({ conversationId: mongoId }).strict(), query: z.object(pagination).strict() });
export const sendMessageSchema = z.object({ body: z.object({ text: z.string().trim().min(1).max(2000) }).strict(), params: z.object({ conversationId: mongoId }).strict(), query: z.object({}).passthrough() });
export const conversationActionSchema = z.object({ body: z.object({}).strict(), params: z.object({ conversationId: mongoId }).strict(), query: z.object({}).passthrough() });
