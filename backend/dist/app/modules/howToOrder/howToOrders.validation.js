"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateHowToOrderSchema = exports.howToOrderSchema = void 0;
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
// updates: either language can be sent alone
const partialLocalized = (label) => localized(label).partial().optional();
const stepSchema = zod_1.z.object({
    icon: zod_1.z.string().trim().min(1, "Step icon is required"),
    title: localized("Step title"),
    desc: localized("Step description"),
});
exports.howToOrderSchema = zod_1.z.object({
    title: localized("Title"),
    subTitle: localized("Subtitle"),
    shortDesc: localized("Short description"),
    steps: zod_1.z.array(stepSchema).min(1, "At least one step is required"),
    isDeleted: zod_1.z.boolean().optional(),
});
exports.updateHowToOrderSchema = zod_1.z.object({
    title: partialLocalized("Title"),
    subTitle: partialLocalized("Subtitle"),
    shortDesc: partialLocalized("Short description"),
    // if sent, the whole steps array is replaced (each step must be complete)
    steps: zod_1.z.array(stepSchema).min(1).optional(),
    isDeleted: zod_1.z.boolean().optional(),
});
