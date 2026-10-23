import { z } from "zod";

const localizedText = z.object({
  en: z.string().trim().min(1, "English text is required"),
  ar: z.string().trim().min(1, "Arabic text is required"),
});

// partial: lets you update only one language without wiping the other
const partialLocalizedText = localizedText.partial();

export const faqSchema = z.object({
  question: localizedText,
  answer: localizedText,
  status: z.enum(["active", "inactive"]).optional(),
});

export const updateFaqSchema = z.object({
  question: partialLocalizedText.optional(),
  answer: partialLocalizedText.optional(),
  status: z.enum(["active", "inactive"]).optional(),
  isDeleted: z.boolean().optional(),
});