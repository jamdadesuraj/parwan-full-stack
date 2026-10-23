"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.homeBannerUpdateSchema = exports.homeBannerSchema = void 0;
const zod_1 = require("zod");
const localized = (label, min = 2) => zod_1.z.object({
    en: zod_1.z
        .string()
        .trim()
        .min(min, `${label} (English) must be at least ${min} characters`),
    ar: zod_1.z
        .string()
        .trim()
        .min(min, `${label} (Arabic) must be at least ${min} characters`),
});
const partialLocalized = (label, min = 2) => zod_1.z
    .object({
    en: zod_1.z
        .string()
        .trim()
        .min(min, `${label} (English) is too short`)
        .optional(),
    ar: zod_1.z
        .string()
        .trim()
        .min(min, `${label} (Arabic) is too short`)
        .optional(),
})
    .optional();
const statusEnum = zod_1.z.enum(["active", "inactive"]);
exports.homeBannerSchema = zod_1.z.object({
    title: localized("Title"),
    subTitle: localized("Subtitle"),
    shortDesc: localized("Short description"),
    bgVideo: zod_1.z.string().optional(),
    status: statusEnum.optional(),
});
exports.homeBannerUpdateSchema = zod_1.z.object({
    title: partialLocalized("Title"),
    subTitle: partialLocalized("Subtitle"),
    shortDesc: partialLocalized("Short description"),
    bgVideo: zod_1.z.string().optional(),
    status: statusEnum.optional(),
});
