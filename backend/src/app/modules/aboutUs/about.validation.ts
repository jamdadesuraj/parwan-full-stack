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

// optional, but if sent both languages are required
const optionalLocalized = (label: string) => localized(label).optional();

// updates: either language can be sent alone
const partialLocalized = (label: string) =>
  localized(label).partial().optional();

const highlightSchema = z.object({
  icon: z.string().trim().min(1, "Highlight icon is required"),
  title: localized("Highlight title"),
  desc: localized("Highlight description"),
});

export const aboutUsSchema = z.object({
  title: localized("Title"),
  subTitle: localized("Subtitle"),
  highlightsTitle: localized("Highlights title"),
  shortDesc: localized("Short description"),
  img1: z.string().min(1, "Image 1 is required"),
  highlights: z.array(highlightSchema).optional(),
  missionTitle: localized("Mission title"),
  missionSubTitle: localized("Mission subtitle"),
  mission: localized("Mission"),
  vision: localized("Vision"),
  values: z.array(localized("Value", 1)).optional(),
  whoWeAreTitle: optionalLocalized("Who we are title"),
  whoWeAresubTitle: optionalLocalized("Who we are subtitle"),
  whoWeAreHightlightTitle: optionalLocalized("Who we are highlight title"),
  whoWeAreDesc: optionalLocalized("Who we are description"),
  img2: z.string().min(1, "Image 2 is required"),
  isDeleted: z.boolean().optional(),
});

export const aboutUsUpdateSchema = z.object({
  title: partialLocalized("Title"),
  subTitle: partialLocalized("Subtitle"),
  highlightsTitle: partialLocalized("Highlights title"),
  shortDesc: partialLocalized("Short description"),
  img1: z.string().optional(),
  // arrays are replaced as a whole, so every item must be complete
  highlights: z.array(highlightSchema).optional(),
  missionTitle: partialLocalized("Mission title"),
  missionSubTitle: partialLocalized("Mission subtitle"),
  mission: partialLocalized("Mission"),
  vision: partialLocalized("Vision"),
  values: z.array(localized("Value", 1)).optional(),
  whoWeAreTitle: partialLocalized("Who we are title"),
  whoWeAresubTitle: partialLocalized("Who we are subtitle"),
  whoWeAreHightlightTitle: partialLocalized("Who we are highlight title"),
  whoWeAreDesc: partialLocalized("Who we are description"),
  img2: z.string().optional(),
  isDeleted: z.boolean().optional(),
});
