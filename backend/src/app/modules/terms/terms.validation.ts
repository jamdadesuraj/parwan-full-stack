import { z } from "zod";

const localized = (label: string, min = 2) =>
  z.object({
    en: z
      .string()
      .trim()
      .min(min, `${label} (English) must be at least ${min} characters`),
    ar: z
      .string()
      .trim()
      .min(min, `${label} (Arabic) must be at least ${min} characters`),
  });

// updates: either language can be sent alone
const partialLocalized = (label: string, min = 2) =>
  localized(label, min).partial().optional();

export const termsSchema = z.object({
  title: localized("Title"),
  subTitle: localized("Subtitle"),
  shortDesc: localized("Short description"),
  content: localized("Content", 1),
  isDeleted: z.boolean().optional(),
});

export const updateTermsSchema = z.object({
  title: partialLocalized("Title"),
  subTitle: partialLocalized("Subtitle"),
  shortDesc: partialLocalized("Short description"),
  content: partialLocalized("Content", 1),
  isDeleted: z.boolean().optional(),
});
