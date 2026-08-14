import { z } from "zod";
const phone = z.string().trim().regex(/^\+?[0-9 ()-]{7,24}$/, "Enter a valid phone number.").transform((value) => value.replace(/[ ()-]/g, ""));
const empty = z.object({ body: z.object({}).strict(), params: z.object({}).passthrough(), query: z.object({}).passthrough() });
export const registerClientProfileSchema = z.object({
  body: z.object({ fullName: z.string().trim().min(2).max(100), phone: phone.optional().default("") }).strict(),
  params: z.object({}).passthrough(), query: z.object({}).passthrough()
});
export const updateOwnProfileSchema = z.object({
  body: z.object({ fullName: z.string().trim().min(2).max(100).optional(), phone: phone.optional() }).strict().refine((body) => Object.keys(body).length > 0, "Provide at least one field."),
  params: z.object({}).passthrough(), query: z.object({}).passthrough()
});
export const emptyBodySchema = empty;
