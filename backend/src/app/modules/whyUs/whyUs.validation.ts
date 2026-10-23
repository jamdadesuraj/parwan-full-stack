import { z } from "zod";

const localized = (label: string) =>
  z.object({
    en: z
      .string()
      .trim()
      .min(2, `${label} (English) must be at least 2 characters`),
    ar: z
      .string()
      .trim()
      .min(2, `${label} (Arabic) must be at least 2 characters`),
  });

const partialLocalized = (label: string) =>
  localized(label).partial().optional();

const featureSchema = z.object({
  icon: z.string().trim().min(1, "Feature icon is required"),
  title: localized("Feature title"),
  desc: localized("Feature description"),
});

export const whyChooseUsSchema = z.object({
  title: localized("Title"),
  subTitle: localized("Subtitle"),
  desc: localized("Description"),
  image: z.string().min(1, "Image is required"),
  features: z.array(featureSchema).min(1, "At least one feature is required"),
  isDeleted: z.boolean().optional(),
});

export const updateWhyChooseUsSchema = z.object({
  title: partialLocalized("Title"),
  subTitle: partialLocalized("Subtitle"),
  desc: partialLocalized("Description"),
  image: z.string().optional(),
  // if sent, the whole features array is replaced (each item must be complete)
  features: z.array(featureSchema).min(1).optional(),
  isDeleted: z.boolean().optional(),
});
