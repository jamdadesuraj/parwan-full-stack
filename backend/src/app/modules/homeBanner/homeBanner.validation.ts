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

const partialLocalized = (label: string, min = 2) =>
  z
    .object({
      en: z
        .string()
        .trim()
        .min(min, `${label} (English) is too short`)
        .optional(),
      ar: z
        .string()
        .trim()
        .min(min, `${label} (Arabic) is too short`)
        .optional(),
    })
    .optional();

const statusEnum = z.enum(["active", "inactive"]);

export const homeBannerSchema = z.object({
  title: localized("Title"),
  subTitle: localized("Subtitle"),
  shortDesc: localized("Short description"),
  bgVideo: z.string().optional(),
  status: statusEnum.optional(),
});

export const homeBannerUpdateSchema = z.object({
  title: partialLocalized("Title"),
  subTitle: partialLocalized("Subtitle"),
  shortDesc: partialLocalized("Short description"),
  bgVideo: z.string().optional(),
  status: statusEnum.optional(),
});