
import { z } from "zod";

export const loginValidation = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .transform((email) => email.toLowerCase()),

  password: z.string().min(1, "Password is required"),
});
