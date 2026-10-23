import { z } from "zod";

// either language can be sent alone; "" clears it
const localized = z
  .object({
    en: z.string().trim().max(2000).optional(),
    ar: z.string().trim().max(2000).optional(),
  })
  .optional();

const optionalUrl = z
  .union([z.literal(""), z.string().trim().url("Enter a valid URL")])
  .optional();

const optionalEmail = z
  .union([z.literal(""), z.string().trim().email("Enter a valid email")])
  .optional();

const optionalPhone = z
  .union([
    z.literal(""),
    z
      .string()
      .trim()
      .regex(/^[+()\d\s-]{6,25}$/, "Enter a valid phone number"),
  ])
  .optional();

// accepts a pasted <iframe ...> or just the URL, and stores only the src
const mapEmbed = z.string().trim().optional();

export const updateGeneralSettingsSchema = z.object({
  logo: z.string().optional(),
  favicon: z.string().optional(),

  mobileNo: optionalPhone,
  alternateMobileNo: optionalPhone,

  mail: optionalEmail,
  alternateEmail: optionalEmail,

  address: localized,
  addressIframe: mapEmbed,
  workingHrs: localized,

  facebook: optionalUrl,
  instagram: optionalUrl,
  linkedin: optionalUrl,
  twitter: optionalUrl,
  youtube: optionalUrl,
  whatsApp: z.string().trim().max(100).optional(),

  footerDesc: localized,
  footerCopyrights: localized,
});
