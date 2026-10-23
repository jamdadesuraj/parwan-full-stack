"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePrivacySchema = exports.privacySchema = void 0;
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
const partialLocalized = (label, min = 2) => localized(label, min).partial().optional();
exports.privacySchema = zod_1.z.object({
    title: localized("Title"),
    subTitle: localized("Subtitle"),
    shortDesc: localized("Short description"),
    content: localized("Content", 1),
    isDeleted: zod_1.z.boolean().optional(),
});
exports.updatePrivacySchema = zod_1.z.object({
    title: partialLocalized("Title"),
    subTitle: partialLocalized("Subtitle"),
    shortDesc: partialLocalized("Short description"),
    content: partialLocalized("Content", 1),
    isDeleted: zod_1.z.boolean().optional(),
});
