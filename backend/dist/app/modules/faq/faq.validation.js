"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFaqSchema = exports.faqSchema = void 0;
const zod_1 = require("zod");
const localizedText = zod_1.z.object({
    en: zod_1.z.string().trim().min(1, "English text is required"),
    ar: zod_1.z.string().trim().min(1, "Arabic text is required"),
});
// partial: lets you update only one language without wiping the other
const partialLocalizedText = localizedText.partial();
exports.faqSchema = zod_1.z.object({
    question: localizedText,
    answer: localizedText,
    status: zod_1.z.enum(["active", "inactive"]).optional(),
});
exports.updateFaqSchema = zod_1.z.object({
    question: partialLocalizedText.optional(),
    answer: partialLocalizedText.optional(),
    status: zod_1.z.enum(["active", "inactive"]).optional(),
    isDeleted: zod_1.z.boolean().optional(),
});
