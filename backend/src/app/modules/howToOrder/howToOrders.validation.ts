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
const partialLocalized = (label: string) =>
  localized(label).partial().optional();

const stepSchema = z.object({
  icon: z.string().trim().min(1, "Step icon is required"),
  title: localized("Step title"),
  desc: localized("Step description"),
});

export const howToOrderSchema = z.object({
  title: localized("Title"),
  subTitle: localized("Subtitle"),
  shortDesc: localized("Short description"),
  steps: z.array(stepSchema).min(1, "At least one step is required"),
  isDeleted: z.boolean().optional(),
});

export const updateHowToOrderSchema = z.object({
  title: partialLocalized("Title"),
  subTitle: partialLocalized("Subtitle"),
  shortDesc: partialLocalized("Short description"),
  // if sent, the whole steps array is replaced (each step must be complete)
  steps: z.array(stepSchema).min(1).optional(),
  isDeleted: z.boolean().optional(),
});
