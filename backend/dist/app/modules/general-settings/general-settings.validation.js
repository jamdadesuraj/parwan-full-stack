"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateGeneralSettingsSchema = void 0;
const zod_1 = require("zod");
// either language can be sent alone; "" clears it
const localized = zod_1.z
    .object({
    en: zod_1.z.string().trim().max(2000).optional(),
    ar: zod_1.z.string().trim().max(2000).optional(),
})
    .optional();
const optionalUrl = zod_1.z
    .union([zod_1.z.literal(""), zod_1.z.string().trim().url("Enter a valid URL")])
    .optional();
const optionalEmail = zod_1.z
    .union([zod_1.z.literal(""), zod_1.z.string().trim().email("Enter a valid email")])
    .optional();
const optionalPhone = zod_1.z
    .union([
    zod_1.z.literal(""),
    zod_1.z
        .string()
        .trim()
        .regex(/^[+()\d\s-]{6,25}$/, "Enter a valid phone number"),
])
    .optional();
// accepts a pasted <iframe ...> or just the URL, and stores only the src
const mapEmbed = zod_1.z.string().trim().optional();
exports.updateGeneralSettingsSchema = zod_1.z.object({
    logo: zod_1.z.string().optional(),
    favicon: zod_1.z.string().optional(),
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
    whatsApp: zod_1.z.string().trim().max(100).optional(),
    footerDesc: localized,
    footerCopyrights: localized,
});
