import { z } from "zod";

export const contactSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100),
  emailAddress: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address")
    .max(150),
  // digits, spaces, +, -, parentheses (works for UAE numbers like +971 50 123 4567)
  phone: z
    .string()
    .trim()
    .regex(/^[+()\d\s-]{6,25}$/, "Enter a valid phone number"),
  companyName: z
    .string()
    .trim()
    .max(150)
    .optional()
    .transform((v) => (v ? v : undefined)), // "" -> not stored
  productOfInterest: z
    .string()
    .trim()
    .min(2, "Product name is required")
    .max(150),
  requiredQty: z.string().trim().min(1, "Quantity is required").max(50),
  message: z
    .string()
    .trim()
    .min(5, "Message must be at least 5 characters")
    .max(2000),
});
