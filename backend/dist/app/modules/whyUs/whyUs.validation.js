"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWhyChooseUsSchema = exports.whyChooseUsSchema = void 0;
const zod_1 = require("zod");
const localized = (label) => zod_1.z.object({
    en: zod_1.z
        .string()
        .trim()
        .min(2, `${label} (English) must be at least 2 characters`),
    ar: zod_1.z
        .string()
        .trim()
        .min(2, `${label} (Arabic) must be at least 2 characters`),
});
const partialLocalized = (label) => localized(label).partial().optional();
const featureSchema = zod_1.z.object({
    icon: zod_1.z.string().trim().min(1, "Feature icon is required"),
    title: localized("Feature title"),
    desc: localized("Feature description"),
});
exports.whyChooseUsSchema = zod_1.z.object({
    title: localized("Title"),
    subTitle: localized("Subtitle"),
    desc: localized("Description"),
    image: zod_1.z.string().min(1, "Image is required"),
    features: zod_1.z.array(featureSchema).min(1, "At least one feature is required"),
    isDeleted: zod_1.z.boolean().optional(),
});
exports.updateWhyChooseUsSchema = zod_1.z.object({
    title: partialLocalized("Title"),
    subTitle: partialLocalized("Subtitle"),
    desc: partialLocalized("Description"),
    image: zod_1.z.string().optional(),
    // if sent, the whole features array is replaced (each item must be complete)
    features: zod_1.z.array(featureSchema).min(1).optional(),
    isDeleted: zod_1.z.boolean().optional(),
});
